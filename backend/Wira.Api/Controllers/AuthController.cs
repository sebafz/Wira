using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Wira.Api.Data;
using Wira.Api.DTOs;
using Wira.Api.Services.Interfaces;

namespace Wira.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly WiraDbContext _context;

        public AuthController(IAuthService authService, WiraDbContext context)
        {
            _authService = authService;
            _context = context;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _authService.LoginAsync(request);
            
            if (result.Success)
            {
                return Ok(result);
            }
            
            return Unauthorized(result);
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _authService.RegisterAsync(request);
            
            if (result.Success)
            {
                return Ok(result);
            }
            
            return BadRequest(result);
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _authService.ForgotPasswordAsync(request);
            return Ok(result);
        }

        [HttpPost("verify-email")]
        public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _authService.VerifyEmailAsync(request);
            
            if (result.Success)
            {
                return Ok(result);
            }
            
            return BadRequest(result);
        }

        [HttpPost("resend-verification")]
        public async Task<IActionResult> ResendVerificationEmail([FromBody] ResendVerificationRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _authService.ResendVerificationEmailAsync(request.Email);
            
            if (result.Success)
            {
                return Ok(result);
            }
            
            return BadRequest(result);
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _authService.ResetPasswordAsync(request);
            
            if (result.Success)
            {
                return Ok(result);
            }
            
            return BadRequest(result);
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetCurrentUser()
        {
            try
            {
                var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized();
                }

                var user = await _context.Usuarios
                    .Include(u => u.UsuariosRoles)
                        .ThenInclude(ur => ur.Rol)
                    .Include(u => u.Minera)
                    .Include(u => u.Proveedor)
                    .FirstOrDefaultAsync(u => u.UsuarioID == userId);

                if (user == null)
                {
                    return NotFound();
                }

                var userInfo = new UserInfo
                {
                    UsuarioID = user.UsuarioID,
                    Email = user.Email,
                    Nombre = user.Nombre ?? "",
                    ValidadoEmail = user.ValidadoEmail,
                    Roles = user.UsuariosRoles.Select(ur => ur.Rol.NombreRol).ToList(),
                    Minera = user.Minera != null ? new MineraInfo
                    {
                        MineraID = user.Minera.MineraID,
                        Nombre = user.Minera.Nombre,
                        CUIT = user.Minera.CUIT
                    } : null,
                    Proveedor = user.Proveedor != null ? new ProveedorInfo
                    {
                        ProveedorID = user.Proveedor.ProveedorID,
                        Nombre = user.Proveedor.Nombre,
                        CUIT = user.Proveedor.CUIT,
                        Especialidad = user.Proveedor.Especialidad
                    } : null
                };

                return Ok(new AuthResponse
                {
                    Success = true,
                    Message = "Usuario obtenido exitosamente",
                    User = userInfo
                });
            }
            catch (Exception ex)
            {
                // Log the error for debugging purposes
                // In a production environment, you might want to use a proper logging framework
                Console.WriteLine($"Error getting current user: {ex.Message}");
                return StatusCode(500, new { message = "Error al obtener información del usuario" });
            }
        }
    }
}
