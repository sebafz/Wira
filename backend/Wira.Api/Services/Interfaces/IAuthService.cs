using Wira.Api.DTOs;

namespace Wira.Api.Services.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponse> LoginAsync(LoginRequest request);
        Task<AuthResponse> RegisterAsync(RegisterRequest request);
        Task<AuthResponse> ForgotPasswordAsync(ForgotPasswordRequest request);
        Task<AuthResponse> ResetPasswordAsync(ResetPasswordRequest request);
        Task<AuthResponse> VerifyEmailAsync(VerifyEmailRequest request);
        Task<AuthResponse> ResendVerificationEmailAsync(string email);
        string GenerateJwtToken(UserInfo user);
        string GenerateEmailVerificationToken();
        string GeneratePasswordResetToken();
    }
}
