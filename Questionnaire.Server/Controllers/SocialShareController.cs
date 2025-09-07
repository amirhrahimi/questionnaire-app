using Microsoft.AspNetCore.Mvc;
using QRCoder;

namespace Questionnaire.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SocialShareController : ControllerBase
    {
        [HttpGet("share-questionnaire")]
        public IActionResult ShareQuestionnaire(
            [FromQuery] string title,
            [FromQuery] string url,
            [FromQuery] string? description = null,
            [FromQuery] string? imageUrl = null)
        {
            if (string.IsNullOrEmpty(title) || string.IsNullOrEmpty(url))
                return BadRequest("Title and URL are required");

            // Set default values if not provided
            description ??= "Fill out this questionnaire and help us gather valuable insights!";
            
            // Create proper Open Graph and Twitter metadata manually for better control
            var html = $@"
<!DOCTYPE html>
<html lang=""en"">
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>{title}</title>
    
    <!-- Open Graph metadata -->
    <meta property=""og:title"" content=""{title}"" />
    <meta property=""og:description"" content=""{description}"" />
    <meta property=""og:url"" content=""{url}"" />
    <meta property=""og:type"" content=""website"" />
    <meta property=""og:site_name"" content=""Questionnaire App"" />
    {(string.IsNullOrEmpty(imageUrl) ? "" : $@"<meta property=""og:image"" content=""{imageUrl}"" />")}
    
    <!-- Twitter Card metadata -->
    <meta name=""twitter:card"" content=""summary_large_image"" />
    <meta name=""twitter:title"" content=""{title}"" />
    <meta name=""twitter:description"" content=""{description}"" />
    {(string.IsNullOrEmpty(imageUrl) ? "" : $@"<meta name=""twitter:image"" content=""{imageUrl}"" />")}
    
    <!-- WhatsApp/Telegram specific -->
    <meta name=""description"" content=""{description}"" />
    
    <!-- Redirect to the actual questionnaire -->
    <meta http-equiv=""refresh"" content=""3;url={url}"" />
</head>
<body>
    <div style=""font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center;"">
        <h1>{title}</h1>
        <p>{description}</p>
        <p>You will be redirected to the questionnaire in 3 seconds...</p>
        <a href=""{url}"" style=""background-color: #1976d2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 20px;"">Go to Questionnaire Now</a>
    </div>
</body>
</html>";

            return Content(html, "text/html");
        }

        // NEW: Clean path-based share URL
        [HttpGet("/share/questionnaire/{questionnaireId}")]
        public IActionResult ShareQuestionnaireByPath(string questionnaireId)
        {
            // Here you would typically get questionnaire details from your database
            // For now, we'll use default values and the questionnaireId
            
            var title = $"Questionnaire #{questionnaireId}";
            var description = "Fill out this questionnaire and help us gather valuable insights!";
            var questionnaireUrl = $"https://web-production-83507.up.railway.app/questionnaire/d4e5f6a7-b8c9-0123-defa-432134567893";
            var qrImageUrl = $"https://api-production-b7e2.up.railway.app/api/socialshare/qr?url={Uri.EscapeDataString(questionnaireUrl)}";

            // TODO: In a real app, you'd fetch the actual questionnaire title from database
            // var questionnaire = await _questionnaireService.GetByIdAsync(questionnaireId);
            // title = questionnaire?.Title ?? title;

            var html = $@"
<!DOCTYPE html>
<html lang=""en"">
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>{title}</title>
    
    <!-- Open Graph metadata -->
    <meta property=""og:title"" content=""{title}"" />
    <meta property=""og:description"" content=""{description}"" />
    <meta property=""og:url"" content=""{questionnaireUrl}"" />
    <meta property=""og:type"" content=""website"" />
    <meta property=""og:site_name"" content=""Questionnaire App"" />
    <meta property=""og:image"" content=""{qrImageUrl}"" />
    
    <!-- Twitter Card metadata -->
    <meta name=""twitter:card"" content=""summary_large_image"" />
    <meta name=""twitter:title"" content=""{title}"" />
    <meta name=""twitter:description"" content=""{description}"" />
    <meta name=""twitter:image"" content=""{qrImageUrl}"" />
    
    <!-- WhatsApp/Telegram specific -->
    <meta name=""description"" content=""{description}"" />
    
    <!-- Redirect to the actual questionnaire -->
    <meta http-equiv=""refresh"" content=""3;url={questionnaireUrl}"" />
</head>
<body>
    <div style=""font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center;"">
        <h1>{title}</h1>
        <p>{description}</p>
        <p>You will be redirected to the questionnaire in 3 seconds...</p>
        <a href=""{questionnaireUrl}"" style=""background-color: #1976d2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 20px;"">Go to Questionnaire Now</a>
    </div>
</body>
</html>";

            return Content(html, "text/html");
        }

        [HttpGet("qr")]
        public IActionResult GenerateQrCode([FromQuery] string url)
        {
            if (string.IsNullOrEmpty(url))
            {
                return BadRequest("URL parameter is required");
            }

            try
            {
                using var qrGenerator = new QRCodeGenerator();
                using var qrCodeData = qrGenerator.CreateQrCode(url, QRCodeGenerator.ECCLevel.Q);
                using var qrCode = new PngByteQRCode(qrCodeData);
                var qrCodeBytes = qrCode.GetGraphic(20);

                return File(qrCodeBytes, "image/png");
            }
            catch (Exception ex)
            {
                return BadRequest($"Error generating QR code: {ex.Message}");
            }
        }

        [HttpGet("test-share")]
        public IActionResult TestShare()
        {
            // Create a test share URL with sample data
            var title = "Customer Satisfaction Survey 2025";
            var description = "Help us improve our services by sharing your feedback";
            var url = $"{Request.Scheme}://{Request.Host}/questionnaire/abc123-def456-789";
            var imageUrl = $"{Request.Scheme}://{Request.Host}/api/socialshare/qr?url={Uri.EscapeDataString(url)}";

            return ShareQuestionnaire(title, url, description, imageUrl);
        }
    }
}
