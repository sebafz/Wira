import apiService from "./apiService";

const getErrorMessageFromAxios = (
  error,
  fallback = "Error al procesar la solicitud"
) => {
  const resp = error?.response?.data;
  if (resp) {
    if (typeof resp.message === "string" && resp.message.trim().length > 0) {
      return `${fallback}: ${resp.message}`;
    }
    if (typeof resp === "string" && resp.trim().length > 0) {
      return `${fallback}: ${resp}`;
    }
  }
  if (error?.message) return `${fallback}: ${error.message}`;
  return fallback;
};

export const registrarCalificacionPostLicitacion = async ({
  licitacionId,
  proveedorId,
  puntualidad,
  calidad,
  comunicacion,
  comentarios,
}) => {
  if (!licitacionId) {
    throw new Error("Falta informacion para registrar la calificacion");
  }

  const normalizedProveedorId = Number(proveedorId);
  if (!Number.isFinite(normalizedProveedorId)) {
    throw new Error("No pudimos identificar al proveedor adjudicado");
  }

  const parseStarValue = (value, label) => {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) {
      throw new Error(`${label} debe ser un numero entre 1 y 5`);
    }
    if (numericValue < 1 || numericValue > 5) {
      throw new Error(`${label} debe estar entre 1 y 5 estrellas`);
    }
    return Math.round(numericValue);
  };

  const calificacionDetallada = {
    licitacionId,
    proveedorId: normalizedProveedorId,
    puntualidad: parseStarValue(puntualidad, "Puntualidad"),
    calidad: parseStarValue(calidad, "Calidad"),
    comunicacion: parseStarValue(comunicacion, "Comunicacion"),
    comentarios:
      typeof comentarios === "string" && comentarios.trim().length > 0
        ? comentarios.trim()
        : null,
  };

  try {
    await apiService.post(
      "/calificaciones-postlicitacion",
      calificacionDetallada
    );
  } catch (err) {
    const message = getErrorMessageFromAxios(
      err,
      "No pudimos registrar el detalle de la calificacion"
    );
    throw new Error(message);
  }

  try {
    await apiService.put(`/licitaciones/${licitacionId}/finalizar`);
  } catch (err) {
    const message = getErrorMessageFromAxios(
      err,
      "La licitacion se adjudico, pero no pudimos marcarla como cerrada"
    );
    throw new Error(message);
  }

  return true;
};

export default {
  registrarCalificacionPostLicitacion,
};
