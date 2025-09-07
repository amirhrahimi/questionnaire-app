using Microsoft.AspNetCore.Mvc;
using QRCoder;
using OpenGraphNet;

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

            // Create OpenGraph object
            var graph = OpenGraph.MakeGraph(
                title: title,
                type: "website",
                image: imageUrl ?? "",
                url: url,
                description: description,
                siteName: "Questionnaire App"
            );

            //// Add Twitter-specific metadata
            //if (!string.IsNullOrEmpty(twitterCard))
            //{
            //    graph.AddMetadata("twitter", "card", twitterCard);
            //}

            var html = $@"
        <!DOCTYPE html>
        <html lang='en'>
        <head>
            <meta charset='UTF-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            {graph.ToString()}
        </head>
        <body>
            <h1>{title}</h1>
            <p>{description}</p>
            <a href='{url}'>Go to Questionnaire</a>
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
