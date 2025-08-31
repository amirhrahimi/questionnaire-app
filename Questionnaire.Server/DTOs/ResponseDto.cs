using System.ComponentModel.DataAnnotations;

namespace Questionnaire.Server.DTOs
{
    public class SubmitResponseDto
    {
        public int QuestionnaireId { get; set; }
        public List<QuestionResponseDto> Responses { get; set; } = new();
    }

    public class QuestionResponseDto
    {
        public int QuestionId { get; set; }
        
        // For descriptive questions
        [StringLength(2000)]
        public string? TextAnswer { get; set; }
        
        // For single choice questions
        public int? SelectedOptionId { get; set; }
        
        // For multiple choice questions
        public List<int> SelectedOptionIds { get; set; } = new();
    }

    public class QuestionnaireResultDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int TotalResponses { get; set; }
        public List<QuestionResultDto> Questions { get; set; } = new();
    }

    public class QuestionResultDto
    {
        public int Id { get; set; }
        public string Text { get; set; } = string.Empty;
        public Models.QuestionType Type { get; set; }
        public bool IsRequired { get; set; }
        public int ResponseCount { get; set; }
        public List<OptionResultDto> Options { get; set; } = new();
        public List<string> TextAnswers { get; set; } = new(); // For descriptive questions
    }

    public class OptionResultDto
    {
        public int Id { get; set; }
        public string Text { get; set; } = string.Empty;
        public int Count { get; set; }
        public double Percentage { get; set; }
    }
}
