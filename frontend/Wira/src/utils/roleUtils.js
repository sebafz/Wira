const normalizeRole = (role) =>
  typeof role === "string" ? role.trim().toLowerCase() : "";

const ROLE_GROUPS = {
  admin: new Set(["administrador del sistema", "admin", "administrador"]),
  minera: new Set(["minera administrador", "minera usuario", "minera"]),
  proveedor: new Set([
    "proveedor administrador",
    "proveedor usuario",
    "proveedor",
  ]),
};

const getUserRoles = (user) => {
  if (!user) return [];
  if (Array.isArray(user.Roles) && user.Roles.length > 0) {
    return user.Roles;
  }
  if (Array.isArray(user.roles) && user.roles.length > 0) {
    return user.roles;
  }
  return [];
};

export const getDashboardRouteForUser = (user) => {
  const normalizedRoles = getUserRoles(user).map(normalizeRole);

  if (normalizedRoles.some((role) => ROLE_GROUPS.admin.has(role))) {
    return "/dashboard-admin";
  }

  if (normalizedRoles.some((role) => ROLE_GROUPS.minera.has(role))) {
    return "/dashboard-minera";
  }

  if (normalizedRoles.some((role) => ROLE_GROUPS.proveedor.has(role))) {
    return "/dashboard-proveedor";
  }

  return "/dashboard-general";
};
