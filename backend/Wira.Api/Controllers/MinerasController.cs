using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Wira.Api.Data;
using Wira.Api.Models;

namespace Wira.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MinerasController : ControllerBase
    {
        private readonly WiraDbContext _context;
        private readonly ILogger<MinerasController> _logger;

        public MinerasController(WiraDbContext context, ILogger<MinerasController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetMineras()
        {
            try
            {
                var mineras = await _context.Empresas
                    .Where(m => m.Activo && m.TipoEmpresa == EmpresaTipos.Minera)
                    .Select(m => new
                    {
                        MineraID = m.EmpresaID,
                        m.Nombre,
                        m.RazonSocial,
                        m.CUIT,
                        m.EmailContacto,
                        m.Telefono,
                        m.FechaAlta
                    })
                    .OrderBy(m => m.Nombre)
                    .ToListAsync();

                return Ok(mineras);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener las mineras");
                return StatusCode(500, new { message = "Error al obtener las mineras" });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetMinera(int id)
        {
            try
            {
                var minera = await _context.Empresas
                    .Where(m => m.EmpresaID == id && m.Activo && m.TipoEmpresa == EmpresaTipos.Minera)
                    .Select(m => new
                    {
                        MineraID = m.EmpresaID,
                        m.Nombre,
                        m.RazonSocial,
                        m.CUIT,
                        m.EmailContacto,
                        m.Telefono,
                        m.FechaAlta
                    })
                    .FirstOrDefaultAsync();

                if (minera == null)
                {
                    return NotFound(new { message = "Minera no encontrada" });
                }

                return Ok(minera);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener la minera con ID: {MineraId}", id);
                return StatusCode(500, new { message = "Error al obtener la minera" });
            }
        }
    }
}
