import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { apiService } from "../services/apiService";

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
`;

const Header = styled.h1`
  color: #2c3e50;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2.5rem;
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: 2rem;

  img {
    width: 200px;
    height: auto;
  }
`;

const StatusCard = styled.div`
  background: ${(props) => (props.connected ? "#d4edda" : "#f8d7da")};
  border: 1px solid ${(props) => (props.connected ? "#c3e6cb" : "#f5c6cb")};
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 2rem;
  color: ${(props) => (props.connected ? "#155724" : "#721c24")};
`;

const RolesContainer = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const RoleCard = styled.div`
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const RoleName = styled.h3`
  color: #495057;
  margin: 0;
  font-size: 1.1rem;
`;

const RoleId = styled.span`
  background: #007bff;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: bold;
`;

const LoadingSpinner = styled.div`
  text-align: center;
  padding: 2rem;
  color: #6c757d;
  font-size: 1.1rem;
`;

const ErrorMessage = styled.div`
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
`;

const RolesDisplay = () => {
  const [roles, setRoles] = useState([]);
  const [connection, setConnection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Probar conexión
        const connectionResponse = await apiService.testConnection();
        setConnection(connectionResponse.data);

        // Obtener roles
        const rolesResponse = await apiService.getRoles();
        setRoles(rolesResponse.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Error connecting to API"
        );
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Container>
        <Header>Sistema Wira</Header>
        <LoadingSpinner>Conectando con el servidor...</LoadingSpinner>
      </Container>
    );
  }

  return (
    <Container>
      <Header>Sistema de Licitación Wira</Header>

      <Logo>
        <img
          src="https://res.cloudinary.com/dbkb6ywuz/image/upload/v1752202258/wira2-removebg-preview_aoecda.png"
          alt="Wira Logo"
        />
      </Logo>

      {/* Estado de conexión */}
      {connection && (
        <StatusCard connected={connection.connected}>
          <strong>Estado de conexión:</strong> {connection.message}
          {connection.data && (
            <div style={{ marginTop: "0.5rem" }}>
              <small>
                Roles: {connection.data.roles}, Estados Licitación:{" "}
                {connection.data.estadosLicitacion}, Estados Propuesta:{" "}
                {connection.data.estadosPropuesta}
              </small>
            </div>
          )}
        </StatusCard>
      )}

      {/* Mensaje de error */}
      {error && (
        <ErrorMessage>
          <strong>Error:</strong> {error}
        </ErrorMessage>
      )}

      {/* Lista de roles */}
      {roles.length > 0 && (
        <RolesContainer>
          <h2 style={{ color: "#495057", marginTop: 0 }}>Roles del Sistema</h2>
          {roles.map((role) => (
            <RoleCard key={role.rolID}>
              <RoleName>{role.nombreRol}</RoleName>
              <RoleId>ID: {role.rolID}</RoleId>
            </RoleCard>
          ))}
        </RolesContainer>
      )}
    </Container>
  );
};

export default RolesDisplay;
