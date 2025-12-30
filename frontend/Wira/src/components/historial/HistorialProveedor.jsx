import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { useAuth } from "../../contexts/AuthContext";
// import { useNavigate } from "react-router-dom"; // Currently not used
import Navbar from "../shared/Navbar";
import { toast } from "react-toastify";
import { buttonBaseStyles } from "../shared/buttonStyles";

const Container = styled.div`
  min-height: 100vh;
  background: #f8f9fa;
`;

const MainContent = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const PageHeader = styled.header`
  margin-bottom: 30px;
`;

const PageTitle = styled.h1`
  margin: 0 0 10px;
  font-size: 2.2rem;
  font-weight: 700;
  color: #0f172a;
`;

const PageSubtitle = styled.p`
  margin: 0;
  font-size: 1.1rem;
  color: #475569;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  text-align: center;
  border-left: 4px solid ${(props) => props.color || "#fc6b0a"};
`;

const StatNumber = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  color: ${(props) => props.color || "#fc6b0a"};
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  color: #666;
  font-size: 1rem;
  font-weight: 500;
`;

const FilterContainer = styled.div`
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 25px;
`;

const FilterTitle = styled.h3`
  color: #333;
  margin: 0 0 20px 0;
  font-size: 1.2rem;
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const FilterLabel = styled.label`
  color: #555;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 5px;
`;

const FilterSelect = styled.select`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
  background: white;

  &:focus {
    outline: none;
    border-color: #fc6b0a;
    box-shadow: 0 0 0 2px rgba(252, 107, 10, 0.1);
  }
`;

const FilterInput = styled.input`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;

  &:focus {
    outline: none;
    border-color: #fc6b0a;
    box-shadow: 0 0 0 2px rgba(252, 107, 10, 0.1);
  }
`;

const FilterActions = styled.div`
  display: flex;
  gap: 10px;
`;

const FilterButton = styled.button`
  ${buttonBaseStyles};
  padding: 10px 20px;
  font-size: 0.9rem;
  background: #fc6b0a;
  color: white;

  &:hover:not(:disabled) {
    background: #e55a09;
  }
`;

const ClearButton = styled.button`
  ${buttonBaseStyles};
  padding: 10px 20px;
  font-size: 0.9rem;
  background: #6c757d;
  color: white;

  &:hover:not(:disabled) {
    background: #5a6268;
  }
`;

const HistorialContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
`;

const HistorialHeader = styled.div`
  background: white;
  padding: 20px 25px;
  border-bottom: 1px solid #e9ecef;
`;

const HistorialTitle = styled.h3`
  margin: 0;
  color: #333;
  font-size: 1.3rem;
`;

const HistorialSubtitle = styled.p`
  margin: 5px 0 0 0;
  color: #666;
  font-size: 0.95rem;
`;

const HistorialList = styled.div`
  padding: 0;
`;

const HistorialItem = styled.div`
  padding: 15px 25px;
  border-bottom: 1px solid #e9ecef;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    background: #f8f9fa;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const HistorialItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
  gap: 20px;
`;

const HistorialItemTitle = styled.h4`
  margin: 0;
  color: #333;
  font-size: 1.2rem;
  font-weight: 600;
  flex: 1;
`;

const ResultadoBadge = styled.span`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;

  ${(props) => {
    if (props.ganador === true) {
      return `
        background: #e8f5e8;
        color: #2d5a2d;
        border: 1px solid #d4e6d4;
      `;
    } else if (props.ganador === false) {
      return `
        background: #fae8e8;
        color: #5a2d2d;
        border: 1px solid #e6d4d4;
      `;
    } else {
      return `
        background: #fdf6e3;
        color: #5a4d2d;
        border: 1px solid #f0e6c7;
      `;
    }
  }}
`;

const HistorialItemMeta = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 10px;
`;

const MetaItem = styled.div``;

const MetaLabel = styled.div`
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 3px;
  font-weight: 500;
`;

const MetaValue = styled.div`
  font-size: 0.95rem;
  color: #333;
  font-weight: 600;
`;

const HistorialItemObservaciones = styled.div`
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #fc6b0a;
  margin-top: 15px;
`;

const ObservacionesLabel = styled.div`
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 5px;
  font-weight: 600;
  text-transform: uppercase;
`;

const ObservacionesText = styled.div`
  color: #555;
  line-height: 1.5;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  color: #666;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #fc6b0a;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.div`
  font-size: 1.1rem;
  font-weight: 500;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  color: #666;
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 20px;
  opacity: 0.5;
`;

const EmptyTitle = styled.h3`
  color: #333;
  margin-bottom: 10px;
  font-size: 1.3rem;
