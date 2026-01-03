const API_BASE_URL = "http://localhost:5242/api";

const buildHeaders = (token, customHeaders = {}, hasBody = false) => {
  const headers = {
    ...(hasBody ? { "Content-Type": "application/json" } : {}),
    ...customHeaders,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

const authorizedFetch = (path, token, options = {}) => {
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
  const hasBody = Boolean(options.body);

  return fetch(url, {
    ...options,
    headers: buildHeaders(token, options.headers, hasBody),
  });
};

const getErrorMessage = async (
  response,
  fallback = "Error al procesar la solicitud"
) => {
  try {
    const data = await response.json();
    if (typeof data?.message === "string" && data.message.trim().length > 0) {
      return `${fallback}: ${data.message}`;
    }
  } catch (error) {
    // Ignorar parse errors y recurrir a texto plano o fallback
  }

  try {
    const text = await response.text();
    if (text && text.trim().length > 0) {
      return `${fallback}: ${text}`;
    }
  } catch (error) {
    // Ignorar
  }

  return fallback;
};

export const registrarCalificacionPostLicitacion = async ({
  token,
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

  const detalleResponse = await authorizedFetch(
    "/calificaciones-postlicitacion",
    token,
    {
      method: "POST",
      body: JSON.stringify(calificacionDetallada),
    }
  );

  if (!detalleResponse.ok) {
    const message = await getErrorMessage(
      detalleResponse,
      "No pudimos registrar el detalle de la calificacion"
    );
    throw new Error(message);
  }

  const finalizeResponse = await authorizedFetch(
    `/licitaciones/${licitacionId}/finalizar`,
    token,
    {
      method: "PUT",
    }
  );

  if (!finalizeResponse.ok) {
    const message = await getErrorMessage(
      finalizeResponse,
      "La licitacion se adjudico, pero no pudimos marcarla como cerrada"
    );
    throw new Error(message);
  }

  return true;
};

export default {
  registrarCalificacionPostLicitacion,
};
