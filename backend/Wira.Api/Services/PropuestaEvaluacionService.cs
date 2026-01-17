using System.Collections.Generic;
using System.Globalization;
using Wira.Api.Models;
using Wira.Api.Services.Interfaces;

namespace Wira.Api.Services
{
    public class PropuestaEvaluacionService : IPropuestaEvaluacionService
    {
        private static readonly CultureInfo[] SupportedCultures =
        {
            CultureInfo.InvariantCulture,
            new CultureInfo("es-AR"),
            new CultureInfo("es-ES"),
        };

        public EvaluacionPropuestaResult CalcularPuntaje(
            Propuesta propuesta,
            IEnumerable<CriterioLicitacion> criterios,
            IDictionary<int, NumericCriterionStats>? criteriosStats = null)
        {
            var criterioList = criterios?.ToList() ?? new List<CriterioLicitacion>();
            var respuestas = propuesta.RespuestasCriterios?.ToList() ?? new List<RespuestaCriterioLicitacion>();

            var resultado = new EvaluacionPropuestaResult();
            var excluyentesFallidos = new List<string>();

            decimal pesoTotal = criterioList.Where(c => c.EsPuntuable).Sum(c => c.Peso);
            decimal sumaContribuciones = 0m;

            foreach (var criterio in criterioList)
            {
                var respuesta = respuestas.FirstOrDefault(r => r.CriterioID == criterio.CriterioID);

                if (criterio.EsExcluyente && !CumpleCriterioExcluyente(criterio, respuesta))
                {
                    resultado.ExcluidaPorCriterios = true;
                    excluyentesFallidos.Add(criterio.Nombre);
                }

                if (!criterio.EsPuntuable || pesoTotal <= 0)
                {
                    continue;
                }

                var scoreCriterio = CalcularScoreCriterio(criterio, respuesta, criteriosStats);
                resultado.PuntajesPorCriterio[criterio.CriterioID] = Math.Round(scoreCriterio * 100m, 2, MidpointRounding.AwayFromZero);
                sumaContribuciones += scoreCriterio * criterio.Peso;
            }

            resultado.CriteriosExcluyentesFallidos = excluyentesFallidos;

            if (!resultado.ExcluidaPorCriterios && pesoTotal > 0)
            {
                var normalizado = (sumaContribuciones / pesoTotal) * 100m;
                resultado.PuntajeNormalizado = Math.Round(normalizado, 2, MidpointRounding.AwayFromZero);
            }
            else
            {
                resultado.PuntajeNormalizado = null;
            }

            return resultado;
        }

        public IDictionary<int, NumericCriterionStats> ConstruirEstadisticasNumericas(IEnumerable<Propuesta> propuestas)
        {
            var stats = new Dictionary<int, NumericCriterionStats>();
            if (propuestas == null)
            {
                return stats;
            }

            foreach (var propuesta in propuestas)
            {
                var respuestas = propuesta?.RespuestasCriterios;
                if (respuestas == null)
                {
                    continue;
                }

                foreach (var respuesta in respuestas)
                {
                    if (respuesta == null)
                    {
                        continue;
                    }

                    // Use only ValorNumerico for numeric statistics (do not fallback to ValorProveedor)
                    var valor = respuesta.ValorNumerico;
                    if (!valor.HasValue)
                    {
                        continue;
                    }

                    if (!stats.TryGetValue(respuesta.CriterioID, out var entry))
                    {
                        entry = new NumericCriterionStats
                        {
                            Min = valor.Value,
                            Max = valor.Value,
                            HasMultipleValues = false
                        };
                        stats[respuesta.CriterioID] = entry;
                    }
                    else
                    {
                        if (!entry.Min.HasValue || valor.Value < entry.Min.Value)
                        {
                            entry.Min = valor.Value;
                        }

                        if (!entry.Max.HasValue || valor.Value > entry.Max.Value)
                        {
                            entry.Max = valor.Value;
                        }

                        if (entry.Min.HasValue && entry.Max.HasValue && entry.Min.Value != entry.Max.Value)
                        {
                            entry.HasMultipleValues = true;
                        }
                    }
                }
            }

            return stats;
        }

