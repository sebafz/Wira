import React, { useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { getDashboardRouteForUser } from "../../utils/roleUtils";

const LoadingContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
`;

const LoadingSpinner = styled.div`
  width: 50px;
  height: 50px;
  border: 4px solid #e1e5e9;
  border-left: 4px solid #fc6b0a;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.p`
  color: #666;
  margin-top: 20px;
  font-size: 1.1rem;
`;

const DashboardRouter = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      const targetRoute = getDashboardRouteForUser(user);
      navigate(targetRoute, { replace: true });
    } else if (!loading && !user) {
      // Si no está autenticado, redirigir al login
      navigate("/login", { replace: true });
    }
  }, [user, loading, navigate]);

  // Mostrar loading mientras se determina el rol
  return (
    <LoadingContainer>
      <LoadingSpinner />
      <LoadingText>Cargando dashboard...</LoadingText>
    </LoadingContainer>
  );
};

export default DashboardRouter;
