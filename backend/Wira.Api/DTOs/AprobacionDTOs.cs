using System.ComponentModel.DataAnnotations;

namespace Wira.Api.DTOs
{
    public class ApproveUserRequest
    {
        public List<string> Roles { get; set; } = new();
    }

    public class RejectUserRequest
    {
        [StringLength(500)]
        public string? Motivo { get; set; }
    }

    public class PendingUserDto
    {
        public int UsuarioID { get; set; }
        public string Email { get; set; } = string.Empty;
        public string? Nombre { get; set; }
        public string? Apellido { get; set; }
        public string DNI { get; set; } = string.Empty;
        public string? Telefono { get; set; }
        public DateTime FechaRegistro { get; set; }
        public string EstadoAprobacion { get; set; } = string.Empty;
        public string? MotivoRechazo { get; set; }
        public bool ValidadoEmail { get; set; }
        public AdminUserEmpresaDto? Empresa { get; set; }
    }

    public class PendingApprovalCountResponse
    {
        public int TotalPendientes { get; set; }
        public int PendientesEmpresaActual { get; set; }
    }
}
