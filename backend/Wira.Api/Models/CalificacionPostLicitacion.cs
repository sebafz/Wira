using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Wira.Api.Models
{
    [Table("CalificacionesPostLicitacion")]
    public class CalificacionPostLicitacion
    {
        [Key]
        public int CalificacionID { get; set; }

        [Required]
        public int ProveedorID { get; set; }

        [Required]
        public int LicitacionID { get; set; }

        [Range(0, 10)]
        public int? Puntualidad { get; set; }

        [Range(0, 10)]
        public int? Calidad { get; set; }

        [Range(0, 10)]
        public int? Comunicacion { get; set; }

        [Column(TypeName = "text")]
        public string? Comentarios { get; set; }

        public DateTime FechaCalificacion { get; set; } = DateTime.Now;

        // Navegación
        [ForeignKey("ProveedorID")]
        public virtual Proveedor Proveedor { get; set; } = null!;

        [ForeignKey("LicitacionID")]
        public virtual Licitacion Licitacion { get; set; } = null!;
    }
}
