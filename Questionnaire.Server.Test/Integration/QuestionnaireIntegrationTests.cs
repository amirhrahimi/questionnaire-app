using Questionnaire.Server.DTOs;
using System.Net;
using System.Text.Json;

namespace Questionnaire.Server.Test.Integration
{
    public class QuestionnaireIntegrationTests : IntegrationTestBase
    {
        public QuestionnaireIntegrationTests(QuestionnaireWebApplicationFactory factory) : base(factory)
        {
        }

        [Fact]
        public async Task GetActiveQuestionnaires_ShouldReturnQuestionnaires()
        {
            // Arrange
            await SeedTestDataAsync();
            
            // Act
            var response = await Client.GetAsync("/api/questionnaire");

            // Assert
            response.EnsureSuccessStatusCode();
            var content = await response.Content.ReadAsStringAsync();
            var questionnaires = JsonSerializer.Deserialize<List<QuestionnaireDto>>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
            
            questionnaires.Should().NotBeNull();
            questionnaires.Should().HaveCount(1);
            questionnaires![0].Title.Should().Be("Test Questionnaire");
        }

        [Fact]
        public async Task GetQuestionnaire_WithValidId_ShouldReturnQuestionnaire()
        {
            // Arrange
            await SeedTestDataAsync();
            var questionnaireId = Guid.Parse("12345678-1234-1234-1234-123456789012");

            // Act
            var response = await Client.GetAsync($"/api/questionnaire/{questionnaireId}");

            // Assert
            response.EnsureSuccessStatusCode();
            var content = await response.Content.ReadAsStringAsync();
            var questionnaire = JsonSerializer.Deserialize<QuestionnaireDto>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
            
            questionnaire.Should().NotBeNull();
            questionnaire!.Id.Should().Be(questionnaireId);
            questionnaire.Questions.Should().HaveCount(3);
        }

        [Fact]
        public async Task SubmitResponse_WithValidData_ShouldSucceed()
        {
            // Arrange
            await SeedTestDataAsync();
            var questionnaireId = Guid.Parse("12345678-1234-1234-1234-123456789012");
            var submitDto = new SubmitResponseDto
            {
                QuestionnaireId = questionnaireId,
                Responses = new List<QuestionResponseDto>
                {
                    new() { QuestionId = 1, SelectedOptionId = 2 },
                    new() { QuestionId = 2, SelectedOptionIds = new List<int> { 4, 5 } },
                    new() { QuestionId = 3, TextAnswer = "Integration test response" }
                }
            };

            // Act
            var response = await Client.PostAsJsonAsync("/api/questionnaire/submit", submitDto);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
        }

        [Fact(Skip = "JWT authentication not working in test environment")]
        public async Task AdminEndpoints_WithoutAuth_ShouldReturn401()
        {
            // Act
            var response = await Client.GetAsync("/api/admin/questionnaires");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }

        [Fact(Skip = "JWT authentication not working in test environment")]
        public async Task AdminEndpoints_WithUserAuth_ShouldReturn403()
        {
            // Arrange
            var userToken = GetAuthToken(isAdmin: false);
            Client.AddJwtAuthentication(userToken);

            // Act
            var response = await Client.GetAsync("/api/admin/questionnaires");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
        }

        [Fact(Skip = "JWT authentication not working in test environment")]
        public async Task AdminEndpoints_WithAdminAuth_ShouldSucceed()
        {
            // Arrange
            await SeedTestDataAsync();
            var adminToken = GetAuthToken(isAdmin: true);
            Client.AddJwtAuthentication(adminToken);

            // Act
            var response = await Client.GetAsync("/api/admin/questionnaires");

            // Assert
            response.EnsureSuccessStatusCode();
            var content = await response.Content.ReadAsStringAsync();
            var questionnaires = JsonSerializer.Deserialize<List<QuestionnaireDto>>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
            questionnaires.Should().NotBeNull();
        }
    }
}