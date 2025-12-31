using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Wira.Api.Data;
using Wira.Api.DTOs;
using Wira.Api.Models;

namespace Wira.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProveedoresController : ControllerBase
    {
        private readonly WiraDbContext _context;
        private readonly ILogger<ProveedoresController> _logger;

        public ProveedoresController(WiraDbContext context, ILogger<ProveedoresController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetProveedores([FromQuery] bool includeInactive = false)
        {
            try
            {
                var query = _context.Empresas
                    .Include(p => p.Rubro)
                    .Where(p => p.TipoEmpresa == EmpresaTipos.Proveedor);

                if (!includeInactive)
                {
                    query = query.Where(p => p.Activo);
                }

                var proveedores = await query
                    .OrderBy(p => p.Nombre)
                    .Select(p => new ProveedorResponse
                    {
                        ProveedorID = p.EmpresaID,
                        Nombre = p.Nombre,
                        RazonSocial = p.RazonSocial,
                        CUIT = p.CUIT,
                        EmailContacto = p.EmailContacto,
                        Telefono = p.Telefono,
                        RubroID = p.RubroID,
                        RubroNombre = p.Rubro != null ? p.Rubro.Nombre : null,
                        Activo = p.Activo,
                        FechaAlta = p.FechaAlta
                    })
                    .ToListAsync();

                return Ok(proveedores);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener los proveedores");
                return StatusCode(500, new { message = "Error al obtener los proveedores" });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetProveedor(int id)
        {
            try
            {
                var proveedor = await _context.Empresas
                    .Include(p => p.Rubro)
                    .Where(p => p.EmpresaID == id && p.TipoEmpresa == EmpresaTipos.Proveedor)
                    .FirstOrDefaultAsync();

                if (proveedor == null)
                {
                    return NotFound(new { message = "Proveedor no encontrado" });
                }

                return Ok(new { proveedor = MapToResponse(proveedor) });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener el proveedor con ID: {ProveedorId}", id);
                return StatusCode(500, new { message = "Error al obtener el proveedor" });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = $"{RoleNames.ProveedorAdministrador},{RoleNames.AdministradorSistema}")]
        public async Task<IActionResult> UpdateProveedor(int id, [FromBody] UpdateProveedorRequest request)
        {
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            try
            {
                var proveedor = await _context.Empresas
                    .FirstOrDefaultAsync(p => p.EmpresaID == id && p.TipoEmpresa == EmpresaTipos.Proveedor);

                if (proveedor == null)
                {
                    return NotFound(new { message = "Proveedor no encontrado" });
                }

                if (!User.IsInRole(RoleNames.AdministradorSistema))
                {
                    var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                    if (string.IsNullOrWhiteSpace(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                    {
                        return Unauthorized();
                    }

                    var userEmpresaId = await _context.Usuarios
                        .Where(u => u.UsuarioID == userId)
                        .Select(u => u.EmpresaID)
                        .FirstOrDefaultAsync();

                    if (userEmpresaId != proveedor.EmpresaID)
                    {
                        return Forbid();
                    }
                }

                var normalizedCuit = NormalizeCuit(request.CUIT);

                if (!string.Equals(proveedor.CUIT, normalizedCuit, StringComparison.OrdinalIgnoreCase))
                {
                    return BadRequest(new { message = "El CUIT no puede modificarse." });
                }

                proveedor.Nombre = request.Nombre.Trim();
                proveedor.RazonSocial = request.RazonSocial.Trim();
                proveedor.EmailContacto = NormalizeOptional(request.EmailContacto);
                proveedor.Telefono = NormalizeOptional(request.Telefono);
                proveedor.RubroID = request.RubroID;
                proveedor.Activo = request.Activo;

                await _context.SaveChangesAsync();

                return Ok(new { proveedor = MapToResponse(proveedor) });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar el proveedor con ID: {ProveedorId}", id);
                return StatusCode(500, new { message = "Error al actualizar el proveedor" });
            }
        }

        [HttpGet("rubros")]
        public async Task<IActionResult> GetRubrosConProveedores()
        {
            try
            {
                var rubros = await _context.Rubros
                    .Where(r => r.Activo && r.Proveedores.Any(p => p.Activo && p.TipoEmpresa == EmpresaTipos.Proveedor))
                    .Select(r => new { r.RubroID, r.Nombre })
                    .OrderBy(r => r.Nombre)
                    .ToListAsync();

                return Ok(rubros);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener los rubros");
                return StatusCode(500, new { message = "Error al obtener los rubros" });
            }
        }

        private static ProveedorResponse MapToResponse(Empresa proveedor)
        {
            return new ProveedorResponse
            {
                ProveedorID = proveedor.EmpresaID,
                Nombre = proveedor.Nombre,
                RazonSocial = proveedor.RazonSocial,
                CUIT = proveedor.CUIT,
                EmailContacto = proveedor.EmailContacto,
                Telefono = proveedor.Telefono,
                RubroID = proveedor.RubroID,
                RubroNombre = proveedor.Rubro?.Nombre,
                Activo = proveedor.Activo,
                FechaAlta = proveedor.FechaAlta
            };
        }

        private static string NormalizeCuit(string cuit)
        {
           return cuit?.Trim() ?? string.Empty;
        }

        private static string? NormalizeOptional(string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return null;
            }

            return value.Trim();
        }
    }
}
