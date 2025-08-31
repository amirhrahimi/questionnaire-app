using System.ComponentModel.DataAnnotations;

namespace Questionnaire.Server.Models
{
    public class Questionnaire
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;
        
        [StringLength(1000)]
        public string? Description { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public bool IsActive { get; set; } = true;
        
        public List<Question> Questions { get; set; } = new();
        
        public List<QuestionnaireResponse> Responses { get; set; } = new();
    }
}
