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

        // Navegación - Empresas proveedoras asociadas a este rubro
        public virtual ICollection<Empresa> Proveedores { get; set; } = new List<Empresa>();

        // Navegación - Licitaciones de este rubro
        public virtual ICollection<Licitacion> Licitaciones { get; set; } = new List<Licitacion>();
    }
}
