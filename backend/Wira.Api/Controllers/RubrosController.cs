using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Wira.Api.Data;
using Wira.Api.DTOs;
using Wira.Api.Models;

namespace Wira.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RubrosController : ControllerBase
    {
        private readonly WiraDbContext _context;

        public RubrosController(WiraDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetRubros([FromQuery] bool includeInactive = false)
        {
            try
            {
                var query = _context.Rubros.AsQueryable();

                if (!includeInactive)
                {
                    query = query.Where(r => r.Activo);
                }

                var rubros = await query
                    .OrderBy(r => r.Nombre)
                    .Select(r => new RubroDto
                    {
                        RubroID = r.RubroID,
                        Nombre = r.Nombre,
                        Activo = r.Activo
                    })
                    .ToListAsync();

                return Ok(rubros);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting rubros: {ex.Message}");
                return StatusCode(500, new { message = "Error al obtener los rubros" });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetRubro(int id)
        {
            try
            {
                var rubro = await _context.Rubros
                    .Where(r => r.RubroID == id)
                    .Select(r => new RubroDto
                    {
                        RubroID = r.RubroID,
                        Nombre = r.Nombre,
                        Activo = r.Activo
                    })
                    .FirstOrDefaultAsync();

                if (rubro == null)
                {
                    return NotFound(new { message = "Rubro no encontrado" });
                }

                return Ok(rubro);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting rubro: {ex.Message}");
                return StatusCode(500, new { message = "Error al obtener el rubro" });
            }
        }
    }
}
