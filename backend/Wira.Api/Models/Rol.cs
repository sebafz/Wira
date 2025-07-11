using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Wira.Api.Models
{
    [Table("Roles")]
    public class Rol
    {
        [Key]
        public int RolID { get; set; }

        [Required]
        [StringLength(50)]
        public string NombreRol { get; set; } = string.Empty;

        // Navegación
        public virtual ICollection<UsuarioRol> UsuariosRoles { get; set; } = new List<UsuarioRol>();
    }
}
