import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import Navbar from "../shared/Navbar";
import { apiService } from "../../services/apiService";
import { toast } from "react-toastify";

const PageContainer = styled.div`
  min-height: 100vh;
  background: #f1f5f9;
`;

const Content = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px 60px;
`;

const PageHeader = styled.header`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  margin: 0;
  color: #0f172a;
`;

const Subtitle = styled.p`
  margin: 0;
  color: #475569;
`;

const Controls = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 220px;
  border: 1px solid #dddddd;
  border-radius: 6px;
  padding: 10px 14px;
  font-size: 0.95rem;
`;

const Select = styled.select`
  min-width: 170px;
  border: 1px solid #dddddd;
  border-radius: 6px;
  padding: 10px 14px;
  font-size: 0.95rem;
`;

const Button = styled.button`
  border: none;
  background: ${(props) =>
    props.variant === "secondary" ? "#e2e8f0" : "#0f172a"};
  color: ${(props) => (props.variant === "secondary" ? "#0f172a" : "white")};
  padding: 10px 18px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s ease;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Card = styled.section`
  background: white;
  border-radius: 12px;
  border: none;
  padding: 0;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
`;

const TableWrapper = styled.div`
  overflow-x: auto;
`;

const TableHeader = styled.div`
  padding: 24px 24px 0 24px;
`;

const TableTitle = styled.h2`
  margin: 0 0 6px;
  color: #0f172a;
  font-size: 1.25rem;
`;

const TableSubtitle = styled.p`
  margin: 0 0 16px;
  color: #475569;
  font-size: 0.95rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;

  th,
  td {
    padding: 16px;
    text-align: left;
    border-bottom: 1px solid #edf2f7;
  }

  th {
    font-size: 0.8rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #94a3b8;
  }

  tr:hover td {
    background: #f8fafc;
  }
`;

const StatusBadge = styled.span`
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 0.8rem;
  font-weight: 600;
  color: ${(props) => (props.active ? "#166534" : "#b91c1c")};
  background: ${(props) => (props.active ? "#dcfce7" : "#fee2e2")};
`;

const RoleTag = styled.span`
  background: #e0e7ff;
  color: #312e81;
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 0.8rem;
  margin: 0 6px 6px 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
`;

const RoleList = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const EmptyState = styled.div`
  padding: 40px;
  text-align: center;
  color: #94a3b8;
`;

const ErrorBanner = styled.div`
  background: #fee2e2;
  color: #b91c1c;
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 16px;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 2000;
`;

const ModalCard = styled.div`
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 520px;
  padding: 28px;
  box-shadow: 0 30px 60px rgba(15, 23, 42, 0.2);
`;

const ModalTitle = styled.h2`
  margin: 0 0 18px;
  color: #0f172a;
