using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Wira.Api.Data;
using Wira.Api.Models;
using Wira.Api.DTOs;
using Wira.Api.Services;
using System.ComponentModel.DataAnnotations;

namespace Wira.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LicitacionesController : ControllerBase
    {
        private readonly WiraDbContext _context;
        private readonly ILogger<LicitacionesController> _logger;
        private readonly INotificacionService _notificacionService;

        public LicitacionesController(WiraDbContext context, ILogger<LicitacionesController> logger, INotificacionService notificacionService)
        {
            _context = context;
            _logger = logger;
            _notificacionService = notificacionService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<LicitacionDto>>> GetLicitaciones()
        {
            try
            {
                var licitaciones = await _context.Licitaciones
                    .Include(l => l.Minera)
                    .Include(l => l.Rubro)
                    .Include(l => l.EstadoLicitacion)
                    .Include(l => l.ProyectoMinero)
                    .Where(l => !l.Eliminado)
                    .ToListAsync();

                var licitacionDtos = new List<LicitacionDto>();

                foreach (var l in licitaciones)
                {
                    // Buscar archivo adjunto en la tabla ArchivosAdjuntos
                    var archivoAdjunto = await _context.ArchivosAdjuntos
                        .Where(a => a.EntidadTipo == "LICITACION" && a.EntidadID == l.LicitacionID)
                        .FirstOrDefaultAsync();

                    var licitacionDto = new LicitacionDto
                    {
                        LicitacionID = l.LicitacionID,
                        MineraID = l.MineraID,
                        RubroID = l.RubroID,
                        Titulo = l.Titulo,
                        Descripcion = l.Descripcion,
                        FechaInicio = l.FechaInicio,
                        FechaCierre = l.FechaCierre,
                        PresupuestoEstimado = l.PresupuestoEstimado,
                        Condiciones = l.Condiciones,
                        EstadoLicitacionID = l.EstadoLicitacionID,
                        ArchivoID = l.ArchivoID,
                        ProyectoMineroID = l.ProyectoMineroID,
                        FechaCreacion = l.FechaCreacion,
                        MineraNombre = l.Minera.Nombre,
                        RubroNombre = l.Rubro.Nombre,
                        EstadoNombre = l.EstadoLicitacion.NombreEstado,
                        ArchivoNombre = archivoAdjunto?.NombreArchivo,
                        ProyectoMineroNombre = l.ProyectoMinero?.Nombre
                    };

                    licitacionDtos.Add(licitacionDto);
                }

                return Ok(licitacionDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener licitaciones");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<LicitacionDto>> GetLicitacion(int id)
        {
            try
            {
                var licitacion = await _context.Licitaciones
                    .Include(l => l.Minera)
                    .Include(l => l.Rubro)
                    .Include(l => l.EstadoLicitacion)
                    .Include(l => l.ProyectoMinero)
                    .Include(l => l.CriteriosLicitacion)
                        .ThenInclude(c => c.Opciones)
                    .Where(l => l.LicitacionID == id && !l.Eliminado)
                    .FirstOrDefaultAsync();

                if (licitacion == null)
                {
                    return NotFound();
                }

                // Buscar archivo adjunto en la tabla ArchivosAdjuntos
                var archivoAdjunto = await _context.ArchivosAdjuntos
                    .Where(a => a.EntidadTipo == "LICITACION" && a.EntidadID == id)
                    .FirstOrDefaultAsync();

                var licitacionDto = new LicitacionDto
                {
                    LicitacionID = licitacion.LicitacionID,
                    MineraID = licitacion.MineraID,
                    RubroID = licitacion.RubroID,
                    Titulo = licitacion.Titulo,
                    Descripcion = licitacion.Descripcion,
                    FechaInicio = licitacion.FechaInicio,
                    FechaCierre = licitacion.FechaCierre,
                    PresupuestoEstimado = licitacion.PresupuestoEstimado,
                    Condiciones = licitacion.Condiciones,
                    EstadoLicitacionID = licitacion.EstadoLicitacionID,
                    ArchivoID = licitacion.ArchivoID,
                    ProyectoMineroID = licitacion.ProyectoMineroID,
                    FechaCreacion = licitacion.FechaCreacion,
                    MineraNombre = licitacion.Minera.Nombre,
                    RubroNombre = licitacion.Rubro.Nombre,
                    EstadoNombre = licitacion.EstadoLicitacion.NombreEstado,
                    ArchivoNombre = archivoAdjunto?.NombreArchivo,
                    ProyectoMineroNombre = licitacion.ProyectoMinero?.Nombre,
                    Criterios = licitacion.CriteriosLicitacion.Select(c => new CriterioLicitacionDto
                    {
                        CriterioID = c.CriterioID,
                        LicitacionID = c.LicitacionID,
                        Nombre = c.Nombre,
                        Descripcion = c.Descripcion,
                        Peso = c.Peso,
                        Tipo = c.Tipo,
                        EsExcluyente = c.EsExcluyente,
                        EsPuntuable = c.EsPuntuable,
                        MayorMejor = c.MayorMejor,
                        ValorMinimo = c.ValorMinimo,
                        ValorMaximo = c.ValorMaximo,
                        ValorRequeridoBooleano = c.ValorRequeridoBooleano,
                        Opciones = c.Opciones
                            .OrderBy(o => o.Orden)
                            .Select(o => new CriterioOpcionDto
                            {
                                OpcionID = o.OpcionID,
                                Valor = o.Valor,
                                Descripcion = o.Descripcion,
                                Puntaje = o.Puntaje,
                                Orden = o.Orden
                            })
                            .ToList()
                    }).ToList()
                };

                return Ok(licitacionDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al obtener licitación con ID: {id}");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        [HttpPost]
        public async Task<ActionResult<LicitacionDto>> CreateLicitacion(CreateLicitacionRequest request)
        {
            try
            {
                // Validar que la minera existe
                var minera = await _context.Empresas
                    .FirstOrDefaultAsync(m => m.EmpresaID == request.MineraID && m.TipoEmpresa == EmpresaTipos.Minera && m.Activo);
                if (minera == null)
                {
                    return BadRequest("La minera especificada no existe.");
                }

                // Validar que el rubro existe
                var rubro = await _context.Rubros.FindAsync(request.RubroID);
                if (rubro == null)
                {
                    return BadRequest("El rubro especificado no existe.");
                }

                // Validar que el proyecto minero existe y pertenece a la minera (si se especifica)
                if (request.ProyectoMineroID.HasValue)
                {
                    var proyecto = await _context.ProyectosMineros
                        .FirstOrDefaultAsync(p => p.ProyectoMineroID == request.ProyectoMineroID.Value &&
                                                  p.MineraID == request.MineraID &&
                                                  p.Activo);
                    if (proyecto == null)
                    {
                        return BadRequest("El proyecto minero especificado no existe o no pertenece a la minera.");
                    }
                }

                // Validar fechas
                if (request.FechaInicio >= request.FechaCierre)
                {
                    return BadRequest("La fecha de cierre debe ser posterior a la fecha de inicio.");
                }

                var criteriosValidationError = ValidateCriteriosPayload(request.Criterios);
                if (criteriosValidationError is not null)
                {
                    return BadRequest(criteriosValidationError);
                }

                // Obtener el estado inicial de licitación ("Publicada")
                var estadoInicial = await _context.EstadosLicitacion.FirstOrDefaultAsync(e => e.NombreEstado == "Publicada");
                if (estadoInicial == null)
                {
                    return BadRequest("No se encontró el estado inicial para la licitación.");
                }

                // Crear la licitación
                var licitacion = new Licitacion
                {
                    MineraID = request.MineraID,
                    RubroID = request.RubroID,
                    Titulo = request.Titulo,
                    Descripcion = request.Descripcion,
                    FechaInicio = request.FechaInicio,
                    FechaCierre = request.FechaCierre,
                    PresupuestoEstimado = request.PresupuestoEstimado,
                    Condiciones = request.Condiciones,
                    EstadoLicitacionID = estadoInicial.EstadoLicitacionID,
                    ArchivoID = request.ArchivoID,
                    ProyectoMineroID = request.ProyectoMineroID,
                    FechaCreacion = DateTime.Now
                };

                _context.Licitaciones.Add(licitacion);
                await _context.SaveChangesAsync();

                // Crear los criterios de evaluación
                foreach (var criterioRequest in request.Criterios)
                {
                    bool esDescriptivo = criterioRequest.Tipo == TipoCriterio.Descriptivo;
                    bool esNumerico = criterioRequest.Tipo == TipoCriterio.Numerico;
                    bool esBooleano = criterioRequest.Tipo == TipoCriterio.Booleano;
                    bool esEscala = criterioRequest.Tipo == TipoCriterio.Escala;

                    var criterio = new CriterioLicitacion
                    {
                        LicitacionID = licitacion.LicitacionID,
                        Nombre = criterioRequest.Nombre,
                        Descripcion = criterioRequest.Descripcion,
                        Peso = criterioRequest.Peso,
                        Tipo = criterioRequest.Tipo,
                        EsExcluyente = esDescriptivo ? false : criterioRequest.EsExcluyente,
                        EsPuntuable = esDescriptivo ? false : criterioRequest.EsPuntuable,
                        MayorMejor = esNumerico ? criterioRequest.MayorMejor : null,
                        ValorMinimo = esNumerico ? criterioRequest.ValorMinimo : null,
                        ValorMaximo = esNumerico ? criterioRequest.ValorMaximo : null,
                        ValorRequeridoBooleano = esBooleano && criterioRequest.EsPuntuable
                            ? criterioRequest.ValorRequeridoBooleano
                            : null
                    };

                    if (esEscala && criterioRequest.Opciones != null)
                    {
                        for (int i = 0; i < criterioRequest.Opciones.Count; i++)
                        {
                            var opcionRequest = criterioRequest.Opciones[i];
                            criterio.Opciones.Add(new CriterioOpcion
                            {
                                Valor = opcionRequest.Valor,
                                Descripcion = opcionRequest.Descripcion,
                                Puntaje = criterio.EsPuntuable ? opcionRequest.Puntaje : null,
                                Orden = opcionRequest.Orden ?? (i + 1)
                            });
                        }
                    }

                    _context.CriteriosLicitacion.Add(criterio);
                }

                await _context.SaveChangesAsync();

                _logger.LogInformation($"Licitación creada exitosamente con ID: {licitacion.LicitacionID}");

                // Crear notificación para proveedores
                await _notificacionService.CrearNotificacionLicitacionPublicada(
                    licitacion.LicitacionID,
                    licitacion.Titulo,
                    licitacion.MineraID
                );

                // Retornar la licitación creada
                return await GetLicitacion(licitacion.LicitacionID);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear licitación");
                return StatusCode(500, "Error interno del servidor al crear la licitación.");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateLicitacion(int id, UpdateLicitacionRequest request)
        {
            try
            {
                var licitacion = await _context.Licitaciones
                    .Include(l => l.CriteriosLicitacion)
                        .ThenInclude(c => c.Opciones)
                    .FirstOrDefaultAsync(l => l.LicitacionID == id && !l.Eliminado);

                if (licitacion == null)
                {
                    return NotFound();
                }

                if (request.FechaInicio >= request.FechaCierre)
                {
                    return BadRequest("La fecha de cierre debe ser posterior a la fecha de inicio.");
                }

                var rubro = await _context.Rubros.FindAsync(request.RubroID);
                if (rubro == null)
                {
                    return BadRequest("El rubro especificado no existe.");
                }

                if (request.ProyectoMineroID.HasValue)
                {
                    var proyecto = await _context.ProyectosMineros
                        .FirstOrDefaultAsync(p => p.ProyectoMineroID == request.ProyectoMineroID.Value &&
                                                  p.MineraID == licitacion.MineraID &&
                                                  p.Activo);
                    if (proyecto == null)
                    {
                        return BadRequest("El proyecto minero especificado no existe o no pertenece a la minera.");
                    }
                }

                var criteriosValidationError = ValidateCriteriosPayload(request.Criterios);
                if (criteriosValidationError is not null)
                {
                    return BadRequest(criteriosValidationError);
                }

                licitacion.Titulo = request.Titulo;
                licitacion.Descripcion = request.Descripcion;
                licitacion.FechaInicio = request.FechaInicio;
                licitacion.FechaCierre = request.FechaCierre;
                licitacion.PresupuestoEstimado = request.PresupuestoEstimado;
                licitacion.Condiciones = request.Condiciones;
                licitacion.ArchivoID = request.ArchivoID;
                licitacion.ProyectoMineroID = request.ProyectoMineroID;
                licitacion.RubroID = request.RubroID;

                if (licitacion.CriteriosLicitacion.Any())
                {
                    _context.CriteriosLicitacion.RemoveRange(licitacion.CriteriosLicitacion);
                }

                foreach (var criterioRequest in request.Criterios)
                {
                    bool esDescriptivo = criterioRequest.Tipo == TipoCriterio.Descriptivo;
                    bool esNumerico = criterioRequest.Tipo == TipoCriterio.Numerico;
                    bool esBooleano = criterioRequest.Tipo == TipoCriterio.Booleano;
                    bool esEscala = criterioRequest.Tipo == TipoCriterio.Escala;

                    var criterio = new CriterioLicitacion
                    {
                        LicitacionID = licitacion.LicitacionID,
                        Nombre = criterioRequest.Nombre,
                        Descripcion = criterioRequest.Descripcion,
                        Peso = criterioRequest.Peso,
                        Tipo = criterioRequest.Tipo,
                        EsExcluyente = esDescriptivo ? false : criterioRequest.EsExcluyente,
                        EsPuntuable = esDescriptivo ? false : criterioRequest.EsPuntuable,
                        MayorMejor = esNumerico ? criterioRequest.MayorMejor : null,
                        ValorMinimo = esNumerico ? criterioRequest.ValorMinimo : null,
                        ValorMaximo = esNumerico ? criterioRequest.ValorMaximo : null,
                        ValorRequeridoBooleano = esBooleano && criterioRequest.EsPuntuable
                            ? criterioRequest.ValorRequeridoBooleano
                            : null
                    };

                    if (esEscala && criterioRequest.Opciones != null)
                    {
                        for (int i = 0; i < criterioRequest.Opciones.Count; i++)
                        {
                            var opcionRequest = criterioRequest.Opciones[i];
                            criterio.Opciones.Add(new CriterioOpcion
                            {
                                Valor = opcionRequest.Valor,
                                Descripcion = opcionRequest.Descripcion,
                                Puntaje = criterio.EsPuntuable ? opcionRequest.Puntaje : null,
                                Orden = opcionRequest.Orden ?? (i + 1)
                            });
                        }
                    }

                    _context.CriteriosLicitacion.Add(criterio);
                }

                await _context.SaveChangesAsync();

                _logger.LogInformation($"Licitación actualizada exitosamente con ID: {id}");

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al actualizar licitación con ID: {id}");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteLicitacion(int id)
        {
            try
            {
                var licitacion = await _context.Licitaciones.FindAsync(id);
                if (licitacion == null || licitacion.Eliminado)
                {
                    return NotFound();
                }

                // Soft delete
                licitacion.Eliminado = true;
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Licitación eliminada (soft delete) con ID: {id}");

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al eliminar licitación con ID: {id}");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        [HttpGet("{id}/criterios")]
        public async Task<ActionResult<IEnumerable<object>>> GetCriteriosLicitacion(int id)
        {
            try
            {
                var licitacion = await _context.Licitaciones
                    .Where(l => l.LicitacionID == id && !l.Eliminado)
                    .FirstOrDefaultAsync();

                if (licitacion == null)
                {
                    return NotFound(new { message = "Licitación no encontrada" });
                }

                var criterios = await _context.CriteriosLicitacion
                    .Where(c => c.LicitacionID == id)
                    .Select(c => new
                    {
                        c.CriterioID,
                        c.LicitacionID,
                        c.Nombre,
                        c.Descripcion,
                        c.Peso,
                        c.MayorMejor,
                        c.Tipo,
                        c.EsExcluyente,
                        c.EsPuntuable,
                        c.ValorMinimo,
                        c.ValorMaximo,
                        c.ValorRequeridoBooleano,
                        Opciones = c.Opciones
                            .OrderBy(o => o.Orden)
                            .Select(o => new
                            {
                                o.OpcionID,
                                o.Valor,
                                o.Descripcion,
                                o.Puntaje,
                                o.Orden
                            }).ToList()
                    })
                    .OrderBy(c => c.Nombre)
                    .ToListAsync();

                return Ok(criterios);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener criterios de la licitación {LicitacionId}", id);
                return StatusCode(500, new { message = "Error al obtener los criterios de la licitación" });
            }
        }

        [HttpPut("{id}/cerrar")]
        public async Task<IActionResult> CerrarLicitacion(int id)
        {
            try
            {
                var licitacion = await _context.Licitaciones
                    .Include(l => l.EstadoLicitacion)
                    .Where(l => l.LicitacionID == id && !l.Eliminado)
                    .FirstOrDefaultAsync();

                if (licitacion == null)
                {
                    return NotFound(new { message = "Licitación no encontrada" });
                }

                string estadoActual = licitacion.EstadoLicitacion.NombreEstado;
                string estadoDestino;
                string mensajeNotificacion;

                // Determinar el estado de destino basado en el estado actual
                if (estadoActual == "Publicada")
                {
                    // Si está publicada, pasa a "En Evaluación"
                    estadoDestino = "En Evaluación";
                    mensajeNotificacion = "Licitación cerrada exitosamente y pasada a evaluación";
                }
                else if (estadoActual == "Adjudicada")
                {
                    // Si está adjudicada, pasa a cerrada (finalizada)
                    estadoDestino = "Cerrada";
                    mensajeNotificacion = "Licitación finalizada exitosamente";
                }
                else
                {
                    return BadRequest(new { message = $"La licitación debe estar en estado 'Publicada' o 'Adjudicada' para poder cerrarla. Estado actual: {estadoActual}" });
                }

                // Buscar el estado de destino
                var estadoNuevo = await _context.EstadosLicitacion
                    .Where(e => e.NombreEstado == estadoDestino)
                    .FirstOrDefaultAsync();

                if (estadoNuevo == null)
                {
                    return BadRequest(new { message = $"No se encontró el estado '{estadoDestino}'" });
                }

                // Cambiar el estado de la licitación
                licitacion.EstadoLicitacionID = estadoNuevo.EstadoLicitacionID;

                // Solo actualizar la fecha de cierre si realmente se está cerrando (no en evaluación)
                if (estadoDestino == "Cerrada")
                {
                    licitacion.FechaCierre = DateTime.UtcNow;
                }

                await _context.SaveChangesAsync();

                _logger.LogInformation($"Licitación actualizada con ID: {id}. Estado: {estadoActual} -> {estadoDestino}");

                // Crear notificación apropiada
                if (estadoDestino == "En Evaluación")
                {
                    await _notificacionService.CrearNotificacionLicitacionCerrada(
                        id,
                        licitacion.Titulo,
                        licitacion.MineraID
                    );
                }

                return Ok(new { message = mensajeNotificacion });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al cerrar licitación con ID: {id}");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        [HttpPut("{id}/adjudicar")]
        public async Task<IActionResult> AdjudicarLicitacion(int id)
        {
            try
            {
                var licitacion = await _context.Licitaciones
                    .Include(l => l.EstadoLicitacion)
                    .Where(l => l.LicitacionID == id && !l.Eliminado)
                    .FirstOrDefaultAsync();

                if (licitacion == null)
                {
                    return NotFound(new { message = "Licitación no encontrada" });
                }

                // Verificar que la licitación esté en estado "En Evaluación"
                if (licitacion.EstadoLicitacion.NombreEstado != "En Evaluación")
                {
                    return BadRequest(new { message = "La licitación debe estar en estado 'En Evaluación' para poder adjudicarla" });
                }

                // Buscar el estado "Adjudicada"
                var estadoAdjudicada = await _context.EstadosLicitacion
                    .Where(e => e.NombreEstado == "Adjudicada")
                    .FirstOrDefaultAsync();

                if (estadoAdjudicada == null)
                {
                    return BadRequest(new { message = "No se encontró el estado 'Adjudicada'" });
                }

                // Cambiar el estado de la licitación
                licitacion.EstadoLicitacionID = estadoAdjudicada.EstadoLicitacionID;

                await _context.SaveChangesAsync();

                _logger.LogInformation($"Licitación adjudicada con ID: {id}");

                // Crear notificación de adjudicación
                await _notificacionService.CrearNotificacionLicitacionAdjudicada(
                    id,
                    licitacion.Titulo,
                    licitacion.MineraID
                );

                return Ok(new { message = "Licitación adjudicada exitosamente" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al adjudicar licitación con ID: {id}");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        [HttpPut("{id}/finalizar")]
        public async Task<IActionResult> FinalizarLicitacion(int id)
        {
            try
            {
                var licitacion = await _context.Licitaciones
                    .Include(l => l.EstadoLicitacion)
                    .Where(l => l.LicitacionID == id && !l.Eliminado)
                    .FirstOrDefaultAsync();

                if (licitacion == null)
                {
                    return NotFound(new { message = "Licitación no encontrada" });
                }

                // Verificar que la licitación esté en estado "Adjudicada"
                if (licitacion.EstadoLicitacion.NombreEstado != "Adjudicada")
                {
                    return BadRequest(new { message = "La licitación debe estar en estado 'Adjudicada' para poder finalizarla" });
                }

                // Buscar el estado "Cerrada"
                var estadoCerrada = await _context.EstadosLicitacion
                    .Where(e => e.NombreEstado == "Cerrada")
                    .FirstOrDefaultAsync();

                if (estadoCerrada == null)
                {
                    return BadRequest(new { message = "No se encontró el estado 'Cerrada'" });
                }

                // Cambiar el estado de la licitación y actualizar la fecha de cierre
                licitacion.EstadoLicitacionID = estadoCerrada.EstadoLicitacionID;
                licitacion.FechaCierre = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation($"Licitación finalizada con ID: {id}");

                return Ok(new { message = "Licitación finalizada exitosamente" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al finalizar licitación con ID: {id}");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        private string? ValidateCriteriosPayload(List<CreateCriterioRequest>? criterios)
        {
            if (criterios == null || !criterios.Any())
            {
                return "Debe especificar al menos un criterio de evaluación.";
            }

            var totalPeso = criterios.Sum(c => c.Peso);
            if (Math.Abs(totalPeso - 100) > 0.01m)
            {
                return "El peso total de los criterios debe sumar exactamente 100%.";
            }

            foreach (var criterioRequest in criterios)
            {
                if (!Enum.IsDefined(typeof(TipoCriterio), criterioRequest.Tipo))
                {
                    return $"Tipo de criterio inválido para '{criterioRequest.Nombre}'.";
                }

                bool esNumerico = criterioRequest.Tipo == TipoCriterio.Numerico;
                bool esBooleano = criterioRequest.Tipo == TipoCriterio.Booleano;
                bool esEscala = criterioRequest.Tipo == TipoCriterio.Escala;

                if (esNumerico)
                {
                    if (criterioRequest.MayorMejor is null)
                    {
                        return $"Define si un valor mayor o menor es mejor para el criterio '{criterioRequest.Nombre}'.";
                    }

                    if (criterioRequest.ValorMinimo.HasValue && criterioRequest.ValorMaximo.HasValue &&
                        criterioRequest.ValorMinimo > criterioRequest.ValorMaximo)
                    {
                        return $"El rango numérico del criterio '{criterioRequest.Nombre}' es inválido (mínimo mayor al máximo).";
                    }
                }
                else if (criterioRequest.MayorMejor is not null)
                {
                    return $"Solo los criterios numéricos pueden definir si mayor o menor es mejor (ver '{criterioRequest.Nombre}').";
                }

                if (esBooleano && criterioRequest.EsPuntuable && criterioRequest.ValorRequeridoBooleano is null)
                {
                    return $"Debes seleccionar el valor correcto para el criterio booleano puntuable '{criterioRequest.Nombre}'.";
                }

                if (esEscala)
                {
                    if (criterioRequest.Opciones == null || criterioRequest.Opciones.Count < 2)
                    {
                        return $"El criterio '{criterioRequest.Nombre}' debe incluir al menos dos opciones.";
                    }

                    foreach (var opcion in criterioRequest.Opciones)
                    {
                        if (string.IsNullOrWhiteSpace(opcion.Valor))
                        {
                            return $"Todas las opciones del criterio '{criterioRequest.Nombre}' deben tener una etiqueta.";
                        }

                        if (criterioRequest.EsPuntuable && !opcion.Puntaje.HasValue)
                        {
                            return $"Debes definir el puntaje de cada opción para el criterio '{criterioRequest.Nombre}'.";
                        }
                    }
                }
                else if (criterioRequest.Opciones?.Any() == true)
                {
                    return $"Solo los criterios de tipo escala pueden incluir opciones (ver '{criterioRequest.Nombre}').";
                }
            }

            return null;
        }
    }

    public class CreateLicitacionRequest
    {
        [Required]
        public int MineraID { get; set; }

        [Required]
        public int RubroID { get; set; }

        [Required]
        [StringLength(255)]
        public string Titulo { get; set; } = string.Empty;

        public string? Descripcion { get; set; }

        [Required]
        public DateTime FechaInicio { get; set; }

        [Required]
        public DateTime FechaCierre { get; set; }

        public decimal? PresupuestoEstimado { get; set; }

        public string? Condiciones { get; set; }

        public int? ArchivoID { get; set; }

        public int? ProyectoMineroID { get; set; }

        [Required]
        public List<CreateCriterioRequest> Criterios { get; set; } = new List<CreateCriterioRequest>();
    }

    public class CreateCriterioRequest
    {
        [Required]
        [StringLength(100)]
        public string Nombre { get; set; } = string.Empty;

        public string? Descripcion { get; set; }

        [Required]
        [Range(0.1, 100)]
        public decimal Peso { get; set; }

        [Required]
        public TipoCriterio Tipo { get; set; } = TipoCriterio.Numerico;

        public bool EsExcluyente { get; set; }

        public bool EsPuntuable { get; set; } = true;

        public bool? MayorMejor { get; set; }

        public decimal? ValorMinimo { get; set; }

        public decimal? ValorMaximo { get; set; }

        public bool? ValorRequeridoBooleano { get; set; }

        public List<CreateCriterioOpcionRequest> Opciones { get; set; } = new List<CreateCriterioOpcionRequest>();
    }

    public class CreateCriterioOpcionRequest
    {
        [Required]
        [StringLength(100)]
        public string Valor { get; set; } = string.Empty;

        public string? Descripcion { get; set; }

        public decimal? Puntaje { get; set; }

        public int? Orden { get; set; }
    }

    public class UpdateLicitacionRequest
    {
        [Required]
        public int RubroID { get; set; }

        [Required]
        [StringLength(255)]
        public string Titulo { get; set; } = string.Empty;

        public string? Descripcion { get; set; }

        [Required]
        public DateTime FechaInicio { get; set; }

        [Required]
        public DateTime FechaCierre { get; set; }

        public decimal? PresupuestoEstimado { get; set; }

        public string? Condiciones { get; set; }

        public int? ArchivoID { get; set; }

        public int? ProyectoMineroID { get; set; }

        [Required]
        public List<CreateCriterioRequest> Criterios { get; set; } = new List<CreateCriterioRequest>();
    }
}
