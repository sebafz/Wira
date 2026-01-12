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
        private readonly IEmailService _emailService;

        public AuthController(IAuthService authService, WiraDbContext context, IEmailService emailService)
        {
            _authService = authService;
            _context = context;
            _emailService = emailService;
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
                    EstadoAprobacion = user.EstadoAprobacion,
                    MotivoRechazo = user.MotivoRechazo,
                    ValidadoEmail = user.ValidadoEmail,
                    Roles = user.UsuariosRoles.Select(ur => ur.Rol.Nombre).ToList(),
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

        [HttpGet("users/by-empresa")]
        [Authorize(Roles = $"{RoleNames.AdministradorSistema},{RoleNames.MineraAdministrador},{RoleNames.ProveedorAdministrador}")]
        public async Task<IActionResult> GetUsersByEmpresa([FromQuery] int? empresaId = null)
        {
            var isSystemAdmin = User.IsInRole(RoleNames.AdministradorSistema);
            var (mineraId, proveedorId) = GetEmpresaContext();

            var query = AdminUsersQuery();

            if (isSystemAdmin)
            {
                if (empresaId.HasValue)
                {
                    query = query.Where(u => u.EmpresaID == empresaId.Value);
                }
            }
            else
            {
                if (mineraId.HasValue)
                {
                    query = query.Where(u => u.EmpresaID == mineraId.Value && u.Empresa != null && u.Empresa.TipoEmpresa == EmpresaTipos.Minera);
                }
                else if (proveedorId.HasValue)
                {
                    query = query.Where(u => u.EmpresaID == proveedorId.Value && u.Empresa != null && u.Empresa.TipoEmpresa == EmpresaTipos.Proveedor);
                }
                else
                {
                    return Forbid();
                }
            }

            var usuarios = await query
                .OrderBy(u => u.Nombre ?? string.Empty)
                .ThenBy(u => u.Apellido ?? string.Empty)
                .ThenBy(u => u.Email)
                .ToListAsync();

            var result = usuarios.Select(MapAdminUserDto).ToList();
            return Ok(result);
        }

        [HttpPost("users")]
        [Authorize(Roles = RoleNames.AdministradorSistema)]
        public async Task<IActionResult> CreateUser([FromBody] CreateAdminUserRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (!TryGetCurrentUserId(out var currentUserId))
            {
                return Unauthorized(new { message = "Token inválido" });
            }

            var normalizedEmail = request.Email.Trim();
            var normalizedEmailLower = normalizedEmail.ToLower();
            var emailExists = await _context.Usuarios
                .AnyAsync(u => u.Email.ToLower() == normalizedEmailLower);

            if (emailExists)
            {
                return Conflict(new { message = "El email ya está registrado" });
            }

            var normalizedDni = request.DNI.Trim();
            var dniExists = await _context.Usuarios
                .AnyAsync(u => u.DNI == normalizedDni);

            if (dniExists)
            {
                return Conflict(new { message = "El DNI ya está registrado" });
            }

            var normalizedRoles = NormalizeRoles(request.Roles);
            var rolesResult = await ResolveRolesAsync(normalizedRoles);
            if (!rolesResult.Success)
            {
                return BadRequest(new { message = rolesResult.ErrorMessage });
            }

            var password = request.Password?.Trim();
            if (string.IsNullOrWhiteSpace(password))
            {
                return BadRequest(new { message = "La contraseña es obligatoria" });
            }

            var usuario = new Usuario
            {
                Email = normalizedEmail,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
                Nombre = string.IsNullOrWhiteSpace(request.Nombre) ? null : request.Nombre.Trim(),
                Apellido = string.IsNullOrWhiteSpace(request.Apellido) ? null : request.Apellido.Trim(),
                DNI = normalizedDni,
                Telefono = string.IsNullOrWhiteSpace(request.Telefono) ? null : request.Telefono.Trim(),
                Activo = request.Activo,
                FechaRegistro = DateTime.UtcNow,
                FechaBaja = request.Activo ? null : DateTime.UtcNow,
                ValidadoEmail = true,
                EmpresaID = request.EmpresaID,
                EstadoAprobacion = AprobacionEstados.Aprobado,
                FechaAprobacion = DateTime.UtcNow,
                AprobadoPorUsuarioID = currentUserId,
                MotivoRechazo = null
            };

            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();

            await ReplaceUserRolesAsync(usuario.UsuarioID, rolesResult.Roles);
            await _context.SaveChangesAsync();

            var usuarioCreado = await AdminUsersQuery()
                .FirstOrDefaultAsync(u => u.UsuarioID == usuario.UsuarioID);

            return Ok(new
            {
                success = true,
                usuario = usuarioCreado == null ? null : MapAdminUserDto(usuarioCreado)
            });
        }

        [HttpPut("users/{usuarioId:int}")]
        [Authorize(Roles = RoleNames.AdministradorSistema)]
        public async Task<IActionResult> UpdateUser(int usuarioId, [FromBody] UpdateAdminUserRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var usuario = await AdminUsersQuery()
                .FirstOrDefaultAsync(u => u.UsuarioID == usuarioId);

            if (usuario == null)
            {
                return NotFound(new { message = "Usuario no encontrado" });
            }

            var normalizedEmail = request.Email.Trim();
            var normalizedEmailLower = normalizedEmail.ToLower();
            var emailExists = await _context.Usuarios
                .AnyAsync(u => u.UsuarioID != usuarioId && u.Email.ToLower() == normalizedEmailLower);

            if (emailExists)
            {
                return Conflict(new { message = "El email ya está registrado" });
            }

            var normalizedDni = request.DNI.Trim();
            var dniExists = await _context.Usuarios
                .AnyAsync(u => u.UsuarioID != usuarioId && u.DNI == normalizedDni);

            if (dniExists)
            {
                return Conflict(new { message = "El DNI ya está registrado" });
            }

            var normalizedRoles = NormalizeRoles(request.Roles);
            var rolesResult = await ResolveRolesAsync(normalizedRoles);
            if (!rolesResult.Success)
            {
                return BadRequest(new { message = rolesResult.ErrorMessage });
            }

            usuario.Email = normalizedEmail;
            usuario.Nombre = string.IsNullOrWhiteSpace(request.Nombre) ? null : request.Nombre.Trim();
            usuario.Apellido = string.IsNullOrWhiteSpace(request.Apellido) ? null : request.Apellido.Trim();
            usuario.DNI = normalizedDni;
            usuario.Telefono = string.IsNullOrWhiteSpace(request.Telefono) ? null : request.Telefono.Trim();
            usuario.EmpresaID = request.EmpresaID;
            usuario.Activo = request.Activo;
            usuario.FechaBaja = request.Activo ? null : DateTime.UtcNow;

            if (!string.IsNullOrWhiteSpace(request.Password))
            {
                usuario.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password.Trim());
            }

            await ReplaceUserRolesAsync(usuario.UsuarioID, rolesResult.Roles);
            await _context.SaveChangesAsync();

            var usuarioActualizado = await AdminUsersQuery()
                .FirstOrDefaultAsync(u => u.UsuarioID == usuario.UsuarioID);

            return Ok(new
            {
                success = true,
                usuario = usuarioActualizado == null ? null : MapAdminUserDto(usuarioActualizado)
            });
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
            var requestedRoles = NormalizeRoles(request.Roles);

            var usuario = await AdminUsersQuery()
                .FirstOrDefaultAsync(u => u.UsuarioID == usuarioId);

            if (usuario == null)
            {
                return NotFound(new { message = "Usuario no encontrado" });
            }

            var rolesResult = await ResolveRolesAsync(requestedRoles);
            if (!rolesResult.Success)
            {
                return BadRequest(new { message = rolesResult.ErrorMessage });
            }

            await ReplaceUserRolesAsync(usuario.UsuarioID, rolesResult.Roles);
            await _context.SaveChangesAsync();

            var usuarioActualizado = await AdminUsersQuery()
                .FirstOrDefaultAsync(u => u.UsuarioID == usuarioId);

            return Ok(new
            {
                success = true,
                usuario = usuarioActualizado == null ? null : MapAdminUserDto(usuarioActualizado)
            });
        }

        [HttpGet("approvals/pending")]
        [Authorize(Roles = $"{RoleNames.AdministradorSistema},{RoleNames.MineraAdministrador},{RoleNames.ProveedorAdministrador}")]
        public async Task<IActionResult> GetPendingApprovals([FromQuery] int? empresaId = null)
        {
            var isSystemAdmin = User.IsInRole(RoleNames.AdministradorSistema);
            var (mineraId, proveedorId) = GetEmpresaContext();

            var query = _context.Usuarios
                .Include(u => u.Empresa)
                .Where(u =>
                    u.EstadoAprobacion != null &&
                    u.EstadoAprobacion.ToUpper() == AprobacionEstados.Pendiente &&
                    u.ValidadoEmail);

            if (isSystemAdmin && empresaId.HasValue)
            {
                query = query.Where(u => u.EmpresaID == empresaId.Value);
            }
            else if (!isSystemAdmin)
            {
                if (mineraId.HasValue)
                {
                    query = query.Where(u => u.EmpresaID == mineraId.Value && u.Empresa != null && u.Empresa.TipoEmpresa == EmpresaTipos.Minera);
                }
                else if (proveedorId.HasValue)
                {
                    query = query.Where(u => u.EmpresaID == proveedorId.Value && u.Empresa != null && u.Empresa.TipoEmpresa == EmpresaTipos.Proveedor);
                }
                else
                {
                    return Forbid();
                }
            }

            var usuariosPendientes = await query
                .OrderBy(u => u.FechaRegistro)
                .ToListAsync();

            var result = usuariosPendientes.Select(MapPendingUserDto).ToList();
            return Ok(result);
        }

        [HttpGet("approvals/pending/count")]
        [Authorize(Roles = $"{RoleNames.AdministradorSistema},{RoleNames.MineraAdministrador},{RoleNames.ProveedorAdministrador}")]
        public async Task<IActionResult> GetPendingApprovalsCount([FromQuery] int? empresaId = null)
        {
            var isSystemAdmin = User.IsInRole(RoleNames.AdministradorSistema);
            var (mineraId, proveedorId) = GetEmpresaContext();

            var baseQuery = _context.Usuarios
                .Where(u =>
                    u.EstadoAprobacion != null &&
                    u.EstadoAprobacion.ToUpper() == AprobacionEstados.Pendiente &&
                    u.ValidadoEmail);

            var totalPendientes = await baseQuery.CountAsync();

            int pendientesEmpresaActual;

            if (isSystemAdmin && empresaId.HasValue)
            {
                pendientesEmpresaActual = await baseQuery.Where(u => u.EmpresaID == empresaId.Value).CountAsync();
            }
            else if (!isSystemAdmin)
            {
                if (mineraId.HasValue)
                {
                    pendientesEmpresaActual = await baseQuery.Where(u => u.EmpresaID == mineraId.Value).CountAsync();
                }
                else if (proveedorId.HasValue)
                {
                    pendientesEmpresaActual = await baseQuery.Where(u => u.EmpresaID == proveedorId.Value).CountAsync();
                }
                else
                {
                    return Forbid();
                }
            }
            else
            {
                pendientesEmpresaActual = totalPendientes;
            }

            return Ok(new PendingApprovalCountResponse
            {
                TotalPendientes = totalPendientes,
                PendientesEmpresaActual = pendientesEmpresaActual
            });
        }

        [HttpPost("approvals/{usuarioId:int}/approve")]
        [Authorize(Roles = $"{RoleNames.AdministradorSistema},{RoleNames.MineraAdministrador},{RoleNames.ProveedorAdministrador}")]
        public async Task<IActionResult> ApproveUser(int usuarioId, [FromBody] ApproveUserRequest request)
        {
            if (!TryGetCurrentUserId(out var approverId))
            {
                return Unauthorized(new { message = "Token inválido" });
            }

            var isSystemAdmin = User.IsInRole(RoleNames.AdministradorSistema);
            var (mineraId, proveedorId) = GetEmpresaContext();

            var usuario = await _context.Usuarios
                .Include(u => u.Empresa)
                .Include(u => u.UsuariosRoles)
                    .ThenInclude(ur => ur.Rol)
                .FirstOrDefaultAsync(u => u.UsuarioID == usuarioId);

            if (usuario == null)
            {
                return NotFound(new { message = "Usuario no encontrado" });
            }

            if (!IsAuthorizedForEmpresa(usuario, isSystemAdmin, mineraId, proveedorId))
            {
                return Forbid();
            }

            if (!usuario.ValidadoEmail)
            {
                return BadRequest(new { message = "El usuario debe validar su email antes de ser aprobado" });
            }

            var estadoActual = AprobacionEstados.Normalizar(usuario.EstadoAprobacion);
            if (estadoActual == AprobacionEstados.Aprobado)
            {
                return BadRequest(new { message = "El usuario ya está aprobado" });
            }

            if (usuario.Empresa == null)
            {
                return BadRequest(new { message = "El usuario no tiene una empresa asociada" });
            }

            var normalizedRoles = NormalizeRoles(request.Roles);
            if (normalizedRoles.Count == 0)
            {
                var defaultRole = GetDefaultRoleForEmpresa(usuario.Empresa.TipoEmpresa);
                if (!string.IsNullOrEmpty(defaultRole))
                {
                    normalizedRoles.Add(defaultRole);
                }
            }

            if (normalizedRoles.Count == 0)
            {
                return BadRequest(new { message = "Debe asignar al menos un rol al usuario" });
            }

            if (!AreRolesAllowedForEmpresa(usuario.Empresa.TipoEmpresa, normalizedRoles, isSystemAdmin))
            {
                return BadRequest(new { message = "Los roles asignados no corresponden al tipo de empresa" });
            }

            var rolesResult = await ResolveRolesAsync(normalizedRoles);
            if (!rolesResult.Success)
            {
                return BadRequest(new { message = rolesResult.ErrorMessage });
            }

            usuario.EstadoAprobacion = AprobacionEstados.Aprobado;
            usuario.FechaAprobacion = DateTime.UtcNow;
            usuario.AprobadoPorUsuarioID = approverId;
            usuario.MotivoRechazo = null;

            await ReplaceUserRolesAsync(usuario.UsuarioID, rolesResult.Roles);
            await _context.SaveChangesAsync();

            var usuarioActualizado = await AdminUsersQuery()
                .FirstOrDefaultAsync(u => u.UsuarioID == usuario.UsuarioID);

            try
            {
                await _emailService.SendApprovalEmailAsync(usuario.Email, usuario.Nombre ?? "Usuario", usuario.Empresa?.Nombre ?? "");
            }
            catch (Exception)
            {
                // Notificamos silenciosamente; la aprobación no debe fallar por email
            }

            return Ok(new
            {
                success = true,
                usuario = usuarioActualizado == null ? null : MapAdminUserDto(usuarioActualizado)
            });
        }

        [HttpPost("approvals/{usuarioId:int}/reject")]
        [Authorize(Roles = $"{RoleNames.AdministradorSistema},{RoleNames.MineraAdministrador},{RoleNames.ProveedorAdministrador}")]
        public async Task<IActionResult> RejectUser(int usuarioId, [FromBody] RejectUserRequest request)
        {
            if (!TryGetCurrentUserId(out var approverId))
            {
                return Unauthorized(new { message = "Token inválido" });
            }

            var isSystemAdmin = User.IsInRole(RoleNames.AdministradorSistema);
            var (mineraId, proveedorId) = GetEmpresaContext();

            var usuario = await _context.Usuarios
                .Include(u => u.Empresa)
                .Include(u => u.UsuariosRoles)
                    .ThenInclude(ur => ur.Rol)
                .FirstOrDefaultAsync(u => u.UsuarioID == usuarioId);

            if (usuario == null)
            {
                return NotFound(new { message = "Usuario no encontrado" });
            }

            if (!IsAuthorizedForEmpresa(usuario, isSystemAdmin, mineraId, proveedorId))
            {
                return Forbid();
            }

            if (!usuario.ValidadoEmail)
            {
                return BadRequest(new { message = "El usuario debe validar su email antes de ser rechazado" });
            }

            if (AprobacionEstados.Normalizar(usuario.EstadoAprobacion) == AprobacionEstados.Aprobado)
            {
                return BadRequest(new { message = "El usuario ya está aprobado" });
            }

            usuario.EstadoAprobacion = AprobacionEstados.Rechazado;
            usuario.FechaAprobacion = DateTime.UtcNow;
            usuario.AprobadoPorUsuarioID = approverId;
            usuario.MotivoRechazo = string.IsNullOrWhiteSpace(request.Motivo) ? null : request.Motivo.Trim();

            await ReplaceUserRolesAsync(usuario.UsuarioID, new List<Rol>());
            await _context.SaveChangesAsync();

            var usuarioActualizado = await AdminUsersQuery()
                .FirstOrDefaultAsync(u => u.UsuarioID == usuario.UsuarioID);

            try
            {
                await _emailService.SendRejectionEmailAsync(usuario.Email, usuario.Nombre ?? "Usuario", usuario.Empresa?.Nombre ?? string.Empty, usuario.MotivoRechazo);
            }
            catch (Exception)
            {
                // Notificamos silenciosamente; el rechazo no debe fallar por email
            }

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

        private static List<string> NormalizeRoles(IEnumerable<string>? roles)
        {
            return roles?
                .Where(r => !string.IsNullOrWhiteSpace(r))
                .Select(r => r.Trim())
                .Distinct(System.StringComparer.OrdinalIgnoreCase)
                .ToList() ?? new List<string>();
        }

        private async Task<(bool Success, string? ErrorMessage, List<Rol> Roles)> ResolveRolesAsync(List<string> normalizedRoles)
        {
            if (normalizedRoles.Count == 0)
            {
                return (true, null, new List<Rol>());
            }

            var rolesDisponibles = await _context.Roles
                .Where(r => normalizedRoles.Contains(r.Nombre))
                .ToListAsync();

            if (rolesDisponibles.Count != normalizedRoles.Count)
            {
                return (false, "Alguno de los roles especificados no existe", new List<Rol>());
            }

            return (true, null, rolesDisponibles);
        }

        private async Task ReplaceUserRolesAsync(int usuarioId, List<Rol> roles)
        {
            var existingRoles = await _context.UsuariosRoles
                .Where(ur => ur.UsuarioID == usuarioId)
                .ToListAsync();

            _context.UsuariosRoles.RemoveRange(existingRoles);

            if (roles.Count == 0)
            {
                return;
            }

            foreach (var rol in roles)
            {
                _context.UsuariosRoles.Add(new UsuarioRol
                {
                    UsuarioID = usuarioId,
                    RolID = rol.RolID
                });
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
                    .Select(ur => ur.Rol.Nombre)
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

        private static PendingUserDto MapPendingUserDto(Usuario usuario)
        {
            return new PendingUserDto
            {
                UsuarioID = usuario.UsuarioID,
                Email = usuario.Email,
                Nombre = usuario.Nombre,
                Apellido = usuario.Apellido,
                DNI = usuario.DNI,
                Telefono = usuario.Telefono,
                FechaRegistro = usuario.FechaRegistro,
                EstadoAprobacion = usuario.EstadoAprobacion,
                MotivoRechazo = usuario.MotivoRechazo,
                ValidadoEmail = usuario.ValidadoEmail,
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

        private bool TryGetCurrentUserId(out int userId)
        {
            userId = 0;
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return !string.IsNullOrEmpty(userIdClaim) && int.TryParse(userIdClaim, out userId);
        }

        private (int? MineraId, int? ProveedorId) GetEmpresaContext()
        {
            int? mineraId = null;
            int? proveedorId = null;

            if (int.TryParse(User.FindFirst("MineraID")?.Value, out var minera))
            {
                mineraId = minera;
            }

            if (int.TryParse(User.FindFirst("ProveedorID")?.Value, out var proveedor))
            {
                proveedorId = proveedor;
            }

            return (mineraId, proveedorId);
        }

        private static bool IsAuthorizedForEmpresa(Usuario usuario, bool isSystemAdmin, int? mineraId, int? proveedorId)
        {
            if (isSystemAdmin)
            {
                return true;
            }

            if (usuario.Empresa == null)
            {
                return false;
            }

            var tipoEmpresa = EmpresaTipos.Normalizar(usuario.Empresa.TipoEmpresa);

            if (tipoEmpresa == EmpresaTipos.Minera && mineraId.HasValue)
            {
                return usuario.EmpresaID == mineraId.Value;
            }

            if (tipoEmpresa == EmpresaTipos.Proveedor && proveedorId.HasValue)
            {
                return usuario.EmpresaID == proveedorId.Value;
            }

            return false;
        }

        private static bool AreRolesAllowedForEmpresa(string? tipoEmpresa, List<string> roles, bool isSystemAdmin)
        {
            var normalizedTipo = EmpresaTipos.Normalizar(tipoEmpresa);

            if (isSystemAdmin)
            {
                return true;
            }

            if (roles.Count == 0)
            {
                return false;
            }

            HashSet<string>? allowedRoles = normalizedTipo == EmpresaTipos.Minera
                ? new HashSet<string>(StringComparer.OrdinalIgnoreCase)
                {
                    RoleNames.MineraAdministrador,
                    RoleNames.MineraUsuario
                }
                : normalizedTipo == EmpresaTipos.Proveedor
                    ? new HashSet<string>(StringComparer.OrdinalIgnoreCase)
                    {
                        RoleNames.ProveedorAdministrador,
                        RoleNames.ProveedorUsuario
                    }
                    : null;

            if (allowedRoles == null)
            {
                return false;
            }

            return roles.All(r => allowedRoles.Contains(r));
        }

        private static string? GetDefaultRoleForEmpresa(string? tipoEmpresa)
        {
            var normalizedTipo = EmpresaTipos.Normalizar(tipoEmpresa);

            return normalizedTipo == EmpresaTipos.Minera
                ? RoleNames.MineraUsuario
                : normalizedTipo == EmpresaTipos.Proveedor
                    ? RoleNames.ProveedorUsuario
                    : null;
        }
    }
}
