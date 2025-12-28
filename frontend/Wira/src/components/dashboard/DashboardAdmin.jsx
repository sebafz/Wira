import React from "react";
import styled from "styled-components";
import Navbar from "../shared/Navbar";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const PageContainer = styled.div`
  min-height: 100vh;
  background: #f8f9fa;
`;

const Content = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px 60px;
`;

const HeroCard = styled.section`
  background: linear-gradient(135deg, #0f172a, #1d2671);
  color: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.3);
  margin-bottom: 40px;
`;

const HeroTitle = styled.h1`
  color: white;
  font-size: 2rem;
  margin-bottom: 10px;
`;

const HeroSubtitle = styled.p`
  font-size: 1.1rem;
  margin: 0;
  opacity: 0.9;
`;

const ActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
`;

const ActionCard = styled.article`
  background: white;
  border-radius: 14px;
  padding: 28px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 15px 40px rgba(15, 23, 42, 0.15);
  }
`;

const ActionIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: linear-gradient(135deg, #f4f4f5, #d4d4d8);
  color: #0f172a;
  font-size: 1.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 18px;
`;

const ActionTitle = styled.h3`
  margin: 0 0 8px;
  color: #0f172a;
  font-size: 1.3rem;
`;

const ActionDescription = styled.p`
  margin: 0 0 20px;
  color: #475569;
  line-height: 1.5;
`;

const ActionButton = styled.button`
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  background: #0f172a;
  color: white;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.9;
  }
`;

const DashboardAdmin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const adminActions = [
    {
      title: "Mineras activas",
      description:
        "Visualizá y auditá todas las empresas mineras activas dentro del ecosistema.",
      icon: "⛏️",
      action: () => navigate("/admin/mineras"),
    },
    {
      title: "Proveedores registrados",
      description:
        "Supervisá proveedores habilitados y asegurá el cumplimiento de los requisitos.",
      icon: "🏭",
      action: () => navigate("/admin/proveedores"),
    },
    {
      title: "Gestión de usuarios",
      description:
        "Alta, baja y asignación de roles para todos los usuarios del sistema.",
      icon: "🛠️",
      action: () => navigate("/admin/usuarios"),
    },
  ];

  const getDisplayName = () => {
    const nombre = user?.nombre || user?.Nombre;
    const apellido = user?.apellido || user?.Apellido;
    return [nombre, apellido].filter(Boolean).join(" ") || "Administrador";
  };

  return (
    <PageContainer>
      <Navbar />
      <Content>
        <HeroCard>
          <HeroTitle>Panel de administración</HeroTitle>
          <HeroSubtitle>
            Hola {getDisplayName()}, desde este panel podés orquestar las
            entidades críticas del ecosistema Wira.
          </HeroSubtitle>
        </HeroCard>

        <ActionsGrid>
          {adminActions.map((action) => (
            <ActionCard key={action.title} onClick={action.action}>
              <ActionIcon>{action.icon}</ActionIcon>
              <ActionTitle>{action.title}</ActionTitle>
              <ActionDescription>{action.description}</ActionDescription>
              <ActionButton>Ir a {action.title.toLowerCase()}</ActionButton>
            </ActionCard>
          ))}
        </ActionsGrid>
      </Content>
    </PageContainer>
  );
};

export default DashboardAdmin;
