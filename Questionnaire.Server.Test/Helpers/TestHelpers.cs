using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Questionnaire.Server.Data;
using Questionnaire.Server.Models;

namespace Questionnaire.Server.Test.Helpers
{
    public static class TestDbContextFactory
    {
        public static QuestionnaireDbContext CreateInMemoryContext(string databaseName = "TestDb")
        {
            var options = new DbContextOptionsBuilder<QuestionnaireDbContext>()
                .UseInMemoryDatabase(databaseName: databaseName + Guid.NewGuid().ToString())
                .Options;

            return new QuestionnaireDbContext(options);
        }

        public static async Task<QuestionnaireDbContext> CreateContextWithSampleDataAsync(string databaseName = "TestDb")
        {
            var context = CreateInMemoryContext(databaseName);
            await SeedTestDataAsync(context);
            return context;
        }

        public static async Task SeedTestDataAsync(QuestionnaireDbContext context)
        {
            // Add test users
            var adminUser = new User
            {
                Id = 1,
                Email = "admin@test.com",
                Name = "Test Admin",
                GoogleId = "google_admin_123",
                Picture = "https://example.com/admin.jpg",
                IsAdmin = true,
                CreatedAt = DateTime.UtcNow
            };

            var regularUser = new User
            {
                Id = 2,
                Email = "user@test.com",
                Name = "Test User",
                GoogleId = "google_user_456",
                Picture = "https://example.com/user.jpg",
                IsAdmin = false,
                CreatedAt = DateTime.UtcNow
            };

            context.Users.AddRange(adminUser, regularUser);

            // Add test questionnaire
            var questionnaire = new Models.Questionnaire
            {
                Id = Guid.Parse("12345678-1234-1234-1234-123456789012"),
                Title = "Test Questionnaire",
                Description = "A test questionnaire for unit tests",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            context.Questionnaires.Add(questionnaire);

            // Add test questions
            var question1 = new Question
            {
                Id = 1,
                Text = "What is your favorite color?",
                Type = QuestionType.SingleChoice,
                IsRequired = true,
                Order = 1,
                QuestionnaireId = questionnaire.Id
            };

            var question2 = new Question
            {
                Id = 2,
                Text = "What are your hobbies?",
                Type = QuestionType.MultipleChoice,
                IsRequired = false,
                Order = 2,
                QuestionnaireId = questionnaire.Id
            };

            var question3 = new Question
            {
                Id = 3,
                Text = "Tell us about yourself",
                Type = QuestionType.Descriptive,
                IsRequired = true,
                Order = 3,
                QuestionnaireId = questionnaire.Id
            };

            context.Questions.AddRange(question1, question2, question3);

            // Add test options
            var options = new List<QuestionOption>
            {
                new() { Id = 1, Text = "Red", Order = 1, QuestionId = question1.Id },
                new() { Id = 2, Text = "Blue", Order = 2, QuestionId = question1.Id },
                new() { Id = 3, Text = "Green", Order = 3, QuestionId = question1.Id },
                new() { Id = 4, Text = "Reading", Order = 1, QuestionId = question2.Id },
                new() { Id = 5, Text = "Sports", Order = 2, QuestionId = question2.Id },
                new() { Id = 6, Text = "Music", Order = 3, QuestionId = question2.Id }
            };

            context.QuestionOptions.AddRange(options);

            await context.SaveChangesAsync();
        }
    }

    public static class ConfigurationHelper
    {
        public static IConfiguration CreateTestConfiguration()
        {
            var configData = new Dictionary<string, string?>
            {
                ["Jwt:SecretKey"] = "ThisIsATestSecretKeyThatIsLongEnough123456789",
                ["Jwt:Issuer"] = "TestIssuer",
                ["Jwt:Audience"] = "TestAudience",
                ["GoogleClientSecret"] = "test_google_client_secret"
            };

            return new ConfigurationBuilder()
                .AddInMemoryCollection(configData)
                .Build();
        }
    }

    public static class MockLoggerFactory
    {
        public static Mock<ILogger<T>> CreateMockLogger<T>()
        {
            return new Mock<ILogger<T>>();
        }
    }
}