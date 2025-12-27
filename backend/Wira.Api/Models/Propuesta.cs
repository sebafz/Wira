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

        // Navegación
        [ForeignKey("LicitacionID")]
        public virtual Licitacion Licitacion { get; set; } = null!;

        [ForeignKey("ProveedorID")]
        public virtual Empresa Proveedor { get; set; } = null!;

        [ForeignKey("EstadoPropuestaID")]
        public virtual EstadoPropuesta EstadoPropuesta { get; set; } = null!;

        public virtual ICollection<RespuestaCriterioLicitacion> RespuestasCriterios { get; set; } = new List<RespuestaCriterioLicitacion>();
        public virtual ICollection<ArchivoAdjunto> ArchivosAdjuntos { get; set; } = new List<ArchivoAdjunto>();
    }
}
