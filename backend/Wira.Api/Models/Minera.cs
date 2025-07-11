using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Wira.Api.Models
{
    [Table("Mineras")]
    public class Minera
    {
        [Key]
        public int MineraID { get; set; }

        [Required]
        [StringLength(255)]
        public string Nombre { get; set; } = string.Empty;

        [Required]
        [StringLength(20)]
        public string CUIT { get; set; } = string.Empty;

        [StringLength(255)]
        [EmailAddress]
        public string? EmailContacto { get; set; }

        public bool Activo { get; set; } = true;

        // Navegación
        public virtual ICollection<Usuario> Usuarios { get; set; } = new List<Usuario>();
        public virtual ICollection<Licitacion> Licitaciones { get; set; } = new List<Licitacion>();
    }
}
