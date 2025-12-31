using System;
using System.ComponentModel.DataAnnotations;

namespace Wira.Api.DTOs
{
    public class BaseProveedorRequest
    {
        [Required]
        [StringLength(255)]
        public string Nombre { get; set; } = string.Empty;

        [Required]
        [StringLength(255)]
        public string RazonSocial { get; set; } = string.Empty;

        [Required]
        [StringLength(20)]
        [RegularExpression(@"^\d{2}-?\d{8}-?\d$", ErrorMessage = "El CUIT debe tener 11 dígitos (puede incluir guiones)")]
        public string CUIT { get; set; } = string.Empty;

        [EmailAddress]
        [StringLength(255)]
        public string? EmailContacto { get; set; }

        [StringLength(30)]
        public string? Telefono { get; set; }

        public int? RubroID { get; set; }

        public bool Activo { get; set; } = true;
    }

    public class UpdateProveedorRequest : BaseProveedorRequest
    {
    }

    public class ProveedorResponse
    {
        public int ProveedorID { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string RazonSocial { get; set; } = string.Empty;
        public string CUIT { get; set; } = string.Empty;
        public string? EmailContacto { get; set; }
        public string? Telefono { get; set; }
        public int? RubroID { get; set; }
        public string? RubroNombre { get; set; }
        public bool Activo { get; set; }
        public DateTime FechaAlta { get; set; }
    }
}
