using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Wira.Api.Models
{
    [Table("Usuarios")]
    public class Usuario
    {
        [Key]
        public int UsuarioID { get; set; }

        [Required]
        [StringLength(255)]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [StringLength(255)]
        public string PasswordHash { get; set; } = string.Empty;

        [StringLength(100)]
        public string? Nombre { get; set; }

        public bool Activo { get; set; } = true;

        public DateTime FechaRegistro { get; set; } = DateTime.Now;

        public bool ValidadoEmail { get; set; } = false;

        public int? MineraID { get; set; }

        public int? ProveedorID { get; set; }

        // Navegación
        [ForeignKey("MineraID")]
        public virtual Minera? Minera { get; set; }

        [ForeignKey("ProveedorID")]
        public virtual Proveedor? Proveedor { get; set; }

        public virtual ICollection<UsuarioRol> UsuariosRoles { get; set; } = new List<UsuarioRol>();
        public virtual ICollection<NotificacionUsuario> NotificacionesUsuarios { get; set; } = new List<NotificacionUsuario>();
        public virtual ICollection<Auditoria> Auditorias { get; set; } = new List<Auditoria>();
    }
}
