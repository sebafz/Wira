using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;
using Wira.Api.Data;
using Wira.Api.DTOs;
using Wira.Api.Models;
using Wira.Api.Services.Interfaces;

namespace Wira.Api.Services
{
    public class AuthService : IAuthService
    {
        private readonly WiraDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthService> _logger;
        private readonly IEmailService _emailService;

        public AuthService(WiraDbContext context, IConfiguration configuration, ILogger<AuthService> logger, IEmailService emailService)
        {
            _context = context;
            _configuration = configuration;
            _logger = logger;
            _emailService = emailService;
        }

        public async Task<AuthResponse> LoginAsync(LoginRequest request)
        {
            try
            {
                var user = await _context.Usuarios
                    .Include(u => u.UsuariosRoles)
                        .ThenInclude(ur => ur.Rol)
                    .Include(u => u.Minera)
                    .Include(u => u.Proveedor)
                        .ThenInclude(p => p!.Rubro)
                    .FirstOrDefaultAsync(u => u.Email == request.Email);

                if (user == null)
                {
                    return new AuthResponse 
                    { 
                        Success = false, 
                        Message = "Email o contraseña incorrectos" 
                    };
                }

                if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                {
                    return new AuthResponse 
                    { 
                        Success = false, 
                        Message = "Email o contraseña incorrectos" 
                    };
                }

                if (!user.Activo)
                {
                    return new AuthResponse 
                    { 
                        Success = false, 
                        Message = "La cuenta está desactivada" 
                    };
                }

                if (!user.ValidadoEmail)
                {
                    return new AuthResponse 
                    { 
                        Success = false, 
                        Message = "Debe verificar su email antes de iniciar sesión" 
                    };
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
                        RubroID = user.Proveedor.RubroID,
                        RubroNombre = user.Proveedor.Rubro?.Nombre
                    } : null
                };

                var token = GenerateJwtToken(userInfo);
                var tokenExpiration = DateTime.UtcNow.AddHours(24);

                return new AuthResponse
                {
                    Success = true,
                    Message = "Inicio de sesión exitoso",
                    Token = token,
                    User = userInfo,
                    TokenExpiration = tokenExpiration
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error durante el login para el email: {Email}", request.Email);
                return new AuthResponse 
                { 
                    Success = false, 
                    Message = "Error interno del servidor" 
                };
            }
        }

