using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Wira.Api.Data;
using Wira.Api.Models;

namespace Wira.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DashboardController : ControllerBase
    {
        private readonly WiraDbContext _context;

        public DashboardController(WiraDbContext context)
        {
            _context = context;
        }

        [HttpGet("minera/{mineraId}/kpis")]
        public async Task<ActionResult<DashboardKpisResponse>> GetMineraKpis(int mineraId)
        {
            try
            {
                // Verificar que la minera existe
                var minera = await _context.Empresas
                    .FirstOrDefaultAsync(m => m.EmpresaID == mineraId && m.TipoEmpresa == EmpresaTipos.Minera && m.Activo);
                if (minera == null)
                {
                    return NotFound("Minera no encontrada");
                }

                // KPI 1: Licitaciones activas (Publicada)
                var licitacionesActivas = await _context.Licitaciones
                    .Include(l => l.EstadoLicitacion)
                    .Where(l => l.MineraID == mineraId &&
                               !l.Eliminado &&
                               l.EstadoLicitacion.NombreEstado == "Publicada")
                    .CountAsync();

                // KPI 2: Licitaciones en evaluación (En Evaluación)
                var licitacionesEnEvaluacion = await _context.Licitaciones
                    .Include(l => l.EstadoLicitacion)
                    .Where(l => l.MineraID == mineraId &&
                               !l.Eliminado &&
                               l.EstadoLicitacion.NombreEstado == "En Evaluación")
                    .CountAsync();

                // KPI 3: Total de propuestas recibidas para todas las licitaciones de la minera
                var propuestasRecibidas = await _context.Propuestas
                    .Include(p => p.Licitacion)
                    .Where(p => p.Licitacion.MineraID == mineraId &&
                               !p.Eliminado)
                    .CountAsync();

                // KPI 4: Adjudicaciones (licitaciones adjudicadas)
                var adjudicaciones = await _context.Licitaciones
                    .Include(l => l.EstadoLicitacion)
                    .Where(l => l.MineraID == mineraId &&
                               !l.Eliminado &&
                               l.EstadoLicitacion.NombreEstado == "Adjudicada")
                    .CountAsync();

                var response = new DashboardKpisResponse
                {
                    LicitacionesActivas = licitacionesActivas,
                    LicitacionesEnEvaluacion = licitacionesEnEvaluacion,
                    PropuestasRecibidas = propuestasRecibidas,
                    Adjudicaciones = adjudicaciones
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        [HttpGet("minera/{mineraId}/estadisticas-recientes")]
        public async Task<ActionResult<EstadisticasRecientesResponse>> GetEstadisticasRecientes(int mineraId)
        {
            try
            {
                // Verificar que la minera existe
                var minera = await _context.Empresas
                    .FirstOrDefaultAsync(m => m.EmpresaID == mineraId && m.TipoEmpresa == EmpresaTipos.Minera && m.Activo);
                if (minera == null)
                {
                    return NotFound("Minera no encontrada");
                }

                var fechaInicio = DateTime.Now.AddDays(-30); // Últimos 30 días

                // Licitaciones creadas en los últimos 30 días
                var licitacionesRecientes = await _context.Licitaciones
                    .Where(l => l.MineraID == mineraId &&
                               !l.Eliminado &&
                               l.FechaCreacion >= fechaInicio)
                    .CountAsync();

                // Propuestas recibidas en los últimos 30 días
                var propuestasRecientes = await _context.Propuestas
                    .Include(p => p.Licitacion)
                    .Where(p => p.Licitacion.MineraID == mineraId &&
                               !p.Eliminado &&
                               p.FechaEnvio >= fechaInicio)
                    .CountAsync();

                // Licitaciones que vencen en los próximos 7 días
                var fechaLimite = DateTime.Now.AddDays(7);
                var licitacionesProximasVencer = await _context.Licitaciones
                    .Include(l => l.EstadoLicitacion)
                    .Where(l => l.MineraID == mineraId &&
                               !l.Eliminado &&
                               l.EstadoLicitacion.NombreEstado == "Publicada" &&
                               l.FechaCierre <= fechaLimite &&
                               l.FechaCierre > DateTime.Now)
                    .CountAsync();

                // Valor promedio de propuestas recibidas por moneda
                var valorPromedioPorMoneda = await _context.Propuestas
                    .Include(p => p.Licitacion)
                    .Include(p => p.Moneda)
                    .Where(p => p.Licitacion.MineraID == mineraId && !p.Eliminado)
                    .GroupBy(p => new
                    {
                        p.MonedaID,
                        Codigo = p.Moneda.Codigo,
                        Nombre = p.Moneda.Nombre,
                        Simbolo = p.Moneda.Simbolo
                    })
                    .Select(g => new ValorPromedioMonedaDto
                    {
                        MonedaID = g.Key.MonedaID,
                        MonedaCodigo = g.Key.Codigo,
                        MonedaNombre = g.Key.Nombre,
                        MonedaSimbolo = g.Key.Simbolo,
                        Promedio = Math.Round(g.Average(p => p.PresupuestoOfrecido), 2)
                    })
                    .OrderByDescending(x => x.Promedio)
                    .ToListAsync();

                var response = new EstadisticasRecientesResponse
                {
                    LicitacionesCreadas30Dias = licitacionesRecientes,
                    PropuestasRecibidas30Dias = propuestasRecientes,
                    LicitacionesProximasVencer = licitacionesProximasVencer,
                    ValorPromedioRespuestas = valorPromedioPorMoneda
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        [HttpGet("proveedor/{proveedorId}/kpis")]
        public async Task<ActionResult<DashboardKpisProveedorResponse>> GetProveedorKpis(int proveedorId)
        {
            try
            {
                // Verificar que el proveedor existe
                var proveedor = await _context.Empresas
                    .FirstOrDefaultAsync(p => p.EmpresaID == proveedorId && p.TipoEmpresa == EmpresaTipos.Proveedor && p.Activo);
                if (proveedor == null)
                {
                    return NotFound("Proveedor no encontrado");
                }

                // KPI 1: Licitaciones disponibles (Publicadas que coincidan con el rubro del proveedor)
                var licitacionesDisponibles = await _context.Licitaciones
                    .Include(l => l.EstadoLicitacion)
                    .Where(l => !l.Eliminado &&
                               l.EstadoLicitacion.NombreEstado == "Publicada" &&
                               l.RubroID == proveedor.RubroID &&
                               l.FechaCierre > DateTime.Now)
                    .CountAsync();

                // KPI 2: Propuestas enviadas por este proveedor
                var propuestasEnviadas = await _context.Propuestas
                    .Where(p => p.ProveedorID == proveedorId && !p.Eliminado)
                    .CountAsync();

                // KPI 3: Propuestas en evaluación
                var propuestasEnEvaluacion = await _context.Propuestas
                    .Include(p => p.EstadoPropuesta)
                    .Where(p => p.ProveedorID == proveedorId &&
                               !p.Eliminado &&
                               (p.EstadoPropuesta.NombreEstado == "En Revisión" ||
                                p.EstadoPropuesta.NombreEstado == "Enviada"))
                    .CountAsync();

                // KPI 4: Adjudicaciones ganadas (desde el historial)
                var adjudicacionesGanadas = await _context.HistorialProveedorLicitacion
                    .Where(h => h.ProveedorID == proveedorId && h.Ganador == true)
                    .CountAsync();

                var response = new DashboardKpisProveedorResponse
                {
                    LicitacionesDisponibles = licitacionesDisponibles,
                    PropuestasEnviadas = propuestasEnviadas,
                    PropuestasEnEvaluacion = propuestasEnEvaluacion,
                    AdjudicacionesGanadas = adjudicacionesGanadas
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }
    }

    public class DashboardKpisResponse
    {
        public int LicitacionesActivas { get; set; }
        public int LicitacionesEnEvaluacion { get; set; }
        public int PropuestasRecibidas { get; set; }
        public int Adjudicaciones { get; set; }
    }

    public class DashboardKpisProveedorResponse
    {
        public int LicitacionesDisponibles { get; set; }
        public int PropuestasEnviadas { get; set; }
        public int PropuestasEnEvaluacion { get; set; }
        public int AdjudicacionesGanadas { get; set; }
    }

    public class EstadisticasRecientesResponse
    {
        public int LicitacionesCreadas30Dias { get; set; }
        public int PropuestasRecibidas30Dias { get; set; }
        public int LicitacionesProximasVencer { get; set; }
        public List<ValorPromedioMonedaDto> ValorPromedioRespuestas { get; set; } = new();
    }

    public class ValorPromedioMonedaDto
    {
        public int MonedaID { get; set; }
        public string MonedaCodigo { get; set; } = string.Empty;
        public string MonedaNombre { get; set; } = string.Empty;
        public string? MonedaSimbolo { get; set; }
        public decimal Promedio { get; set; }
    }
}
