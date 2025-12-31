import React, { useState, useEffect, useCallback, useMemo } from "react";
import styled from "styled-components";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../shared/Navbar";
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
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 30px;
`;

const ActionCard = styled.article`
  background: white;
  border-radius: 14px;
  padding: 28px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
  transition: transform 0.25s ease, box-shadow 0.25s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 15px 40px rgba(15, 23, 42, 0.15);
  }
`;

const ActionIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: linear-gradient(135deg, #f97316, #fb923c);
  color: white;
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
  background: #fb6b0a;
  color: white;
  transition: background 0.2s ease;

  &:hover {
    background: #ff8740;
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

const RubroBadge = styled.span`
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  margin-left: 10px;
`;

const DashboardProveedor = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [kpis, setKpis] = useState({
    licitacionesDisponibles: 0,
    propuestasEnviadas: 0,
    propuestasEnEvaluacion: 0,
    adjudicacionesGanadas: 0,
  });
  const [loading, setLoading] = useState(true);

  const isEmpresaAdmin = useMemo(() => {
    const rawRoles = Array.isArray(user?.roles)
      ? user.roles
      : Array.isArray(user?.Roles)
      ? user.Roles
      : [];

    return rawRoles
      .filter((role) => typeof role === "string")
      .map((role) => role.trim().toUpperCase())
      .includes("PROVEEDOR_ADMINISTRADOR");
  }, [user]);

  const fetchKpis = useCallback(async () => {
    try {
      setLoading(true);
      const proveedorId = user?.proveedor?.proveedorID;

      if (!proveedorId) {
        console.error("No proveedorID found in user:", user);
        setLoading(false);
        return;
      }

      const response = await fetch(
        `http://localhost:5242/api/dashboard/proveedor/${proveedorId}/kpis`,
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
  }, [user?.proveedor?.proveedorID, token]);

  useEffect(() => {
    if (user?.proveedor?.proveedorID) {
      fetchKpis();
    }
  }, [user?.proveedor?.proveedorID, fetchKpis]);

  const handleVerLicitaciones = () => {
    navigate("/licitaciones-activas");
  };

  const handleVerPropuestas = () => {
    navigate("/propuestas-proveedor");
  };

  const handleVerHistorial = () => {
    navigate("/historial-proveedor");
  };

  const getUserName = () => {
    return user?.Nombre || user?.nombre || "Usuario";
  };

  const getCompanyName = () => {
    return (
      user?.Proveedor?.Nombre || user?.proveedor?.nombre || "Empresa Proveedora"
    );
  };

  // const getCompanyCUIT = () => {
  //   return user?.Proveedor?.CUIT || user?.proveedor?.cuit || "";
  // };

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
          <StatCard color="#fc6b0a">
            <StatNumber color="#fc6b0a">
              {loading ? "..." : kpis.licitacionesDisponibles}
            </StatNumber>
            <StatLabel>Licitaciones disponibles</StatLabel>
          </StatCard>
          <StatCard color="#28a745">
            <StatNumber color="#28a745">
              {loading ? "..." : kpis.propuestasEnviadas}
            </StatNumber>
            <StatLabel>Propuestas enviadas</StatLabel>
          </StatCard>
          <StatCard color="#ffc107">
            <StatNumber color="#ffc107">
              {loading ? "..." : kpis.propuestasEnEvaluacion}
            </StatNumber>
            <StatLabel>En evaluación</StatLabel>
          </StatCard>
          <StatCard color="#17a2b8">
            <StatNumber color="#17a2b8">
              {loading ? "..." : kpis.adjudicacionesGanadas}
            </StatNumber>
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
            <ActionButton onClick={handleVerPropuestas}>
              Ver mis propuestas
            </ActionButton>
          </ActionCard>

          <ActionCard>
            <ActionIcon>⭐</ActionIcon>
            <ActionTitle>Mi historial</ActionTitle>
            <ActionDescription>
              Consulte tu historial de participaciones y calificaciones
              recibidas.
            </ActionDescription>
            <ActionButton onClick={handleVerHistorial}>
              Ver mi historial
            </ActionButton>
          </ActionCard>
        </ActionsSection>
      </MainContent>
    </DashboardContainer>
  );
};

export default DashboardProveedor;
