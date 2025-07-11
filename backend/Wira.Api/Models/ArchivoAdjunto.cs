using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Wira.Api.Models
{
    [Table("ArchivosAdjuntos")]
    public class ArchivoAdjunto
    {
        [Key]
        public int ArchivoID { get; set; }

        [Required]
        [StringLength(50)]
        public string EntidadTipo { get; set; } = string.Empty; // 'LICITACION' o 'PROPUESTA'

        [Required]
        public int EntidadID { get; set; }

        [Required]
        [StringLength(255)]
        public string NombreArchivo { get; set; } = string.Empty;

        [Required]
        [StringLength(500)]
        public string RutaArchivo { get; set; } = string.Empty;

        [StringLength(100)]
        public string? TipoMime { get; set; }

        public int? TamañoBytes { get; set; }

        public DateTime FechaSubida { get; set; } = DateTime.Now;
    }
}
