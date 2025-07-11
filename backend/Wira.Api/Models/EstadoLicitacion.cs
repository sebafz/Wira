using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Wira.Api.Models
{
    [Table("EstadosLicitacion")]
    public class EstadoLicitacion
    {
        [Key]
        public int EstadoLicitacionID { get; set; }

        [Required]
        [StringLength(50)]
        public string NombreEstado { get; set; } = string.Empty;

        // Navegación
        public virtual ICollection<Licitacion> Licitaciones { get; set; } = new List<Licitacion>();
    }
}
