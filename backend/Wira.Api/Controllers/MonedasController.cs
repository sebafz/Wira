using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Wira.Api.Data;

namespace Wira.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MonedasController : ControllerBase
    {
        private readonly WiraDbContext _context;
        private readonly ILogger<MonedasController> _logger;

        public MonedasController(WiraDbContext context, ILogger<MonedasController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetMonedas()
        {
            try
            {
                var monedas = await _context.Monedas
                    .Where(m => m.Activo)
                    .OrderBy(m => m.Nombre)
                    .Select(m => new
                    {
                        m.MonedaID,
                        m.Codigo,
                        m.Nombre,
                        m.Simbolo
                    })
                    .ToListAsync();

                return Ok(monedas);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener las monedas disponibles");
                return StatusCode(500, new { message = "Error al obtener las monedas" });
            }
        }
    }
}
