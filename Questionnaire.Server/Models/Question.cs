using System.ComponentModel.DataAnnotations;

namespace Questionnaire.Server.Models
{
    public enum QuestionType
    {
        SingleChoice = 1,
        MultipleChoice = 2,
        Descriptive = 3
    }

    public class Question
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(500)]
        public string Text { get; set; } = string.Empty;
        
        public QuestionType Type { get; set; }
        
        public bool IsRequired { get; set; }
        
        public int Order { get; set; }
        
        public int QuestionnaireId { get; set; }
        public Questionnaire Questionnaire { get; set; } = null!;
        
        public List<QuestionOption> Options { get; set; } = new();
        
        public List<Response> Responses { get; set; } = new();
    }
}
