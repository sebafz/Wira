using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Wira.Api.Data;

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
                var proveedores = await _context.Proveedores
                    .Where(p => p.Activo)
                    .Select(p => new
                    {
                        p.ProveedorID,
                        p.Nombre,
                        p.CUIT,
                        p.Especialidad
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
                var proveedor = await _context.Proveedores
                    .Where(p => p.ProveedorID == id && p.Activo)
                    .Select(p => new
                    {
                        p.ProveedorID,
                        p.Nombre,
                        p.CUIT,
                        p.Especialidad
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

        [HttpGet("especialidades")]
        public async Task<IActionResult> GetEspecialidades()
        {
            try
            {
                var especialidades = await _context.Proveedores
                    .Where(p => p.Activo && !string.IsNullOrEmpty(p.Especialidad))
                    .Select(p => p.Especialidad)
                    .Distinct()
                    .OrderBy(e => e)
                    .ToListAsync();

                return Ok(especialidades);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener las especialidades");
                return StatusCode(500, new { message = "Error al obtener las especialidades" });
            }
        }
    }
}
