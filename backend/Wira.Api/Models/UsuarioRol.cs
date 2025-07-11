using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Wira.Api.Models
{
    [Table("UsuariosRoles")]
    public class UsuarioRol
    {
        [Key, Column(Order = 0)]
        public int UsuarioID { get; set; }

        [Key, Column(Order = 1)]
        public int RolID { get; set; }

        // Navegación
        [ForeignKey("UsuarioID")]
        public virtual Usuario Usuario { get; set; } = null!;

        [ForeignKey("RolID")]
        public virtual Rol Rol { get; set; } = null!;
    }
}
