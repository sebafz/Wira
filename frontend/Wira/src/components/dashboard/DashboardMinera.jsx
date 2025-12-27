import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { toast } from "react-toastify";

const DashboardContainer = styled.div`
  min-height: 100vh;
  background: #f8f9fa;
`;

const MainContent = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const WelcomeSection = styled.div`
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 30px;
`;

const WelcomeTitle = styled.h1`
  color: white;
  font-size: 2rem;
  margin-bottom: 10px;
`;

const WelcomeSubtitle = styled.p`
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.1rem;
  margin-bottom: 20px;
`;

const CompanyInfo = styled.div`
  background: linear-gradient(135deg, #fc6b0a 0%, #ff8f42 100%);
  color: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(252, 107, 10, 0.3);
  margin-bottom: 30px;
`;

const CompanyName = styled.h3`
  margin: 0;
  font-size: 1.4rem;
  font-weight: 600;
`;

const CompanyDetail = styled.p`
  margin: 0;
  opacity: 0.9;
  font-size: 1rem;
`;

const ActionsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 30px;
`;

const ActionCard = styled.div`
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  text-align: center;
  border: 2px solid transparent;
  transition: all 0.3s ease;

  &:hover {
    border-color: #fc6b0a;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(252, 107, 10, 0.15);
  }
`;

const ActionIcon = styled.div`
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #fc6b0a 0%, #ff8f42 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  font-size: 1.5rem;
  color: white;
`;

const ActionTitle = styled.h3`
  color: #333;
  font-size: 1.3rem;
  margin-bottom: 10px;
`;

const ActionDescription = styled.p`
  color: #666;
  font-size: 1rem;
  margin-bottom: 20px;
  line-height: 1.5;
`;

const ActionButton = styled.button`
  background: linear-gradient(135deg, #fc6b0a 0%, #ff8f42 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(252, 107, 10, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

const StatsGrid = styled.div`
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

const DashboardMinera = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [kpis, setKpis] = useState({
    licitacionesActivas: 0,
    licitacionesEnEvaluacion: 0,
    propuestasRecibidas: 0,
    adjudicaciones: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchKpis = useCallback(async () => {
    try {
      setLoading(true);
      const mineraId = user?.minera?.mineraID;

      console.log("DashboardMinera - fetchKpis called:", {
        user,
        mineraId,
        token: !!token,
      });

      if (!mineraId) {
        console.error("No mineraID found in user:", user);
        setLoading(false);
        return;
      }

      const response = await fetch(
        `http://localhost:5242/api/dashboard/minera/${mineraId}/kpis`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setKpis(data);
      } else {
        toast.error("Error al cargar estadísticas del dashboard");
      }
    } catch (error) {
      console.error("Error fetching KPIs:", error);
      toast.error("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  }, [user?.minera?.mineraID, token]);

  useEffect(() => {
    if (user?.minera?.mineraID) {
      fetchKpis();
    }
  }, [user?.minera?.mineraID, fetchKpis]);

  const handleCrearLicitacion = () => {
    navigate("/crear-licitacion");
  };

  const handleMisLicitaciones = () => {
    navigate("/mis-licitaciones");
  };

  const getUserName = () => {
    return user?.Nombre || user?.nombre || "Usuario";
  };

  const getCompanyName = () => {
    return user?.Minera?.Nombre || user?.minera?.nombre || "Empresa Minera";
  };

  // const getCompanyCUIT = () => {
  //   return user?.Minera?.CUIT || user?.minera?.cuit || "";
  // };

  return (
    <DashboardContainer>
      <Navbar />

      <MainContent>
        <CompanyInfo>
          <WelcomeTitle>Bienvenido, {getUserName()}</WelcomeTitle>
          <WelcomeSubtitle>
            Gestione las licitaciones de su empresa minera desde acá.
          </WelcomeSubtitle>
          <CompanyName>{getCompanyName()}</CompanyName>
        </CompanyInfo>

        <StatsGrid>
          <StatCard color="#fc6b0a">
            <StatNumber color="#fc6b0a">
              {loading ? "..." : kpis.licitacionesActivas}
            </StatNumber>
            <StatLabel>Licitaciones activas</StatLabel>
          </StatCard>
          <StatCard color="#ffc107">
            <StatNumber color="#ffc107">
              {loading ? "..." : kpis.licitacionesEnEvaluacion}
            </StatNumber>
            <StatLabel>En evaluación</StatLabel>
          </StatCard>
          <StatCard color="#28a745">
            <StatNumber color="#28a745">
              {loading ? "..." : kpis.propuestasRecibidas}
            </StatNumber>
            <StatLabel>Propuestas recibidas</StatLabel>
          </StatCard>
          <StatCard color="#17a2b8">
            <StatNumber color="#17a2b8">
              {loading ? "..." : kpis.adjudicaciones}
            </StatNumber>
            <StatLabel>Adjudicaciones</StatLabel>
          </StatCard>
        </StatsGrid>

        <ActionsSection>
          <ActionCard>
            <ActionIcon>📝</ActionIcon>
            <ActionTitle>Nueva licitación</ActionTitle>
            <ActionDescription>
              Cree una nueva licitación para recibir propuestas de proveedores
              especializados.
            </ActionDescription>
            <ActionButton onClick={handleCrearLicitacion}>
              Crear licitación
            </ActionButton>
          </ActionCard>

          <ActionCard>
            <ActionIcon>📊</ActionIcon>
            <ActionTitle>Mis licitaciones</ActionTitle>
            <ActionDescription>
              Visualice y gestione todas sus licitaciones activas, en evaluación
              y finalizadas.
            </ActionDescription>
            <ActionButton onClick={handleMisLicitaciones}>
              Ver licitaciones
            </ActionButton>
          </ActionCard>

          <ActionCard>
            <ActionIcon>📈</ActionIcon>
            <ActionTitle>Reportes</ActionTitle>
            <ActionDescription>
              Genere reportes detallados sobre el rendimiento de sus procesos de
              licitación.
            </ActionDescription>
            <ActionButton
              disabled
              style={{ opacity: 0.6, cursor: "not-allowed" }}
            >
              Próximamente
            </ActionButton>
          </ActionCard>
        </ActionsSection>
      </MainContent>
    </DashboardContainer>
  );
};

export default DashboardMinera;
