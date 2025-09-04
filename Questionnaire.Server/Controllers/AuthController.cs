using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Questionnaire.Server.Data;
using Questionnaire.Server.DTOs;
using Questionnaire.Server.Models;
using Questionnaire.Server.Services;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

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
        private readonly IConfiguration _configuration;

        public AuthController(
            QuestionnaireDbContext context,
            IGoogleOAuthService googleOAuthService,
            IJwtService jwtService,
            ILogger<AuthController> logger,
            IConfiguration configuration)
        {
            _context = context;
            _googleOAuthService = googleOAuthService;
            _jwtService = jwtService;
            _logger = logger;
            _configuration = configuration;
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

                // Check if user is admin (this is also enforced by JWT claims)
                if (!user.IsAdmin)
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
                        IsAdmin = user.IsAdmin
                    }
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<ActionResult<UserDto>> GetCurrentUser()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId) || !int.TryParse(userId, out var userIdInt))
                {
                    return Unauthorized();
                }

                var user = await _context.Users.FindAsync(userIdInt);
                if (user == null)
                {
                    return NotFound();
                }

                return Ok(new UserDto
                {
                    Id = user.Id,
                    Email = user.Email,
                    Name = user.Name,
                    Picture = user.Picture,
                    IsAdmin = user.IsAdmin
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get current user");
                return StatusCode(500, "Failed to get user information");
            }
        }

        private bool IsAdminEmail(string email)
        {
            // Get admin emails from configuration/environment variables
            var adminEmailsConfig = _configuration["AdminEmails"];
            
            if (string.IsNullOrEmpty(adminEmailsConfig))
            {
                // Fallback to hardcoded admin emails if no config is provided
                var defaultAdminEmails = new[]
                {
                    "a.rahimi.at@gmail.com", // Your current admin email
                };
                return defaultAdminEmails.Contains(email.ToLower());
            }

            // Parse comma-separated admin emails from configuration
            var adminEmails = adminEmailsConfig
                .Split(',', StringSplitOptions.RemoveEmptyEntries)
                .Select(e => e.Trim().ToLower())
                .ToArray();

            return adminEmails.Contains(email.ToLower());
        }
    }
}
