using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Wira.Api.Models
{
    [Table("NotificacionesUsuarios")]
    public class NotificacionUsuario
    {
        [Key, Column(Order = 0)]
        public int UsuarioID { get; set; }

        [Key, Column(Order = 1)]
        public int NotificacionID { get; set; }

        public bool Leido { get; set; } = false;

        public DateTime? FechaLeido { get; set; }

        // Navegación
        [ForeignKey("UsuarioID")]
        public virtual Usuario Usuario { get; set; } = null!;

        [ForeignKey("NotificacionID")]
        public virtual Notificacion Notificacion { get; set; } = null!;
    }
}
