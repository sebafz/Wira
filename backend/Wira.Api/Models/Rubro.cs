using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Wira.Api.Models
{
    public class Rubro
    {
        [Key]
        public int RubroID { get; set; }

        [Required]
        [StringLength(255)]
        public string Nombre { get; set; } = string.Empty;

        public bool Activo { get; set; } = true;

        // Navegación - Proveedores que pertenecen a este rubro
        public virtual ICollection<Proveedor> Proveedores { get; set; } = new List<Proveedor>();

        // Navegación - Licitaciones de este rubro
        public virtual ICollection<Licitacion> Licitaciones { get; set; } = new List<Licitacion>();
    }
}
