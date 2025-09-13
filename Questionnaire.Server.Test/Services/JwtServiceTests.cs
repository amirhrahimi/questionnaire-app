using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Questionnaire.Server.Models;
using Questionnaire.Server.Services;
using Questionnaire.Server.Test.Helpers;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace Questionnaire.Server.Test.Services
{
    public class JwtServiceTests
    {
        private readonly IConfiguration _configuration;
        private readonly JwtService _jwtService;
        private readonly User _testUser;

        public JwtServiceTests()
        {
            _configuration = ConfigurationHelper.CreateTestConfiguration();
            _jwtService = new JwtService(_configuration);
            _testUser = new User
            {
                Id = 1,
                Email = "test@example.com",
                Name = "Test User",
                GoogleId = "google123",
                IsAdmin = false
            };
        }

        [Fact]
        public void GenerateToken_WithValidUser_ShouldReturnValidJwtToken()
        {
            // Act
            var token = _jwtService.GenerateToken(_testUser);

            // Assert
            token.Should().NotBeNullOrEmpty();
            
            // Verify it's a valid JWT format (3 parts separated by dots)
            var tokenParts = token.Split('.');
            tokenParts.Should().HaveCount(3);
        }

        [Fact]
        public void GenerateToken_WithValidUser_ShouldContainCorrectClaims()
        {
            // Act
            var token = _jwtService.GenerateToken(_testUser);

            // Assert
            var tokenHandler = new JwtSecurityTokenHandler();
            var jwt = tokenHandler.ReadJwtToken(token);

            // Verify claims
            jwt.Claims.Should().Contain(c => c.Type == ClaimTypes.NameIdentifier && c.Value == _testUser.Id.ToString());
            jwt.Claims.Should().Contain(c => c.Type == ClaimTypes.Email && c.Value == _testUser.Email);
            jwt.Claims.Should().Contain(c => c.Type == ClaimTypes.Name && c.Value == _testUser.Name);
            jwt.Claims.Should().Contain(c => c.Type == "IsAdmin" && c.Value == _testUser.IsAdmin.ToString());
            jwt.Claims.Should().Contain(c => c.Type == "GoogleId" && c.Value == _testUser.GoogleId);
        }

        [Fact]
        public void GenerateToken_WithAdminUser_ShouldSetIsAdminClaimToTrue()
        {
            // Arrange
            var adminUser = new User
            {
                Id = 2,
                Email = "admin@example.com",
                Name = "Admin User",
                GoogleId = "admin123",
                IsAdmin = true
            };

            // Act
            var token = _jwtService.GenerateToken(adminUser);

            // Assert
            var tokenHandler = new JwtSecurityTokenHandler();
            var jwt = tokenHandler.ReadJwtToken(token);
            
            jwt.Claims.Should().Contain(c => c.Type == "IsAdmin" && c.Value == "True");
        }

        [Fact]
        public void GenerateToken_ShouldSetCorrectIssuerAndAudience()
        {
            // Act
            var token = _jwtService.GenerateToken(_testUser);

            // Assert
            var tokenHandler = new JwtSecurityTokenHandler();
            var jwt = tokenHandler.ReadJwtToken(token);

            jwt.Issuer.Should().Be(_configuration["Jwt:Issuer"]);
            jwt.Audiences.Should().Contain(_configuration["Jwt:Audience"]);
        }

        [Fact]
        public void GenerateToken_ShouldSetExpirationToSevenDaysFromNow()
        {
            // Arrange
            var beforeGeneration = DateTime.UtcNow;

            // Act
            var token = _jwtService.GenerateToken(_testUser);

            // Assert
            var tokenHandler = new JwtSecurityTokenHandler();
            var jwt = tokenHandler.ReadJwtToken(token);
            var afterGeneration = DateTime.UtcNow;

            // Token should expire 7 days from generation time (with some tolerance)
            var expectedExpiry = beforeGeneration.AddDays(7);
            var actualExpiry = jwt.ValidTo;

            actualExpiry.Should().BeCloseTo(expectedExpiry, TimeSpan.FromMinutes(1));
        }

        [Fact]
        public void ValidateToken_WithValidToken_ShouldReturnClaimsPrincipal()
        {
            // Arrange
            var token = _jwtService.GenerateToken(_testUser);

            // Act
            var principal = _jwtService.ValidateToken(token);

            // Assert
            principal.Should().NotBeNull();
            principal!.Identity!.IsAuthenticated.Should().BeTrue();
            
            // Verify claims
            principal.FindFirst(ClaimTypes.NameIdentifier)?.Value.Should().Be(_testUser.Id.ToString());
            principal.FindFirst(ClaimTypes.Email)?.Value.Should().Be(_testUser.Email);
            principal.FindFirst(ClaimTypes.Name)?.Value.Should().Be(_testUser.Name);
            principal.FindFirst("IsAdmin")?.Value.Should().Be(_testUser.IsAdmin.ToString());
            principal.FindFirst("GoogleId")?.Value.Should().Be(_testUser.GoogleId);
        }

        [Fact]
        public void ValidateToken_WithInvalidToken_ShouldReturnNull()
        {
            // Arrange
            var invalidToken = "invalid.token.here";

            // Act
            var principal = _jwtService.ValidateToken(invalidToken);

            // Assert
            principal.Should().BeNull();
        }

        [Fact]
        public void ValidateToken_WithExpiredToken_ShouldReturnNull()
        {
            // Arrange - Create a token with past expiry
            var key = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(_configuration["Jwt:SecretKey"]!));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, _testUser.Id.ToString()),
                new Claim(ClaimTypes.Email, _testUser.Email)
            };

            var expiredToken = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddDays(-1), // Expired yesterday
                signingCredentials: credentials
            );

            var tokenString = new JwtSecurityTokenHandler().WriteToken(expiredToken);

            // Act
            var principal = _jwtService.ValidateToken(tokenString);

            // Assert
            principal.Should().BeNull();
        }

        [Fact]
        public void ValidateToken_WithWrongIssuer_ShouldReturnNull()
        {
            // Arrange - Create a token with wrong issuer
            var key = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(_configuration["Jwt:SecretKey"]!));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, _testUser.Id.ToString()),
                new Claim(ClaimTypes.Email, _testUser.Email)
            };

            var tokenWithWrongIssuer = new JwtSecurityToken(
                issuer: "WrongIssuer",
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: credentials
            );

            var tokenString = new JwtSecurityTokenHandler().WriteToken(tokenWithWrongIssuer);

            // Act
            var principal = _jwtService.ValidateToken(tokenString);

            // Assert
            principal.Should().BeNull();
        }

        [Fact]
        public void ValidateToken_WithEmptyToken_ShouldReturnNull()
        {
            // Act
            var principal = _jwtService.ValidateToken(string.Empty);

            // Assert
            principal.Should().BeNull();
        }

        [Fact]
        public void ValidateToken_WithNullToken_ShouldReturnNull()
        {
            // Act
            var principal = _jwtService.ValidateToken(null!);

            // Assert
            principal.Should().BeNull();
        }
    }
}