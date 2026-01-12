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
            var subject = "Código de verificación - Wira";
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
                            <p>Gracias por registrarse en Wira. Para completar su registro y activar su cuenta, ingrese el siguiente código de verificación en nuestra web:</p>

                            <div class='code-box'>
                                <div class='code'>{verificationCode}</div>
                            </div>

                            <div class='warning'>
                                <p><strong>⚠️ Importante:</strong></p>
                                <ul>
                                    <li>Este código expirará en 10 minutos</li>
                                    <li>Solo puede usar este código una vez</li>
                                    <li>No comparta este código con nadie</li>
                                </ul>
                            </div>

                            <p>Si no creó esta cuenta, puede ignorar este email de forma segura.</p>
                        </div>
                        <div class='footer'>
                            <p>© 2026 Wira - Sistema de Licitaciones Mineras</p>
                            <p>Este es un email automático, por favor no responda.</p>
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

            var subject = "Restablecer contraseña - Wira";
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
                            <p>Recibimos una solicitud para restablecer la contraseña de su cuenta. Si fue usted quien la solicitó, haga clic en el siguiente botón:</p>

                            <div style='text-align: center;'>
                                <a href='{resetUrl}' class='button'>Restablecer Contraseña</a>
                            </div>

                            <p>Si el botón no funciona, también puede copiar y pegar el siguiente enlace en su navegador:</p>
                            <p style='background: #e9ecef; padding: 10px; border-radius: 4px; word-break: break-all;'>{resetUrl}</p>

                            <div class='warning'>
                                <p><strong>⚠️ Importante:</strong></p>
                                <ul>
                                    <li>Este enlace expirará en 1 hora</li>
                                    <li>Solo puede usar este enlace una vez</li>
                                    <li>Si no solicitó este cambio, ignore este email</li>
                                </ul>
                            </div>
                        </div>
                        <div class='footer'>
                            <p>© 2026 Wira - Sistema de Licitaciones Mineras</p>
                            <p>Este es un email automático, por favor no responda</p>
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
                            <p>Le confirmamos que su cuenta para <strong>{empresaNombre}</strong> fue aprobada. Ya puede iniciar sesión y usar Wira.</p>
                            <p>Gracias por sumarse.</p>
                        </div>
                        <div class='footer'>
                            <p>© 2026 Wira - Sistema de Licitaciones Mineras</p>
                            <p>Este es un email automático, por favor no responda</p>
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
                            <p>Si cree que se trata de un error, por favor contacte al administrador de la empresa.</p>
                        </div>
                        <div class='footer'>
                            <p>© 2026 Wira - Sistema de Licitaciones Mineras</p>
                            <p>Este es un email automático, por favor no responda</p>
                        </div>
                    </div>
                </body>
                </html>";

            await SendEmailAsync(toEmail, subject, body, true);
        }

        public async Task SendLicitacionCanceladaAsync(string toEmail, string userName, string licitacionTitulo)
        {
            var subject = $"Licitación cancelada: {licitacionTitulo}";
            var body = $@"
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset='utf-8'>
                    <style>
                        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                        .header {{ background: linear-gradient(135deg, #ef4444 0%, #d63636 100%); color: white; padding: 24px; text-align: center; border-radius: 8px 8px 0 0; }}
                        .content {{ background: #f8f9fa; padding: 28px; border-radius: 0 0 8px 8px; }}
                        .footer {{ text-align: center; margin-top: 22px; color: #666; font-size: 13px; }}
                    </style>
                </head>
                <body>
                    <div class='container'>
                        <div class='header'>
                            <h1>Licitación cancelada</h1>
                        </div>
                        <div class='content'>
                            <p>Hola {userName},</p>
                            <p>Le informamos que la licitación <strong>{licitacionTitulo}</strong> ha sido cancelada por la minera. Su propuesta asociada a esta licitación ya no será considerada.</p>
                            <p>Si tiene preguntas o necesita más detalles, por favor contacte a la minera responsable desde la plataforma.</p>
                        </div>
                        <div class='footer'>
                            <p>© 2026 Wira - Sistema de Licitaciones Mineras</p>
                            <p>Este es un email automático, por favor no responda.</p>
                        </div>
                    </div>
                </body>
                </html>";

            await SendEmailAsync(toEmail, subject, body, true);
        }

        public async Task SendLicitacionAdjudicadaAsync(string toEmail, string userName, string licitacionTitulo, string adjudicadoNombre)
        {
            var subject = $"Licitación adjudicada: {licitacionTitulo}";
            var body = $@"
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset='utf-8'>
                    <style>
                        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                        .header {{ background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 24px; text-align: center; border-radius: 8px 8px 0 0; }}
                        .content {{ background: #f8f9fa; padding: 28px; border-radius: 0 0 8px 8px; }}
                        .highlight {{ font-weight: bold; color: #0b5e1a; }}
                        .footer {{ text-align: center; margin-top: 22px; color: #666; font-size: 13px; }}
                    </style>
                </head>
                <body>
                    <div class='container'>
                        <div class='header'>
                            <h1>Licitación adjudicada</h1>
                        </div>
                        <div class='content'>
                            <p>Hola {userName},</p>
                            <p>La licitación <strong>{licitacionTitulo}</strong> ha sido adjudicada.</p>
                            <p>Proveedor adjudicado: <span class='highlight'>{adjudicadoNombre}</span></p>
                            <p>Para más detalles, ingrese a la plataforma o contacte a la minera responsable.</p>
                        </div>
                        <div class='footer'>
                            <p>© 2026 Wira - Sistema de Licitaciones Mineras</p>
                            <p>Este es un email automático, por favor no responda.</p>
                        </div>
                    </div>
                </body>
                </html>";

            await SendEmailAsync(toEmail, subject, body, true);
        }
    }
}
