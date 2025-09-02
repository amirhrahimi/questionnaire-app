using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Questionnaire.Server.Data
{
    public class QuestionnaireDbContextFactory : IDesignTimeDbContextFactory<QuestionnaireDbContext>
    {
        public QuestionnaireDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<QuestionnaireDbContext>();
            
            // Use PostgreSQL for migrations (design-time)
            // This connection string is only used for generating migrations, not runtime
            optionsBuilder.UseNpgsql("Host=localhost;Database=questionnaire_design;Username=postgres;Password=password");
            
            return new QuestionnaireDbContext(optionsBuilder.Options);
        }
    }
}
