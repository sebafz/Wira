import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiService } from "../../services/apiService";

const VerificationContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
`;

const VerificationCard = styled.div`
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
  text-align: center;
`;

const Icon = styled.div`
  font-size: 4rem;
  margin-bottom: 20px;
  color: #28a745;
`;

const Title = styled.h1`
  color: #333;
  font-size: 2rem;
  margin-bottom: 15px;
`;

const Message = styled.p`
  color: #666;
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 30px;
`;

const EmailHighlight = styled.span`
  background: #e8f5e8;
  color: #2d5016;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 600;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 30px;
`;

const Button = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 14px 20px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

const SecondaryButton = styled(Button)`
  background: #6c757d;

  &:hover {
    box-shadow: 0 8px 25px rgba(108, 117, 125, 0.3);
  }
`;

const InfoBox = styled.div`
  background: #f8f9fa;
  border-left: 4px solid #667eea;
  padding: 20px;
  margin: 20px 0;
  border-radius: 4px;
  text-align: left;

  h3 {
    color: #333;
    margin: 0 0 10px 0;
    font-size: 1.1rem;
  }

  ul {
    margin: 10px 0;
    padding-left: 20px;
  }

  li {
    color: #666;
    margin: 5px 0;
  }
`;

const EmailVerification = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "su correo electrónico";
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleGoToLogin = () => {
    navigate("/login");
  };

  const handleResendEmail = async () => {
    if (!email || email === "su correo electrónico") {
      setMessage("Email no válido para reenvío");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await apiService.resendVerificationEmail(email);

      if (response.data.success) {
        setMessage(
          "Email de verificación reenviado exitosamente. Revise su bandeja de entrada."
        );
      } else {
        setMessage(response.data.message || "Error reenviando el email");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Error reenviando el email de verificación";
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <VerificationContainer>
      <VerificationCard>
        <Icon>✉️</Icon>

        <Title>¡Cuenta Creada Exitosamente!</Title>

        <Message>
          Hemos enviado un email de verificación a{" "}
          <EmailHighlight>{email}</EmailHighlight>. Por favor revise su bandeja
          de entrada y haga clic en el enlace de verificación para activar su
          cuenta.
        </Message>

        <InfoBox>
          <h3>Próximos pasos:</h3>
          <ul>
            <li>Revise su bandeja de entrada de correo electrónico</li>
            <li>Si no encuentra el email, revise la carpeta de spam</li>
            <li>Haga clic en el enlace de verificación del email</li>
            <li>Una vez verificado, podrá iniciar sesión normalmente</li>
          </ul>
        </InfoBox>

        {message && (
          <div
            style={{
              background: message.includes("exitosamente") ? "#e8f5e8" : "#fee",
              color: message.includes("exitosamente") ? "#2d5016" : "#c33",
              padding: "12px 16px",
              borderRadius: "8px",
              borderLeft: `4px solid ${
                message.includes("exitosamente") ? "#28a745" : "#c33"
              }`,
              fontSize: "0.9rem",
              margin: "15px 0",
            }}
          >
            {message}
          </div>
        )}

        <ButtonGroup>
          <Button onClick={handleGoToLogin}>Ir al Inicio de Sesión</Button>

          <SecondaryButton onClick={handleResendEmail} disabled={loading}>
            {loading ? "Reenviando..." : "Reenviar Email de Verificación"}
          </SecondaryButton>
        </ButtonGroup>
      </VerificationCard>
    </VerificationContainer>
  );
};

export default EmailVerification;
