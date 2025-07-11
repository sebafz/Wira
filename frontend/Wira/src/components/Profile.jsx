import React from "react";
import styled from "styled-components";
import { useAuth } from "../contexts/AuthContext";
import Navbar from "./Navbar";

const ProfileContainer = styled.div`
  min-height: 100vh;
  background: #f8f9fa;
`;

const MainContent = styled.main`
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const ProfileCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
`;

const ProfileHeader = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
  text-align: center;
`;

const ProfileAvatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  margin: 0 auto 15px;
  border: 3px solid rgba(255, 255, 255, 0.3);
`;

const ProfileName = styled.h1`
  margin: 0 0 5px 0;
  font-size: 1.8rem;
  font-weight: 600;
`;

const ProfileRole = styled.p`
  margin: 0;
  font-size: 1rem;
  opacity: 0.9;
`;

const ProfileBody = styled.div`
  padding: 30px;
`;

const Section = styled.div`
  margin-bottom: 30px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h2`
  color: #333;
  font-size: 1.3rem;
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e1e5e9;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
`;

const InfoItem = styled.div`
  .label {
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 5px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .value {
    font-size: 1.1rem;
    color: #333;
    font-weight: 500;
  }
`;

const Badge = styled.span`
  display: inline-block;
  background: ${(props) => {
    switch (props.type) {
      case "verified":
        return "#28a745";
      case "unverified":
        return "#ffc107";
      default:
        return "#6c757d";
    }
  }};
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  margin-left: 10px;
`;

const BackButton = styled.button`
  background: #6c757d;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  margin-bottom: 20px;

  &:hover {
    background: #5a6268;
  }
`;

const Profile = () => {
  const { user } = useAuth();

  const getUserInitials = () => {
    if (!user?.nombre) return "U";
    return user.nombre
      .split(" ")
      .map((name) => name.charAt(0))
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const getUserRole = () => {
    if (!user?.roles || user.roles.length === 0) return "Usuario";
    return user.roles.join(", ");
  };

  const getCompanyInfo = () => {
    if (user?.minera) {
      return {
        type: "Información de la Minera",
        name: user.minera.nombre,
        cuit: user.minera.cuit,
      };
    }
    if (user?.proveedor) {
      return {
        type: "Información del Proveedor",
        name: user.proveedor.nombre,
        cuit: user.proveedor.cuit,
        specialty: user.proveedor.especialidad,
      };
    }
    return null;
  };

  const companyInfo = getCompanyInfo();

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <ProfileContainer>
      <Navbar />

      <MainContent>
        <BackButton onClick={handleGoBack}>← Volver</BackButton>

        <ProfileCard>
          <ProfileHeader>
            <ProfileAvatar>{getUserInitials()}</ProfileAvatar>
            <ProfileName>{user?.nombre || "Usuario"}</ProfileName>
            <ProfileRole>{getUserRole()}</ProfileRole>
          </ProfileHeader>

          <ProfileBody>
            <Section>
              <SectionTitle>Información Personal</SectionTitle>
              <InfoGrid>
                <InfoItem>
                  <div className="label">Nombre Completo</div>
                  <div className="value">{user?.nombre || "No disponible"}</div>
                </InfoItem>
                <InfoItem>
                  <div className="label">Email</div>
                  <div className="value">
                    {user?.email || "No disponible"}
                    <Badge
                      type={user?.validadoEmail ? "verified" : "unverified"}
                    >
                      {user?.validadoEmail ? "Verificado" : "No verificado"}
                    </Badge>
                  </div>
                </InfoItem>
                <InfoItem>
                  <div className="label">ID de Usuario</div>
                  <div className="value">
                    {user?.usuarioID || "No disponible"}
                  </div>
                </InfoItem>
                <InfoItem>
                  <div className="label">Roles</div>
                  <div className="value">{getUserRole()}</div>
                </InfoItem>
              </InfoGrid>
            </Section>

            {companyInfo && (
              <Section>
                <SectionTitle>{companyInfo.type}</SectionTitle>
                <InfoGrid>
                  <InfoItem>
                    <div className="label">Nombre de la Empresa</div>
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
                </InfoGrid>
              </Section>
            )}
          </ProfileBody>
        </ProfileCard>
      </MainContent>
    </ProfileContainer>
  );
};

export default Profile;
