using Wira.Api.Models;

namespace Wira.Api.Services.Interfaces
{
    public interface IPropuestaEvaluacionService
    {
        EvaluacionPropuestaResult CalcularPuntaje(Propuesta propuesta, IEnumerable<CriterioLicitacion> criterios);
    }

    public class EvaluacionPropuestaResult
    {
        public decimal? PuntajeNormalizado { get; set; }
        public Dictionary<int, decimal?> PuntajesPorCriterio { get; set; } = new();
        public bool ExcluidaPorCriterios { get; set; }
        public IReadOnlyList<string> CriteriosExcluyentesFallidos { get; set; } = Array.Empty<string>();
    }
}
