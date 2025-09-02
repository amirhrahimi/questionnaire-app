using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Questionnaire.Server.Data;
using Questionnaire.Server.DTOs;
using Questionnaire.Server.Models;
using Questionnaire.Server.Services;

namespace Questionnaire.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly QuestionnaireDbContext _context;
        private readonly IGoogleOAuthService _googleOAuthService;
        private readonly IJwtService _jwtService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            QuestionnaireDbContext context,
            IGoogleOAuthService googleOAuthService,
            IJwtService jwtService,
            ILogger<AuthController> logger)
        {
            _context = context;
            _googleOAuthService = googleOAuthService;
            _jwtService = jwtService;
            _logger = logger;
        }

        [HttpPost("google-login")]
        public async Task<ActionResult<LoginResponseDto>> GoogleLogin([FromBody] LoginRequestDto request)
        {
            try
            {
                _logger.LogInformation("Attempting Google login with token length: {TokenLength}", request.GoogleToken?.Length ?? 0);
                
                if (string.IsNullOrEmpty(request.GoogleToken))
                {
                    _logger.LogWarning("Empty or null Google token received");
                    return BadRequest("Google token is required");
                }
                
                // Verify Google token
                var googleUserInfo = await _googleOAuthService.VerifyGoogleTokenAsync(request.GoogleToken);
                if (googleUserInfo == null)
                {
                    _logger.LogWarning("Google token verification failed");
                    return Unauthorized("Invalid Google token");
                }

                if (!googleUserInfo.Email_Verified)
                {
                    _logger.LogWarning("Google email not verified for user: {Email}", googleUserInfo.Email);
                    return Unauthorized("Email not verified");
                }

                _logger.LogInformation("Google token verified for user: {Email}", googleUserInfo.Email);

                // Find or create user
                var user = await _context.Users.FirstOrDefaultAsync(u => u.GoogleId == googleUserInfo.Sub);
                if (user == null)
                {
                    user = new User
                    {
                        GoogleId = googleUserInfo.Sub,
                        Email = googleUserInfo.Email,
                        Name = googleUserInfo.Name,
                        Picture = googleUserInfo.Picture,
                        IsAdmin = IsAdminEmail(googleUserInfo.Email), // Configure this method
                        CreatedAt = DateTime.UtcNow,
                        LastLoginAt = DateTime.UtcNow
                    };
                    _context.Users.Add(user);
                }
                else
                {
                    // Update user info
                    user.Name = googleUserInfo.Name;
                    user.Picture = googleUserInfo.Picture;
                    user.LastLoginAt = DateTime.UtcNow;
                }

                await _context.SaveChangesAsync();

                // Check if user is admin
                if (!user.IsAdmin && user.Email != "a.rahimi.at@gmail.com")
                {
                    return Forbid("Access denied. Admin privileges required.");
                }

                // Generate JWT token
                var token = _jwtService.GenerateToken(user);

                var response = new LoginResponseDto
                {
                    Token = token,
                    User = new UserDto
                    {
                        Id = user.Id,
                        Email = user.Email,
                        Name = user.Name,
                        Picture = user.Picture,
                        IsAdmin = user.IsAdmin || user.Email == "a.rahimi.at@gmail.com"
                    }
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        private bool IsAdminEmail(string email)
        {
            // Configure your admin emails here
            var adminEmails = new[]
            {
                "ah.rahimy@gmail.com", // Your admin email
                "admin@yourdomain.com", // Replace with additional admin emails as needed
            };

            return adminEmails.Contains(email.ToLower());
        }
    }
}
