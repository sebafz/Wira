namespace Wira.Api.Models
{
    public static class AprobacionEstados
    {
        public const string Pendiente = "PENDIENTE";
        public const string Aprobado = "APROBADO";
        public const string Rechazado = "RECHAZADO";

        public static bool EsValido(string? estado)
        {
            var normalized = Normalizar(estado);
            return normalized == Pendiente || normalized == Aprobado || normalized == Rechazado;
        }

        public static string Normalizar(string? estado)
        {
            return string.IsNullOrWhiteSpace(estado)
                ? string.Empty
                : estado.Trim().ToUpperInvariant();
        }
    }
}
