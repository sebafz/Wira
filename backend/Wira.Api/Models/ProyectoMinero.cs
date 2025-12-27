using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Wira.Api.Models
{
    [Table("ProyectosMineros")]
    public class ProyectoMinero
    {
        [Key]
        public int ProyectoMineroID { get; set; }

        [Required]
        public int MineraID { get; set; }

        [Required]
        [StringLength(255)]
        public string Nombre { get; set; } = string.Empty;

        [StringLength(255)]
        public string? Ubicacion { get; set; }

        public string? Descripcion { get; set; }

        public bool Activo { get; set; } = true;

        // Navigation properties
        [ForeignKey("MineraID")]
        public virtual Empresa Minera { get; set; } = null!;

        public virtual ICollection<Licitacion> Licitaciones { get; set; } = new List<Licitacion>();
    }
}
