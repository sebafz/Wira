import React, { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import Navbar from "../shared/Navbar";
import { apiService } from "../../services/apiService";
import { useAuth } from "../../contexts/AuthContext";
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

const Card = styled.section`
  background: white;
  border-radius: 12px;
  border: none;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
`;

const TableHeader = styled.div`
  margin-bottom: 18px;
`;

const CardTitle = styled.h2`
  margin: 0 0 6px;
  font-size: 1.25rem;
  color: #0f172a;
`;

const TableSubtitle = styled.p`
  margin: 0;
  color: #475569;
  font-size: 0.9rem;
`;

const CardActions = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const SecondaryButton = styled.button`
  ${buttonBaseStyles};
  padding: 10px 20px;
  font-size: 0.9rem;
  background: #6c757d;
  color: white;

  &:hover:not(:disabled) {
    background: #5a6268;
  }
`;

const PrimaryButton = styled.button`
  ${buttonBaseStyles};
  padding: 10px 20px;
  font-size: 0.9rem;
  background: #fc6b0a;
  color: white;

  &:hover:not(:disabled) {
    background: #e55a09;
  }
`;

const TableWrapper = styled.div`
  overflow-x: auto;
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

const UserCell = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const NameBlock = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.span`
  font-size: 0.85rem;
  font-weight: 700;
  color: #0f172a;
`;

const SubLabel = styled.span`
  font-size: 0.85rem;
  color: #64748b;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 0.8rem;
  background: ${(props) => props.bg || "#e2e8f0"};
  color: ${(props) => props.color || "#0f172a"};
`;

const EmptyState = styled.div`
  padding: 50px 20px;
  text-align: center;
  color: #94a3b8;
  font-weight: 600;
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 2000;
`;

const ModalCard = styled.div`
  background: white;
  border-radius: 14px;
  width: 100%;
  max-width: 560px;
  padding: 28px;
  box-shadow: 0 30px 60px rgba(15, 23, 42, 0.35);
`;

const ModalTitle = styled.h3`
  margin: 0 0 8px;
  color: #0f172a;
`;

const ModalText = styled.p`
  margin: 0 0 18px;
  color: #475569;
`;

const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 14px;
  font-weight: 700;
  color: #0f172a;
`;

const Select = styled.select`
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 0.95rem;
`;

const TextArea = styled.textarea`
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 12px;
  min-height: 96px;
  font-size: 0.95rem;
  resize: vertical;
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 6px;
`;

const ROLE_GROUPS = {
  MINERA: [
    { value: "MINERA_ADMINISTRADOR", label: "Administrador de minera" },
    { value: "MINERA_USUARIO", label: "Usuario de minera" },
  ],
  PROVEEDOR: [
    { value: "PROVEEDOR_ADMINISTRADOR", label: "Administrador de proveedor" },
    { value: "PROVEEDOR_USUARIO", label: "Usuario de proveedor" },
  ],
};

const AprobacionesUsuarios = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState(null); // "approve" | "reject" | null
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [motivo, setMotivo] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const normalizedRoles = useMemo(() => {
    const rawRoles = Array.isArray(user?.roles)
      ? user.roles
      : Array.isArray(user?.Roles)
      ? user.Roles
      : [];

    return rawRoles
      .filter((role) => typeof role === "string")
      .map((role) => role.trim().toUpperCase());
  }, [user]);

  const hasApprovalRole = useMemo(
    () =>
      normalizedRoles.includes("ADMIN_SISTEMA") ||
      normalizedRoles.includes("MINERA_ADMINISTRADOR") ||
      normalizedRoles.includes("PROVEEDOR_ADMINISTRADOR"),
    [normalizedRoles]
  );

  const empresaTipo = useMemo(() => {
    if (user?.minera || user?.Minera) return "MINERA";
    if (user?.proveedor || user?.Proveedor) return "PROVEEDOR";
    return "";
  }, [user]);

  const approverRoleOptions = useMemo(() => {
    if (empresaTipo === "MINERA" || empresaTipo === "PROVEEDOR") {
      return ROLE_GROUPS[empresaTipo];
    }
    return [];
  }, [empresaTipo]);

  const getRoleOptionsForUser = useCallback(
    (usuario) => {
      const tipo = getEmpresaTipo(usuario);
      if (tipo && ROLE_GROUPS[tipo]) {
        return ROLE_GROUPS[tipo];
      }
      return approverRoleOptions;
    },
    [approverRoleOptions]
  );

  const modalRoleOptions = selectedUser
    ? getRoleOptionsForUser(selectedUser)
    : approverRoleOptions;

  const loadPending = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.getPendingApprovals();
      setPendingUsers(response.data || []);
    } catch (error) {
      console.error("Error al cargar aprobaciones pendientes", error);
      toast.error(
        error.response?.data?.message ||
          "No pudimos cargar las solicitudes de aprobación"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hasApprovalRole) {
      toast.info("No tenés permisos para aprobar usuarios");
      navigate("/dashboard", { replace: true });
      return;
    }

    loadPending();
  }, [hasApprovalRole, loadPending, navigate]);

  const openApprove = (usuario) => {
    const optionsForUser = getRoleOptionsForUser(usuario);
    setSelectedUser(usuario);
    setModalMode("approve");
    setSelectedRole(optionsForUser[0]?.value || "");
    setMotivo("");
  };

  const openReject = (usuario) => {
    setSelectedUser(usuario);
    setModalMode("reject");
    setSelectedRole("");
    setMotivo("");
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedUser(null);
    setSelectedRole("");
    setMotivo("");
  };

  const getUserId = (usuario) => usuario?.usuarioID || usuario?.UsuarioID;
  const getNombre = (usuario) =>
    `${usuario?.nombre || usuario?.Nombre || ""} ${
      usuario?.apellido || usuario?.Apellido || ""
    }`.trim() || "Sin nombre";
  const getEmail = (usuario) => usuario?.email || usuario?.Email || "";
  const getEmpresaNombre = (usuario) =>
    usuario?.empresa?.nombre ||
    usuario?.Empresa?.Nombre ||
    usuario?.empresa?.Nombre ||
    usuario?.Empresa?.nombre ||
    "Empresa";
  const getEmpresaTipo = (usuario) =>
    (
      usuario?.empresa?.tipoEmpresa ||
      usuario?.Empresa?.TipoEmpresa ||
      ""
    ).toUpperCase();
  const getFechaRegistro = (usuario) =>
    usuario?.fechaRegistro || usuario?.FechaRegistro || null;
  const isVerified = (usuario) =>
    usuario?.validadoEmail ?? usuario?.ValidadoEmail ?? false;

  const formatDate = (value) => {
    if (!value) return "-";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "-";
    return parsed.toLocaleDateString();
  };

  const formatEstado = (value) => {
    if (typeof value !== "string") return "-";
    const trimmed = value.trim();
    if (!trimmed) return "-";
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
  };

  const handleApprove = async () => {
    if (!selectedUser || submitting) return;
    if (!selectedRole) {
      toast.warn("Seleccioná un rol para aprobar");
      return;
    }

    try {
      setSubmitting(true);
      await apiService.approveUser(getUserId(selectedUser), [selectedRole]);
      toast.success("Usuario aprobado correctamente");
      await loadPending();
      closeModal();
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "No pudimos aprobar el usuario. Verificá la información.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedUser || submitting) return;

    try {
      setSubmitting(true);
      await apiService.rejectUser(
        getUserId(selectedUser),
        motivo?.trim() || null
      );
      toast.success("Usuario rechazado");
      await loadPending();
      closeModal();
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "No pudimos rechazar el usuario. Intentalo nuevamente.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <Navbar />
      <Content>
        <PageHeader>
          <Title>Solicitudes de aprobación</Title>
          <Subtitle>
            Revisa y aprueba las cuentas con email verificado que esperan un
            rol.
          </Subtitle>
        </PageHeader>

        <Card>
          <TableHeader>
            <CardTitle>Usuarios pendientes</CardTitle>
          </TableHeader>

          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Empresa</th>
                  <th>Estado</th>
                  <th>Registrado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5}>
                      <EmptyState>Cargando solicitudes...</EmptyState>
                    </td>
                  </tr>
                ) : pendingUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <EmptyState>
                        No hay solicitudes pendientes para tu empresa en este
                        momento
                      </EmptyState>
                    </td>
                  </tr>
                ) : (
                  pendingUsers.map((usuario) => (
                    <tr key={getUserId(usuario)}>
                      <td>
                        <UserCell>
                          <NameBlock>
                            <Label>{getNombre(usuario)}</Label>
                            <SubLabel>{getEmail(usuario)}</SubLabel>
                          </NameBlock>
                        </UserCell>
                      </td>
                      <td>
                        <NameBlock>
                          <Label>{getEmpresaNombre(usuario)}</Label>
                          <SubLabel>{getEmpresaTipo(usuario)}</SubLabel>
                        </NameBlock>
                      </td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            flexWrap: "wrap",
                          }}
                        >
                          <Badge bg="#e0f2fe" color="#0369a1">
                            {formatEstado(
                              usuario?.estadoAprobacion ||
                                usuario?.EstadoAprobacion
                            )}
                          </Badge>
                          <Badge
                            bg={isVerified(usuario) ? "#dcfce7" : "#fee2e2"}
                            color={isVerified(usuario) ? "#166534" : "#b91c1c"}
                          >
                            {isVerified(usuario)
                              ? "Email verificado"
                              : "Email pendiente"}
                          </Badge>
                        </div>
                      </td>
                      <td>
                        <SubLabel>
                          {formatDate(getFechaRegistro(usuario))}
                        </SubLabel>
                      </td>
                      <td>
                        <CardActions>
                          <SecondaryButton
                            onClick={() => openReject(usuario)}
                            disabled={submitting}
                          >
                            Rechazar
                          </SecondaryButton>
                          <PrimaryButton
                            onClick={() => openApprove(usuario)}
                            disabled={submitting || !isVerified(usuario)}
                          >
                            Aprobar
                          </PrimaryButton>
                        </CardActions>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </TableWrapper>
        </Card>
      </Content>

      {modalMode && selectedUser && (
        <ModalOverlay>
          <ModalCard>
            <ModalTitle>
              {modalMode === "approve" ? "Aprobar usuario" : "Rechazar usuario"}
            </ModalTitle>
            <ModalText>
              {modalMode === "approve"
                ? "Asigne un rol para habilitar el acceso de este usuario."
                : "Explique (opcional) por qué se rechaza la solicitud."}
            </ModalText>

            {modalMode === "approve" ? (
              <Field>
                Rol a asignar
                <Select
                  value={selectedRole}
                  onChange={(event) => setSelectedRole(event.target.value)}
                >
                  <option value="">Seleccioná un rol</option>
                  {modalRoleOptions.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </Select>
              </Field>
            ) : (
              <Field>
                Motivo (opcional)
                <TextArea
                  value={motivo}
                  onChange={(event) => setMotivo(event.target.value)}
                  maxLength={500}
                  placeholder="Ej: datos incompletos o correo inválido"
                />
              </Field>
            )}

            <Actions>
              <SecondaryButton onClick={closeModal} disabled={submitting}>
                Cancelar
              </SecondaryButton>
              {modalMode === "approve" ? (
                <PrimaryButton onClick={handleApprove} disabled={submitting}>
                  {submitting ? "Guardando..." : "Aprobar"}
                </PrimaryButton>
              ) : (
                <SecondaryButton onClick={handleReject} disabled={submitting}>
                  {submitting ? "Guardando..." : "Rechazar"}
                </SecondaryButton>
              )}
            </Actions>
          </ModalCard>
        </ModalOverlay>
      )}
    </PageContainer>
  );
};

export default AprobacionesUsuarios;
