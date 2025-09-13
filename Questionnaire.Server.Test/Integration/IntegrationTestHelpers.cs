using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Questionnaire.Server.Data;
using Questionnaire.Server.Test.Helpers;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace Questionnaire.Server.Test.Integration
{
    public class QuestionnaireWebApplicationFactory : WebApplicationFactory<Program>
    {
        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.ConfigureAppConfiguration((context, config) =>
            {
                // Add test JWT configuration
                var configData = new Dictionary<string, string?>
                {
                    ["Jwt:SecretKey"] = "ThisIsATestSecretKeyThatIsLongEnough123456789",
                    ["Jwt:Issuer"] = "TestIssuer",
                    ["Jwt:Audience"] = "TestAudience",
                    ["GoogleClientSecret"] = "test_google_client_secret"
                };
                config.AddInMemoryCollection(configData);
            });

            builder.ConfigureServices(services =>
            {
                // Remove the default DbContext registration
                var descriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(DbContextOptions<QuestionnaireDbContext>));
                if (descriptor != null)
                {
                    services.Remove(descriptor);
                }

                // Add in-memory database for testing - use a static name so all tests share the same data
                services.AddDbContext<QuestionnaireDbContext>(options =>
                {
                    options.UseInMemoryDatabase("IntegrationTestDb");
                });

                // Build the service provider
                var serviceProvider = services.BuildServiceProvider();

                // Create a scope to obtain a reference to the database context
                using var scope = serviceProvider.CreateScope();
                var scopedServices = scope.ServiceProvider;
                var context = scopedServices.GetRequiredService<QuestionnaireDbContext>();
                var logger = scopedServices.GetRequiredService<ILogger<QuestionnaireWebApplicationFactory>>();

                // Ensure the database is created
                context.Database.EnsureCreated();

                try
                {
                    // Seed the database with test data if needed
                    TestDbContextFactory.SeedTestDataAsync(context).Wait();
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "An error occurred seeding the database with test data. Error: {Message}", ex.Message);
                }
            });

            builder.UseEnvironment("Test");
        }
    }

    public static class HttpClientExtensions
    {
        public static void AddJwtAuthentication(this HttpClient client, string token)
        {
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        }

        public static async Task<T?> GetFromJsonAsync<T>(this HttpClient client, string requestUri)
        {
            var response = await client.GetAsync(requestUri);
            response.EnsureSuccessStatusCode();
            
            var content = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<T>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
        }

        public static async Task<HttpResponseMessage> PostAsJsonAsync<T>(this HttpClient client, string requestUri, T data)
        {
            var json = JsonSerializer.Serialize(data);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            return await client.PostAsync(requestUri, content);
        }

        public static async Task<HttpResponseMessage> PutAsJsonAsync<T>(this HttpClient client, string requestUri, T data)
        {
            var json = JsonSerializer.Serialize(data);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            return await client.PutAsync(requestUri, content);
        }
    }

    public class IntegrationTestBase : IClassFixture<QuestionnaireWebApplicationFactory>
    {
        protected readonly QuestionnaireWebApplicationFactory Factory;
        protected readonly HttpClient Client;

        public IntegrationTestBase(QuestionnaireWebApplicationFactory factory)
        {
            Factory = factory;
            Client = factory.CreateClient();
        }

        protected async Task SeedTestDataAsync()
        {
            // The test data was already seeded in the factory setup
            // We just need to ensure it's available. Since each test gets its own database,
            // we need to seed it again for the test context.
            using var scope = Factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<QuestionnaireDbContext>();
            
            // Check if data already exists
            if (!context.Questionnaires.Any())
            {
                await TestDbContextFactory.SeedTestDataAsync(context);
            }
        }

        protected string GetAuthToken(bool isAdmin = false)
        {
            // Create the user in the database first
            using var scope = Factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<QuestionnaireDbContext>();
            
            var mockUser = new Questionnaire.Server.Models.User
            {
                Id = isAdmin ? 1 : 2,
                Email = isAdmin ? "admin@test.com" : "user@test.com",
                Name = isAdmin ? "Test Admin" : "Test User",
                GoogleId = isAdmin ? "admin_google_123" : "user_google_456",
                IsAdmin = isAdmin
            };

            // Check if user already exists
            var existingUser = context.Users.FirstOrDefault(u => u.Id == mockUser.Id);
            if (existingUser == null)
            {
                context.Users.Add(mockUser);
                context.SaveChanges();
            }

            // Create a JWT service instance to generate a real token
            var jwtService = scope.ServiceProvider.GetRequiredService<Questionnaire.Server.Services.IJwtService>();
            return jwtService.GenerateToken(mockUser);
        }

        protected QuestionnaireDbContext GetDbContext()
        {
            var scope = Factory.Services.CreateScope();
            return scope.ServiceProvider.GetRequiredService<QuestionnaireDbContext>();
        }
    }
}