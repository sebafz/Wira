using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Wira.Api.Models
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum TipoCriterio
    {
        Numerico = 1,
        Booleano = 2,
        Descriptivo = 3,
        Escala = 4
    }

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
        public TipoCriterio Tipo { get; set; } = TipoCriterio.Numerico;

        public bool EsExcluyente { get; set; }

        public bool EsPuntuable { get; set; } = true;

        public bool? ValorRequeridoBooleano { get; set; } // aplica solo si Tipo es Booleano y EsPuntuable es true

        [Column(TypeName = "decimal(18,4)")]
        public decimal? ValorMinimo { get; set; } // aplica solo si Tipo es Numérico

        [Column(TypeName = "decimal(18,4)")]
        public decimal? ValorMaximo { get; set; } // aplica solo si Tipo es Numérico

        public bool? MayorMejor { get; set; } // true: mayor valor puntúa más, false: menor; solo aplica a numéricos

        // Navegación
        [ForeignKey("LicitacionID")]
        public virtual Licitacion Licitacion { get; set; } = null!;

        public virtual ICollection<RespuestaCriterioLicitacion> RespuestasCriterios { get; set; } = new List<RespuestaCriterioLicitacion>();

        public virtual ICollection<CriterioOpcion> Opciones { get; set; } = new List<CriterioOpcion>();
    }
}
