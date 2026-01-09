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
                var fromEmail = _configuration["Email:FromEmail"] ?? _configuration["Email:Username"];
                if (string.IsNullOrWhiteSpace(fromEmail))
                {
                    _logger.LogError("Email From address is not configured. Set Email:FromEmail or Email:Username in configuration.");
                    throw new InvalidOperationException("Email From address is not configured. Set Email:FromEmail or Email:Username in configuration.");
                }
                message.From.Add(new MailboxAddress("Wira Sistema", fromEmail));
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
                        .header {{ background: linear-gradient(135deg, #fc6b0a 0%, #ff8f42 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }}
                        .content {{ background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }}
                        .code-box {{ background: white; border: 2px dashed #fc6b0a; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }}
                        .code {{ font-size: 2.5rem; font-weight: bold; color: #fc6b0a; letter-spacing: 0.5rem; font-family: 'Courier New', monospace; }}
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
                        .header {{ background: linear-gradient(135deg, #fc6b0a 0%, #ff8f42 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }}
                        .content {{ background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }}
                        .button {{ display: inline-block; background: linear-gradient(135deg, #fc6b0a 0%, #ff8f42 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
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

        public async Task SendApprovalEmailAsync(string toEmail, string userName, string empresaNombre)
        {
            var subject = "Cuenta aprobada - Wira";
            var body = $@"
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset='utf-8'>
                    <style>
                        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                        .header {{ background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 26px; text-align: center; border-radius: 10px 10px 0 0; }}
                        .content {{ background: #f8f9fa; padding: 28px; border-radius: 0 0 10px 10px; }}
                        .footer {{ text-align: center; margin-top: 22px; color: #666; font-size: 13px; }}
                    </style>
                </head>
                <body>
                    <div class='container'>
                        <div class='header'>
                            <h1>¡Tu cuenta fue aprobada!</h1>
                        </div>
                        <div class='content'>
                            <p>Hola {userName},</p>
                            <p>Te confirmamos que tu cuenta para <strong>{empresaNombre}</strong> fue aprobada. Ya puedes iniciar sesión y usar Wira.</p>
                            <p>Gracias por sumarte.</p>
                        </div>
                        <div class='footer'>
                            <p>© 2025 Wira - Sistema de Licitaciones Mineras</p>
                        </div>
                    </div>
                </body>
                </html>";

            await SendEmailAsync(toEmail, subject, body, true);
        }

        public async Task SendRejectionEmailAsync(string toEmail, string userName, string empresaNombre, string? motivo)
        {
            var subject = "Cuenta rechazada - Wira";
            var reasonText = string.IsNullOrWhiteSpace(motivo) ? "" : $"<p>Motivo: {motivo}</p>";
            var body = $@"
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset='utf-8'>
                    <style>
                        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                        .header {{ background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%); color: white; padding: 26px; text-align: center; border-radius: 10px 10px 0 0; }}
                        .content {{ background: #f8f9fa; padding: 28px; border-radius: 0 0 10px 10px; }}
                        .footer {{ text-align: center; margin-top: 22px; color: #666; font-size: 13px; }}
                    </style>
                </head>
                <body>
                    <div class='container'>
                        <div class='header'>
                            <h1>Tu cuenta fue rechazada</h1>
                        </div>
                        <div class='content'>
                            <p>Hola {userName},</p>
                            <p>La solicitud de cuenta asociada a <strong>{empresaNombre}</strong> fue rechazada.</p>
                            {reasonText}
                            <p>Si crees que se trata de un error, por favor contacta al administrador de la empresa.</p>
                        </div>
                        <div class='footer'>
                            <p>© 2025 Wira - Sistema de Licitaciones Mineras</p>
                        </div>
                    </div>
                </body>
                </html>";

            await SendEmailAsync(toEmail, subject, body, true);
        }
    }
}
