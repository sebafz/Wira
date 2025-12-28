using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Wira.Api.Data;
using Wira.Api.DTOs;
using Wira.Api.Models;
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
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized();
                }

                var user = await _context.Usuarios
                    .Include(u => u.UsuariosRoles)
                        .ThenInclude(ur => ur.Rol)
                    .Include(u => u.Empresa)
                        .ThenInclude(e => e!.Rubro)
                    .FirstOrDefaultAsync(u => u.UsuarioID == userId);

                if (user == null)
                {
                    return NotFound();
                }

                MineraInfo? mineraInfo = null;
                ProveedorInfo? proveedorInfo = null;

                if (user.Empresa != null)
                {
                    if (user.Empresa.TipoEmpresa == EmpresaTipos.Minera)
                    {
                        mineraInfo = new MineraInfo
                        {
                            MineraID = user.Empresa.EmpresaID,
                            Nombre = user.Empresa.Nombre,
                            CUIT = user.Empresa.CUIT
                        };
                    }
                    else if (user.Empresa.TipoEmpresa == EmpresaTipos.Proveedor)
                    {
                        proveedorInfo = new ProveedorInfo
                        {
                            ProveedorID = user.Empresa.EmpresaID,
                            Nombre = user.Empresa.Nombre,
                            CUIT = user.Empresa.CUIT,
                            RubroID = user.Empresa.RubroID,
                            RubroNombre = user.Empresa.Rubro?.Nombre
                        };
                    }
                }

                var userInfo = new UserInfo
                {
                    UsuarioID = user.UsuarioID,
                    Email = user.Email,
                    Nombre = user.Nombre ?? "",
                    Apellido = user.Apellido,
                    DNI = user.DNI,
                    Telefono = user.Telefono,
                    FechaBaja = user.FechaBaja,
                    ValidadoEmail = user.ValidadoEmail,
                    Roles = user.UsuariosRoles.Select(ur => ur.Rol.NombreRol).ToList(),
                    Minera = mineraInfo,
                    Proveedor = proveedorInfo
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
                Console.WriteLine($"Error al obtener información del usuario: {ex.Message}");
                return StatusCode(500, new { message = "Error al obtener información del usuario" });
            }
        }

        [HttpGet("users")]
        [Authorize(Roles = RoleNames.AdministradorSistema)]
        public async Task<IActionResult> GetUsers()
        {
            var usuarios = await AdminUsersQuery()
                .OrderBy(u => u.Nombre ?? string.Empty)
                .ThenBy(u => u.Apellido ?? string.Empty)
                .ThenBy(u => u.Email)
                .ToListAsync();

            var result = usuarios.Select(MapAdminUserDto).ToList();
            return Ok(result);
        }

        [HttpPatch("users/{usuarioId:int}/status")]
        [Authorize(Roles = RoleNames.AdministradorSistema)]
        public async Task<IActionResult> UpdateUserStatus(int usuarioId, [FromBody] UpdateUserStatusRequest request)
        {
            var usuario = await AdminUsersQuery()
                .FirstOrDefaultAsync(u => u.UsuarioID == usuarioId);

            if (usuario == null)
            {
                return NotFound(new { message = "Usuario no encontrado" });
            }

            usuario.Activo = request.Activo;
            usuario.FechaBaja = request.Activo ? null : DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                usuario = MapAdminUserDto(usuario)
            });
        }

        [HttpPut("users/{usuarioId:int}/roles")]
        [Authorize(Roles = RoleNames.AdministradorSistema)]
        public async Task<IActionResult> UpdateUserRoles(int usuarioId, [FromBody] UpdateUserRolesRequest request)
        {
            var requestedRoles = request.Roles
                ?.Where(r => !string.IsNullOrWhiteSpace(r))
                .Select(r => r.Trim())
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList() ?? new List<string>();

            var usuario = await AdminUsersQuery()
                .FirstOrDefaultAsync(u => u.UsuarioID == usuarioId);

            if (usuario == null)
            {
                return NotFound(new { message = "Usuario no encontrado" });
            }

            var rolesDisponibles = await _context.Roles
                .Where(r => requestedRoles.Contains(r.NombreRol))
                .ToListAsync();

            if (rolesDisponibles.Count != requestedRoles.Count)
            {
                return BadRequest(new { message = "Alguno de los roles especificados no existe" });
            }

            _context.UsuariosRoles.RemoveRange(usuario.UsuariosRoles);

            foreach (var rol in rolesDisponibles)
            {
                _context.UsuariosRoles.Add(new UsuarioRol
                {
                    UsuarioID = usuario.UsuarioID,
                    RolID = rol.RolID
                });
            }

            await _context.SaveChangesAsync();

            var usuarioActualizado = await AdminUsersQuery()
                .FirstOrDefaultAsync(u => u.UsuarioID == usuarioId);

            return Ok(new
            {
                success = true,
                usuario = usuarioActualizado == null ? null : MapAdminUserDto(usuarioActualizado)
            });
        }

        [HttpPut("profile")]
        [Authorize]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new { message = "Token inválido" });
                }

                var user = await _context.Usuarios.FindAsync(userId);

                if (user == null)
                {
                    return NotFound(new { message = "Usuario no encontrado" });
                }

                // Actualizar solo los campos proporcionados
                if (request.Nombre != null)
                {
                    user.Nombre = string.IsNullOrWhiteSpace(request.Nombre) ? null : request.Nombre.Trim();
                }

                if (request.Apellido != null)
                {
                    user.Apellido = string.IsNullOrWhiteSpace(request.Apellido) ? null : request.Apellido.Trim();
                }

                if (request.Telefono != null)
                {
                    user.Telefono = string.IsNullOrWhiteSpace(request.Telefono) ? null : request.Telefono.Trim();
                }

                if (request.DNI != null)
                {
                    var normalizedDni = request.DNI.Trim();
                    if (string.IsNullOrWhiteSpace(normalizedDni))
                    {
                        return BadRequest(new { message = "El DNI no puede estar vacío" });
                    }

                    var dniExists = await _context.Usuarios
                        .AnyAsync(u => u.DNI == normalizedDni && u.UsuarioID != userId);

                    if (dniExists)
                    {
                        return Conflict(new { message = "El DNI ya está registrado" });
                    }

                    user.DNI = normalizedDni;
                }

                await _context.SaveChangesAsync();

                return Ok(new {
                    success = true,
                    message = "Perfil actualizado correctamente",
                    user = new {
                        usuarioID = user.UsuarioID,
                        email = user.Email,
                        nombre = user.Nombre,
                        apellido = user.Apellido,
                        dni = user.DNI,
                        telefono = user.Telefono,
                        fechaBaja = user.FechaBaja,
                        validadoEmail = user.ValidadoEmail
                    }
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating profile: {ex.Message}");
                return StatusCode(500, new { success = false, message = "Error al actualizar el perfil" });
            }
        }

        private IQueryable<Usuario> AdminUsersQuery()
        {
            return _context.Usuarios
                .Include(u => u.UsuariosRoles)
                    .ThenInclude(ur => ur.Rol)
                .Include(u => u.Empresa);
        }

        private static AdminUserDto MapAdminUserDto(Usuario usuario)
        {
            return new AdminUserDto
            {
                UsuarioID = usuario.UsuarioID,
                Email = usuario.Email,
                Nombre = usuario.Nombre,
                Apellido = usuario.Apellido,
                DNI = usuario.DNI,
                Telefono = usuario.Telefono,
                Activo = usuario.Activo,
                FechaRegistro = usuario.FechaRegistro,
                FechaBaja = usuario.FechaBaja,
                ValidadoEmail = usuario.ValidadoEmail,
                Roles = usuario.UsuariosRoles
                    .Select(ur => ur.Rol.NombreRol)
                    .OrderBy(r => r)
                    .ToList(),
                Empresa = usuario.Empresa == null
                    ? null
                    : new AdminUserEmpresaDto
                    {
                        EmpresaID = usuario.Empresa.EmpresaID,
                        Nombre = usuario.Empresa.Nombre,
                        CUIT = usuario.Empresa.CUIT,
                        TipoEmpresa = usuario.Empresa.TipoEmpresa
                    }
            };
        }
    }
}
