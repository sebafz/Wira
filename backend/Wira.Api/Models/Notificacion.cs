using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Wira.Api.Models
{
    [Table("Notificaciones")]
    public class Notificacion
    {
        [Key]
        public int NotificacionID { get; set; }

        [Required]
        [StringLength(255)]
        public string Titulo { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "text")]
        public string Mensaje { get; set; } = string.Empty;

        public DateTime FechaCreacion { get; set; } = DateTime.Now;

        [StringLength(50)]
        public string? Tipo { get; set; } // 'APERTURA', 'CIERRE', 'ADJUDICACION'

        [StringLength(50)]
        public string? EntidadTipo { get; set; } // 'LICITACION', 'PROPUESTA'

        public int? EntidadID { get; set; }

        // Navegación
        public virtual ICollection<NotificacionUsuario> NotificacionesUsuarios { get; set; } = new List<NotificacionUsuario>();
    }
}
