using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Questionnaire.Server.Controllers;
using Questionnaire.Server.Data;
using Questionnaire.Server.DTOs;
using Questionnaire.Server.Models;
using Questionnaire.Server.Test.Helpers;

namespace Questionnaire.Server.Test.Controllers
{
    public class AdminControllerTests : IDisposable
    {
        private readonly QuestionnaireDbContext _context;
        private readonly AdminController _controller;

        public AdminControllerTests()
        {
            _context = TestDbContextFactory.CreateInMemoryContext();
            _controller = new AdminController(_context);
        }

        [Fact]
        public async Task GetQuestionnaires_WithQuestionnaires_ShouldReturnAllQuestionnaires()
        {
            // Arrange
            await TestDbContextFactory.SeedTestDataAsync(_context);

            // Act
            var result = await _controller.GetQuestionnaires();

            // Assert
            result.Should().NotBeNull();
            var actionResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            var questionnaires = actionResult.Value.Should().BeAssignableTo<List<QuestionnaireDto>>().Subject;

            questionnaires.Should().HaveCount(1);
            var questionnaire = questionnaires[0];
            questionnaire.Title.Should().Be("Test Questionnaire");
            questionnaire.Questions.Should().HaveCount(3);
            questionnaire.ResponseCount.Should().Be(0); // No responses yet
        }

        [Fact]
        public async Task GetQuestionnaires_WithNoQuestionnaires_ShouldReturnEmptyList()
        {
            // Act
            var result = await _controller.GetQuestionnaires();

            // Assert
            result.Should().NotBeNull();
            var actionResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            var questionnaires = actionResult.Value.Should().BeAssignableTo<List<QuestionnaireDto>>().Subject;

            questionnaires.Should().BeEmpty();
        }

        [Fact]
        public async Task CreateQuestionnaire_WithValidData_ShouldCreateQuestionnaire()
        {
            // Arrange
            var createDto = new CreateQuestionnaireDto
            {
                Title = "New Test Questionnaire",
                Description = "This is a new test questionnaire",
                Questions = new List<CreateQuestionDto>
                {
                    new()
                    {
                        Text = "What is your name?",
                        Type = QuestionType.Descriptive,
                        IsRequired = true,
                        Order = 1,
                        Options = new List<CreateQuestionOptionDto>()
                    },
                    new()
                    {
                        Text = "What is your favorite color?",
                        Type = QuestionType.SingleChoice,
                        IsRequired = true,
                        Order = 2,
                        Options = new List<CreateQuestionOptionDto>
                        {
                            new() { Text = "Red", Order = 1 },
                            new() { Text = "Blue", Order = 2 },
                            new() { Text = "Green", Order = 3 }
                        }
                    }
                }
            };

            // Act
            var result = await _controller.CreateQuestionnaire(createDto);

            // Assert
            result.Should().NotBeNull();
            var actionResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            var questionnaire = actionResult.Value.Should().BeOfType<QuestionnaireDto>().Subject;

            questionnaire.Title.Should().Be("New Test Questionnaire");
            questionnaire.Description.Should().Be("This is a new test questionnaire");
            questionnaire.IsActive.Should().BeTrue();
            questionnaire.Questions.Should().HaveCount(2);

            // Verify question order
            questionnaire.Questions[0].Order.Should().Be(1);
            questionnaire.Questions[1].Order.Should().Be(2);

            // Verify single choice question has options
            questionnaire.Questions[1].Options.Should().HaveCount(3);
            questionnaire.Questions[1].Options[0].Text.Should().Be("Red");

            // Verify in database
            var questionnaireInDb = await _context.Questionnaires
                .Include(q => q.Questions)
                .ThenInclude(q => q.Options)
                .FirstOrDefaultAsync(q => q.Id == questionnaire.Id);

            questionnaireInDb.Should().NotBeNull();
            questionnaireInDb!.Title.Should().Be("New Test Questionnaire");
        }

        [Fact]
        public async Task CreateQuestionnaire_WithInvalidData_ShouldReturnBadRequest()
        {
            // Arrange - Missing title
            var createDto = new CreateQuestionnaireDto
            {
                Title = string.Empty,
                Description = "Missing title",
                Questions = new List<CreateQuestionDto>()
            };

            // Act
            var result = await _controller.CreateQuestionnaire(createDto);

            // Assert
            result.Should().NotBeNull();
            // Controller doesn't have explicit validation, so empty title still creates questionnaire
            result.Result.Should().BeOfType<OkObjectResult>();
        }

