using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using Wira.Api.Services.Interfaces;

namespace Wira.Api.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string body, bool isHtml = true)
        {
            try
            {
                var message = new MimeMessage();
                message.From.Add(new MailboxAddress("Wira Sistema", _configuration["Email:FromEmail"]));
                message.To.Add(new MailboxAddress("", toEmail));
                message.Subject = subject;

                var bodyBuilder = new BodyBuilder();
                if (isHtml)
                {
                    bodyBuilder.HtmlBody = body;
                }
                else
                {
                    bodyBuilder.TextBody = body;
                }
                message.Body = bodyBuilder.ToMessageBody();

                using var client = new SmtpClient();
                
                // Para desarrollo, usar configuración SMTP local o de prueba
                var smtpHost = _configuration["Email:SmtpHost"] ?? "localhost";
                var smtpPort = int.Parse(_configuration["Email:SmtpPort"] ?? "587");
                var username = _configuration["Email:Username"];
                var password = _configuration["Email:Password"];

                await client.ConnectAsync(smtpHost, smtpPort, SecureSocketOptions.StartTlsWhenAvailable);
                
                if (!string.IsNullOrEmpty(username) && !string.IsNullOrEmpty(password))
                {
                    await client.AuthenticateAsync(username, password);
                }

                await client.SendAsync(message);
                await client.DisconnectAsync(true);

                _logger.LogInformation("Email enviado exitosamente a {Email}", toEmail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error enviando email a {Email}", toEmail);
                throw;
            }
        }

        public async Task SendVerificationEmailAsync(string toEmail, string userName, string verificationCode)
        {
            var subject = "Código de verificación - Wira Sistema";
            var body = $@"
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset='utf-8'>
                    <style>
                        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }}
                        .content {{ background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }}
                        .code-box {{ background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }}
                        .code {{ font-size: 2.5rem; font-weight: bold; color: #667eea; letter-spacing: 0.5rem; font-family: 'Courier New', monospace; }}
                        .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 14px; }}
                        .warning {{ background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 4px; margin: 15px 0; }}
                    </style>
                </head>
                <body>
                    <div class='container'>
                        <div class='header'>
                            <h1>¡Bienvenido a Wira!</h1>
                            <p>Sistema de Licitaciones Mineras</p>
                        </div>
                        <div class='content'>
                            <h2>Hola {userName},</h2>
                            <p>Gracias por registrarte en Wira. Para completar tu registro y activar tu cuenta, ingresa el siguiente código de verificación en la aplicación:</p>
                            
                            <div class='code-box'>
                                <div class='code'>{verificationCode}</div>
                            </div>
                            
                            <div class='warning'>
                                <p><strong>⚠️ Importante:</strong></p>
                                <ul>
                                    <li>Este código expirará en 10 minutos</li>
                                    <li>Solo puedes usar este código una vez</li>
                                    <li>No compartas este código con nadie</li>
                                </ul>
                            </div>
                            
                            <p>Si no creaste esta cuenta, puedes ignorar este email de forma segura.</p>
                        </div>
                        <div class='footer'>
                            <p>© 2025 Wira - Sistema de Licitaciones Mineras</p>
                            <p>Este es un email automático, por favor no respondas.</p>
                        </div>
                    </div>
                </body>
                </html>";

            await SendEmailAsync(toEmail, subject, body, true);
        }

        public async Task SendPasswordResetEmailAsync(string toEmail, string userName, string resetToken)
        {
            var frontendUrl = _configuration["Frontend:BaseUrl"] ?? "http://localhost:5173";
            var resetUrl = $"{frontendUrl}/reset-password?token={resetToken}";

            var subject = "Restablecer contraseña - Wira Sistema";
            var body = $@"
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset='utf-8'>
                    <style>
                        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }}
                        .content {{ background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }}
                        .button {{ display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
                        .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 14px; }}
                        .warning {{ background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 4px; margin: 15px 0; }}
                    </style>
                </head>
                <body>
                    <div class='container'>
                        <div class='header'>
                            <h1>Restablecer Contraseña</h1>
                            <p>Wira Sistema</p>
                        </div>
                        <div class='content'>
                            <h2>Hola {userName},</h2>
                            <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta. Si fuiste tú quien la solicitó, haz clic en el siguiente botón:</p>
                            
                            <div style='text-align: center;'>
                                <a href='{resetUrl}' class='button'>Restablecer Contraseña</a>
                            </div>
                            
                            <p>Si el botón no funciona, también puedes copiar y pegar el siguiente enlace en tu navegador:</p>
                            <p style='background: #e9ecef; padding: 10px; border-radius: 4px; word-break: break-all;'>{resetUrl}</p>
                            
                            <div class='warning'>
                                <p><strong>⚠️ Importante:</strong></p>
                                <ul>
                                    <li>Este enlace expirará en 1 hora por seguridad</li>
                                    <li>Solo puedes usar este enlace una vez</li>
                                    <li>Si no solicitaste este cambio, ignora este email</li>
                                </ul>
                            </div>
                        </div>
                        <div class='footer'>
                            <p>© 2025 Wira - Sistema de Licitaciones Mineras</p>
                            <p>Este es un email automático, por favor no respondas.</p>
                        </div>
                    </div>
                </body>
                </html>";

            await SendEmailAsync(toEmail, subject, body, true);
        }
    }
}
