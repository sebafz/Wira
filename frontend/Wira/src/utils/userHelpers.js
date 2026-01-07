const normalizeNumericId = (value) => {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0 ? value : null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }
    const parsed = Number(trimmed);
    return Number.isNaN(parsed) || parsed <= 0 ? null : parsed;
  }

  return null;
};

export const getUserMineraId = (user) => {
  if (!user) return null;

  const candidates = [
    user.MineraID,
    user.mineraID,
    user.EmpresaID,
    user.empresaID,
    user?.Minera?.MineraID,
    user?.Minera?.mineraID,
    user?.Minera?.EmpresaID,
    user?.Minera?.empresaID,
    user?.minera?.MineraID,
    user?.minera?.mineraID,
    user?.minera?.EmpresaID,
    user?.minera?.empresaID,
    user?.Empresa?.EmpresaID,
    user?.empresa?.empresaID,
  ];

  for (const candidate of candidates) {
    const parsed = normalizeNumericId(candidate);
    if (parsed !== null) {
      return parsed;
    }
  }

  return null;
};

export const getUserCompanyName = (user) => {
  const minera =
    user?.Minera || user?.minera || user?.Empresa || user?.empresa || null;

  return (
    minera?.Nombre ||
    minera?.nombre ||
    minera?.RazonSocial ||
    minera?.razonSocial ||
    user?.empresaNombre ||
    user?.EmpresaNombre ||
    "Empresa Minera"
  );
};
