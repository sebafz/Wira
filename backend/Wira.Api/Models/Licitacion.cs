using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Wira.Api.Models
{
    [Table("Licitaciones")]
    public class Licitacion
    {
        [Key]
        public int LicitacionID { get; set; }

        [Required]
        public int MineraID { get; set; }

        [Required]
        [StringLength(255)]
        public string Titulo { get; set; } = string.Empty;

        [Column(TypeName = "text")]
        public string? Descripcion { get; set; }

        [Required]
        public DateTime FechaInicio { get; set; }

        [Required]
        public DateTime FechaCierre { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? PresupuestoEstimado { get; set; }

        [Column(TypeName = "text")]
        public string? Condiciones { get; set; }

        [Required]
        public int EstadoLicitacionID { get; set; }

        public bool Eliminado { get; set; } = false;

        // Navegación
        [ForeignKey("MineraID")]
        public virtual Minera Minera { get; set; } = null!;

        [ForeignKey("EstadoLicitacionID")]
        public virtual EstadoLicitacion EstadoLicitacion { get; set; } = null!;

        public virtual ICollection<CriterioLicitacion> CriteriosLicitacion { get; set; } = new List<CriterioLicitacion>();
        public virtual ICollection<Propuesta> Propuestas { get; set; } = new List<Propuesta>();
        public virtual ICollection<HistorialProveedorLicitacion> HistorialesProveedor { get; set; } = new List<HistorialProveedorLicitacion>();
        public virtual ICollection<CalificacionPostLicitacion> CalificacionesPost { get; set; } = new List<CalificacionPostLicitacion>();
    }
}