        private static bool CumpleCriterioExcluyente(CriterioLicitacion criterio, RespuestaCriterioLicitacion? respuesta)
        {
            return criterio.Tipo switch
            {
                TipoCriterio.Booleano => CumpleBooleano(criterio, respuesta),
                TipoCriterio.Numerico => CumpleNumerico(criterio, respuesta),
                TipoCriterio.Escala => ObtenerOpcionSeleccionada(criterio, respuesta) is not null,
                _ => !string.IsNullOrWhiteSpace(respuesta?.ValorProveedor)
            };
        }

        private static bool CumpleBooleano(CriterioLicitacion criterio, RespuestaCriterioLicitacion? respuesta)
        {
            var valor = respuesta?.ValorBooleano ?? ParseBoolean(respuesta?.ValorProveedor);
            if (!valor.HasValue)
            {
                return false;
            }

            return criterio.ValorRequeridoBooleano.HasValue
                ? valor.Value == criterio.ValorRequeridoBooleano.Value
                : valor.Value;
        }

        private static bool CumpleNumerico(CriterioLicitacion criterio, RespuestaCriterioLicitacion? respuesta)
        {
            // Use only ValorNumerico for scoring numeric criteria (do not fallback to ValorProveedor)
            var valor = respuesta?.ValorNumerico;
            if (!valor.HasValue)
            {
                return false;
            }

            if (criterio.ValorMinimo.HasValue && valor.Value < criterio.ValorMinimo.Value)
            {
                return false;
            }

            if (criterio.ValorMaximo.HasValue && valor.Value > criterio.ValorMaximo.Value)
            {
                return false;
            }

            return true;
        }

        private static decimal CalcularScoreCriterio(
            CriterioLicitacion criterio,
            RespuestaCriterioLicitacion? respuesta,
            IDictionary<int, NumericCriterionStats>? criteriosStats)
        {
            return criterio.Tipo switch
            {
                TipoCriterio.Numerico => CalcularScoreNumerico(criterio, respuesta, criteriosStats),
                TipoCriterio.Booleano => CalcularScoreBooleano(criterio, respuesta),
                TipoCriterio.Escala => CalcularScoreEscala(criterio, respuesta),
                _ => 0m
            };
        }

        private static decimal CalcularScoreNumerico(
            CriterioLicitacion criterio,
            RespuestaCriterioLicitacion? respuesta,
            IDictionary<int, NumericCriterionStats>? criteriosStats)
        {
            // Use only ValorNumerico for scoring numeric criteria (do not fallback to ValorProveedor)
            var valor = respuesta?.ValorNumerico;
            if (!valor.HasValue)
            {
                return 0m;
            }

            var hasMin = criterio.ValorMinimo.HasValue;
            var hasMax = criterio.ValorMaximo.HasValue;
            var mayorMejor = criterio.MayorMejor ?? true;
            var statsEntry = criteriosStats != null && criteriosStats.TryGetValue(criterio.CriterioID, out var entry)
                ? entry
                : null;
            var observedMin = statsEntry?.Min;
            var observedMax = statsEntry?.Max;

            if (!hasMin && !hasMax)
            {
                return CalcularDesdeObservados(valor.Value, observedMin, observedMax, mayorMejor);
            }

            if (hasMin && hasMax)
            {
                var minConfigurado = criterio.ValorMinimo!.Value;
                var maxConfigurado = criterio.ValorMaximo!.Value;
                if (maxConfigurado <= minConfigurado)
                {
                    return valor.Value >= minConfigurado && valor.Value <= maxConfigurado ? 1m : 0m;
                }

                return NormalizarEnRango(valor.Value, minConfigurado, maxConfigurado, mayorMejor);
            }

            if (hasMin)
            {
                var minPermitido = criterio.ValorMinimo!.Value;
                if (observedMax.HasValue && observedMax.Value > minPermitido)
                {
                    return NormalizarEnRango(valor.Value, minPermitido, observedMax.Value, mayorMejor);
                }

                return valor.Value >= minPermitido
                    ? (mayorMejor ? 1m : 0m)
                    : 0m;
            }

            var maxPermitido = criterio.ValorMaximo!.Value;
            if (observedMin.HasValue && observedMin.Value < maxPermitido)
            {
                return NormalizarEnRango(valor.Value, observedMin.Value, maxPermitido, mayorMejor);
            }

            return valor.Value <= maxPermitido
                ? (mayorMejor ? 1m : 0m)
                : 0m;
        }

