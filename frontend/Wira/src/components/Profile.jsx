import React, { useState } from "react";
import styled from "styled-components";
import { useAuth } from "../contexts/AuthContext";
import { apiService } from "../services/apiService";
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
  background: linear-gradient(135deg, #fc6b0a 0%, #ff8f42 100%);
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
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .value {
    font-size: 1.1rem;
    color: #333;
    font-weight: 500;
  }
`;

const EditableField = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const EditInput = styled.input`
  font-size: 1.1rem;
  color: #333;
  font-weight: 500;
  border: 2px solid #fc6b0a;
  border-radius: 6px;
  padding: 8px 12px;
  background: white;
  width: 100%;

  &:focus {
    outline: none;
    border-color: #ff8f42;
    box-shadow: 0 0 0 3px rgba(252, 107, 10, 0.1);
  }
`;

const EditButton = styled.button`
  background: none;
  border: none;
  color: #fc6b0a;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(252, 107, 10, 0.1);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const SaveButton = styled.button`
  background: #28a745;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: #218838;
  }

  &:disabled {
    background: #6c757d;
    cursor: not-allowed;
  }
`;

const CancelButton = styled.button`
  background: #6c757d;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: #5a6268;
  }
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  font-size: 0.9rem;
  margin-top: 5px;
`;

const SuccessMessage = styled.div`
  color: #28a745;
  font-size: 0.9rem;
  margin-top: 5px;
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
  const { user, updateUser } = useAuth();

  // Estado para la edición del nombre
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  // Inicializar el nombre editado cuando se inicia la edición
  const handleStartEdit = () => {
    setEditedName(user?.Nombre || user?.nombre || "");
    setIsEditingName(true);
    setSaveError("");
    setSaveSuccess("");
  };

  // Cancelar edición
  const handleCancelEdit = () => {
    setIsEditingName(false);
    setEditedName("");
    setSaveError("");
    setSaveSuccess("");
  };

  // Guardar cambios
  const handleSaveName = async () => {
    if (!editedName.trim()) {
      setSaveError("El nombre no puede estar vacío");
      return;
    }

    if (editedName.trim() === (user?.Nombre || user?.nombre)) {
      // No hay cambios
      handleCancelEdit();
      return;
    }

    setSaveLoading(true);
    setSaveError("");

    try {
      // Llamada al API para actualizar el perfil
      const response = await apiService.updateProfile({
        Nombre: editedName.trim(),
      });

      if (response.data.success) {
        // Actualizar el contexto de usuario
        await updateUser({
          ...user,
          Nombre: editedName.trim(),
          nombre: editedName.trim(), // Mantener compatibilidad
        });

        setSaveSuccess("Nombre actualizado correctamente");
        setIsEditingName(false);

        // Limpiar mensaje de éxito después de 3 segundos
        setTimeout(() => setSaveSuccess(""), 3000);
      } else {
        setSaveError(response.data.message || "Error al actualizar el nombre");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error al actualizar el nombre";
      setSaveError(errorMessage);
    } finally {
      setSaveLoading(false);
    }
  };

  const getUserInitials = () => {
    const nombre = user?.Nombre || user?.nombre;
    if (!nombre) return "U";
    return nombre
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
        type: "Información de la minera",
        name: user.minera.nombre,
        cuit: user.minera.cuit,
      };
    }
    if (user?.proveedor) {
      return {
        type: "Información del proveedor",
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
            <ProfileName>
              {user?.Nombre || user?.nombre || "Usuario"}
            </ProfileName>
            <ProfileRole>{getUserRole()}</ProfileRole>
          </ProfileHeader>

          <ProfileBody>
            <Section>
              <SectionTitle>Información personal</SectionTitle>
              <InfoGrid>
                <InfoItem>
                  <div className="label">
                    Nombre completo
                    {!isEditingName && (
                      <EditButton
                        onClick={handleStartEdit}
                        title="Editar nombre"
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                        </svg>
                      </EditButton>
                    )}
                  </div>
                  {isEditingName ? (
                    <div>
                      <EditableField>
                        <EditInput
                          type="text"
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          placeholder="Ingrese su nombre completo"
                          disabled={saveLoading}
                        />
                        <SaveButton
                          onClick={handleSaveName}
                          disabled={saveLoading}
                        >
                          {saveLoading ? "..." : "✓"}
                        </SaveButton>
                        <CancelButton
                          onClick={handleCancelEdit}
                          disabled={saveLoading}
                        >
                          ✕
                        </CancelButton>
                      </EditableField>
                      {saveError && <ErrorMessage>{saveError}</ErrorMessage>}
                      {saveSuccess && (
                        <SuccessMessage>{saveSuccess}</SuccessMessage>
                      )}
                    </div>
                  ) : (
                    <div className="value">
                      {user?.Nombre || user?.nombre || "No disponible"}
                    </div>
                  )}
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
              </InfoGrid>
            </Section>

            {companyInfo && (
              <Section>
                <SectionTitle>{companyInfo.type}</SectionTitle>
                <InfoGrid>
                  <InfoItem>
                    <div className="label">Nombre de la empresa</div>
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
