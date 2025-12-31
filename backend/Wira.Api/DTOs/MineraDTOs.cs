using System;
using System.ComponentModel.DataAnnotations;

namespace Wira.Api.DTOs
{
    public class BaseMineraRequest
    {
        [Required]
        [StringLength(255)]
        public string Nombre { get; set; } = string.Empty;

        [Required]
        [StringLength(255)]
        public string RazonSocial { get; set; } = string.Empty;

        [Required]
        [StringLength(20)]
        [RegularExpression(@"^\d{2}-\d{8}-\d$", ErrorMessage = "El CUIT debe tener el formato 00-00000000-0")]
        public string CUIT { get; set; } = string.Empty;

        [EmailAddress]
        [StringLength(255)]
        public string? EmailContacto { get; set; }

        [StringLength(30)]
        public string? Telefono { get; set; }

        public bool Activo { get; set; } = true;
    }

    public class CreateMineraRequest : BaseMineraRequest
    {
    }

    public class UpdateMineraRequest : BaseMineraRequest
    {
    }

    public class UpdateMineraStatusRequest
    {
        public bool Activo { get; set; }
    }

    public class MineraResponse
    {
        public int MineraID { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string RazonSocial { get; set; } = string.Empty;
        public string CUIT { get; set; } = string.Empty;
        public string? EmailContacto { get; set; }
        public string? Telefono { get; set; }
        public bool Activo { get; set; }
        public DateTime FechaAlta { get; set; }
    }
}
