using Questionnaire.Server.Models;
using System.ComponentModel.DataAnnotations;

namespace Questionnaire.Server.DTOs
{
    public class CreateQuestionnaireDto
    {
        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;
        
        [StringLength(1000)]
        public string? Description { get; set; }
        
        public List<CreateQuestionDto> Questions { get; set; } = new();
    }

    public class CreateQuestionDto
    {
        [Required]
        [StringLength(500)]
        public string Text { get; set; } = string.Empty;
        
        public QuestionType Type { get; set; }
        
        public bool IsRequired { get; set; }
        
        public int Order { get; set; }
        
        public List<CreateQuestionOptionDto> Options { get; set; } = new();
    }

    public class CreateQuestionOptionDto
    {
        [Required]
        [StringLength(300)]
        public string Text { get; set; } = string.Empty;
        
        public int Order { get; set; }
    }

    public class QuestionnaireDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsActive { get; set; }
        public List<QuestionDto> Questions { get; set; } = new();
        public int ResponseCount { get; set; }
    }

    public class QuestionDto
    {
        public int Id { get; set; }
        public string Text { get; set; } = string.Empty;
        public QuestionType Type { get; set; }
        public bool IsRequired { get; set; }
        public int Order { get; set; }
        public List<QuestionOptionDto> Options { get; set; } = new();
    }

    public class QuestionOptionDto
    {
        public int Id { get; set; }
        public string Text { get; set; } = string.Empty;
        public int Order { get; set; }
    }
}
