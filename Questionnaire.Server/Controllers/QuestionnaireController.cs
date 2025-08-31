using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Questionnaire.Server.Data;
using Questionnaire.Server.DTOs;
using Questionnaire.Server.Models;

namespace Questionnaire.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class QuestionnaireController : ControllerBase
    {
        private readonly QuestionnaireDbContext _context;

        public QuestionnaireController(QuestionnaireDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<List<QuestionnaireDto>>> GetActiveQuestionnaires()
        {
            var questionnaires = await _context.Questionnaires
                .Include(q => q.Questions)
                    .ThenInclude(qu => qu.Options.OrderBy(o => o.Order))
                .Where(q => q.IsActive)
                .OrderByDescending(q => q.CreatedAt)
                .Select(q => new QuestionnaireDto
                {
                    Id = q.Id,
                    Title = q.Title,
                    Description = q.Description,
                    CreatedAt = q.CreatedAt,
                    IsActive = q.IsActive,
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

        [HttpGet("{id}")]
        public async Task<ActionResult<QuestionnaireDto>> GetQuestionnaire(int id)
        {
            var questionnaire = await _context.Questionnaires
                .Include(q => q.Questions)
                    .ThenInclude(qu => qu.Options.OrderBy(o => o.Order))
                .Where(q => q.Id == id && q.IsActive)
                .Select(q => new QuestionnaireDto
                {
                    Id = q.Id,
                    Title = q.Title,
                    Description = q.Description,
                    CreatedAt = q.CreatedAt,
                    IsActive = q.IsActive,
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

        [HttpPost("submit")]
        public async Task<IActionResult> SubmitResponse(SubmitResponseDto dto)
        {
            var questionnaire = await _context.Questionnaires
                .Include(q => q.Questions)
                    .ThenInclude(qu => qu.Options)
                .FirstOrDefaultAsync(q => q.Id == dto.QuestionnaireId && q.IsActive);

            if (questionnaire == null)
            {
                return BadRequest("Questionnaire not found or not active");
            }

            // Validate required questions
            var requiredQuestions = questionnaire.Questions.Where(q => q.IsRequired).ToList();
            foreach (var requiredQuestion in requiredQuestions)
            {
                var response = dto.Responses.FirstOrDefault(r => r.QuestionId == requiredQuestion.Id);
                if (response == null)
                {
                    return BadRequest($"Question '{requiredQuestion.Text}' is required");
                }

                if (requiredQuestion.Type == QuestionType.Descriptive)
                {
                    if (string.IsNullOrWhiteSpace(response.TextAnswer))
                    {
                        return BadRequest($"Question '{requiredQuestion.Text}' is required");
                    }
                }
                else if (requiredQuestion.Type == QuestionType.SingleChoice)
                {
                    if (!response.SelectedOptionId.HasValue)
                    {
                        return BadRequest($"Question '{requiredQuestion.Text}' is required");
                    }
                }
                else if (requiredQuestion.Type == QuestionType.MultipleChoice)
                {
                    if (!response.SelectedOptionIds.Any())
                    {
                        return BadRequest($"Question '{requiredQuestion.Text}' is required");
                    }
                }
            }

            // Create questionnaire response
            var questionnaireResponse = new QuestionnaireResponse
            {
                QuestionnaireId = dto.QuestionnaireId,
                SubmittedAt = DateTime.UtcNow
            };

            _context.QuestionnaireResponses.Add(questionnaireResponse);
            await _context.SaveChangesAsync();

            // Create individual responses
            foreach (var responseDto in dto.Responses)
            {
                var question = questionnaire.Questions.FirstOrDefault(q => q.Id == responseDto.QuestionId);
                if (question == null) continue;

                if (question.Type == QuestionType.Descriptive)
                {
                    if (!string.IsNullOrWhiteSpace(responseDto.TextAnswer))
                    {
                        var response = new Response
                        {
                            QuestionId = responseDto.QuestionId,
                            QuestionnaireResponseId = questionnaireResponse.Id,
                            TextAnswer = responseDto.TextAnswer
                        };
                        _context.Responses.Add(response);
                    }
                }
                else if (question.Type == QuestionType.SingleChoice)
                {
                    if (responseDto.SelectedOptionId.HasValue)
                    {
                        var response = new Response
                        {
                            QuestionId = responseDto.QuestionId,
                            QuestionnaireResponseId = questionnaireResponse.Id,
                            QuestionOptionId = responseDto.SelectedOptionId
                        };
                        _context.Responses.Add(response);
                    }
                }
                else if (question.Type == QuestionType.MultipleChoice)
                {
                    foreach (var optionId in responseDto.SelectedOptionIds)
                    {
                        var response = new Response
                        {
                            QuestionId = responseDto.QuestionId,
                            QuestionnaireResponseId = questionnaireResponse.Id,
                            QuestionOptionId = optionId
                        };
                        _context.Responses.Add(response);
                    }
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new { Message = "Response submitted successfully", ResponseId = questionnaireResponse.Id });
        }
    }
}
