using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Wira.Api.Models
{
    [Table("Auditoria")]
    public class Auditoria
    {
        [Key]
        public int AuditoriaID { get; set; }

        public int? UsuarioID { get; set; }

        public DateTime Fecha { get; set; } = DateTime.Now;

        [Required]
        [StringLength(50)]
        public string Operacion { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string TablaAfectada { get; set; } = string.Empty;

        [StringLength(100)]
        public string? ClaveRegistro { get; set; }

        [Column(TypeName = "text")]
        public string? Descripcion { get; set; }

        // Navegación
        [ForeignKey("UsuarioID")]
        public virtual Usuario? Usuario { get; set; }
    }
}