`;

const RoleCheckbox = styled.label`
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 10px 0;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;

  input {
    margin-top: 4px;
  }

  span {
    color: #475569;
  }
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
`;

const ROLE_OPTIONS = [
  { value: "", label: "Sin rol asignado" },
  { value: "ADMIN_SISTEMA", label: "Administrador del sistema" },
  { value: "MINERA_ADMINISTRADOR", label: "Minera administrador" },
  { value: "MINERA_USUARIO", label: "Minera usuario" },
  { value: "PROVEEDOR_ADMINISTRADOR", label: "Proveedor administrador" },
  { value: "PROVEEDOR_USUARIO", label: "Proveedor usuario" },
];

const ROLE_LABELS = ROLE_OPTIONS.reduce((labels, role) => {
  if (role.value) {
    labels[role.value] = role.label;
  }
  return labels;
}, {});

const KNOWN_ROLE_VALUES = new Set(Object.keys(ROLE_LABELS));

const LEGACY_ROLE_MAP = {
  "administrador del sistema": "ADMIN_SISTEMA",
  "minera administrador": "MINERA_ADMINISTRADOR",
  "minera usuario": "MINERA_USUARIO",
  "proveedor administrador": "PROVEEDOR_ADMINISTRADOR",
  "proveedor usuario": "PROVEEDOR_USUARIO",
};

const normalizeRoleValue = (role) => {
  if (typeof role !== "string") return "";
  const trimmed = role.trim();
  if (!trimmed) return "";
  if (KNOWN_ROLE_VALUES.has(trimmed)) return trimmed;
  const legacyKey = trimmed.toLowerCase();
  return LEGACY_ROLE_MAP[legacyKey] || trimmed;
};

const getRoleLabel = (role) => ROLE_LABELS[role] || role;

const extractUserRoles = (usuario) => {
  if (Array.isArray(usuario?.Roles) && usuario.Roles.length > 0) {
    return usuario.Roles;
  }
  if (Array.isArray(usuario?.roles) && usuario.roles.length > 0) {
    return usuario.roles;
  }
  return [];
};

const getUserId = (usuario) => usuario?.UsuarioID || usuario?.usuarioID;
const getUserRoles = (usuario) =>
  extractUserRoles(usuario)
    .map((role) => normalizeRoleValue(role))
    .filter((role) => typeof role === "string" && role.length > 0);
const isUserActive = (usuario) => {
  if (typeof usuario?.Activo === "boolean") return usuario.Activo;
  if (typeof usuario?.activo === "boolean") return usuario.activo;
  return !(usuario?.FechaBaja || usuario?.fechaBaja);
};

const AdminUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [roleSelection, setRoleSelection] = useState("");
  const [savingRoles, setSavingRoles] = useState(false);
  const [toggling, setToggling] = useState(false);

  const loadUsuarios = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiService.getUsuarios();
      setUsuarios(response.data || []);
    } catch (apiError) {
      console.error("Error loading users", apiError);
      setError("No pudimos cargar los usuarios.");
      toast.error("Error al obtener los usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsuarios();
  }, []);

  const filteredUsuarios = useMemo(() => {
    const term = search.trim().toLowerCase();

    return usuarios.filter((usuario) => {
      const roleValues = getUserRoles(usuario);
      const roleLabels = roleValues.map((role) => getRoleLabel(role));
      const matchesTerm = term
        ? [
            usuario.Nombre || usuario.nombre || "",
            usuario.Apellido || usuario.apellido || "",
            usuario.Email || usuario.email || "",
            ...roleValues,
            ...roleLabels,
          ].some(
            (value) =>
              typeof value === "string" &&
              value.toLowerCase().includes(term)
          )
        : true;

      const matchesStatus =
        statusFilter === "todos" ||
        (statusFilter === "activos" && isUserActive(usuario)) ||
        (statusFilter === "inactivos" && !isUserActive(usuario));

      return matchesTerm && matchesStatus;
    });
  }, [usuarios, search, statusFilter]);

  const usuariosActivos = useMemo(() => {
    return filteredUsuarios.filter((usuario) => isUserActive(usuario)).length;
  }, [filteredUsuarios]);

  const usuariosInactivos = Math.max(
    0,
    filteredUsuarios.length - usuariosActivos
  );

  const handleToggleStatus = async (usuario) => {
    try {
      setToggling(true);
      const newStatus = !isUserActive(usuario);
      await apiService.updateUsuarioStatus(getUserId(usuario), newStatus);
      setUsuarios((prev) =>
        prev.map((item) =>
          getUserId(item) === getUserId(usuario)
            ? {
                ...item,
                Activo: newStatus,
                activo: newStatus,
                FechaBaja: newStatus ? null : new Date().toISOString(),
                fechaBaja: newStatus ? null : new Date().toISOString(),
              }
            : item
        )
      );
      toast.success(
        `Usuario ${newStatus ? "habilitado" : "dado de baja"} correctamente`
      );
    } catch (apiError) {
      console.error("Error toggling user", apiError);
      toast.error("No se pudo actualizar el estado del usuario");
    } finally {
      setToggling(false);
    }
  };

  const openRoleModal = (usuario) => {
    setSelectedUser(usuario);
    const [firstRole = ""] = getUserRoles(usuario);
    setRoleSelection(firstRole);
  };

  const handleRoleSelection = (role) => {
    setRoleSelection(role);
  };

  const handleSaveRoles = async () => {
    if (!selectedUser) return;

    try {
      setSavingRoles(true);
      const rolesToSave = roleSelection ? [roleSelection] : [];
      await apiService.updateUsuarioRoles(getUserId(selectedUser), rolesToSave);
      setUsuarios((prev) =>
        prev.map((usuario) =>
          getUserId(usuario) === getUserId(selectedUser)
            ? { ...usuario, Roles: rolesToSave, roles: rolesToSave }
            : usuario
        )
      );
      toast.success("Roles actualizados correctamente");
      setSelectedUser(null);
    } catch (apiError) {
      console.error("Error updating roles", apiError);
      toast.error("No se pudieron actualizar los roles");
    } finally {
      setSavingRoles(false);
    }
  };

  return (
    <PageContainer>
      <Navbar />
      <Content>
        <PageHeader>
          <Title>Gestión de usuarios</Title>
          <Subtitle>
            Administrá altas, bajas y roles de cada usuario dentro del sistema.
          </Subtitle>
        </PageHeader>

        <Controls>
          <SearchInput
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nombre, apellido, email o rol"
          />
          <Select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="todos">Todos los estados</option>
            <option value="activos">Solo activos</option>
            <option value="inactivos">Solo inactivos</option>
          </Select>
          <Button onClick={loadUsuarios} disabled={loading}>
            {loading ? "Actualizando..." : "Actualizar"}
          </Button>
        </Controls>

        {error && <ErrorBanner>{error}</ErrorBanner>}

        <Card>
          <TableHeader>
            <TableTitle>Usuarios</TableTitle>
            <TableSubtitle>
              {`${filteredUsuarios.length} usuarios visibles (${usuariosActivos} activos, ${usuariosInactivos} inactivos)`}
            </TableSubtitle>
          </TableHeader>
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsuarios.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <EmptyState>
                        {loading
                          ? "Cargando usuarios..."
                          : "No encontramos usuarios para los filtros aplicados"}
                      </EmptyState>
                    </td>
                  </tr>
                ) : (
                  filteredUsuarios.map((usuario) => (
                    <tr key={getUserId(usuario)}>
                      <td>
                        <div style={{ fontWeight: 600 }}>
                          {`${usuario.Nombre || usuario.nombre || ""} ${
                            usuario.Apellido || usuario.apellido || ""
                          }`.trim() || "Sin nombre"}
                        </div>
                      </td>
                      <td>{usuario.Email || usuario.email}</td>
                      <td>
                        <RoleList>
                          {getUserRoles(usuario).length === 0 ? (
                            <span style={{ color: "#94a3b8" }}>
                              Sin rol asignado
                            </span>
                          ) : (
                            getUserRoles(usuario).map((rol) => (
                              <RoleTag key={rol}>{getRoleLabel(rol)}</RoleTag>
                            ))
                          )}
                        </RoleList>
                      </td>
                      <td>
                        <StatusBadge active={isUserActive(usuario)}>
                          {isUserActive(usuario) ? "Activo" : "Inactivo"}
                        </StatusBadge>
                      </td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            flexWrap: "wrap",
                          }}
                        >
                          <Button
                            variant="secondary"
                            onClick={() => openRoleModal(usuario)}
                          >
                            Gestionar roles
                          </Button>
                          <Button
                            onClick={() => handleToggleStatus(usuario)}
                            disabled={toggling}
                          >
                            {isUserActive(usuario)
                              ? "Dar de baja"
                              : "Rehabilitar"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </TableWrapper>
        </Card>
      </Content>

      {selectedUser && (
        <ModalOverlay>
          <ModalCard>
            <ModalTitle>
              Roles de {selectedUser.Nombre || selectedUser.nombre || "usuario"}
            </ModalTitle>
            {ROLE_OPTIONS.map((role) => (
              <RoleCheckbox key={role.value}>
                <input
                  type="radio"
                  name="role-selection"
                  value={role.value}
                  checked={roleSelection === role.value}
                  onChange={() => handleRoleSelection(role.value)}
                />
                <span>{role.label}</span>
              </RoleCheckbox>
            ))}
            <ModalActions>
              <Button
                variant="secondary"
                onClick={() => setSelectedUser(null)}
                disabled={savingRoles}
              >
                Cancelar
              </Button>
              <Button onClick={handleSaveRoles} disabled={savingRoles}>
                {savingRoles ? "Guardando..." : "Guardar"}
              </Button>
            </ModalActions>
          </ModalCard>
        </ModalOverlay>
      )}
    </PageContainer>
  );
};

export default AdminUsuarios;
