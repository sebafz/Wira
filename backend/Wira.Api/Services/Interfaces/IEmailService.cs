using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace Wira.Api.Services.Interfaces
{
    public interface IEmailService
    {
        Task SendEmailAsync(string toEmail, string subject, string body, bool isHtml = true);
        Task SendVerificationEmailAsync(string toEmail, string userName, string verificationToken);
        Task SendPasswordResetEmailAsync(string toEmail, string userName, string resetToken);
        Task SendApprovalEmailAsync(string toEmail, string userName, string empresaNombre);
        Task SendRejectionEmailAsync(string toEmail, string userName, string empresaNombre, string? motivo);
    }
}
