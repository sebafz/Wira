using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Wira.Api.Data;
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
        public async Task<IActionResult> GetProveedores()
        {
            try
            {
                var proveedores = await _context.Empresas
                    .Include(p => p.Rubro)
                    .Where(p => p.Activo && p.TipoEmpresa == EmpresaTipos.Proveedor)
                    .Select(p => new
                    {
                        ProveedorID = p.EmpresaID,
                        p.Nombre,
                        p.RazonSocial,
                        p.CUIT,
                        p.RubroID,
                        RubroNombre = p.Rubro != null ? p.Rubro.Nombre : null,
                        p.Telefono,
                        p.FechaAlta
                    })
                    .OrderBy(p => p.Nombre)
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
                    .Where(p => p.EmpresaID == id && p.Activo && p.TipoEmpresa == EmpresaTipos.Proveedor)
                    .Select(p => new
                    {
                        ProveedorID = p.EmpresaID,
                        p.Nombre,
                        p.RazonSocial,
                        p.CUIT,
                        p.RubroID,
                        RubroNombre = p.Rubro != null ? p.Rubro.Nombre : null,
                        p.Telefono,
                        p.FechaAlta
                    })
                    .FirstOrDefaultAsync();

                if (proveedor == null)
                {
                    return NotFound(new { message = "Proveedor no encontrado" });
                }

                return Ok(proveedor);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener el proveedor con ID: {ProveedorId}", id);
                return StatusCode(500, new { message = "Error al obtener el proveedor" });
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
    }
}
