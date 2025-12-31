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
  font-size: 0.9rem;
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
    font-size: 0.85rem;
    letter-spacing: 0.05em;
    color: #555;
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
  max-width: 640px;
  padding: 32px;
  box-shadow: 0 30px 60px rgba(15, 23, 42, 0.2);
`;

const ModalTitle = styled.h2`
  margin: 0 0 10px;
  color: #0f172a;
`;

const ModalDescription = styled.p`
  margin: 0 0 20px;
  color: #475569;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const FormRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
`;

const FormGroup = styled.label`
  flex: 1;
  min-width: 220px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const FormLabel = styled.span`
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;
`;

const TextInput = styled.input`
  border: 1px solid #d7dfe9;
  border-radius: 6px;
  padding: 10px 14px;
  font-size: 0.95rem;
`;

const FormSelect = styled.select`
  border: 1px solid #d7dfe9;
  border-radius: 6px;
  padding: 10px 14px;
  font-size: 0.95rem;
  background: white;
`;

const SwitchGroup = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  color: #0f172a;

  input {
    width: 18px;
    height: 18px;
  }
`;

const SectionLabel = styled.p`
  margin: 0;
  font-size: 0.85rem;
  font-weight: 600;
  color: #0f172a;
`;

const NoteText = styled.p`
  margin: -10px 0 0;
  font-size: 0.8rem;
  color: #64748b;
`;

const RoleOptions = styled.div`
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 12px;
  max-height: 220px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const RoleOption = styled.label`
  display: flex;
  gap: 10px;
  align-items: flex-start;
  cursor: pointer;
  padding: 6px 0;

  input {
    margin-top: 3px;
  }

  span {
    color: #475569;
  }
`;

