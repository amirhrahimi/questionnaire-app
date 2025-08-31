using System.Text.Json;
using Google.Apis.Auth;

namespace Questionnaire.Server.Services
{
    public interface IGoogleOAuthService
    {
        Task<GoogleUserInfo?> VerifyGoogleTokenAsync(string token);
    }

    public class GoogleOAuthService : IGoogleOAuthService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;

        public GoogleOAuthService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _configuration = configuration;
        }

        public async Task<GoogleUserInfo?> VerifyGoogleTokenAsync(string token)
        {
            try
            {
                // Method 1: Use Google.Apis.Auth library (more reliable)
                var payload = await GoogleJsonWebSignature.ValidateAsync(token);
                
                return new GoogleUserInfo
                {
                    Sub = payload.Subject,
                    Email = payload.Email,
                    Name = payload.Name,
                    Picture = payload.Picture,
                    Email_Verified = payload.EmailVerified
                };
            }
            catch (Exception)
            {
                // Fallback Method 2: Use Google's tokeninfo endpoint
                try
                {
                    var response = await _httpClient.GetAsync($"https://oauth2.googleapis.com/tokeninfo?id_token={token}");
                    
                    if (!response.IsSuccessStatusCode)
                        return null;

                    var content = await response.Content.ReadAsStringAsync();
                    var options = new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    };
                    
                    return JsonSerializer.Deserialize<GoogleUserInfo>(content, options);
                }
                catch
                {
                    return null;
                }
            }
        }
    }

    public class GoogleUserInfo
    {
        public string Sub { get; set; } = string.Empty; // Google ID
        public string Email { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Picture { get; set; } = string.Empty;
        public bool Email_Verified { get; set; }
    }
}
