using System.ComponentModel.DataAnnotations;

namespace Questionnaire.Server.Models
{
    public class QuestionnaireResponse
    {
        public int Id { get; set; }
        
        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
        
        public Guid QuestionnaireId { get; set; }
        public Questionnaire Questionnaire { get; set; } = null!;
        
        public List<Response> Responses { get; set; } = new();
    }
}
