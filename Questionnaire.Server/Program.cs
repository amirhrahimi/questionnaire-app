
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
            builder.Services.AddDbContext<QuestionnaireDbContext>(options =>
                options.UseInMemoryDatabase("QuestionnaireDb"));

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
                    policy.WithOrigins("https://localhost:5173", "http://localhost:5173")
                          .AllowAnyMethod()
                          .AllowAnyHeader();
                });
            });
            
            // Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
            builder.Services.AddOpenApi();

            var app = builder.Build();

            app.UseDefaultFiles();
            app.MapStaticAssets();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.MapOpenApi();
            }

            app.UseHttpsRedirection();
            
            app.UseCors("AllowReactApp");

            app.UseAuthentication();
            app.UseAuthorization();

            app.MapControllers();

            app.MapFallbackToFile("/index.html");

            app.Run();
        }
    }
}
