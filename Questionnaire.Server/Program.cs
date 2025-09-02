
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Questionnaire.Server.Data;
using Questionnaire.Server.Services;

namespace Questionnaire.Server
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            // Configure database based on environment
            if (builder.Environment.IsDevelopment())
            {
                // Use InMemory database for local development
                builder.Services.AddDbContext<QuestionnaireDbContext>(options =>
                    options.UseInMemoryDatabase("QuestionnaireDb"));
            }
            else
            {
                // Use PostgreSQL for production (Railway)
                var connectionString = Environment.GetEnvironmentVariable("DATABASE_URL") ?? 
                                     builder.Configuration.GetConnectionString("DefaultConnection");
                
                if (!string.IsNullOrEmpty(connectionString))
                {
                    // Railway provides DATABASE_URL in a specific format
                    connectionString = ConvertRailwayConnectionString(connectionString);
                    
                    builder.Services.AddDbContext<QuestionnaireDbContext>(options =>
                        options.UseNpgsql(connectionString));
                }
                else
                {
                    // Fallback to InMemory if no connection string
                    builder.Services.AddDbContext<QuestionnaireDbContext>(options =>
                        options.UseInMemoryDatabase("QuestionnaireDb"));
                }
            }

            builder.Services.AddControllers();

            // Add authentication services
            builder.Services.AddScoped<IJwtService, JwtService>();
            builder.Services.AddHttpClient<IGoogleOAuthService, GoogleOAuthService>((serviceProvider, client) =>
            {
                // Configure HTTP client if needed
            });

            // Configure JWT Authentication
            var jwtSection = builder.Configuration.GetSection("Jwt");
            var secretKey = jwtSection["SecretKey"] ?? "YourSuperSecretKeyThatShouldBeAtLeast32CharactersLong!";

            builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        ValidIssuer = jwtSection["Issuer"] ?? "QuestionnaireApp",
                        ValidAudience = jwtSection["Audience"] ?? "QuestionnaireApp",
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
                        ClockSkew = TimeSpan.Zero
                    };
                });

            builder.Services.AddAuthorization();
            
            // Add CORS
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowReactApp", policy =>
                {
                    policy.AllowAnyOrigin()
                          .AllowAnyMethod()
                          .AllowAnyHeader();
                });
            });
            
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            var app = builder.Build();

            // Auto-migrate database in production
            if (!app.Environment.IsDevelopment())
            {
                using (var scope = app.Services.CreateScope())
                {
                    var context = scope.ServiceProvider.GetRequiredService<QuestionnaireDbContext>();
                    try
                    {
                        context.Database.Migrate();
                        var migrationLogger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
                        migrationLogger.LogInformation("Database migration completed successfully");
                    }
                    catch (Exception ex)
                    {
                        var migrationLogger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
                        migrationLogger.LogError(ex, "Database migration failed");
                        throw;
                    }
                }
            }

            // Configure for Railway deployment
            var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
            
            // Use HTTPS for local development, HTTP for Railway (which handles SSL termination)
            var protocol = app.Environment.IsDevelopment() ? "https" : "http";
            app.Urls.Add($"{protocol}://0.0.0.0:{port}");
            
            // Log startup information
            var logger = app.Services.GetRequiredService<ILogger<Program>>();
            logger.LogInformation("Starting application on port {Port}", port);
            logger.LogInformation("Environment: {Environment}", app.Environment.EnvironmentName);

            app.UseDefaultFiles();
            app.UseStaticFiles();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            // Only redirect to HTTPS in development (Railway handles SSL)
            if (app.Environment.IsDevelopment())
            {
                app.UseHttpsRedirection();
            }
            
            app.UseCors("AllowReactApp");

            app.UseAuthentication();
            app.UseAuthorization();

            app.MapControllers();

            // Add health check endpoint for Railway
            app.MapGet("/health", () => Results.Ok(new { 
                status = "healthy", 
                timestamp = DateTime.UtcNow,
                environment = app.Environment.EnvironmentName,
                port = Environment.GetEnvironmentVariable("PORT") ?? "8080"
            }));

            app.MapFallbackToFile("/index.html");

            app.Run();
        }

        // Helper method to convert Railway DATABASE_URL to PostgreSQL connection string
        private static string ConvertRailwayConnectionString(string databaseUrl)
        {
            if (string.IsNullOrEmpty(databaseUrl))
                return databaseUrl;

            // Railway provides DATABASE_URL in format: postgresql://user:password@host:port/database
            // We need to convert it to a standard connection string format
            if (databaseUrl.StartsWith("postgresql://"))
            {
                var uri = new Uri(databaseUrl);
                var connectionString = $"Host={uri.Host};Port={uri.Port};Database={uri.AbsolutePath.TrimStart('/')};Username={uri.UserInfo.Split(':')[0]};Password={uri.UserInfo.Split(':')[1]};SSL Mode=Require;Trust Server Certificate=true";
                return connectionString;
            }

            return databaseUrl;
        }
    }
}