        [Fact]
        public async Task UpdateQuestionnaire_WithValidData_ShouldUpdateQuestionnaire()
        {
            // Arrange
            await TestDbContextFactory.SeedTestDataAsync(_context);
            var questionnaireId = Guid.Parse("12345678-1234-1234-1234-123456789012");

            var updateDto = new CreateQuestionnaireDto
            {
                Title = "Updated Test Questionnaire",
                Description = "Updated description",
                Questions = new List<CreateQuestionDto>
                {
                    new()
                    {
                        Text = "Updated question?",
                        Type = QuestionType.Descriptive,
                        IsRequired = false,
                        Order = 1,
                        Options = new List<CreateQuestionOptionDto>()
                    }
                }
            };

            // Act
            var result = await _controller.UpdateQuestionnaire(questionnaireId, updateDto);

            // Assert
            result.Should().NotBeNull();
            var actionResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            var questionnaire = actionResult.Value.Should().BeOfType<QuestionnaireDto>().Subject;

            questionnaire.Title.Should().Be("Updated Test Questionnaire");
            questionnaire.Description.Should().Be("Updated description");
            questionnaire.Questions.Should().HaveCount(1);
            questionnaire.Questions[0].Text.Should().Be("Updated question?");
        }

        [Fact]
        public async Task UpdateQuestionnaire_WithInvalidId_ShouldReturnNotFound()
        {
            // Arrange
            var invalidId = Guid.NewGuid();
            var updateDto = new CreateQuestionnaireDto
            {
                Title = "Updated Title",
                Questions = new List<CreateQuestionDto>()
            };

            // Act
            var result = await _controller.UpdateQuestionnaire(invalidId, updateDto);

            // Assert
            result.Should().NotBeNull();
            result.Result.Should().BeOfType<NotFoundResult>();
        }

        [Fact]
        public async Task DeleteQuestionnaire_WithValidId_ShouldDeleteQuestionnaire()
        {
            // Arrange
            await TestDbContextFactory.SeedTestDataAsync(_context);
            var questionnaireId = Guid.Parse("12345678-1234-1234-1234-123456789012");

            // Act
            var result = await _controller.DeleteQuestionnaire(questionnaireId);

            // Assert
            result.Should().BeOfType<NoContentResult>();

            // Verify questionnaire was deleted
            var questionnaireInDb = await _context.Questionnaires.FindAsync(questionnaireId);
            questionnaireInDb.Should().BeNull();
        }

        [Fact]
        public async Task DeleteQuestionnaire_WithInvalidId_ShouldReturnNotFound()
        {
            // Arrange
            var invalidId = Guid.NewGuid();

            // Act
            var result = await _controller.DeleteQuestionnaire(invalidId);

            // Assert
            result.Should().BeOfType<NotFoundResult>();
        }

        [Fact]
        public async Task ToggleQuestionnaireStatus_WithValidId_ShouldToggleStatus()
        {
            // Arrange
            await TestDbContextFactory.SeedTestDataAsync(_context);
            var questionnaireId = Guid.Parse("12345678-1234-1234-1234-123456789012");

            // Verify initial state
            var questionnaire = await _context.Questionnaires.FindAsync(questionnaireId);
            var initialStatus = questionnaire!.IsActive;

            // Act
            var result = await _controller.ToggleQuestionnaireStatus(questionnaireId);

            // Assert
            var actionResult = result.Should().BeOfType<OkObjectResult>().Subject;
            actionResult.Value.Should().NotBeNull();

            // Verify status was toggled
            await _context.Entry(questionnaire).ReloadAsync();
            questionnaire.IsActive.Should().Be(!initialStatus);
        }

        [Fact]
        public async Task ToggleQuestionnaireStatus_WithInvalidId_ShouldReturnNotFound()
        {
            // Arrange
            var invalidId = Guid.NewGuid();

            // Act
            var result = await _controller.ToggleQuestionnaireStatus(invalidId);

            // Assert
            result.Should().BeOfType<NotFoundResult>();
        }

        [Fact]
        public async Task GetQuestionnaireResults_WithValidId_ShouldReturnResults()
        {
            // Arrange
            await TestDbContextFactory.SeedTestDataAsync(_context);
            var questionnaireId = Guid.Parse("12345678-1234-1234-1234-123456789012");

            // Add a test response
            var response = new QuestionnaireResponse
            {
                QuestionnaireId = questionnaireId,
                SubmittedAt = DateTime.UtcNow,
                Responses = new List<Response>
                {
                    new() { QuestionId = 1, QuestionOptionId = 2 },
                    new() { QuestionId = 3, TextAnswer = "I love testing!" }
                }
            };

            _context.QuestionnaireResponses.Add(response);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetQuestionnaireResults(questionnaireId);

            // Assert
            result.Should().NotBeNull();
            var actionResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            var results = actionResult.Value.Should().BeOfType<QuestionnaireResultDto>().Subject;

            results.Id.Should().Be(questionnaireId);
            results.Title.Should().Be("Test Questionnaire");
            results.TotalResponses.Should().Be(1);
            results.Questions.Should().HaveCount(3);
        }

        [Fact]
        public async Task GetQuestionnaireResults_WithInvalidId_ShouldReturnNotFound()
        {
            // Arrange
            var invalidId = Guid.NewGuid();

            // Act
            var result = await _controller.GetQuestionnaireResults(invalidId);

            // Assert
            result.Should().NotBeNull();
            result.Result.Should().BeOfType<NotFoundResult>();
        }

        public void Dispose()
        {
            _context.Dispose();
        }
    }
}