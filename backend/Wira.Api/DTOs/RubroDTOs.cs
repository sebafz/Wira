namespace Wira.Api.DTOs
{
    public class RubroDto
    {
        public int RubroID { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public bool Activo { get; set; }
    }

    public class CreateRubroRequest
    {
        public string Nombre { get; set; } = string.Empty;
        public bool Activo { get; set; } = true;
    }

    public class UpdateRubroRequest
    {
        public string? Nombre { get; set; }
        public bool? Activo { get; set; }
    }
}
