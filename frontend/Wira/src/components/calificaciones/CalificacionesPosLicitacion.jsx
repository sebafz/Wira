import React, { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../shared/Navbar";
import { useAuth } from "../../contexts/AuthContext";
import apiService from "../../services/apiService";
import { buttonBaseStyles } from "../shared/buttonStyles";
import CalificacionProveedorModal from "./CalificacionProveedorModal";
import { registrarCalificacionPostLicitacion } from "../../services/calificacionesService";

const PageContainer = styled.div`
  min-height: 100vh;
  background: #f8f9fa;
`;

const MainContent = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px 60px;
`;

const PageHeader = styled.header`
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 6px;
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

  /* Responsive: convert table to card-like rows on small screens */
  @media (max-width: 768px) {
    width: 100%;

    thead {
      display: none;
    }

    tbody tr {
      display: block;
      border: 1px solid #e6eef7;
      border-radius: 8px;
      margin-bottom: 12px;
      padding: 8px;
      background: white;
    }

    tbody tr td {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 10px;
      border-bottom: none;
    }

    tbody tr td::before {
      content: attr(data-label) " ";
      font-weight: 700;
      color: #64748b;
      flex: 0 0 45%;
      max-width: 45%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    tbody tr td > * {
      flex: 1 1 auto;
      text-align: right;
    }
  }
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

const LicitacionCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const LicitacionTitle = styled.span`
  font-weight: 700;
  color: #0f172a;
`;

const LicitacionMeta = styled.span`
  font-size: 0.85rem;
  color: #64748b;
`;

const ProveedorCell = styled.div`
  display: flex;
  flex-direction: column;
`;

const ProveedorName = styled.span`
  font-weight: 600;
  color: #0f172a;
`;

const ProveedorMeta = styled.span`
  font-size: 0.85rem;
  color: #475569;
`;

const ValueText = styled.span`
  font-weight: 600;
  color: #0f172a;
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

const EmptyState = styled.div`
  padding: 60px 20px;
  text-align: center;
  color: #475569;
  font-weight: 600;
`;

const ErrorBanner = styled.div`
  border-radius: 10px;
  padding: 12px 16px;
  background: #fee2e2;
  color: #b91c1c;
  margin-bottom: 20px;
`;

const LoadingState = styled.div`
  background: white;
  border-radius: 12px;
  padding: 50px 20px;
  text-align: center;
  border: 1px solid #e2e8f0;
  color: #475569;
`;

const formatDate = (value) => {
  if (!value) return "Sin registro";
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "Fecha invalida";
    }
    return date.toLocaleDateString("es-AR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    return "Fecha invalida";
  }
};

const formatCurrency = (value, currency = "USD") => {
  if (value === null || value === undefined || value === "") {
    return "No definido";
  }
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return value;
  }
  try {
    return numeric.toLocaleString("es-AR", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    });
  } catch (error) {
    return numeric.toLocaleString("es-AR");
  }
};

const formatCurrencyWithSymbol = (value, currency, symbol) => {
  const formatted = formatCurrency(value, currency);
  if (value === null || value === undefined || value === "") {
    return formatted;
  }
  return symbol ? `${formatted} (${symbol})` : formatted;
};

const CalificacionesPosLicitacion = () => {
  const { user, token } = useAuth();
  const [pendientes, setPendientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const getUserMineraID = useCallback(() => {
    if (!user) return null;
    if (user.mineraID !== undefined && user.mineraID !== null) {
      return user.mineraID;
    }
    if (user.mineraId !== undefined && user.mineraId !== null) {
      return user.mineraId;
    }
    if (user.minera?.mineraID !== undefined && user.minera?.mineraID !== null) {
      return user.minera.mineraID;
    }
    if (user.minera?.mineraId !== undefined && user.minera?.mineraId !== null) {
      return user.minera.mineraId;
    }
    return null;
  }, [user]);

  const fetchPendientes = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const mineraId = getUserMineraID();
      if (!mineraId) {
        setPendientes([]);
        return;
      }
      const licitacionesResp = await apiService.get("/licitaciones");
      const data = licitacionesResp.data;
      const adjudicadas = data.filter((licitacion) => {
        const estado = licitacion.estadoNombre;
        const itemMineraId = licitacion.mineraID;
        const isSameMinera = String(itemMineraId) === String(mineraId);
        return estado === "Adjudicada" && isSameMinera;
      });

      const enriched = await Promise.all(
        adjudicadas.map(async (licitacion) => {
          const licitacionId = licitacion.licitacionID;
          if (!licitacionId) {
            return { licitacion, propuestaGanadora: null };
          }

          try {
            const ganadorResponse = await apiService.get(
              `/historial-proveedor-licitacion/licitacion/${licitacionId}/propuesta-ganadora`
            );
            const propuestaGanadora = ganadorResponse.data;
            return { licitacion, propuestaGanadora };
          } catch (innerError) {
            return { licitacion, propuestaGanadora: null };
          }
        })
      );

      const pendientesCalificacion = enriched.filter((item) => {
        return Boolean(item.propuestaGanadora);
      });

      setPendientes(pendientesCalificacion);
    } catch (fetchError) {
      console.error("Error al cargar calificaciones pendientes:", fetchError);
      const message =
        fetchError.message || "No pudimos obtener las licitaciones adjudicadas";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [getUserMineraID]);

  useEffect(() => {
    if (user && token) {
      fetchPendientes();
    }
  }, [user, token, fetchPendientes]);

  const handleOpenModal = (item) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedItem(null);
  };

  const handleSubmitModal = async ({
    puntualidad,
    calidad,
    comunicacion,
    comentarios,
  }) => {
    if (!selectedItem?.licitacion || !selectedItem?.propuestaGanadora) {
      toast.error("Selecciona una licitacion valida");
      return;
    }

    const licitacionId = selectedItem.licitacion.licitacionID;
    const proveedorId = selectedItem.propuestaGanadora.proveedorID;

    if (!licitacionId || !proveedorId) {
      toast.error("No pudimos identificar la licitacion seleccionada");
      return;
    }

    try {
      setSubmitting(true);
      await registrarCalificacionPostLicitacion({
        token,
        licitacionId,
        proveedorId,
        puntualidad,
        calidad,
        comunicacion,
        comentarios,
      });
      toast.success("Calificacion registrada y licitacion cerrada");
      handleCloseModal();
      fetchPendientes();
    } catch (submitError) {
      console.error("Error guardando calificacion:", submitError);
      toast.error(
        submitError.message || "No pudimos registrar la calificacion"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const pendingCount = useMemo(() => pendientes.length, [pendientes]);

  return (
    <PageContainer>
      <Navbar />
      <MainContent>
        <PageHeader>
          <Title>Calificaciones post licitacion</Title>
          <Subtitle>
            Registra la evaluacion final de tus proveedores adjudicados para
            cerrar sus licitaciones.
          </Subtitle>
        </PageHeader>

        {error && <ErrorBanner>{error}</ErrorBanner>}

        <Card>
          <TableHeader>
            <CardTitle>Calificaciones pendientes ({pendingCount})</CardTitle>
            <TableSubtitle>
              Revisa tus licitaciones adjudicadas y califica al proveedor
              ganador para cerrar el proceso.
            </TableSubtitle>
          </TableHeader>
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <th>Licitación</th>
                  <th>Proveedor adjudicado</th>
                  <th>Adjudicada el</th>
                  <th>Presupuesto máximo</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5}>
                      <EmptyState>
                        Cargando licitaciones adjudicadas...
                      </EmptyState>
                    </td>
                  </tr>
                ) : pendingCount === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <EmptyState>
                        No hay calificaciones pendientes. Tus proveedores
                        adjudicados ya fueron evaluados.
                      </EmptyState>
                    </td>
                  </tr>
                ) : (
                  pendientes.map((item) => {
                    const { licitacion, propuestaGanadora } = item;
                    const licitacionId = licitacion.licitacionID;
                    const titulo = licitacion.titulo || "Sin titulo";
                    const proveedorNombre =
                      propuestaGanadora?.proveedorNombre ||
                      "Proveedor sin nombre";
                    const proveedorEmail =
                      propuestaGanadora?.proveedorEmail ||
                      propuestaGanadora?.proveedor?.emailContacto ||
                      "Email no disponible";
                    const historialGanador =
                      propuestaGanadora?.historialGanador || null;
                    const fechaAdjudicacion =
                      historialGanador?.fechaGanador ??
                      historialGanador?.fechaParticipacion ??
                      null;
                    const presupuestoMaximo =
                      licitacion.presupuestoMaximo ?? null;
                    const presupuestoOfrecido =
                      propuestaGanadora?.presupuestoOfrecido ?? null;
                    const monedaCodigo =
                      propuestaGanadora?.monedaCodigo ??
                      licitacion?.moneda?.codigo ??
                      "USD";
                    const monedaSimbolo =
                      propuestaGanadora?.monedaSimbolo ??
                      licitacion?.moneda?.simbolo ??
                      "";
                    const presupuestoParaMostrar =
                      presupuestoOfrecido ?? presupuestoMaximo;
                    const esOfertaProveedor =
                      presupuestoOfrecido !== null &&
                      presupuestoOfrecido !== undefined;
                    const rowKey =
                      licitacionId || `${titulo}-${proveedorNombre}`;

                    return (
                      <tr key={rowKey}>
                        <td data-label="Licitación">
                          <LicitacionCell>
                            <LicitacionTitle>{titulo}</LicitacionTitle>
                          </LicitacionCell>
                        </td>
                        <td data-label="Proveedor adjudicado">
                          <ProveedorCell>
                            <ProveedorName>{proveedorNombre}</ProveedorName>
                            <ProveedorMeta>{proveedorEmail}</ProveedorMeta>
                          </ProveedorCell>
                        </td>
                        <td data-label="Adjudicada el">
                          <ValueText>{formatDate(fechaAdjudicacion)}</ValueText>
                        </td>
                        <td data-label="Presupuesto máximo">
                          <ValueText>
                            {formatCurrencyWithSymbol(
                              presupuestoParaMostrar,
                              monedaCodigo,
                              monedaSimbolo
                            )}
                          </ValueText>
                          {esOfertaProveedor ? (
                            <LicitacionMeta>
                              <br />
                              Oferta del proveedor
                            </LicitacionMeta>
                          ) : (
                            <LicitacionMeta>
                              <br />
                              Presupuesto de la licitación
                            </LicitacionMeta>
                          )}
                        </td>
                        <td data-label="Acción">
                          <PrimaryButton onClick={() => handleOpenModal(item)}>
                            Calificar
                          </PrimaryButton>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </Table>
          </TableWrapper>
        </Card>
      </MainContent>

      <CalificacionProveedorModal
        isOpen={modalOpen}
        licitacionTitulo={selectedItem?.licitacion?.titulo || "Sin titulo"}
        proveedorNombre={
          selectedItem?.propuestaGanadora?.proveedorNombre ||
          "Proveedor sin nombre"
        }
        fechaAdjudicacion={(() => {
          const historial = selectedItem?.propuestaGanadora?.historialGanador;
          return (
            historial?.fechaGanador ?? historial?.fechaParticipacion ?? null
          );
        })()}
        onCancel={handleCloseModal}
        onSubmit={handleSubmitModal}
        isSubmitting={submitting}
      />

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{ zIndex: 9999 }}
      />
    </PageContainer>
  );
};

export default CalificacionesPosLicitacion;
