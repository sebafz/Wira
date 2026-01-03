using System.Collections.Generic;
using Wira.Api.Models;

namespace Wira.Api.Services.Interfaces
{
    public interface IPropuestaEvaluacionService
    {
        EvaluacionPropuestaResult CalcularPuntaje(
            Propuesta propuesta,
            IEnumerable<CriterioLicitacion> criterios,
            IDictionary<int, NumericCriterionStats>? criteriosStats = null);

        IDictionary<int, NumericCriterionStats> ConstruirEstadisticasNumericas(
            IEnumerable<Propuesta> propuestas);
    }

    public class EvaluacionPropuestaResult
    {
        public decimal? PuntajeNormalizado { get; set; }
        public Dictionary<int, decimal?> PuntajesPorCriterio { get; set; } = new();
        public bool ExcluidaPorCriterios { get; set; }
        public IReadOnlyList<string> CriteriosExcluyentesFallidos { get; set; } = Array.Empty<string>();
    }

    public class NumericCriterionStats
    {
        public decimal? Min { get; set; }
        public decimal? Max { get; set; }
        public bool HasMultipleValues { get; set; }
    }
}
