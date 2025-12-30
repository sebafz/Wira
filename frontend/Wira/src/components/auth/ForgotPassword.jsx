import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import logoWira from "../../assets/logoWira.png";

const ForgotPasswordContainer = styled.div`
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

const ForgotPasswordCard = styled.div`
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: 30px;

  img {
    height: 60px;
    margin-bottom: 5px;
  }

  p {
    color: #666;
    margin: 5px 0 0 0;
    font-size: 0.9rem;
  }
`;

const Title = styled.h1`
  color: #333;
  font-size: 1.8rem;
  margin-bottom: 15px;
  background: linear-gradient(135deg, #fc6b0a 0%, #ff8f42 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Description = styled.p`
  color: #666;
  font-size: 1rem;
  line-height: 1.5;
  margin-bottom: 30px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  text-align: left;
`;

const Label = styled.label`
  color: #333;
  font-weight: 500;
  font-size: 0.9rem;
`;

const Input = styled.input`
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #fc6b0a;
  }

  &::placeholder {
    color: #999;
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

const LinkButton = styled.button`
  background: none;
  border: none;
  color: #667eea;
  cursor: pointer;
  text-decoration: underline;
  font-size: 0.9rem;
  margin-top: 15px;

  &:hover {
    color: #5a6fd8;
  }
`;

const SuccessMessage = styled.div`
  background: #e8f5e8;
  color: #2d5016;
  padding: 12px 16px;
  border-radius: 8px;
  border-left: 4px solid #28a745;
  font-size: 0.9rem;
  margin: 15px 0;
  text-align: left;
`;

const ErrorMessage = styled.div`
  background: #fee;
  color: #c33;
  padding: 12px 16px;
  border-radius: 8px;
  border-left: 4px solid #c33;
  font-size: 0.9rem;
  margin: 15px 0;
  text-align: left;
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

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError("Por favor ingrese su email");
      return;
    }

    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Por favor ingrese un email válido");
      return;
    }

    setLoading(true);
    setError("");

    // Simular envío de email (2 segundos de carga)
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 2000);
  };

  if (success) {
    return (
      <ForgotPasswordContainer>
        <ForgotPasswordCard>
          <Logo>
            <img src={logoWira} alt="Wira" />
            <p>Restablecer contraseña</p>
          </Logo>

          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <div
              style={{
                fontSize: "4rem",
                marginBottom: "20px",
                color: "#28a745",
              }}
            >
              ✅
            </div>
            <Title>¡Email enviado!</Title>
            <Description>
              Hemos enviado las instrucciones para restablecer su contraseña a{" "}
              <strong>{email}</strong>
            </Description>
          </div>

          <SuccessMessage>
            <strong>Próximos pasos:</strong>
            <br />
            • Revise su bandeja de entrada
            <br />
            • Siga las instrucciones del email
            <br />• Si no lo encuentra, revise la carpeta de spam
          </SuccessMessage>

          <Button onClick={() => navigate("/login")}>
            Volver al inicio de sesión
          </Button>

          <div style={{ textAlign: "center" }}>
            <LinkButton onClick={() => setSuccess(false)}>
              ¿No recibió el email? Intente de nuevo
            </LinkButton>
          </div>
        </ForgotPasswordCard>
      </ForgotPasswordContainer>
    );
  }

  return (
    <ForgotPasswordContainer>
      <ForgotPasswordCard>
        <Logo>
          <img src={logoWira} alt="Wira" />
          <p>Restablecer contraseña</p>
        </Logo>

        <Title>¿Olvidó su contraseña?</Title>
        <Description>
          No se preocupe. Ingrese su email y le enviaremos las instrucciones
          para restablecer su contraseña.
        </Description>

        <Form onSubmit={handleSubmit}>
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <InputGroup>
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ejemplo@email.com"
              required
              disabled={loading}
            />
          </InputGroup>

          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <LoadingSpinner />
                <span style={{ marginLeft: "8px" }}>Enviando...</span>
              </>
            ) : (
              "Enviar instrucciones"
            )}
          </Button>
        </Form>

        <div style={{ textAlign: "center" }}>
          <LinkButton onClick={() => navigate("/login")}>
            Volver al inicio de sesión
          </LinkButton>
        </div>
      </ForgotPasswordCard>
    </ForgotPasswordContainer>
  );
};

export default ForgotPassword;