        public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
        {
            try
            {
                // Verificar si el email ya existe
                if (await _context.Usuarios.AnyAsync(u => u.Email == request.Email))
                {
                    return new AuthResponse 
                    { 
                        Success = false, 
                        Message = "El email ya está registrado" 
                    };
                }

                // Validar que el tipo de cuenta sea válido
                if (request.TipoCuenta != "Minera" && request.TipoCuenta != "Proveedor")
                {
                    return new AuthResponse 
                    { 
                        Success = false, 
                        Message = "Tipo de cuenta inválido" 
                    };
                }

                // Validar que la empresa existe según el tipo
                if (request.TipoCuenta == "Minera" && request.MineraID.HasValue)
                {
                    if (!await _context.Mineras.AnyAsync(m => m.MineraID == request.MineraID && m.Activo))
                    {
                        return new AuthResponse 
                        { 
                            Success = false, 
                            Message = "La minera seleccionada no existe o está inactiva" 
                        };
                    }
                }
                else if (request.TipoCuenta == "Proveedor" && request.ProveedorID.HasValue)
                {
                    if (!await _context.Proveedores.AnyAsync(p => p.ProveedorID == request.ProveedorID && p.Activo))
                    {
                        return new AuthResponse 
                        { 
                            Success = false, 
                            Message = "El proveedor seleccionado no existe o está inactivo" 
                        };
                    }
                }

                // Crear el usuario
                var hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);
                var user = new Usuario
                {
                    Email = request.Email,
                    PasswordHash = hashedPassword,
                    Nombre = request.Nombre,
                    Activo = true,
                    ValidadoEmail = false,
                    FechaRegistro = DateTime.Now,
                    MineraID = request.TipoCuenta == "Minera" ? request.MineraID : null,
                    ProveedorID = request.TipoCuenta == "Proveedor" ? request.ProveedorID : null
                };

                _context.Usuarios.Add(user);
                await _context.SaveChangesAsync();

                // Asignar rol
                var rol = await _context.Roles.FirstOrDefaultAsync(r => r.NombreRol == request.TipoCuenta);
                if (rol != null)
                {
                    var usuarioRol = new UsuarioRol
                    {
                        UsuarioID = user.UsuarioID,
                        RolID = rol.RolID
                    };
                    _context.UsuariosRoles.Add(usuarioRol);
                    await _context.SaveChangesAsync();
                }

                // Generar token de verificación y guardarlo
                var verificationToken = GenerateEmailVerificationToken();
                user.TokenVerificacionEmail = verificationToken;
                user.FechaVencimientoTokenVerificacion = DateTime.UtcNow.AddMinutes(10); // 10 minutos
                
                await _context.SaveChangesAsync();

                // Enviar email de verificación
                try
                {
                    await _emailService.SendVerificationEmailAsync(user.Email, user.Nombre ?? "Usuario", verificationToken);
                }
                catch (Exception emailEx)
                {
                    _logger.LogError(emailEx, "Error enviando email de verificación a: {Email}", user.Email);
                    // No fallar el registro por error de email
                }
                
                return new AuthResponse
                {
                    Success = true,
                    Message = "Usuario registrado exitosamente. Se ha enviado un email de verificación."
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error durante el registro para el email: {Email}", request.Email);
                return new AuthResponse 
                { 
                    Success = false, 
                    Message = "Error interno del servidor" 
                };
            }
        }

