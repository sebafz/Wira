using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Wira.Api.Data;
using Wira.Api.Models;

namespace Wira.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestController : ControllerBase
    {
        private readonly WiraDbContext _context;

        public TestController(WiraDbContext context)
        {
            _context = context;
        }

        [HttpGet("connection")]
        public async Task<IActionResult> TestConnection()
        {
            try
            {
                var canConnect = await _context.Database.CanConnectAsync();
                if (canConnect)
                {
                    var rolesCount = await _context.Roles.CountAsync();
                    var estadosLicitacionCount = await _context.EstadosLicitacion.CountAsync();
                    var estadosPropuestaCount = await _context.EstadosPropuesta.CountAsync();

                    return Ok(new
                    {
                        connected = true,
                        message = "Conexión exitosa a la base de datos",
                        data = new
                        {
                            roles = rolesCount,
                            estadosLicitacion = estadosLicitacionCount,
                            estadosPropuesta = estadosPropuestaCount
                        }
                    });
                }
                else
                {
                    return BadRequest(new { connected = false, message = "No se pudo conectar a la base de datos" });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { connected = false, message = ex.Message });
            }
        }

        [HttpGet("roles")]
        public async Task<IActionResult> GetRoles()
        {
            try
            {
                var roles = await _context.Roles.ToListAsync();
                return Ok(roles);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("estados")]
        public async Task<IActionResult> GetEstados()
        {
            try
            {
                var estados = new
                {
                    licitacion = await _context.EstadosLicitacion.ToListAsync(),
                    propuesta = await _context.EstadosPropuesta.ToListAsync()
                };
                return Ok(estados);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }
}
