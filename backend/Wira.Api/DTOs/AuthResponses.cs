namespace Wira.Api.DTOs
{
    public class AuthResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public string? Token { get; set; }
        public UserInfo? User { get; set; }
        public DateTime? TokenExpiration { get; set; }
    }

    public class UserInfo
    {
        public int UsuarioID { get; set; }
        public string Email { get; set; } = string.Empty;
        public string Nombre { get; set; } = string.Empty;
        public bool ValidadoEmail { get; set; }
        public List<string> Roles { get; set; } = new List<string>();
        public MineraInfo? Minera { get; set; }
        public ProveedorInfo? Proveedor { get; set; }
    }

    public class MineraInfo
    {
        public int MineraID { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string CUIT { get; set; } = string.Empty;
    }

    public class ProveedorInfo
    {
        public int ProveedorID { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string CUIT { get; set; } = string.Empty;
        public int? RubroID { get; set; }
        public string? RubroNombre { get; set; }
    }
}