const InlineError = styled.div`
  background: #fee2e2;
  color: #b91c1c;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 0.9rem;
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
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

const buildEmptyFormState = () => ({
  usuarioId: null,
  nombre: "",
  apellido: "",
  email: "",
  dni: "",
  telefono: "",
  role: "",
  activo: true,
  password: "",
  confirmPassword: "",
  empresaTipo: "",
  empresaId: "",
  empresaNombre: "",
});

const AdminUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toggling, setToggling] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [formState, setFormState] = useState(() => buildEmptyFormState());
  const [formError, setFormError] = useState("");
  const [submittingForm, setSubmittingForm] = useState(false);
  const [lockedFields, setLockedFields] = useState({ email: "", dni: "" });
  const [minerasOptions, setMinerasOptions] = useState([]);
  const [proveedoresOptions, setProveedoresOptions] = useState([]);
  const [empresaOptionsLoading, setEmpresaOptionsLoading] = useState(false);

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

  const loadEmpresas = async () => {
    try {
      setEmpresaOptionsLoading(true);
      const [minerasRes, proveedoresRes] = await Promise.all([
        apiService.getMineras({ includeInactive: false }),
        apiService.getProveedores(),
      ]);

      const normalizedMineras = (minerasRes.data || [])
        .map((minera) => {
          const id =
            minera.MineraID ??
            minera.mineraID ??
            minera.EmpresaID ??
            minera.empresaID ??
            null;

          if (!id && id !== 0) {
            return null;
          }

          return {
            id: String(id),
            nombre:
              minera.Nombre ||
              minera.RazonSocial ||
              minera.nombre ||
              minera.razonSocial ||
              "Sin nombre",
          };
        })
        .filter(Boolean);

      const normalizedProveedores = (proveedoresRes.data || [])
        .map((proveedor) => {
          const id =
            proveedor.ProveedorID ??
            proveedor.proveedorID ??
            proveedor.EmpresaID ??
            proveedor.empresaID ??
            null;

          if (!id && id !== 0) {
            return null;
          }

          return {
            id: String(id),
            nombre:
              proveedor.Nombre ||
              proveedor.RazonSocial ||
              proveedor.nombre ||
              proveedor.razonSocial ||
              "Sin nombre",
          };
        })
        .filter(Boolean);

      setMinerasOptions(normalizedMineras);
      setProveedoresOptions(normalizedProveedores);
    } catch (apiError) {
      console.error("Error loading companies", apiError);
      toast.error("No pudimos cargar la lista de empresas");
    } finally {
      setEmpresaOptionsLoading(false);
    }
  };

  useEffect(() => {
    loadUsuarios();
    loadEmpresas();
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
              typeof value === "string" && value.toLowerCase().includes(term)
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

  const empresaOptions = useMemo(() => {
    const options =
      formState.empresaTipo === "MINERA"
        ? minerasOptions
        : formState.empresaTipo === "PROVEEDOR"
        ? proveedoresOptions
        : [];

    if (
      formState.empresaTipo &&
      formState.empresaId &&
      !options.some((option) => option.id === formState.empresaId) &&
      formState.empresaNombre
    ) {
      return [
        {
          id: formState.empresaId,
          nombre: `${formState.empresaNombre} (asignada)`,
        },
        ...options,
      ];
    }

    return options;
  }, [
    formState.empresaTipo,
    formState.empresaId,
    formState.empresaNombre,
    minerasOptions,
    proveedoresOptions,
  ]);

  const handleToggleStatus = async (usuario) => {
    try {
      setToggling(true);
      const newStatus = !isUserActive(usuario);
      const response = await apiService.updateUsuarioStatus(
        getUserId(usuario),
        newStatus
      );
      const updatedUser = response?.data?.usuario || null;

      if (updatedUser) {
        setUsuarios((prev) =>
          prev.map((item) =>
            getUserId(item) === getUserId(updatedUser) ? updatedUser : item
          )
        );
      } else {
        await loadUsuarios();
      }
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

  const openCreateForm = () => {
    setFormMode("create");
    setFormState(buildEmptyFormState());
    setLockedFields({ email: "", dni: "" });
    setFormError("");
    setFormOpen(true);
  };

  const openEditForm = (usuario) => {
    const [firstRole = ""] = getUserRoles(usuario);
    setFormMode("edit");
    const empresa = usuario.Empresa || usuario.empresa || null;
    const rawEmpresaTipo = (
      empresa?.TipoEmpresa ||
      empresa?.tipoEmpresa ||
      ""
    ).toUpperCase();
    const empresaTipo =
      rawEmpresaTipo === "MINERA" || rawEmpresaTipo === "PROVEEDOR"
        ? rawEmpresaTipo
        : "";
    const empresaId =
      empresa?.EmpresaID || empresa?.empresaID || empresa?.MineraID || null;

    setFormState({
      usuarioId: getUserId(usuario),
      nombre: usuario.Nombre || usuario.nombre || "",
      apellido: usuario.Apellido || usuario.apellido || "",
      email: usuario.Email || usuario.email || "",
      dni: usuario.DNI || usuario.dni || "",
      telefono: usuario.Telefono || usuario.telefono || "",
      role: firstRole,
      activo: isUserActive(usuario),
      password: "",
      confirmPassword: "",
      empresaTipo,
      empresaId: empresaTipo && empresaId ? String(empresaId) : "",
      empresaNombre: empresa?.Nombre || empresa?.nombre || "",
    });
    setLockedFields({
      email: usuario.Email || usuario.email || "",
      dni: usuario.DNI || usuario.dni || "",
    });
    setFormError("");
    setFormOpen(true);
  };

  const handleRowClick = (usuario) => {
    openEditForm(usuario);
  };

  const handleFormChange = (field, value) => {
    if (field === "dni") {
      const numericValue = (value || "").replace(/[^0-9]/g, "");
      setFormState((prev) => ({ ...prev, dni: numericValue }));
      return;
    }

    if (field === "empresaTipo") {
      setFormState((prev) => ({
        ...prev,
        empresaTipo: value,
        empresaId: "",
        empresaNombre: "",
      }));
      return;
    }

    if (field === "empresaId") {
      setFormState((prev) => {
        const options =
          prev.empresaTipo === "MINERA"
            ? minerasOptions
            : prev.empresaTipo === "PROVEEDOR"
            ? proveedoresOptions
            : [];
        const selected = options.find((option) => option.id === value);
        return {
          ...prev,
          empresaId: value,
          empresaNombre: selected?.nombre || prev.empresaNombre,
        };
      });
      return;
    }

    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const closeForm = () => {
    setFormOpen(false);
    setFormError("");
    setFormState(buildEmptyFormState());
  };

  const normalizeOptional = (value) => {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    if (submittingForm) return;

    const nombre = formState.nombre.trim();
    const email = (
      formMode === "edit" ? lockedFields.email : formState.email
    ).trim();
    const dni = (formMode === "edit" ? lockedFields.dni : formState.dni).trim();
    const password = formState.password.trim();
    const confirmPassword = formState.confirmPassword.trim();
    const passwordProvided = password.length > 0 || confirmPassword.length > 0;

    if (!nombre || !email || !dni) {
      setFormError("Nombre, email y DNI son obligatorios.");
      return;
    }

    if (formMode === "create" && password.length === 0) {
      setFormError("Debe definir una contraseña temporal.");
      return;
    }

    if (passwordProvided) {
      if (password.length > 0 && password.length < 6) {
        setFormError("La contraseña debe tener al menos 6 caracteres.");
        return;
      }

      if (password !== confirmPassword) {
        setFormError("Las contraseñas no coinciden.");
        return;
      }
    }

    let empresaIdValue = null;
    if (formState.empresaTipo) {
      if (!formState.empresaId) {
        setFormError("Seleccione una empresa para el usuario.");
        return;
      }

      const parsed = parseInt(formState.empresaId, 10);
      if (Number.isNaN(parsed)) {
        setFormError("La empresa seleccionada no es válida.");
        return;
      }
      empresaIdValue = parsed;
    }

    const payload = {
      nombre,
      apellido: normalizeOptional(formState.apellido),
      email,
      dni,
      telefono: normalizeOptional(formState.telefono),
      activo: formState.activo,
      roles: formState.role ? [formState.role] : [],
      empresaID: empresaIdValue,
    };

    if (formMode === "create" || passwordProvided) {
      payload.password = password;
    }

    setSubmittingForm(true);

    try {
      const response =
        formMode === "create"
          ? await apiService.createUsuario(payload)
          : await apiService.updateUsuario(formState.usuarioId, payload);

      const returnedUser = response?.data?.usuario || null;

      if (returnedUser) {
        setUsuarios((prev) => {
          const updatedId = getUserId(returnedUser);
          const exists = prev.some((item) => getUserId(item) === updatedId);
          if (exists) {
            return prev.map((item) =>
              getUserId(item) === updatedId ? returnedUser : item
            );
          }
          return [...prev, returnedUser];
        });
      } else {
        await loadUsuarios();
      }

      toast.success(
        formMode === "create"
          ? "Usuario creado correctamente"
          : "Usuario actualizado correctamente"
      );
      closeForm();
    } catch (apiError) {
      console.error("Error saving user", apiError);
      const message =
        apiError.response?.data?.message ||
        "No se pudieron guardar los cambios";
      setFormError(message);
      toast.error(message);
    } finally {
      setSubmittingForm(false);
    }
  };

  return (
    <PageContainer>
      <Navbar />
      <Content>
        <PageHeader>
          <Title>Gestión de usuarios</Title>
          <Subtitle>
            Administre altas, bajas y roles de cada usuario dentro del sistema.
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
          <Button onClick={openCreateForm}>Agregar usuario</Button>
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
                    <tr
                      key={getUserId(usuario)}
                      onClick={() => handleRowClick(usuario)}
                      style={{ cursor: "pointer" }}
                    >
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
                            onClick={(event) => {
                              event.stopPropagation();
                              openEditForm(usuario);
                            }}
                          >
                            Editar
                          </Button>
                          <Button
                            onClick={(event) => {
                              event.stopPropagation();
                              handleToggleStatus(usuario);
                            }}
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

      {formOpen && (
        <ModalOverlay>
          <ModalCard>
            <ModalTitle>
              {formMode === "create" ? "Agregar usuario" : "Editar usuario"}
            </ModalTitle>
            <ModalDescription>
              {formMode === "create"
                ? "Complete los datos para crear una nueva cuenta."
                : "Actualice la información y los roles del usuario seleccionado."}
            </ModalDescription>
            <Form onSubmit={handleFormSubmit} autoComplete="off" noValidate>
              {formError && <InlineError>{formError}</InlineError>}
              <FormRow>
                <FormGroup>
                  <FormLabel>Nombre *</FormLabel>
                  <TextInput
                    name="admin-user-first-name"
                    autoComplete="off"
                    value={formState.nombre}
                    onChange={(event) =>
                      handleFormChange("nombre", event.target.value)
                    }
                    placeholder="Nombre"
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <FormLabel>Apellido *</FormLabel>
                  <TextInput
                    name="admin-user-last-name"
                    autoComplete="off"
                    value={formState.apellido}
                    onChange={(event) =>
                      handleFormChange("apellido", event.target.value)
                    }
                    placeholder="Apellido"
                  />
                </FormGroup>
              </FormRow>
              <FormRow>
                <FormGroup>
                  <FormLabel>Email</FormLabel>
                  <TextInput
                    type="email"
                    name="admin-user-email"
                    autoComplete="new-email"
                    disabled={formMode === "edit"}
                    value={formState.email}
                    onChange={(event) =>
                      handleFormChange("email", event.target.value)
                    }
                    placeholder="correo@empresa.com"
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <FormLabel>DNI *</FormLabel>
                  <TextInput
                    name="admin-user-dni"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="off"
                    disabled={formMode === "edit"}
                    value={formState.dni}
                    onChange={(event) =>
                      handleFormChange("dni", event.target.value)
                    }
                    placeholder="Documento"
                    required
                  />
                </FormGroup>
              </FormRow>
              <FormRow>
                <FormGroup>
                  <FormLabel>Tipo de empresa</FormLabel>
                  <FormSelect
                    name="admin-user-company-type"
                    value={formState.empresaTipo}
                    onChange={(event) =>
                      handleFormChange("empresaTipo", event.target.value)
                    }
                  >
                    <option value="">Sin empresa</option>
                    <option value="MINERA">Minera</option>
                    <option value="PROVEEDOR">Proveedor</option>
                  </FormSelect>
                </FormGroup>
                <FormGroup>
                  <FormLabel>Empresa asignada</FormLabel>
                  <FormSelect
                    name="admin-user-company"
                    value={formState.empresaId}
                    onChange={(event) =>
                      handleFormChange("empresaId", event.target.value)
                    }
                    disabled={!formState.empresaTipo || empresaOptionsLoading}
                  >
                    <option value="">
                      {!formState.empresaTipo
                        ? "Seleccione un tipo"
                        : empresaOptionsLoading
                        ? "Cargando opciones..."
                        : "Seleccione una empresa"}
                    </option>
                    {empresaOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.nombre}
                      </option>
                    ))}
                  </FormSelect>
                </FormGroup>
              </FormRow>
              <FormRow>
                <FormGroup>
                  <FormLabel>Teléfono</FormLabel>
                  <TextInput
                    name="admin-user-phone"
                    autoComplete="off"
                    inputMode="tel"
                    pattern="[0-9+ ]*"
                    value={formState.telefono}
                    onChange={(event) =>
                      handleFormChange("telefono", event.target.value)
                    }
                    placeholder="+54 387 0 000000"
                  />
                </FormGroup>
                <FormGroup>
                  <FormLabel>
                    Contraseña {formMode === "edit" ? "(opcional)" : ""}
                  </FormLabel>
                  <TextInput
                    type="password"
                    name="admin-user-password"
                    autoComplete="new-password"
                    data-lpignore="true"
                    value={formState.password}
                    onChange={(event) =>
                      handleFormChange("password", event.target.value)
                    }
                    placeholder=""
                  />
                </FormGroup>
                <FormGroup>
                  <FormLabel>Confirmar contraseña</FormLabel>
                  <TextInput
                    type="password"
                    name="admin-user-password-confirm"
                    autoComplete="new-password"
                    data-lpignore="true"
                    value={formState.confirmPassword}
                    onChange={(event) =>
                      handleFormChange("confirmPassword", event.target.value)
                    }
                    placeholder=""
                  />
                </FormGroup>
              </FormRow>
              {formMode === "edit" && (
                <NoteText>
                  Deje los campos de contraseña vacíos para mantener la actual.
                </NoteText>
              )}
              <FormRow>
                <SwitchGroup>
                  <input
                    type="checkbox"
                    checked={formState.activo}
                    onChange={(event) =>
                      handleFormChange("activo", event.target.checked)
                    }
                  />
                  <span>
                    {formState.activo ? "Usuario activo" : "Usuario inactivo"}
                  </span>
                </SwitchGroup>
              </FormRow>
              <div>
                <SectionLabel>Rol principal</SectionLabel>
                <RoleOptions>
                  {ROLE_OPTIONS.map((role) => (
                    <RoleOption key={role.value || "none"}>
                      <input
                        type="radio"
                        name="form-role"
                        value={role.value}
                        checked={formState.role === role.value}
                        onChange={() => handleFormChange("role", role.value)}
                      />
                      <span>{role.label}</span>
                    </RoleOption>
                  ))}
                </RoleOptions>
              </div>
              <ModalActions>
                <Button
                  variant="secondary"
                  type="button"
                  onClick={closeForm}
                  disabled={submittingForm}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={submittingForm}>
                  {submittingForm
                    ? "Guardando..."
                    : formMode === "create"
                    ? "Crear usuario"
                    : "Guardar cambios"}
                </Button>
              </ModalActions>
            </Form>
          </ModalCard>
        </ModalOverlay>
      )}
    </PageContainer>
  );
};

export default AdminUsuarios;
