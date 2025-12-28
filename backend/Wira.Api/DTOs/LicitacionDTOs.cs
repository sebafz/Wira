using Wira.Api.Models;

namespace Wira.Api.DTOs
{
    public class LicitacionDto
    {
        public int LicitacionID { get; set; }
        public int MineraID { get; set; }
        public int RubroID { get; set; }
        public int MonedaID { get; set; }
        public string Titulo { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
        public DateTime FechaInicio { get; set; }
        public DateTime FechaCierre { get; set; }
        public decimal? PresupuestoEstimado { get; set; }
        public string? Condiciones { get; set; }
        public int EstadoLicitacionID { get; set; }
        public int? ArchivoID { get; set; }
        public int? ProyectoMineroID { get; set; }
        public DateTime FechaCreacion { get; set; }

        // Propiedades de navegación
        public string MineraNombre { get; set; } = string.Empty;
        public string RubroNombre { get; set; } = string.Empty;
        public string EstadoNombre { get; set; } = string.Empty;
        public string? ArchivoNombre { get; set; }
        public string? ProyectoMineroNombre { get; set; }
        public string MonedaCodigo { get; set; } = string.Empty;
        public string MonedaNombre { get; set; } = string.Empty;
        public string? MonedaSimbolo { get; set; }

        // Criterios de evaluación
        public List<CriterioLicitacionDto> Criterios { get; set; } = new List<CriterioLicitacionDto>();
    }

    public class CriterioLicitacionDto
    {
        public int CriterioID { get; set; }
        public int LicitacionID { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
        public decimal Peso { get; set; }
        public TipoCriterio Tipo { get; set; } = TipoCriterio.Numerico;
        public bool EsExcluyente { get; set; }
        public bool EsPuntuable { get; set; } = true;
        public bool? MayorMejor { get; set; }
        public decimal? ValorMinimo { get; set; }
        public decimal? ValorMaximo { get; set; }
        public bool? ValorRequeridoBooleano { get; set; }
        public List<CriterioOpcionDto> Opciones { get; set; } = new List<CriterioOpcionDto>();
    }

    public class CriterioOpcionDto
    {
        public int OpcionID { get; set; }
        public string Valor { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
        public decimal? Puntaje { get; set; }
        public int Orden { get; set; }
    }

    public class ArchivoAdjuntoDto
    {
        public int ArchivoID { get; set; }
        public string EntidadTipo { get; set; } = string.Empty;
        public int EntidadID { get; set; }
        public string NombreArchivo { get; set; } = string.Empty;
        public string RutaArchivo { get; set; } = string.Empty;
        public string? TipoMime { get; set; }
        public int? TamañoBytes { get; set; }
        public DateTime FechaSubida { get; set; }
    }
}
