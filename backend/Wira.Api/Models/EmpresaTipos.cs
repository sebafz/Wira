namespace Wira.Api.Models
{
    public static class EmpresaTipos
    {
        public const string Minera = "MINERA";
        public const string Proveedor = "PROVEEDOR";

        public static bool EsValido(string? tipo)
        {
            var normalizado = Normalizar(tipo);
            return normalizado == Minera || normalizado == Proveedor;
        }

        public static string Normalizar(string? tipo)
        {
            return string.IsNullOrWhiteSpace(tipo)
                ? string.Empty
                : tipo.Trim().ToUpperInvariant();
        }
    }
}
