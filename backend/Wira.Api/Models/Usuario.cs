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

        [StringLength(100)]
        public string? Apellido { get; set; }

        [Required]
        [StringLength(20)]
        public string DNI { get; set; } = string.Empty;

        [StringLength(30)]
        public string? Telefono { get; set; }

        public bool Activo { get; set; } = true;

        public DateTime FechaRegistro { get; set; } = DateTime.Now;

        public DateTime? FechaBaja { get; set; }

        public bool ValidadoEmail { get; set; } = false;

        [StringLength(255)]
        public string? TokenVerificacionEmail { get; set; }

        public DateTime? FechaVencimientoTokenVerificacion { get; set; }

        [StringLength(255)]
        public string? TokenRecuperacionPassword { get; set; }

        public DateTime? FechaVencimientoTokenRecuperacion { get; set; }

        public int? EmpresaID { get; set; }

        // Navegación
        [ForeignKey("EmpresaID")]
        public virtual Empresa? Empresa { get; set; }

        public virtual ICollection<UsuarioRol> UsuariosRoles { get; set; } = new List<UsuarioRol>();
        public virtual ICollection<NotificacionUsuario> NotificacionesUsuarios { get; set; } = new List<NotificacionUsuario>();
        public virtual ICollection<Auditoria> Auditorias { get; set; } = new List<Auditoria>();
    }
}
