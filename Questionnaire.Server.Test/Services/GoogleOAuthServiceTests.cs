using Microsoft.Extensions.Configuration;
using Questionnaire.Server.Services;
using Questionnaire.Server.Test.Helpers;
using System.Net;
using System.Text.Json;
using Moq.Contrib.HttpClient;

namespace Questionnaire.Server.Test.Services
{
    public class GoogleOAuthServiceTests
    {
        private readonly Mock<HttpMessageHandler> _mockHttpMessageHandler;
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly GoogleOAuthService _googleOAuthService;

        public GoogleOAuthServiceTests()
        {
            _mockHttpMessageHandler = new Mock<HttpMessageHandler>();
            _httpClient = _mockHttpMessageHandler.CreateClient();
            _configuration = ConfigurationHelper.CreateTestConfiguration();
            _googleOAuthService = new GoogleOAuthService(_httpClient, _configuration);
        }

        [Fact(Skip = "Google.Apis.Auth library cannot be properly mocked")]
        public async Task VerifyGoogleTokenAsync_WithValidToken_ShouldReturnGoogleUserInfo()
        {
            // Arrange
            var expectedUserInfo = new GoogleUserInfo
            {
                Sub = "google123",
                Email = "test@gmail.com",
                Name = "Test User",
                Picture = "https://example.com/photo.jpg",
                Email_Verified = true
            };

            var tokenInfoResponse = new
            {
                sub = expectedUserInfo.Sub,
                email = expectedUserInfo.Email,
                name = expectedUserInfo.Name,
                picture = expectedUserInfo.Picture,
                email_verified = expectedUserInfo.Email_Verified.ToString().ToLower()
            };

            var responseContent = JsonSerializer.Serialize(tokenInfoResponse);
            
            _mockHttpMessageHandler.SetupAnyRequest()
                .ReturnsResponse(HttpStatusCode.OK, responseContent);

            // Use an invalid token format that will cause Google.Apis.Auth to fail
            // and trigger the HTTP fallback that we can mock
            var invalidFormatToken = "invalid.token.format";

            // Act
            var result = await _googleOAuthService.VerifyGoogleTokenAsync(invalidFormatToken);

            // Assert
            result.Should().NotBeNull();
            result!.Sub.Should().Be(expectedUserInfo.Sub);
            result.Email.Should().Be(expectedUserInfo.Email);
            result.Name.Should().Be(expectedUserInfo.Name);
            result.Picture.Should().Be(expectedUserInfo.Picture);
            result.Email_Verified.Should().Be(expectedUserInfo.Email_Verified);
        }

        [Fact]
        public async Task VerifyGoogleTokenAsync_WithInvalidToken_ShouldReturnNull()
        {
            // Arrange
            _mockHttpMessageHandler.SetupAnyRequest()
                .ReturnsResponse(HttpStatusCode.BadRequest);

            var invalidToken = "invalid.token";

            // Act
            var result = await _googleOAuthService.VerifyGoogleTokenAsync(invalidToken);

            // Assert
            result.Should().BeNull();
        }

        [Fact]
        public async Task VerifyGoogleTokenAsync_WithHttpException_ShouldReturnNull()
        {
            // Arrange
            _mockHttpMessageHandler.SetupAnyRequest()
                .Throws(new HttpRequestException("Network error"));

            var token = "some.token";

            // Act
            var result = await _googleOAuthService.VerifyGoogleTokenAsync(token);

            // Assert
            result.Should().BeNull();
        }

        [Fact]
        public async Task VerifyGoogleTokenAsync_WithMalformedJson_ShouldReturnNull()
        {
            // Arrange
            _mockHttpMessageHandler.SetupAnyRequest()
                .ReturnsResponse(HttpStatusCode.OK, "invalid json content");

            var token = "some.token";

            // Act
            var result = await _googleOAuthService.VerifyGoogleTokenAsync(token);

            // Assert
            result.Should().BeNull();
        }

        [Fact]
        public async Task VerifyGoogleTokenAsync_WithEmptyToken_ShouldReturnNull()
        {
            // Act
            var result = await _googleOAuthService.VerifyGoogleTokenAsync(string.Empty);

            // Assert
            result.Should().BeNull();
        }

        [Fact]
        public async Task VerifyGoogleTokenAsync_WithNullToken_ShouldReturnNull()
        {
            // Act
            var result = await _googleOAuthService.VerifyGoogleTokenAsync(null!);

            // Assert
            result.Should().BeNull();
        }

        [Fact]
        public async Task VerifyGoogleTokenAsync_ShouldCallCorrectGoogleEndpoint()
        {
            // Arrange
            var token = "test.token";
            var expectedUrl = $"https://oauth2.googleapis.com/tokeninfo?id_token={token}";
            
            _mockHttpMessageHandler.SetupRequest(HttpMethod.Get, expectedUrl)
                .ReturnsResponse(HttpStatusCode.OK, "{\"sub\":\"123\",\"email\":\"test@gmail.com\"}");

            // Act
            await _googleOAuthService.VerifyGoogleTokenAsync(token);

            // Assert
            _mockHttpMessageHandler.VerifyRequest(HttpMethod.Get, expectedUrl, Times.Once());
        }

        [Fact]
        public async Task VerifyGoogleTokenAsync_WithPartialUserInfo_ShouldHandleMissingFields()
        {
            // Arrange
            var tokenInfoResponse = new
            {
                sub = "google123",
                email = "test@gmail.com",
                // Missing name, picture, email_verified
            };

            var responseContent = JsonSerializer.Serialize(tokenInfoResponse);
            
            _mockHttpMessageHandler.SetupAnyRequest()
                .ReturnsResponse(HttpStatusCode.OK, responseContent);

            var token = "valid.token";

            // Act
            var result = await _googleOAuthService.VerifyGoogleTokenAsync(token);

            // Assert
            result.Should().NotBeNull();
            result!.Sub.Should().Be("google123");
            result.Email.Should().Be("test@gmail.com");
            result.Name.Should().BeNullOrEmpty();
            result.Picture.Should().BeNullOrEmpty();
        }
    }
}