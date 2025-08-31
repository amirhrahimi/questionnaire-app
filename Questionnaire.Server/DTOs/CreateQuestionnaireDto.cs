using Questionnaire.Server.Models;
using System.ComponentModel.DataAnnotations;

namespace Questionnaire.Server.DTOs
{
    public class CreateQuestionnaireDto
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? Description { get; set; }

        [Required]
        public List<CreateQuestionDto> Questions { get; set; } = new();
    }

    public class CreateQuestionDto
    {
        [Required]
        [MaxLength(500)]
        public string Text { get; set; } = string.Empty;

        [Required]
        public QuestionType Type { get; set; }

        public bool IsRequired { get; set; }

        public int Order { get; set; }

        public List<CreateQuestionOptionDto> Options { get; set; } = new();
    }

    public class CreateQuestionOptionDto
    {
        [Required]
        [MaxLength(200)]
        public string Text { get; set; } = string.Empty;

        public int Order { get; set; }
    }
}
