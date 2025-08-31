using System.ComponentModel.DataAnnotations;

namespace Questionnaire.Server.Models
{
    public class QuestionOption
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(300)]
        public string Text { get; set; } = string.Empty;
        
        public int Order { get; set; }
        
        public int QuestionId { get; set; }
        public Question Question { get; set; } = null!;
        
        public List<Response> Responses { get; set; } = new();
    }
}
