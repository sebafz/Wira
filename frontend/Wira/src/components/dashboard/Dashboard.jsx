import React from "react";
import styled from "styled-components";
import { useAuth } from "../../contexts/AuthContext";
import Navbar from "../shared/Navbar";

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

const UserCard = styled.div`
  background: linear-gradient(135deg, #fc6b0a 0%, #ff8f42 100%);
  color: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(252, 107, 10, 0.3);
  margin-bottom: 30px;
`;

const UserCardTitle = styled.h3`
  margin: 0 0 15px 0;
  font-size: 1.3rem;
  font-weight: 600;
`;

const UserInfo = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
`;

const InfoItem = styled.div`
  .label {
    font-size: 0.95rem;
    opacity: 0.9;
    margin-bottom: 6px;
  }

  .value {
    font-size: 1.15rem;
    font-weight: 700;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 30px;
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

  const getUserName = () => {
    return user?.Nombre || user?.nombre || "Usuario";
  };

  return (
    <DashboardContainer>
      <Navbar />

      <MainContent>
        <WelcomeSection>
          <UserCard>
            <WelcomeTitle>Bienvenido, {getUserName()}!</WelcomeTitle>
            <WelcomeSubtitle>
              Parece que su cuenta no tiene roles asignados.
            </WelcomeSubtitle>
            <UserCardTitle>Sin rol asignado</UserCardTitle>
            <UserInfo>
              <InfoItem>
                <div className="label">Atención</div>
                <div className="value">
                  Por favor comuníquese con su organización para solicitar
                  asignación de roles.
                </div>
              </InfoItem>
            </UserInfo>
          </UserCard>
        </WelcomeSection>
      </MainContent>
    </DashboardContainer>
  );
};

export default Dashboard;
