using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Wira.Api.Models
{
    [Table("Propuestas")]
    public class Propuesta
    {
        [Key]
        public int PropuestaID { get; set; }

        [Required]
        public int LicitacionID { get; set; }

        [Required]
        public int ProveedorID { get; set; }

        public DateTime FechaEnvio { get; set; } = DateTime.Now;

        [Required]
        public int EstadoPropuestaID { get; set; }

        public string? Descripcion { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal PresupuestoOfrecido { get; set; }

        public DateTime? FechaEntrega { get; set; }

        public bool CumpleRequisitos { get; set; } = true;

        [Column(TypeName = "decimal(5,2)")]
        public decimal? CalificacionFinal { get; set; }

        public bool Eliminado { get; set; } = false;

        public int? ArchivoID { get; set; }

        // Navegación
        [ForeignKey("LicitacionID")]
        public virtual Licitacion Licitacion { get; set; } = null!;

        [ForeignKey("ProveedorID")]
        public virtual Proveedor Proveedor { get; set; } = null!;

        [ForeignKey("EstadoPropuestaID")]
        public virtual EstadoPropuesta EstadoPropuesta { get; set; } = null!;

        [ForeignKey("ArchivoID")]
        public virtual ArchivoAdjunto? ArchivoAdjunto { get; set; }

        public virtual ICollection<RespuestaCriterioLicitacion> RespuestasCriterios { get; set; } = new List<RespuestaCriterioLicitacion>();
    }
}
