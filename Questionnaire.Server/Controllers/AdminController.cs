using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Questionnaire.Server.Data;
using Questionnaire.Server.DTOs;
using Questionnaire.Server.Models;
using Questionnaire.Server.Attributes;

namespace Questionnaire.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [AdminRequired]
    public class AdminController : ControllerBase
    {
        private readonly QuestionnaireDbContext _context;

        public AdminController(QuestionnaireDbContext context)
        {
            _context = context;
        }

        [HttpGet("questionnaires")]
        public async Task<ActionResult<List<QuestionnaireDto>>> GetQuestionnaires()
        {
            var questionnaires = await _context.Questionnaires
                .Include(q => q.Questions)
                    .ThenInclude(qu => qu.Options.OrderBy(o => o.Order))
                .Include(q => q.Responses)
                .OrderByDescending(q => q.CreatedAt)
                .Select(q => new QuestionnaireDto
                {
                    Id = q.Id,
                    Title = q.Title,
                    Description = q.Description,
                    CreatedAt = q.CreatedAt,
                    IsActive = q.IsActive,
                    ResponseCount = q.Responses.Count,
                    Questions = q.Questions.OrderBy(qu => qu.Order).Select(qu => new QuestionDto
                    {
                        Id = qu.Id,
                        Text = qu.Text,
                        Type = qu.Type,
                        IsRequired = qu.IsRequired,
                        Order = qu.Order,
                        Options = qu.Options.OrderBy(o => o.Order).Select(o => new QuestionOptionDto
                        {
                            Id = o.Id,
                            Text = o.Text,
                            Order = o.Order
                        }).ToList()
                    }).ToList()
                })
                .ToListAsync();

            return Ok(questionnaires);
        }

        [HttpGet("questionnaires/{id}")]
        public async Task<ActionResult<QuestionnaireDto>> GetQuestionnaire(int id)
        {
            var questionnaire = await _context.Questionnaires
                .Include(q => q.Questions)
                    .ThenInclude(qu => qu.Options.OrderBy(o => o.Order))
                .Include(q => q.Responses)
                .Where(q => q.Id == id)
                .Select(q => new QuestionnaireDto
                {
                    Id = q.Id,
                    Title = q.Title,
                    Description = q.Description,
                    CreatedAt = q.CreatedAt,
                    IsActive = q.IsActive,
                    ResponseCount = q.Responses.Count,
                    Questions = q.Questions.OrderBy(qu => qu.Order).Select(qu => new QuestionDto
                    {
                        Id = qu.Id,
                        Text = qu.Text,
                        Type = qu.Type,
                        IsRequired = qu.IsRequired,
                        Order = qu.Order,
                        Options = qu.Options.OrderBy(o => o.Order).Select(o => new QuestionOptionDto
                        {
                            Id = o.Id,
                            Text = o.Text,
                            Order = o.Order
                        }).ToList()
                    }).ToList()
                })
                .FirstOrDefaultAsync();

            if (questionnaire == null)
            {
                return NotFound();
            }

            return Ok(questionnaire);
        }

        [HttpPost("questionnaires")]
        public async Task<ActionResult<QuestionnaireDto>> CreateQuestionnaire(CreateQuestionnaireDto dto)
        {
            var questionnaire = new Models.Questionnaire
            {
                Title = dto.Title,
                Description = dto.Description,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            _context.Questionnaires.Add(questionnaire);
            await _context.SaveChangesAsync();

            // Add questions
            foreach (var questionDto in dto.Questions)
            {
                var question = new Question
                {
                    Text = questionDto.Text,
                    Type = questionDto.Type,
                    IsRequired = questionDto.IsRequired,
                    Order = questionDto.Order,
                    QuestionnaireId = questionnaire.Id
                };

                _context.Questions.Add(question);
                await _context.SaveChangesAsync();

                // Add options for choice questions
                if (questionDto.Type == QuestionType.SingleChoice || questionDto.Type == QuestionType.MultipleChoice)
                {
                    foreach (var optionDto in questionDto.Options)
                    {
                        var option = new QuestionOption
                        {
                            Text = optionDto.Text,
                            Order = optionDto.Order,
                            QuestionId = question.Id
                        };

                        _context.QuestionOptions.Add(option);
                    }
                }
            }

            await _context.SaveChangesAsync();

            return await GetQuestionnaire(questionnaire.Id);
        }

        [HttpPut("questionnaires/{id}")]
        public async Task<ActionResult<QuestionnaireDto>> UpdateQuestionnaire(int id, CreateQuestionnaireDto updateDto)
        {
            var existingQuestionnaire = await _context.Questionnaires
                .Include(q => q.Questions)
                    .ThenInclude(qu => qu.Options)
                .FirstOrDefaultAsync(q => q.Id == id);

            if (existingQuestionnaire == null)
            {
                return NotFound();
            }

            // Update basic properties
            existingQuestionnaire.Title = updateDto.Title;
            existingQuestionnaire.Description = updateDto.Description;

            // Remove existing questions and their options
            _context.QuestionOptions.RemoveRange(
                existingQuestionnaire.Questions.SelectMany(q => q.Options));
            _context.Questions.RemoveRange(existingQuestionnaire.Questions);

            // Add new questions
            foreach (var questionDto in updateDto.Questions)
            {
                var question = new Question
                {
                    Text = questionDto.Text,
                    Type = questionDto.Type,
                    IsRequired = questionDto.IsRequired,
                    Order = questionDto.Order,
                    QuestionnaireId = existingQuestionnaire.Id
                };

                _context.Questions.Add(question);

                // Add options for multiple choice questions
                if (questionDto.Type == QuestionType.SingleChoice || questionDto.Type == QuestionType.MultipleChoice)
                {
                    foreach (var optionDto in questionDto.Options)
                    {
                        var option = new QuestionOption
                        {
                            Text = optionDto.Text,
                            Order = optionDto.Order,
                            Question = question
                        };
                        _context.QuestionOptions.Add(option);
                    }
                }
            }

            await _context.SaveChangesAsync();

            return await GetQuestionnaire(existingQuestionnaire.Id);
        }

        [HttpPut("questionnaires/{id}/toggle")]
        public async Task<IActionResult> ToggleQuestionnaireStatus(int id)
        {
            var questionnaire = await _context.Questionnaires.FindAsync(id);
            if (questionnaire == null)
            {
                return NotFound();
            }

            questionnaire.IsActive = !questionnaire.IsActive;
            await _context.SaveChangesAsync();

            return Ok(new { IsActive = questionnaire.IsActive });
        }

        [HttpDelete("questionnaires/{id}")]
        public async Task<IActionResult> DeleteQuestionnaire(int id)
        {
            var questionnaire = await _context.Questionnaires.FindAsync(id);
            if (questionnaire == null)
            {
                return NotFound();
            }

            _context.Questionnaires.Remove(questionnaire);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("questionnaires/{id}/results")]
        public async Task<ActionResult<QuestionnaireResultDto>> GetQuestionnaireResults(int id)
        {
            var questionnaire = await _context.Questionnaires
                .Include(q => q.Questions)
                    .ThenInclude(qu => qu.Options)
                .Include(q => q.Questions)
                    .ThenInclude(qu => qu.Responses)
                        .ThenInclude(r => r.QuestionOption)
                .Include(q => q.Responses)
                .FirstOrDefaultAsync(q => q.Id == id);

            if (questionnaire == null)
            {
                return NotFound();
            }

            var result = new QuestionnaireResultDto
            {
                Id = questionnaire.Id,
                Title = questionnaire.Title,
                Description = questionnaire.Description,
                TotalResponses = questionnaire.Responses.Count,
                Questions = questionnaire.Questions.OrderBy(q => q.Order).Select(q => new QuestionResultDto
                {
                    Id = q.Id,
                    Text = q.Text,
                    Type = q.Type,
                    IsRequired = q.IsRequired,
                    ResponseCount = q.Responses.Count,
                    Options = q.Options.OrderBy(o => o.Order).Select(o => new OptionResultDto
                    {
                        Id = o.Id,
                        Text = o.Text,
                        Count = o.Responses.Count,
                        Percentage = questionnaire.Responses.Count > 0 
                            ? (double)o.Responses.Count / questionnaire.Responses.Count * 100 
                            : 0
                    }).ToList(),
                    TextAnswers = q.Type == QuestionType.Descriptive 
                        ? q.Responses.Where(r => !string.IsNullOrEmpty(r.TextAnswer))
                            .Select(r => r.TextAnswer!)
                            .ToList()
                        : new List<string>()
                }).ToList()
            };

            return Ok(result);
        }
    }
}
