
using Microsoft.EntityFrameworkCore;
using Questionnaire.Server.Data;

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

            app.UseAuthorization();

            app.MapControllers();

            app.MapFallbackToFile("/index.html");

            app.Run();
        }
    }
}
