import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import Navbar from "../shared/Navbar";
import { apiService } from "../../services/apiService";
import { toast } from "react-toastify";
import { buttonBaseStyles } from "../shared/buttonStyles";

const PageContainer = styled.div`
  min-height: 100vh;
  background: #f8f9fa;
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
  ${buttonBaseStyles};
  padding: 10px 20px;
  font-size: 0.9rem;
  background: ${(props) =>
    props.variant === "secondary" ? "#6c757d" : "#fc6b0a"};
  color: white;

  &:hover:not(:disabled) {
    background: ${(props) =>
      props.variant === "secondary" ? "#5a6268" : "#e55a09"};
  }
`;

const Card = styled.section`
  background: white;
  border-radius: 12px;
  border: none;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
`;

const TableWrapper = styled.div`
  overflow-x: auto;
`;

const TableHeader = styled.div`
  margin-bottom: 18px;
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

  th,
  td {
    padding: 14px;
    text-align: left;
    border-bottom: 1px solid #edf2f7;
  }

  tbody tr:last-child td {
    border-bottom: none;
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
  max-width: 620px;
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

const NoteText = styled.p`
  margin: -10px 0 0;
  font-size: 0.8rem;
  color: #64748b;
`;

const formatDate = (value) => {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleDateString("es-AR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return value;
  }
};

const formatCuitInput = (value = "") => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 10) {
    return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  }
  return `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10)}`;
};

const buildEmptyFormState = () => ({
  mineraId: null,
  nombre: "",
  razonSocial: "",
  cuit: "",
  emailContacto: "",
  telefono: "",
  activo: true,
});

const getMineraId = (minera) =>
  minera?.MineraID || minera?.mineraID || minera?.EmpresaID || null;

const isMineraActive = (minera) => {
  if (typeof minera?.Activo === "boolean") return minera.Activo;
  if (typeof minera?.activo === "boolean") return minera.activo;
  return true;
};

const AdminMineras = () => {
  const [mineras, setMineras] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [formState, setFormState] = useState(() => buildEmptyFormState());
  const [lockedCuit, setLockedCuit] = useState("");
  const [formError, setFormError] = useState("");
  const [submittingForm, setSubmittingForm] = useState(false);

  const loadMineras = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiService.getMineras({ includeInactive: true });
      setMineras(response.data || []);
    } catch (apiError) {
      console.error("Error loading mineras", apiError);
      setError("No pudimos cargar las mineras.");
      toast.error("Error al obtener las mineras");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMineras();
  }, []);

  const filteredMineras = useMemo(() => {
    const term = search.trim().toLowerCase();

    return mineras.filter((minera) => {
      const nombre = minera.Nombre || minera.nombre || "";
      const razon = minera.RazonSocial || minera.razonSocial || "";
      const cuit = minera.CUIT || minera.cuit || "";
      const email = minera.EmailContacto || minera.emailContacto || "";

      const matchesTerm = term
        ? [nombre, razon, cuit, email].some(
            (value) =>
              typeof value === "string" && value.toLowerCase().includes(term)
          )
        : true;

      const matchesStatus =
        statusFilter === "todos" ||
        (statusFilter === "activos" && isMineraActive(minera)) ||
        (statusFilter === "inactivos" && !isMineraActive(minera));

      return matchesTerm && matchesStatus;
    });
  }, [mineras, search, statusFilter]);

  const minerasActivas = useMemo(() => {
    return filteredMineras.filter((minera) => isMineraActive(minera)).length;
  }, [filteredMineras]);

  const minerasInactivas = Math.max(0, filteredMineras.length - minerasActivas);

  const openCreateForm = () => {
    setFormMode("create");
    setFormState(buildEmptyFormState());
    setLockedCuit("");
    setFormError("");
    setFormOpen(true);
  };

  const openEditForm = (minera) => {
    setFormMode("edit");
    setFormState({
      mineraId: getMineraId(minera),
      nombre: minera.Nombre || minera.nombre || "",
      razonSocial: minera.RazonSocial || minera.razonSocial || "",
      cuit: minera.CUIT || minera.cuit || "",
      emailContacto: minera.EmailContacto || minera.emailContacto || "",
      telefono: minera.Telefono || minera.telefono || "",
      activo: isMineraActive(minera),
    });
    setLockedCuit(minera.CUIT || minera.cuit || "");
    setFormError("");
    setFormOpen(true);
  };

  const handleRowClick = (minera) => {
    openEditForm(minera);
  };

  const handleFormChange = (field, value) => {
    if (field === "cuit") {
      setFormState((prev) => ({ ...prev, cuit: formatCuitInput(value) }));
      return;
    }

    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const closeForm = () => {
    setFormOpen(false);
    setFormError("");
    setFormState(buildEmptyFormState());
    setLockedCuit("");
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
    const razonSocial = formState.razonSocial.trim();
    const cuit = (formMode === "edit" ? lockedCuit : formState.cuit).trim();
    const emailContacto = formState.emailContacto.trim();
    const telefono = formState.telefono.trim();

    if (!nombre || !razonSocial || !cuit) {
      setFormError("Nombre, razón social y CUIT son obligatorios.");
      return;
    }

    if (cuit.length !== 13) {
      setFormError("El CUIT debe seguir el formato 00-00000000-0.");
      return;
    }

    if (formMode === "edit" && !formState.mineraId) {
      setFormError("No encontramos el identificador de la minera.");
      return;
    }

    const payload = {
      nombre,
      razonSocial,
      cuit,
      emailContacto: normalizeOptional(emailContacto),
      telefono: normalizeOptional(telefono),
      activo: formState.activo,
    };

    setSubmittingForm(true);

    try {
      const response =
        formMode === "create"
          ? await apiService.createMinera(payload)
          : await apiService.updateMinera(formState.mineraId, payload);

      const returnedMinera = response?.data?.minera || null;

      if (returnedMinera) {
        setMineras((prev) => {
          const updatedId = getMineraId(returnedMinera);
          const exists = prev.some((item) => getMineraId(item) === updatedId);
          if (exists) {
            return prev.map((item) =>
              getMineraId(item) === updatedId ? returnedMinera : item
            );
          }
          return [...prev, returnedMinera];
        });
      } else {
        await loadMineras();
      }

      toast.success(
        formMode === "create"
          ? "Minera creada correctamente"
          : "Minera actualizada correctamente"
      );
      closeForm();
    } catch (apiError) {
      console.error("Error saving minera", apiError);
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
          <Title>Gestión de mineras</Title>
          <Subtitle>
            Administre el padrón de compañías habilitadas dentro de la
            plataforma.
          </Subtitle>
        </PageHeader>

        <Controls>
          <SearchInput
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nombre, razón social, CUIT o email"
          />
          <Select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="todos">Todos los estados</option>
            <option value="activos">Solo activas</option>
            <option value="inactivos">Solo inactivas</option>
          </Select>
          <Button onClick={openCreateForm}>Agregar minera</Button>
        </Controls>

        {error && <ErrorBanner>{error}</ErrorBanner>}

        <Card>
          <TableHeader>
            <TableTitle>Mineras</TableTitle>
            <TableSubtitle>
              {`${filteredMineras.length} registros visibles (${minerasActivas} activas, ${minerasInactivas} inactivas)`}
            </TableSubtitle>
          </TableHeader>
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Razón Social</th>
                  <th>CUIT</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Alta</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredMineras.length === 0 ? (
                  <tr>
                    <td colSpan={8}>
                      <EmptyState>
                        {loading
                          ? "Cargando mineras..."
                          : "No encontramos mineras con esos filtros"}
                      </EmptyState>
                    </td>
                  </tr>
                ) : (
                  filteredMineras.map((minera) => {
                    const mineraId = getMineraId(minera);
                    return (
                      <tr
                        key={mineraId}
                        onClick={() => handleRowClick(minera)}
                        style={{ cursor: "pointer" }}
                      >
                        <td>{minera.Nombre || minera.nombre || "-"}</td>
                        <td>
                          {minera.RazonSocial || minera.razonSocial || "-"}
                        </td>
                        <td>{minera.CUIT || minera.cuit || "-"}</td>
                        <td>
                          {minera.EmailContacto || minera.emailContacto || "-"}
                        </td>
                        <td>{minera.Telefono || minera.telefono || "-"}</td>
                        <td>
                          {formatDate(minera.FechaAlta || minera.fechaAlta)}
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
                                openEditForm(minera);
                              }}
                            >
                              Editar
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
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
              {formMode === "create" ? "Agregar minera" : "Editar minera"}
            </ModalTitle>
            <ModalDescription>
              {formMode === "create"
                ? "Complete los datos para agregar una nueva compañía."
                : "Actualice los datos y estado de la minera seleccionada."}
            </ModalDescription>
            <Form onSubmit={handleFormSubmit} autoComplete="off" noValidate>
              {formError && <InlineError>{formError}</InlineError>}
              <FormRow>
                <FormGroup>
                  <FormLabel>Nombre comercial *</FormLabel>
                  <TextInput
                    name="mining-name"
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
                  <FormLabel>Razón social *</FormLabel>
                  <TextInput
                    name="mining-biz-name"
                    autoComplete="off"
                    value={formState.razonSocial}
                    onChange={(event) =>
                      handleFormChange("razonSocial", event.target.value)
                    }
                    placeholder="Razón social"
                    required
                  />
                </FormGroup>
              </FormRow>
              <FormRow>
                <FormGroup>
                  <FormLabel>CUIT *</FormLabel>
                  <TextInput
                    name="mining-cuit"
                    inputMode="numeric"
                    autoComplete="new-password"
                    disabled={formMode === "edit"}
                    value={formState.cuit}
                    onChange={(event) =>
                      handleFormChange("cuit", event.target.value)
                    }
                    placeholder="00-00000000-0"
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <FormLabel>Email de contacto</FormLabel>
                  <TextInput
                    type="email"
                    name="mining-email"
                    autoComplete="off"
                    value={formState.emailContacto}
                    onChange={(event) =>
                      handleFormChange("emailContacto", event.target.value)
                    }
                    placeholder="correo@empresa.com"
                  />
                </FormGroup>
                <FormGroup>
                  <FormLabel>Teléfono</FormLabel>
                  <TextInput
                    name="mining-phone"
                    autoComplete="off"
                    value={formState.telefono}
                    onChange={(event) =>
                      handleFormChange("telefono", event.target.value)
                    }
                    placeholder="Opcional"
                  />
                </FormGroup>
              </FormRow>
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
                    ? "Crear minera"
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

export default AdminMineras;
