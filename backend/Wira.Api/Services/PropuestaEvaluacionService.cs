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

        public EvaluacionPropuestaResult CalcularPuntaje(Propuesta propuesta, IEnumerable<CriterioLicitacion> criterios)
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

                var scoreCriterio = CalcularScoreCriterio(criterio, respuesta);
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
            var valor = respuesta?.ValorNumerico ?? ParseDecimal(respuesta?.ValorProveedor);
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

        private static decimal CalcularScoreCriterio(CriterioLicitacion criterio, RespuestaCriterioLicitacion? respuesta)
        {
            return criterio.Tipo switch
            {
                TipoCriterio.Numerico => CalcularScoreNumerico(criterio, respuesta),
                TipoCriterio.Booleano => CalcularScoreBooleano(criterio, respuesta),
                TipoCriterio.Escala => CalcularScoreEscala(criterio, respuesta),
                _ => 0m
            };
        }

        private static decimal CalcularScoreNumerico(CriterioLicitacion criterio, RespuestaCriterioLicitacion? respuesta)
        {
            var valor = respuesta?.ValorNumerico ?? ParseDecimal(respuesta?.ValorProveedor);
            if (!valor.HasValue)
            {
                return 0m;
            }

            var hasMin = criterio.ValorMinimo.HasValue;
            var hasMax = criterio.ValorMaximo.HasValue;

            if (!hasMin && !hasMax)
            {
                return 0m;
            }

            if (hasMin && hasMax)
            {
                var min = criterio.ValorMinimo!.Value;
                var max = criterio.ValorMaximo!.Value;
                if (max <= min)
                {
                    return valor.Value >= min && valor.Value <= max ? 1m : 0m;
                }

                var clamped = Clamp(valor.Value, min, max);
                var ratio = (clamped - min) / (max - min);
                var mayorMejor = criterio.MayorMejor ?? true;
                var normalized = mayorMejor ? ratio : 1m - ratio;
                return Clamp(normalized, 0m, 1m);
            }

            if (hasMin)
            {
                return valor.Value >= criterio.ValorMinimo!.Value ? 1m : 0m;
            }

            return valor.Value <= criterio.ValorMaximo!.Value ? 1m : 0m;
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
