using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Wira.Api.Models
{
    [Table("RespuestasCriteriosLicitacion")]
    public class RespuestaCriterioLicitacion
    {
        [Key]
        public int RespuestaID { get; set; }

        [Required]
        public int PropuestaID { get; set; }

        [Required]
        public int CriterioID { get; set; }

        [StringLength(255)]
        public string? ValorProveedor { get; set; }

        [Column(TypeName = "decimal(18,4)")]
        public decimal? ValorNumerico { get; set; }

        public bool? ValorBooleano { get; set; }

        public int? CriterioOpcionID { get; set; }

        // Navegación
        [ForeignKey("PropuestaID")]
        public virtual Propuesta Propuesta { get; set; } = null!;

        [ForeignKey("CriterioID")]
        public virtual CriterioLicitacion Criterio { get; set; } = null!;

        [ForeignKey(nameof(CriterioOpcionID))]
        public virtual CriterioOpcion? OpcionSeleccionada { get; set; }
    }
}
