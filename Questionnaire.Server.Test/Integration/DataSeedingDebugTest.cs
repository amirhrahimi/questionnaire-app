using Microsoft.Extensions.DependencyInjection;
using Questionnaire.Server.Data;
using Microsoft.EntityFrameworkCore;

namespace Questionnaire.Server.Test.Integration
{
    public class DataSeedingDebugTest : IntegrationTestBase
    {
        public DataSeedingDebugTest(QuestionnaireWebApplicationFactory factory) : base(factory)
        {
        }

        [Fact(Skip = "Data seeding debugging - not needed for regular test run")]
        public async Task TestDataSeeding()
        {
            // Seed test data
            await SeedTestDataAsync();
            
            // Check if data was seeded correctly
            using var scope = Factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<QuestionnaireDbContext>();
            
            var questionnaires = await context.Questionnaires.ToListAsync();
            var questions = await context.Questions.ToListAsync();
            var options = await context.QuestionOptions.ToListAsync();
            var users = await context.Users.ToListAsync();

            Console.WriteLine($"Questionnaires count: {questionnaires.Count}");
            Console.WriteLine($"Questions count: {questions.Count}");
            Console.WriteLine($"Options count: {options.Count}");
            Console.WriteLine($"Users count: {users.Count}");
            
            if (questionnaires.Any())
            {
                var q = questionnaires.First();
                Console.WriteLine($"First questionnaire: ID={q.Id}, Title={q.Title}, IsActive={q.IsActive}");
            }
            
            questionnaires.Should().HaveCount(1);
            questions.Should().HaveCount(3);
            options.Should().HaveCount(6);
            users.Should().HaveCount(2);
        }
    }
}