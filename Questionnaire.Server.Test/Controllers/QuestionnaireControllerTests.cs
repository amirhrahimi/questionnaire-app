using Microsoft.AspNetCore.Mvc;
using Questionnaire.Server.Controllers;
using Questionnaire.Server.Data;
using Questionnaire.Server.DTOs;
using Questionnaire.Server.Models;
using Questionnaire.Server.Test.Helpers;
using FluentAssertions;
using Xunit;

namespace Questionnaire.Server.Test.Controllers
{
    public class QuestionnaireControllerTests : IDisposable
    {
        private readonly QuestionnaireDbContext _context;
        private readonly QuestionnaireController _controller;

        public QuestionnaireControllerTests()
        {
            _context = TestDbContextFactory.CreateInMemoryContext();
            _controller = new QuestionnaireController(_context);
        }

        [Fact]
        public async Task GetActiveQuestionnaires_ShouldReturnActiveQuestionnaires()
        {
            // Arrange
            await TestDbContextFactory.SeedTestDataAsync(_context);

            // Act
            var result = await _controller.GetActiveQuestionnaires();

            // Assert
            result.Should().NotBeNull();
            var actionResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            var questionnaires = actionResult.Value.Should().BeAssignableTo<List<QuestionnaireDto>>().Subject;

            questionnaires.Should().NotBeEmpty();
            questionnaires.Should().OnlyContain(q => q.IsActive);
        }

        [Fact]
        public async Task GetQuestionnaire_WithValidId_ShouldReturnQuestionnaire()
        {
            // Arrange
            await TestDbContextFactory.SeedTestDataAsync(_context);
            var questionnaireId = Guid.Parse("12345678-1234-1234-1234-123456789012");

            // Act
            var result = await _controller.GetQuestionnaire(questionnaireId);

            // Assert
            result.Should().NotBeNull();
            var actionResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            var questionnaire = actionResult.Value.Should().BeOfType<QuestionnaireDto>().Subject;

            questionnaire.Id.Should().Be(questionnaireId);
            questionnaire.Title.Should().Be("Test Questionnaire");
            questionnaire.Questions.Should().HaveCount(3);
            questionnaire.Questions[0].Type.Should().Be(QuestionType.SingleChoice);
            questionnaire.Questions[1].Type.Should().Be(QuestionType.MultipleChoice);
            questionnaire.Questions[2].Type.Should().Be(QuestionType.Descriptive);
        }

        [Fact]
        public async Task GetQuestionnaire_WithInvalidId_ShouldReturnNotFound()
        {
            // Arrange
            var invalidId = Guid.NewGuid();

            // Act
            var result = await _controller.GetQuestionnaire(invalidId);

            // Assert
            result.Result.Should().BeOfType<NotFoundResult>();
        }

        [Fact]
        public async Task SubmitResponse_WithValidData_ShouldCreateResponse()
        {
            // Arrange
            await TestDbContextFactory.SeedTestDataAsync(_context);
            var questionnaireId = Guid.Parse("12345678-1234-1234-1234-123456789012");

            var submitDto = new SubmitResponseDto
            {
                QuestionnaireId = questionnaireId,
                Responses = new List<QuestionResponseDto>
                {
                    new() { QuestionId = 1, SelectedOptionId = 2 },
                    new() { QuestionId = 3, TextAnswer = "I love testing!" }
                }
            };

            // Act
            var result = await _controller.SubmitResponse(submitDto);

            // Assert
            result.Should().BeOfType<OkObjectResult>();

            // Verify response was created in database
            var responseInDb = _context.QuestionnaireResponses
                .Where(r => r.QuestionnaireId == questionnaireId)
                .FirstOrDefault();

            responseInDb.Should().NotBeNull();
            responseInDb.Responses.Should().HaveCount(2);
        }

        [Fact]
        public async Task SubmitResponse_WithInvalidQuestionnaireId_ShouldReturnBadRequest()
        {
            // Arrange
            var invalidQuestionnaireId = Guid.NewGuid();
            var submitDto = new SubmitResponseDto
            {
                QuestionnaireId = invalidQuestionnaireId,
                Responses = new List<QuestionResponseDto>()
            };

            // Act
            var result = await _controller.SubmitResponse(submitDto);

            // Assert
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Fact]
        public async Task SubmitResponse_WithInactiveQuestionnaire_ShouldReturnBadRequest()
        {
            // Arrange
            await TestDbContextFactory.SeedTestDataAsync(_context);
            var questionnaireId = Guid.Parse("12345678-1234-1234-1234-123456789012");
            
            // Make questionnaire inactive
            var questionnaire = await _context.Questionnaires.FindAsync(questionnaireId);
            questionnaire!.IsActive = false;
            await _context.SaveChangesAsync();

            var submitDto = new SubmitResponseDto
            {
                QuestionnaireId = questionnaireId,
                Responses = new List<QuestionResponseDto>()
            };

            // Act
            var result = await _controller.SubmitResponse(submitDto);

            // Assert
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Fact]
        public async Task SubmitResponse_WithMissingRequiredFields_ShouldReturnBadRequest()
        {
            // Arrange
            await TestDbContextFactory.SeedTestDataAsync(_context);
            var questionnaireId = Guid.Parse("12345678-1234-1234-1234-123456789012");

            var submitDto = new SubmitResponseDto
            {
                QuestionnaireId = questionnaireId,
                Responses = new List<QuestionResponseDto>()
            };

            // Act
            var result = await _controller.SubmitResponse(submitDto);

            // Assert
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Fact]
        public async Task SubmitResponse_WithValidDataForAllQuestionTypes_ShouldCreateResponse()
        {
            // Arrange
            await TestDbContextFactory.SeedTestDataAsync(_context);
            var questionnaireId = Guid.Parse("12345678-1234-1234-1234-123456789012");

            var submitDto = new SubmitResponseDto
            {
                QuestionnaireId = questionnaireId,
                Responses = new List<QuestionResponseDto>
                {
                    new() { QuestionId = 1, SelectedOptionId = 2 }, // Single choice
                    new() { QuestionId = 2, SelectedOptionIds = new List<int> { 3 } }, // Multiple choice  
                    new() { QuestionId = 3, TextAnswer = "This is a descriptive answer" } // Descriptive
                }
            };

            // Act
            var result = await _controller.SubmitResponse(submitDto);

            // Assert
            result.Should().BeOfType<OkObjectResult>();

            // Verify all responses were saved
            var responseInDb = _context.QuestionnaireResponses
                .Where(r => r.QuestionnaireId == questionnaireId)
                .FirstOrDefault();

            responseInDb.Should().NotBeNull();
            responseInDb.Responses.Should().HaveCount(3);
        }

        public void Dispose()
        {
            _context?.Dispose();
        }
    }
}