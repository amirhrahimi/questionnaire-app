using System.ComponentModel.DataAnnotations;

namespace Questionnaire.Server.Models
{
    public class Response
    {
        public int Id { get; set; }
        
        public int QuestionId { get; set; }
        public Question Question { get; set; } = null!;
        
        public int QuestionnaireResponseId { get; set; }
        public QuestionnaireResponse QuestionnaireResponse { get; set; } = null!;
        
        // For descriptive questions
        [StringLength(2000)]
        public string? TextAnswer { get; set; }
        
        // For choice questions
        public int? QuestionOptionId { get; set; }
        public QuestionOption? QuestionOption { get; set; }
    }
}
