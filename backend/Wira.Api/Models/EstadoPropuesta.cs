using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Wira.Api.Models
{
    [Table("EstadosPropuesta")]
    public class EstadoPropuesta
    {
        [Key]
        public int EstadoPropuestaID { get; set; }

        [Required]
        [StringLength(50)]
        public string NombreEstado { get; set; } = string.Empty;

        // Navegación
        public virtual ICollection<Propuesta> Propuestas { get; set; } = new List<Propuesta>();
    }
}