`;

const EmptyDescription = styled.p`
  color: #666;
  font-size: 1rem;
  line-height: 1.5;
  max-width: 400px;
`;

const HistorialProveedor = () => {
  const { user, token } = useAuth();
  // const navigate = useNavigate(); // Unused for now

  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filtros, setFiltros] = useState({
    resultado: "",
    ganador: "",
    fechaDesde: "",
    fechaHasta: "",
  });

  const [stats, setStats] = useState({
    totalParticipaciones: 0,
    adjudicacionesGanadas: 0,
    participacionesPerdidas: 0,
    enEvaluacion: 0,
  });

  useEffect(() => {
    console.log("HistorialProveedor useEffect called:", {
      user: !!user,
      token: !!token,
    });
    if (user && token) {
      fetchHistorial();
    }
  }, [user, token]); // Removemos fetchHistorial para evitar dependencia circular

  const fetchHistorial = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const proveedorId =
        user?.proveedor?.proveedorID || user?.Proveedor?.ProveedorID;

      if (!proveedorId) {
        setError("No se pudo obtener el ID del proveedor");
        return;
      }

      const response = await fetch(
        `http://localhost:5242/api/historial-proveedor-licitacion/proveedor/${proveedorId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setHistorial(data);

      // Calcular estadísticas
      const totalParticipaciones = data.length;
      const adjudicacionesGanadas = data.filter(
        (h) => h.ganador === true
      ).length;
      const participacionesPerdidas = data.filter(
        (h) => h.ganador === false
      ).length;
      const enEvaluacion = data.filter(
        (h) => h.ganador === null || h.ganador === undefined
      ).length;

      setStats({
        totalParticipaciones,
        adjudicacionesGanadas,
        participacionesPerdidas,
        enEvaluacion,
      });
    } catch (error) {
      console.error("Error al cargar historial:", error);
      setError("Error al cargar el historial. Por favor, intente nuevamente.");
      toast.error("Error al cargar el historial");
    } finally {
      setLoading(false);
    }
  }, [user, token]); // Simplificamos las dependencias

  const handleFilterChange = (field, value) => {
    setFiltros((prev) => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFiltros({
      resultado: "",
      ganador: "",
      fechaDesde: "",
      fechaHasta: "",
    });
  };

  const applyFilters = () => {
    fetchHistorial(); // Por simplicidad, refetch. En una implementación más avanzada se filtrarían los datos localmente
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No especificada";
    try {
      return new Date(dateString).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return "Fecha inválida";
    }
  };

  const getCompanyName = () => {
    return (
      user?.Proveedor?.Nombre || user?.proveedor?.nombre || "Empresa Proveedora"
    );
  };

  const filteredHistorial = historial.filter((item) => {
    if (filtros.resultado && filtros.resultado !== "") {
      if (filtros.resultado === "GANADOR" && item.ganador !== true)
        return false;
      if (filtros.resultado === "PERDEDOR" && item.ganador !== false)
        return false;
      if (
        filtros.resultado === "EN_EVALUACION" &&
        item.ganador !== null &&
        item.ganador !== undefined
      )
        return false;
    }
    if (filtros.ganador === "true" && item.ganador !== true) return false;
    if (filtros.ganador === "false" && item.ganador !== false) return false;
    if (
      filtros.fechaDesde &&
      new Date(item.fechaParticipacion) < new Date(filtros.fechaDesde)
    )
      return false;
    if (
      filtros.fechaHasta &&
      new Date(item.fechaParticipacion) > new Date(filtros.fechaHasta)
    )
      return false;
    return true;
  });

  return (
    <Container>
      <Navbar />
      <MainContent>
        {/* Header */}
        <PageHeader>
          <PageTitle>Mi historial</PageTitle>
          <PageSubtitle>
            Historial completo de participaciones en licitaciones de{" "}
            {getCompanyName()}
          </PageSubtitle>
        </PageHeader>

        {/* Estadísticas */}
        <StatsContainer>
          <StatCard color="#fc6b0a">
            <StatNumber color="#fc6b0a">
              {stats.totalParticipaciones}
            </StatNumber>
            <StatLabel>Total participaciones</StatLabel>
          </StatCard>
          <StatCard color="#28a745">
            <StatNumber color="#28a745">
              {stats.adjudicacionesGanadas}
            </StatNumber>
            <StatLabel>Adjudicaciones ganadas</StatLabel>
          </StatCard>
          <StatCard color="#dc3545">
            <StatNumber color="#dc3545">
              {stats.participacionesPerdidas}
            </StatNumber>
            <StatLabel>Participaciones perdidas</StatLabel>
          </StatCard>
          <StatCard color="#ffc107">
            <StatNumber color="#ffc107">{stats.enEvaluacion}</StatNumber>
            <StatLabel>En evaluación</StatLabel>
          </StatCard>
        </StatsContainer>

        {/* Filtros */}
        <FilterContainer>
          <FilterTitle>Filtros de búsqueda</FilterTitle>
          <FilterGrid>
            <FilterGroup>
              <FilterLabel>Resultado</FilterLabel>
              <FilterSelect
                value={filtros.resultado}
                onChange={(e) =>
                  handleFilterChange("resultado", e.target.value)
                }
              >
                <option value="">Todos los resultados</option>
                <option value="GANADOR">Ganador</option>
                <option value="PERDEDOR">Perdedor</option>
                <option value="EN_EVALUACION">En evaluación</option>
              </FilterSelect>
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Estado de adjudicación</FilterLabel>
              <FilterSelect
                value={filtros.ganador}
                onChange={(e) => handleFilterChange("ganador", e.target.value)}
              >
                <option value="">Todos</option>
                <option value="true">Adjudicaciones ganadas</option>
                <option value="false">No adjudicadas</option>
              </FilterSelect>
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Fecha desde</FilterLabel>
              <FilterInput
                type="date"
                value={filtros.fechaDesde}
                onChange={(e) =>
                  handleFilterChange("fechaDesde", e.target.value)
                }
              />
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Fecha hasta</FilterLabel>
              <FilterInput
                type="date"
                value={filtros.fechaHasta}
                onChange={(e) =>
                  handleFilterChange("fechaHasta", e.target.value)
                }
              />
            </FilterGroup>
          </FilterGrid>

          <FilterActions>
            <FilterButton onClick={applyFilters}>Aplicar filtros</FilterButton>
            <ClearButton onClick={clearFilters}>Limpiar</ClearButton>
          </FilterActions>
        </FilterContainer>

        {/* Lista de historial */}
        <HistorialContainer>
          <HistorialHeader>
            <HistorialTitle>Historial de participaciones</HistorialTitle>
            <HistorialSubtitle>
              {filteredHistorial.length}{" "}
              {filteredHistorial.length === 1
                ? "participación encontrada"
                : "participaciones encontradas"}
            </HistorialSubtitle>
          </HistorialHeader>

          {loading ? (
            <LoadingContainer>
              <LoadingSpinner />
              <LoadingText>Cargando historial...</LoadingText>
            </LoadingContainer>
          ) : error ? (
            <EmptyState>
              <EmptyIcon>⚠️</EmptyIcon>
              <EmptyTitle>Error al cargar el historial</EmptyTitle>
              <EmptyDescription>{error}</EmptyDescription>
            </EmptyState>
          ) : filteredHistorial.length === 0 ? (
            <EmptyState>
              <EmptyIcon>📋</EmptyIcon>
              <EmptyTitle>No hay participaciones</EmptyTitle>
              <EmptyDescription>
                {historial.length === 0
                  ? "Aún no ha participado en ninguna licitación. ¡Explore las licitaciones disponibles!"
                  : "No se encontraron participaciones que coincidan con los filtros aplicados."}
              </EmptyDescription>
            </EmptyState>
          ) : (
            <HistorialList>
              {filteredHistorial.map((item) => (
                <HistorialItem key={item.historialID}>
                  <HistorialItemHeader>
                    <HistorialItemTitle>
                      {item.licitacionTitulo}
                    </HistorialItemTitle>
                    <ResultadoBadge ganador={item.ganador}>
                      {item.ganador === true
                        ? "Ganador"
                        : item.ganador === false
                        ? "Perdedor"
                        : "En evaluación"}
                    </ResultadoBadge>
                  </HistorialItemHeader>

                  <HistorialItemMeta>
                    <MetaItem>
                      <MetaLabel>Fecha de participación</MetaLabel>
                      <MetaValue>
                        {formatDate(item.fechaParticipacion)}
                      </MetaValue>
                    </MetaItem>
                    <MetaItem>
                      <MetaLabel>Estado</MetaLabel>
                      <MetaValue>
                        {item.ganador === true
                          ? "Adjudicada"
                          : item.ganador === false
                          ? "Perdida"
                          : "En proceso"}
                      </MetaValue>
                    </MetaItem>
                  </HistorialItemMeta>

                  {/* {item.observaciones && (
                    <HistorialItemObservaciones>
                      <ObservacionesLabel>Observaciones</ObservacionesLabel>
                      <ObservacionesText>
                        {item.observaciones}
                      </ObservacionesText>
                    </HistorialItemObservaciones>
                  )} */}
                </HistorialItem>
              ))}
            </HistorialList>
          )}
        </HistorialContainer>
      </MainContent>
    </Container>
  );
};

export default HistorialProveedor;
