using Microsoft.EntityFrameworkCore;
using Questionnaire.Server.Models;

namespace Questionnaire.Server.Data
{
    public class QuestionnaireDbContext : DbContext
    {
        public QuestionnaireDbContext(DbContextOptions<QuestionnaireDbContext> options) : base(options)
        {
        }

        public DbSet<Models.Questionnaire> Questionnaires { get; set; }
        public DbSet<Question> Questions { get; set; }
        public DbSet<QuestionOption> QuestionOptions { get; set; }
        public DbSet<QuestionnaireResponse> QuestionnaireResponses { get; set; }
        public DbSet<Response> Responses { get; set; }
        public DbSet<User> Users { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure relationships
            modelBuilder.Entity<Question>()
                .HasOne(q => q.Questionnaire)
                .WithMany(qu => qu.Questions)
                .HasForeignKey(q => q.QuestionnaireId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<QuestionOption>()
                .HasOne(qo => qo.Question)
                .WithMany(q => q.Options)
                .HasForeignKey(qo => qo.QuestionId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<QuestionnaireResponse>()
                .HasOne(qr => qr.Questionnaire)
                .WithMany(q => q.Responses)
                .HasForeignKey(qr => qr.QuestionnaireId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Response>()
                .HasOne(r => r.Question)
                .WithMany(q => q.Responses)
                .HasForeignKey(r => r.QuestionId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Response>()
                .HasOne(r => r.QuestionnaireResponse)
                .WithMany(qr => qr.Responses)
                .HasForeignKey(r => r.QuestionnaireResponseId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Response>()
                .HasOne(r => r.QuestionOption)
                .WithMany(qo => qo.Responses)
                .HasForeignKey(r => r.QuestionOptionId)
                .OnDelete(DeleteBehavior.SetNull);

            // Configure indexes
            modelBuilder.Entity<Question>()
                .HasIndex(q => new { q.QuestionnaireId, q.Order });

            modelBuilder.Entity<QuestionOption>()
                .HasIndex(qo => new { qo.QuestionId, qo.Order });
        }
    }
}
