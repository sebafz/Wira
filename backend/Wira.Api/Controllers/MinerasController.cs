using System;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Wira.Api.Data;
using Wira.Api.DTOs;
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
        public async Task<IActionResult> GetMineras([FromQuery] bool includeInactive = false)
        {
            try
            {
                var query = _context.Empresas
                    .Where(m => m.TipoEmpresa == EmpresaTipos.Minera);

                if (!includeInactive)
                {
                    query = query.Where(m => m.Activo);
                }

                var mineras = await query
                    .OrderBy(m => m.Nombre)
                    .Select(m => new MineraResponse
                    {
                        MineraID = m.EmpresaID,
                        Nombre = m.Nombre,
                        RazonSocial = m.RazonSocial,
                        CUIT = m.CUIT,
                        EmailContacto = m.EmailContacto,
                        Telefono = m.Telefono,
                        Activo = m.Activo,
                        FechaAlta = m.FechaAlta
                    })
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
                    .Where(m => m.EmpresaID == id && m.TipoEmpresa == EmpresaTipos.Minera)
                    .Select(m => new MineraResponse
                    {
                        MineraID = m.EmpresaID,
                        Nombre = m.Nombre,
                        RazonSocial = m.RazonSocial,
                        CUIT = m.CUIT,
                        EmailContacto = m.EmailContacto,
                        Telefono = m.Telefono,
                        Activo = m.Activo,
                        FechaAlta = m.FechaAlta
                    })
                    .FirstOrDefaultAsync();

                if (minera == null)
                {
                    return NotFound(new { message = "Minera no encontrada" });
                }

                return Ok(new { minera });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener la minera con ID: {MineraId}", id);
                return StatusCode(500, new { message = "Error al obtener la minera" });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateMinera([FromBody] CreateMineraRequest request)
        {
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            try
            {
                var normalizedCuit = NormalizeCuit(request.CUIT);
                var exists = await _context.Empresas.AnyAsync(m =>
                    m.TipoEmpresa == EmpresaTipos.Minera &&
                    m.CUIT == normalizedCuit);

                if (exists)
                {
                    return Conflict(new { message = "Ya existe una minera con ese CUIT." });
                }

                var minera = new Empresa
                {
                    Nombre = request.Nombre.Trim(),
                    RazonSocial = request.RazonSocial.Trim(),
                    CUIT = normalizedCuit,
                    EmailContacto = NormalizeOptional(request.EmailContacto),
                    Telefono = NormalizeOptional(request.Telefono),
                    TipoEmpresa = EmpresaTipos.Minera,
                    Activo = request.Activo,
                    FechaAlta = DateTime.UtcNow
                };

                _context.Empresas.Add(minera);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetMinera), new { id = minera.EmpresaID }, new { minera = MapToResponse(minera) });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear la minera");
                return StatusCode(500, new { message = "Error al crear la minera" });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateMinera(int id, [FromBody] UpdateMineraRequest request)
        {
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            try
            {
                var minera = await _context.Empresas
                    .FirstOrDefaultAsync(m => m.EmpresaID == id && m.TipoEmpresa == EmpresaTipos.Minera);

                if (minera == null)
                {
                    return NotFound(new { message = "Minera no encontrada" });
                }

                var normalizedCuit = NormalizeCuit(request.CUIT);
                if (!string.Equals(minera.CUIT, normalizedCuit, StringComparison.OrdinalIgnoreCase))
                {
                    return BadRequest(new { message = "El CUIT no puede modificarse." });
                }

                minera.Nombre = request.Nombre.Trim();
                minera.RazonSocial = request.RazonSocial.Trim();
                minera.EmailContacto = NormalizeOptional(request.EmailContacto);
                minera.Telefono = NormalizeOptional(request.Telefono);
                minera.Activo = request.Activo;

                await _context.SaveChangesAsync();

                return Ok(new { minera = MapToResponse(minera) });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar la minera con ID: {MineraId}", id);
                return StatusCode(500, new { message = "Error al actualizar la minera" });
            }
        }

        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateMineraStatus(int id, [FromBody] UpdateMineraStatusRequest request)
        {
            try
            {
                var minera = await _context.Empresas
                    .FirstOrDefaultAsync(m => m.EmpresaID == id && m.TipoEmpresa == EmpresaTipos.Minera);

                if (minera == null)
                {
                    return NotFound(new { message = "Minera no encontrada" });
                }

                minera.Activo = request.Activo;
                await _context.SaveChangesAsync();

                return Ok(new { minera = MapToResponse(minera) });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar el estado de la minera con ID: {MineraId}", id);
                return StatusCode(500, new { message = "Error al actualizar el estado de la minera" });
            }
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

        private static MineraResponse MapToResponse(Empresa minera)
        {
            return new MineraResponse
            {
                MineraID = minera.EmpresaID,
                Nombre = minera.Nombre,
                RazonSocial = minera.RazonSocial,
                CUIT = minera.CUIT,
                EmailContacto = minera.EmailContacto,
                Telefono = minera.Telefono,
                Activo = minera.Activo,
                FechaAlta = minera.FechaAlta
            };
        }
    }
}
