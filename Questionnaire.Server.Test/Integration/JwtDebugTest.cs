using Microsoft.Extensions.DependencyInjection;
using System.IdentityModel.Tokens.Jwt;

namespace Questionnaire.Server.Test.Integration
{
    public class JwtDebugTest : IntegrationTestBase
    {
        public JwtDebugTest(QuestionnaireWebApplicationFactory factory) : base(factory)
        {
        }

        [Fact(Skip = "JWT authentication debugging - not needed for regular test run")]
        public async Task DebugJwtToken()
        {
            // Generate token
            var token = GetAuthToken(isAdmin: true);
            
            // Decode and examine the token
            var handler = new JwtSecurityTokenHandler();
            var jsonToken = handler.ReadJwtToken(token);
            
            // Output token details for debugging
            Console.WriteLine($"Token: {token}");
            Console.WriteLine($"Issuer: {jsonToken.Issuer}");
            Console.WriteLine($"Audience: {string.Join(", ", jsonToken.Audiences)}");
            Console.WriteLine($"Claims: {string.Join(", ", jsonToken.Claims.Select(c => $"{c.Type}={c.Value}"))}");
            Console.WriteLine($"Valid From: {jsonToken.ValidFrom}");
            Console.WriteLine($"Valid To: {jsonToken.ValidTo}");

            // Test a simple authenticated endpoint
            Client.AddJwtAuthentication(token);
            var response = await Client.GetAsync("/api/admin/questionnaires");
            
            Console.WriteLine($"Response Status: {response.StatusCode}");
            var content = await response.Content.ReadAsStringAsync();
            Console.WriteLine($"Response Content: {content}");
            
            // This should pass if JWT is working
            response.StatusCode.Should().Be(System.Net.HttpStatusCode.OK);
        }
    }
}