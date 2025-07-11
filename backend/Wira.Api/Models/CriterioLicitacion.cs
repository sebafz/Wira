using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Wira.Api.Models
{
    [Table("CriteriosLicitacion")]
    public class CriterioLicitacion
    {
        [Key]
        public int CriterioID { get; set; }

        [Required]
        public int LicitacionID { get; set; }

        [Required]
        [StringLength(100)]
        public string Nombre { get; set; } = string.Empty;

        [Column(TypeName = "text")]
        public string? Descripcion { get; set; }

        [Required]
        [Column(TypeName = "decimal(5,2)")]
        public decimal Peso { get; set; }

        [Required]
        [StringLength(20)]
        public string ModoEvaluacion { get; set; } = string.Empty; // 'MENOR_MEJOR' o 'MAYOR_MEJOR'

        // Navegación
        [ForeignKey("LicitacionID")]
        public virtual Licitacion Licitacion { get; set; } = null!;

        public virtual ICollection<RespuestaCriterioLicitacion> RespuestasCriterios { get; set; } = new List<RespuestaCriterioLicitacion>();
    }
}
