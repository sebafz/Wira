using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Wira.Api.Models
{
    [Table("Proveedores")]
    public class Proveedor
    {
        [Key]
        public int ProveedorID { get; set; }

        [Required]
        [StringLength(255)]
        public string Nombre { get; set; } = string.Empty;

        [Required]
        [StringLength(20)]
        public string CUIT { get; set; } = string.Empty;

        // Clave foránea hacia Rubros
        public int? RubroID { get; set; }

        public bool Activo { get; set; } = true;

        // Navegación - Rubro al que pertenece este proveedor
        [ForeignKey("RubroID")]
        public virtual Rubro? Rubro { get; set; }

        // Navegación
        public virtual ICollection<Usuario> Usuarios { get; set; } = new List<Usuario>();
        public virtual ICollection<Propuesta> Propuestas { get; set; } = new List<Propuesta>();
        public virtual ICollection<HistorialProveedorLicitacion> HistorialesProveedor { get; set; } = new List<HistorialProveedorLicitacion>();
        public virtual ICollection<CalificacionPostLicitacion> CalificacionesPost { get; set; } = new List<CalificacionPostLicitacion>();
    }
}
