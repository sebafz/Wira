import React from "react";
import styled from "styled-components";
import { useAuth } from "../contexts/AuthContext";
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
  color: #333;
  font-size: 2rem;
  margin-bottom: 10px;
  background: linear-gradient(135deg, #fc6b0a 0%, #ff8f42 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const WelcomeSubtitle = styled.p`
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 20px;
`;

const UserCard = styled.div`
  background: linear-gradient(135deg, #fc6b0a 0%, #ff8f42 100%);
  color: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(252, 107, 10, 0.3);
`;

const UserCardTitle = styled.h3`
  margin: 0 0 15px 0;
  font-size: 1.3rem;
  font-weight: 600;
`;

const UserInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
`;

const InfoItem = styled.div`
  .label {
    font-size: 0.9rem;
    opacity: 0.9;
    margin-bottom: 3px;
  }

  .value {
    font-size: 1.1rem;
    font-weight: 600;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 30px;
`;

const StatCard = styled.div`
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
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
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const PlaceholderSection = styled.div`
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  text-align: center;
  margin-top: 30px;
`;

const PlaceholderTitle = styled.h2`
  color: #333;
  margin-bottom: 15px;
`;

const PlaceholderText = styled.p`
  color: #666;
  font-size: 1.1rem;
  line-height: 1.6;
`;

const Dashboard = () => {
  const { user } = useAuth();

  const getUserRole = () => {
    if (!user?.roles || user.roles.length === 0) return "Usuario";
    return user.roles.join(", ");
  };

  const getCompanyInfo = () => {
    if (user?.minera) {
      return {
        type: "Minera",
        name: user.minera.nombre,
        cuit: user.minera.cuit,
      };
    }
    if (user?.proveedor) {
      return {
        type: "Proveedor",
        name: user.proveedor.nombre,
        cuit: user.proveedor.cuit,
        specialty: user.proveedor.especialidad,
      };
    }
    return null;
  };

  const companyInfo = getCompanyInfo();

  return (
    <DashboardContainer>
      <Navbar />

      <MainContent>
        <WelcomeSection>
          <WelcomeTitle>¡Bienvenido a Wira!</WelcomeTitle>
          <WelcomeSubtitle>
            Sistema de Gestión de Licitaciones para la Industria Minera
          </WelcomeSubtitle>

          <UserCard>
            <UserCardTitle>Información del Usuario</UserCardTitle>
            <UserInfo>
              <InfoItem>
                <div className="label">Nombre</div>
                <div className="value">{user?.nombre || "No disponible"}</div>
              </InfoItem>
              <InfoItem>
                <div className="label">Email</div>
                <div className="value">{user?.email || "No disponible"}</div>
              </InfoItem>
              <InfoItem>
                <div className="label">Rol</div>
                <div className="value">{getUserRole()}</div>
              </InfoItem>
              {companyInfo && (
                <>
                  <InfoItem>
                    <div className="label">{companyInfo.type}</div>
                    <div className="value">{companyInfo.name}</div>
                  </InfoItem>
                  <InfoItem>
                    <div className="label">CUIT</div>
                    <div className="value">{companyInfo.cuit}</div>
                  </InfoItem>
                  {companyInfo.specialty && (
                    <InfoItem>
                      <div className="label">Especialidad</div>
                      <div className="value">{companyInfo.specialty}</div>
                    </InfoItem>
                  )}
                </>
              )}
            </UserInfo>
          </UserCard>
        </WelcomeSection>

        <StatsGrid>
          <StatCard color="#28a745">
            <StatNumber color="#28a745">0</StatNumber>
            <StatLabel>Licitaciones Activas</StatLabel>
          </StatCard>

          <StatCard color="#ffc107">
            <StatNumber color="#ffc107">0</StatNumber>
            <StatLabel>Propuestas Enviadas</StatLabel>
          </StatCard>

          <StatCard color="#17a2b8">
            <StatNumber color="#17a2b8">0</StatNumber>
            <StatLabel>Proyectos en Curso</StatLabel>
          </StatCard>

          <StatCard color="#dc3545">
            <StatNumber color="#dc3545">0</StatNumber>
            <StatLabel>Notificaciones</StatLabel>
          </StatCard>
        </StatsGrid>

        <PlaceholderSection>
          <PlaceholderTitle>Dashboard en Desarrollo</PlaceholderTitle>
          <PlaceholderText>
            Esta página será desarrollada con más funcionalidades en futuras
            iteraciones. Aquí se mostrarán gráficos, estadísticas detalladas,
            accesos rápidos a las funciones principales del sistema y
            notificaciones importantes.
          </PlaceholderText>
        </PlaceholderSection>
      </MainContent>
    </DashboardContainer>
  );
};

export default Dashboard;
