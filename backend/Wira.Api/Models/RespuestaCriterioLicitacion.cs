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

        // Navegación
        [ForeignKey("PropuestaID")]
        public virtual Propuesta Propuesta { get; set; } = null!;

        [ForeignKey("CriterioID")]
        public virtual CriterioLicitacion Criterio { get; set; } = null!;
    }
}
