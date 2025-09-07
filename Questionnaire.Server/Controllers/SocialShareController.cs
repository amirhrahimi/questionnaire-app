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
    {(string.IsNullOrEmpty(imageUrl) ? "" : $@"<meta property=""og:image"" content=""{imageUrl}"" />
    <meta property=""og:image:type"" content=""image/png"" />
    <meta property=""og:image:width"" content=""300"" />
    <meta property=""og:image:height"" content=""300"" />")}
    
    <!-- Twitter Card metadata -->
    <meta name=""twitter:card"" content=""summary"" />
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
    }
}
