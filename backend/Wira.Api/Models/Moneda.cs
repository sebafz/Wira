using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Wira.Api.Models
{
    [Table("Monedas")]
    public class Moneda
    {
        [Key]
        public int MonedaID { get; set; }

        [Required]
        [StringLength(3)]
        public string Codigo { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Nombre { get; set; } = string.Empty;

        [StringLength(10)]
        public string? Simbolo { get; set; }

        public bool Activo { get; set; } = true;

        public virtual ICollection<Licitacion> Licitaciones { get; set; } = new List<Licitacion>();
        public virtual ICollection<Propuesta> Propuestas { get; set; } = new List<Propuesta>();
    }
}