        public async Task<AuthResponse> ForgotPasswordAsync(ForgotPasswordRequest request)
        {
            try
            {
                var user = await _context.Usuarios.FirstOrDefaultAsync(u => u.Email == request.Email);
                
                if (user == null)
                {
                    // Por seguridad, no revelamos si el email existe o no
                    return new AuthResponse
                    {
                        Success = true,
                        Message = "Si el email existe, se ha enviado un enlace de recuperación"
                    };
                }

                // Generar token de recuperación y guardarlo
                var resetToken = GeneratePasswordResetToken();
                user.TokenRecuperacionPassword = resetToken;
                user.FechaVencimientoTokenRecuperacion = DateTime.UtcNow.AddHours(1); // 1 hora
                
                await _context.SaveChangesAsync();

                // Enviar email de recuperación
                try
                {
                    await _emailService.SendPasswordResetEmailAsync(user.Email, user.Nombre ?? "Usuario", resetToken);
                }
                catch (Exception emailEx)
                {
                    _logger.LogError(emailEx, "Error enviando email de recuperación a: {Email}", user.Email);
                    // Continuar normalmente para no revelar si el email existe
                }
                
                return new AuthResponse
                {
                    Success = true,
                    Message = "Se ha enviado un enlace de recuperación a su email"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error durante forgot password para el email: {Email}", request.Email);
                return new AuthResponse 
                { 
                    Success = false, 
                    Message = "Error interno del servidor" 
                };
            }
        }

        public async Task<AuthResponse> ResetPasswordAsync(ResetPasswordRequest request)
        {
            try
            {
                var user = await _context.Usuarios.FirstOrDefaultAsync(u => 
                    u.TokenRecuperacionPassword == request.Token && 
                    u.FechaVencimientoTokenRecuperacion > DateTime.UtcNow);

                if (user == null)
                {
                    return new AuthResponse
                    {
                        Success = false,
                        Message = "Token de recuperación inválido o expirado"
                    };
                }

                // Actualizar contraseña
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
                user.TokenRecuperacionPassword = null;
                user.FechaVencimientoTokenRecuperacion = null;

                await _context.SaveChangesAsync();

                return new AuthResponse
                {
                    Success = true,
                    Message = "Contraseña restablecida exitosamente"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error restableciendo contraseña con token: {Token}", request.Token);
                return new AuthResponse
                {
                    Success = false,
                    Message = "Error interno del servidor"
                };
            }
        }

        public async Task<AuthResponse> VerifyEmailAsync(VerifyEmailRequest request)
        {
            try
            {
                var user = await _context.Usuarios.FirstOrDefaultAsync(u => 
                    u.Email == request.Email &&
                    u.TokenVerificacionEmail == request.Code && 
                    u.FechaVencimientoTokenVerificacion > DateTime.UtcNow);

                if (user == null)
                {
                    return new AuthResponse
                    {
                        Success = false,
                        Message = "Código de verificación inválido o expirado"
                    };
                }

                if (user.ValidadoEmail)
                {
                    return new AuthResponse
                    {
                        Success = false,
                        Message = "La cuenta ya está verificada"
                    };
                }

                // Marcar como verificado
                user.ValidadoEmail = true;
                user.TokenVerificacionEmail = null;
                user.FechaVencimientoTokenVerificacion = null;

                await _context.SaveChangesAsync();

                return new AuthResponse
                {
                    Success = true,
                    Message = "Email verificado exitosamente"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verificando email con código: {Code} para email: {Email}", request.Code, request.Email);
                return new AuthResponse
                {
                    Success = false,
                    Message = "Error interno del servidor"
                };
            }
        }

        public async Task<AuthResponse> ResendVerificationEmailAsync(string email)
        {
            try
            {
                var user = await _context.Usuarios.FirstOrDefaultAsync(u => u.Email == email);
                
                if (user == null || user.ValidadoEmail)
                {
                    return new AuthResponse 
                    { 
                        Success = false, 
                        Message = "Usuario no encontrado o ya verificado" 
                    };
                }

                // Generar nuevo token de verificación y guardarlo
                var verificationToken = GenerateEmailVerificationToken();
                user.TokenVerificacionEmail = verificationToken;
                user.FechaVencimientoTokenVerificacion = DateTime.UtcNow.AddMinutes(10); // 10 minutos
                
                await _context.SaveChangesAsync();

                // Reenviar email de verificación
                try
                {
                    await _emailService.SendVerificationEmailAsync(user.Email, user.Nombre ?? "Usuario", verificationToken);
                }
                catch (Exception emailEx)
                {
                    _logger.LogError(emailEx, "Error reenviando email de verificación a: {Email}", user.Email);
                    return new AuthResponse 
                    { 
                        Success = false, 
                        Message = "Error enviando el email de verificación" 
                    };
                }

                return new AuthResponse
                {
                    Success = true,
                    Message = "Email de verificación reenviado"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error durante reenvío de verificación para: {Email}", email);
                return new AuthResponse 
                { 
                    Success = false, 
                    Message = "Error interno del servidor" 
                };
            }
        }

        public string GenerateJwtToken(UserInfo user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? "default-secret-key"));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.UsuarioID.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.Nombre)
            };

            // Agregar roles como claims
            foreach (var role in user.Roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            // Agregar información de minera o proveedor
            if (user.Minera != null)
            {
                claims.Add(new Claim("MineraID", user.Minera.MineraID.ToString()));
            }
            if (user.Proveedor != null)
            {
                claims.Add(new Claim("ProveedorID", user.Proveedor.ProveedorID.ToString()));
            }

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(24),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public string GenerateEmailVerificationToken()
        {
            // Generar código de 6 dígitos
            var random = new Random();
            return random.Next(100000, 999999).ToString();
        }

        public string GeneratePasswordResetToken()
        {
            return Guid.NewGuid().ToString("N");
        }
    }
}
