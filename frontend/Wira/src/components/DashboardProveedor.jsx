import React from "react";
import styled from "styled-components";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

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
`;

const StatNumber = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  color: #fc6b0a;
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  color: #666;
  font-size: 1rem;
`;

const RubroBadge = styled.span`
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  margin-left: 10px;
`;

const DashboardProveedor = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleVerLicitaciones = () => {
    navigate("/licitaciones-activas");
  };

  const getUserName = () => {
    return user?.Nombre || user?.nombre || "Usuario";
  };

  const getCompanyName = () => {
    return (
      user?.Proveedor?.Nombre || user?.proveedor?.nombre || "Empresa Proveedora"
    );
  };

  const getCompanyCUIT = () => {
    return user?.Proveedor?.CUIT || user?.proveedor?.cuit || "";
  };

  const getRubroName = () => {
    return (
      user?.Proveedor?.RubroNombre ||
      user?.proveedor?.rubroNombre ||
      "Sin rubro asignado"
    );
  };

  return (
    <DashboardContainer>
      <Navbar />

      <MainContent>
        <CompanyInfo>
          <WelcomeTitle>Bienvenido, {getUserName()}</WelcomeTitle>
          <WelcomeSubtitle>
            Encuentre y participe en licitaciones que se ajusten a su
            especialidad.
          </WelcomeSubtitle>
          <CompanyName>
            {getCompanyName()}
            <RubroBadge>{getRubroName()}</RubroBadge>
          </CompanyName>
        </CompanyInfo>

        <StatsGrid>
          <StatCard>
            <StatNumber>0</StatNumber>
            <StatLabel>Licitaciones disponibles</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>0</StatNumber>
            <StatLabel>Propuestas enviadas</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>0</StatNumber>
            <StatLabel>En evaluación</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>0</StatNumber>
            <StatLabel>Adjudicaciones ganadas</StatLabel>
          </StatCard>
        </StatsGrid>

        <ActionsSection>
          <ActionCard>
            <ActionIcon>🔍</ActionIcon>
            <ActionTitle>Buscar licitaciones</ActionTitle>
            <ActionDescription>
              Explore las licitaciones disponibles que coincidan con tu rubro y
              especialidad.
            </ActionDescription>
            <ActionButton onClick={handleVerLicitaciones}>
              Ver licitaciones
            </ActionButton>
          </ActionCard>

          <ActionCard>
            <ActionIcon>📋</ActionIcon>
            <ActionTitle>Mis propuestas</ActionTitle>
            <ActionDescription>
              Revise el estado de todas las propuestas que ha enviado y su
              progreso.
            </ActionDescription>
            <ActionButton
              disabled
              style={{ opacity: 0.6, cursor: "not-allowed" }}
            >
              Próximamente
            </ActionButton>
          </ActionCard>

          <ActionCard>
            <ActionIcon>⭐</ActionIcon>
            <ActionTitle>Mi historial</ActionTitle>
            <ActionDescription>
              Consulte tu historial de participaciones y calificaciones
              recibidas.
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

export default DashboardProveedor;
