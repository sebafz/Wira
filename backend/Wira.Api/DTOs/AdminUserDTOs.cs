using System;
using System.Collections.Generic;

namespace Wira.Api.DTOs
{
    public class AdminUserDto
    {
        public int UsuarioID { get; set; }
        public string Email { get; set; } = string.Empty;
        public string? Nombre { get; set; }
        public string? Apellido { get; set; }
        public string DNI { get; set; } = string.Empty;
        public string? Telefono { get; set; }
        public bool Activo { get; set; }
        public DateTime FechaRegistro { get; set; }
        public DateTime? FechaBaja { get; set; }
        public bool ValidadoEmail { get; set; }
        public List<string> Roles { get; set; } = new();
        public AdminUserEmpresaDto? Empresa { get; set; }
    }

    public class AdminUserEmpresaDto
    {
        public int EmpresaID { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string CUIT { get; set; } = string.Empty;
        public string TipoEmpresa { get; set; } = string.Empty;
    }

    public class UpdateUserStatusRequest
    {
        public bool Activo { get; set; }
    }

    public class UpdateUserRolesRequest
    {
        public List<string> Roles { get; set; } = new();
    }
}
