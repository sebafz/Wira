using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Wira.Api.Data;
using Wira.Api.Models;
using System.ComponentModel.DataAnnotations;

namespace Wira.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ArchivosController : ControllerBase
    {
        private readonly WiraDbContext _context;
        private readonly IWebHostEnvironment _environment;
        private readonly ILogger<ArchivosController> _logger;

        // Tipos de archivo permitidos
        private readonly string[] _allowedMimeTypes = {
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "image/jpeg",
            "image/png",
            "image/gif",
            "application/zip",
            "application/x-rar-compressed",
            "application/vnd.dwg",
            "application/octet-stream"
        };

        // Extensiones permitidas
        private readonly string[] _allowedExtensions = {
            ".pdf", ".doc", ".docx", ".xls", ".xlsx",
            ".jpg", ".jpeg", ".png", ".gif",
            ".zip", ".rar", ".dwg"
        };

        public ArchivosController(WiraDbContext context, IWebHostEnvironment environment, ILogger<ArchivosController> logger)
        {
            _context = context;
            _environment = environment;
            _logger = logger;
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadFile([FromForm] UploadFileRequest request)
        {
            try
            {
                // Validaciones
                if (request.File == null || request.File.Length == 0)
                {
                    return BadRequest("No se ha proporcionado ningún archivo.");
                }

                // Validar tamaño (máximo 50MB)
                if (request.File.Length > 50 * 1024 * 1024)
                {
                    return BadRequest("El archivo es demasiado grande. Máximo permitido: 50MB.");
                }

                // Validar extensión
                var extension = Path.GetExtension(request.File.FileName).ToLowerInvariant();
                if (!_allowedExtensions.Contains(extension))
                {
                    return BadRequest($"Tipo de archivo no permitido. Extensiones permitidas: {string.Join(", ", _allowedExtensions)}");
                }

                // Validar tipo MIME
                if (!_allowedMimeTypes.Contains(request.File.ContentType))
                {
                    return BadRequest("Tipo de archivo no permitido.");
                }

                // Validar EntidadTipo
                if (request.EntidadTipo != "LICITACION" && request.EntidadTipo != "PROPUESTA")
                {
                    return BadRequest("EntidadTipo debe ser 'LICITACION' o 'PROPUESTA'.");
                }

                // Crear directorio si no existe
                var uploadsFolder = Path.Combine(_environment.WebRootPath ?? _environment.ContentRootPath, "uploads", request.EntidadTipo.ToLower());
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                // Generar nombre único para el archivo
                var fileName = $"{Guid.NewGuid()}{extension}";
                var filePath = Path.Combine(uploadsFolder, fileName);

                // Guardar archivo físico
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await request.File.CopyToAsync(stream);
                }

                // Crear registro en base de datos
                var archivoAdjunto = new ArchivoAdjunto
                {
                    EntidadTipo = request.EntidadTipo,
                    EntidadID = request.EntidadID,
                    PropuestaID = request.EntidadTipo == "PROPUESTA" ? request.EntidadID : null,
                    NombreArchivo = request.File.FileName,
                    RutaArchivo = Path.Combine("uploads", request.EntidadTipo.ToLower(), fileName),
                    TipoMime = request.File.ContentType,
                    TamañoBytes = (int)request.File.Length,
                    FechaSubida = DateTime.Now
                };

                _context.ArchivosAdjuntos.Add(archivoAdjunto);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Archivo subido exitosamente: {request.File.FileName} para {request.EntidadTipo} ID: {request.EntidadID}");

                return Ok(new
                {
                    ArchivoID = archivoAdjunto.ArchivoID,
                    NombreArchivo = archivoAdjunto.NombreArchivo,
                    TamañoBytes = archivoAdjunto.TamañoBytes,
                    FechaSubida = archivoAdjunto.FechaSubida
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al subir archivo");
                return StatusCode(500, "Error interno del servidor al subir el archivo.");
            }
        }

        [HttpGet("{archivoId}/download")]
        public async Task<IActionResult> DownloadFile(int archivoId)
        {
            try
            {
                var archivo = await _context.ArchivosAdjuntos.FindAsync(archivoId);
                if (archivo == null)
                {
                    return NotFound("Archivo no encontrado.");
                }

                var filePath = Path.Combine(_environment.WebRootPath ?? _environment.ContentRootPath, archivo.RutaArchivo);
                if (!System.IO.File.Exists(filePath))
                {
                    return NotFound("El archivo físico no existe.");
                }

                var fileBytes = await System.IO.File.ReadAllBytesAsync(filePath);
                return File(fileBytes, archivo.TipoMime ?? "application/octet-stream", archivo.NombreArchivo);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al descargar archivo con ID: {archivoId}");
                return StatusCode(500, "Error interno del servidor al descargar el archivo.");
            }
        }

        [HttpDelete("{archivoId}")]
        public async Task<IActionResult> DeleteFile(int archivoId)
        {
            try
            {
                var archivo = await _context.ArchivosAdjuntos.FindAsync(archivoId);
                if (archivo == null)
                {
                    return NotFound("Archivo no encontrado.");
                }

                // Eliminar archivo físico
                var filePath = Path.Combine(_environment.WebRootPath ?? _environment.ContentRootPath, archivo.RutaArchivo);
                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                }

                // Eliminar registro de base de datos
                _context.ArchivosAdjuntos.Remove(archivo);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Archivo eliminado exitosamente: {archivo.NombreArchivo}");

                return Ok("Archivo eliminado exitosamente.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al eliminar archivo con ID: {archivoId}");
                return StatusCode(500, "Error interno del servidor al eliminar el archivo.");
            }
        }

        [HttpGet("entidad/{entidadTipo}/{entidadId}")]
        public async Task<IActionResult> GetArchivosByEntidad(string entidadTipo, int entidadId)
        {
            try
            {
                if (entidadTipo != "LICITACION" && entidadTipo != "PROPUESTA")
                {
                    return BadRequest("EntidadTipo debe ser 'LICITACION' o 'PROPUESTA'.");
                }

                var archivos = await _context.ArchivosAdjuntos
                    .Where(a => a.EntidadTipo == entidadTipo && a.EntidadID == entidadId)
                    .Select(a => new
                    {
                        a.ArchivoID,
                        a.NombreArchivo,
                        a.TipoMime,
                        a.TamañoBytes,
                        a.FechaSubida
                    })
                    .ToListAsync();

                return Ok(archivos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al obtener archivos para {entidadTipo} ID: {entidadId}");
                return StatusCode(500, "Error interno del servidor al obtener los archivos.");
            }
        }
    }

    public class UploadFileRequest
    {
        [Required]
        public IFormFile File { get; set; } = null!;

        [Required]
        [StringLength(50)]
        public string EntidadTipo { get; set; } = string.Empty;

        [Required]
        public int EntidadID { get; set; }
    }
}
