using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Wira.Api.Models
{
    [Table("HistorialProveedorLicitacion")]
    public class HistorialProveedorLicitacion
    {
        [Key]
        public int HistorialID { get; set; }

        [Required]
        public int ProveedorID { get; set; }

        [Required]
        public int LicitacionID { get; set; }

        [StringLength(100)]
        public string? Resultado { get; set; }

        public bool? Ganador { get; set; } = null;

        [Column(TypeName = "text")]
        public string? Observaciones { get; set; }

        public DateTime FechaParticipacion { get; set; } = DateTime.Now;

        // Navegación
        [ForeignKey("ProveedorID")]
        public virtual Empresa Proveedor { get; set; } = null!;

        [ForeignKey("LicitacionID")]
        public virtual Licitacion Licitacion { get; set; } = null!;
    }
}
