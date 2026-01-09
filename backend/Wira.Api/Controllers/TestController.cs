using Microsoft.AspNetCore.Mvc;
using Wira.Api.Data;
using Wira.Api.Services.Interfaces;

namespace Wira.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestController : ControllerBase
    {
        private readonly WiraDbContext _context;
        private readonly IEmailService _emailService;
        private readonly ILogger<TestController> _logger;

        public TestController(WiraDbContext context, IEmailService emailService, ILogger<TestController> logger)
        {
            _context = context;
            _emailService = emailService;
            _logger = logger;
        }

        [HttpGet("db")]
        public async Task<IActionResult> CheckDatabase()
        {
            try
            {
                var canConnect = await _context.Database.CanConnectAsync();
                return Ok(new { success = true, canConnect });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "DB connectivity test failed");
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        public class SendEmailRequest
        {
            public string ToEmail { get; set; } = string.Empty;
            public string? Subject { get; set; }
            public string? Body { get; set; }
        }

        [HttpPost("send-email")]
        public async Task<IActionResult> SendTestEmail([FromBody] SendEmailRequest request)
        {
            if (string.IsNullOrWhiteSpace(request?.ToEmail))
            {
                return BadRequest(new { success = false, message = "ToEmail is required" });
            }

            try
            {
                var subject = string.IsNullOrWhiteSpace(request.Subject) ? "Wira - Test Email" : request.Subject;
                var body = string.IsNullOrWhiteSpace(request.Body) ? "Este es un email de prueba desde Wira" : request.Body;

                await _emailService.SendEmailAsync(request.ToEmail, subject, body, true);
                return Ok(new { success = true, message = "Email enviado (o al menos intentado)" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending test email to {Email}", request.ToEmail);
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
    }
}