        private static decimal CalcularDesdeObservados(
            decimal valor,
            decimal? observedMin,
            decimal? observedMax,
            bool mayorMejor)
        {
            if (!observedMin.HasValue || !observedMax.HasValue)
            {
                return mayorMejor ? 1m : 0m;
            }

            if (observedMax.Value == observedMin.Value)
            {
                return mayorMejor ? 1m : 0m;
            }

            return NormalizarEnRango(valor, observedMin.Value, observedMax.Value, mayorMejor);
        }

        private static decimal NormalizarEnRango(decimal valor, decimal min, decimal max, bool mayorMejor)
        {
            if (max <= min)
            {
                return mayorMejor ? 1m : 0m;
            }

            var clamped = Clamp(valor, min, max);
            var ratio = (clamped - min) / (max - min);
            var normalized = mayorMejor ? ratio : 1m - ratio;
            return Clamp(normalized, 0m, 1m);
        }

        private static decimal CalcularScoreBooleano(CriterioLicitacion criterio, RespuestaCriterioLicitacion? respuesta)
        {
            var valor = respuesta?.ValorBooleano ?? ParseBoolean(respuesta?.ValorProveedor);
            if (!valor.HasValue)
            {
                return 0m;
            }

            if (!criterio.ValorRequeridoBooleano.HasValue)
            {
                return valor.Value ? 1m : 0m;
            }

            return valor.Value == criterio.ValorRequeridoBooleano.Value ? 1m : 0m;
        }

        private static decimal CalcularScoreEscala(CriterioLicitacion criterio, RespuestaCriterioLicitacion? respuesta)
        {
            var opcionSeleccionada = ObtenerOpcionSeleccionada(criterio, respuesta);
            if (opcionSeleccionada?.Puntaje is null)
            {
                return 0m;
            }

            var maxPuntaje = criterio.Opciones.Where(o => o.Puntaje.HasValue).Select(o => o.Puntaje!.Value).DefaultIfEmpty(0m).Max();
            if (maxPuntaje <= 0)
            {
                return 0m;
            }

            var ratio = opcionSeleccionada.Puntaje.Value / maxPuntaje;
            return Clamp(ratio, 0m, 1m);
        }

        private static CriterioOpcion? ObtenerOpcionSeleccionada(CriterioLicitacion criterio, RespuestaCriterioLicitacion? respuesta)
        {
            if (respuesta == null)
            {
                return null;
            }

            if (respuesta.CriterioOpcionID.HasValue)
            {
                return criterio.Opciones.FirstOrDefault(o => o.OpcionID == respuesta.CriterioOpcionID.Value);
            }

            if (string.IsNullOrWhiteSpace(respuesta.ValorProveedor))
            {
                return null;
            }

            return criterio.Opciones.FirstOrDefault(o =>
                string.Equals(o.Valor, respuesta.ValorProveedor, StringComparison.OrdinalIgnoreCase) ||
                string.Equals(o.Descripcion, respuesta.ValorProveedor, StringComparison.OrdinalIgnoreCase));
        }

        private static decimal Clamp(decimal value, decimal min, decimal max)
        {
            if (value < min)
            {
                return min;
            }

            if (value > max)
            {
                return max;
            }

            return value;
        }

        private static decimal? ParseDecimal(string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return null;
            }

            foreach (var culture in SupportedCultures)
            {
                if (decimal.TryParse(value, NumberStyles.Number, culture, out var parsed))
                {
                    return parsed;
                }
            }

            return null;
        }

        private static bool? ParseBoolean(string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return null;
            }

            var normalized = value.Trim().ToLowerInvariant();
            return normalized switch
            {
                "true" or "1" or "si" or "sí" => true,
                "false" or "0" or "no" => false,
                _ => null
            };
        }
    }
}
