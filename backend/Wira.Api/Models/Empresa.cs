using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Wira.Api.Models
{
    [Table("Empresas")]
    public class Empresa
    {
        [Key]
        public int EmpresaID { get; set; }

        [Required]
        [StringLength(255)]
        public string Nombre { get; set; } = string.Empty;

        [Required]
        [StringLength(255)]
        public string RazonSocial { get; set; } = string.Empty;

        [Required]
        [StringLength(20)]
        public string CUIT { get; set; } = string.Empty;

        [StringLength(255)]
        [EmailAddress]
        public string? EmailContacto { get; set; }

        [StringLength(30)]
        public string? Telefono { get; set; }

        [Required]
        [StringLength(20)]
        public string TipoEmpresa { get; set; } = EmpresaTipos.Minera;

        public DateTime FechaAlta { get; set; } = DateTime.Now;

        public bool Activo { get; set; } = true;

        public int? RubroID { get; set; }

        [ForeignKey("RubroID")]
        public virtual Rubro? Rubro { get; set; }

        public virtual ICollection<Usuario> Usuarios { get; set; } = new List<Usuario>();
        public virtual ICollection<Licitacion> Licitaciones { get; set; } = new List<Licitacion>();
        public virtual ICollection<Propuesta> Propuestas { get; set; } = new List<Propuesta>();
        public virtual ICollection<HistorialProveedorLicitacion> HistorialesProveedor { get; set; } = new List<HistorialProveedorLicitacion>();
        public virtual ICollection<CalificacionPostLicitacion> CalificacionesPost { get; set; } = new List<CalificacionPostLicitacion>();
        public virtual ICollection<ProyectoMinero> ProyectosMineros { get; set; } = new List<ProyectoMinero>();
    }
}
