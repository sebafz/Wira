import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiService } from "../../services/apiService";

const VerifyContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg,
    rgba(252, 107, 10, 0.8) 0%,
    rgba(255, 143, 66, 0.7) 100%
  );
  padding: 20px;
`;

const VerifyCard = styled.div`
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 450px;
  text-align: center;
`;

const Icon = styled.div`
  font-size: 4rem;
  margin-bottom: 20px;
  color: #fc6b0a;
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

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 30px;
`;

const CodeInputContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin: 20px 0;
`;

const CodeInput = styled.input`
  width: 50px;
  height: 60px;
  text-align: center;
  font-size: 1.5rem;
  font-weight: bold;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #fc6b0a;
  }

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &[type="number"] {
    -moz-appearance: textfield;
  }
`;

const Button = styled.button`
  background: linear-gradient(135deg, #fc6b0a 0%, #ff8f42 100%);
  color: white;
  border: none;
  padding: 14px 20px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(252, 107, 10, 0.3);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const SecondaryButton = styled.button`
  background: white;
  border: 1px solid #fc6b0a;
  color: #fc6b0a;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: rgba(252, 107, 10, 0.08);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ResendBox = styled.div`
  margin-top: 16px;
  padding: 12px 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
`;

const ResendLabel = styled.span`
  color: #475569;
  font-size: 0.95rem;
`;

const ApprovalBox = styled.div`
  background: #ecfdf3;
  border: 1px solid #bbf7d0;
  color: #166534;
  padding: 14px 16px;
  border-radius: 10px;
  margin: 12px 0 20px;
  line-height: 1.5;
  font-weight: 600;
`;

const ErrorMessage = styled.div`
  background: #fee;
  color: #c33;
  padding: 12px 16px;
  border-radius: 8px;
  border-left: 4px solid #c33;
  font-size: 0.9rem;
  margin: 15px 0;
`;

const SuccessMessage = styled.div`
  background: #e8f5e8;
  color: #2d5016;
  padding: 12px 16px;
  border-radius: 8px;
  border-left: 4px solid #28a745;
  font-size: 0.9rem;
  margin: 15px 0;
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid #ffffff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s ease-in-out infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [pendingApproval, setPendingApproval] = useState(false);

  // Manejo de inputs del código
  const handleCodeChange = (index, value) => {
    if (!/^\d?$/.test(value)) return; // Solo dígitos

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError("");

    // Auto-focus al siguiente input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Backspace para ir al input anterior
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const verificationCode = code.join("");

    if (verificationCode.length !== 6) {
      setError("Por favor ingrese el código completo de 6 dígitos");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await apiService.verifyEmail(email, verificationCode);

      if (response.data.success) {
        setPendingApproval(true);
        setSuccess(
          "Email verificado. Tu cuenta está pendiente de aprobación y ya avisamos al administrador."
        );
      } else {
        setError(response.data.message || "Código inválido");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error verificando el código";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      setError("Email no válido para reenvío");
      return;
    }

    setResendLoading(true);
    setError("");

    try {
      const response = await apiService.resendVerificationEmail(email);

      if (response.data.success) {
        setSuccess("Nuevo código enviado. Revise su email.");
        setCode(["", "", "", "", "", ""]); // Limpiar código actual

        // Iniciar timer de 60 segundos
        setTimer(60);
        const countdown = setInterval(() => {
          setTimer((prev) => {
            if (prev <= 1) {
              clearInterval(countdown);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setError(response.data.message || "Error reenviando el código");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error reenviando el código";
      setError(errorMessage);
    } finally {
      setResendLoading(false);
    }
  };

  if (!email) {
    return (
      <VerifyContainer>
        <VerifyCard>
          <Icon>❌</Icon>
          <Title>Error</Title>
          <Message>No se encontró el email para verificar.</Message>
          <Button onClick={() => navigate("/register")}>
            Volver al registro
          </Button>
        </VerifyCard>
      </VerifyContainer>
    );
  }

  if (pendingApproval) {
    return (
      <VerifyContainer>
        <VerifyCard>
          <Icon>⏳</Icon>
          <Title>Cuenta en revisión</Title>
          <ApprovalBox>¡Tu email fue verificado correctamente!</ApprovalBox>
          <Message style={{ marginTop: 0 }}>
            Tu cuenta está pendiente de aprobación y ya avisamos al
            administrador. Te notificaremos cuando puedas ingresar.
          </Message>
          <Button onClick={() => navigate("/login")}>
            Volver al inicio de sesión
          </Button>
        </VerifyCard>
      </VerifyContainer>
    );
  }

  return (
    <VerifyContainer>
      <VerifyCard>
        <Icon>📧</Icon>

        <Title>Verificar email</Title>

        <Message>
          Hemos enviado un código de 6 dígitos a{" "}
          <EmailHighlight>{email}</EmailHighlight>. Ingrese el código a
          continuación:
        </Message>

        <Form onSubmit={handleSubmit}>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && <SuccessMessage>{success}</SuccessMessage>}

          <CodeInputContainer>
            {code.map((digit, index) => (
              <CodeInput
                key={index}
                id={`code-${index}`}
                type="number"
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                maxLength={1}
                disabled={loading}
              />
            ))}
          </CodeInputContainer>

          <Button
            type="submit"
            disabled={loading || code.join("").length !== 6}
          >
            {loading ? (
              <>
                <LoadingSpinner />
                <span style={{ marginLeft: "8px" }}>Verificando...</span>
              </>
            ) : (
              "Verificar código"
            )}
          </Button>
        </Form>

        <ResendBox>
          <ResendLabel>
            {timer > 0
              ? `Podrás reenviar en ${timer} segundos`
              : "¿No recibiste el código?"}
          </ResendLabel>
          <SecondaryButton
            onClick={handleResendCode}
            disabled={resendLoading || timer > 0}
          >
            {resendLoading
              ? "Reenviando..."
              : timer > 0
              ? `Reenviar en ${timer}s`
              : "Reenviar código"}
          </SecondaryButton>
        </ResendBox>

        <div style={{ marginTop: "20px" }}>
          <Button
            style={{ background: "#6c757d" }}
            onClick={() => navigate("/login")}
          >
            Volver al inicio de sesión
          </Button>
        </div>
      </VerifyCard>
    </VerifyContainer>
  );
};

export default VerifyEmail;
