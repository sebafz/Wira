using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Wira.Api.Models
{
    [Table("CriteriosOpciones")]
    public class CriterioOpcion
    {
        [Key]
        public int OpcionID { get; set; }

        [Required]
        public int CriterioID { get; set; }

        [Required]
        [StringLength(100)]
        public string Valor { get; set; } = string.Empty;

        [StringLength(250)]
        public string? Descripcion { get; set; }

        [Column(TypeName = "decimal(5,2)")]
        public decimal? Puntaje { get; set; }

        public int Orden { get; set; } = 0;

        [ForeignKey(nameof(CriterioID))]
        public CriterioLicitacion Criterio { get; set; } = null!;
    }
}
