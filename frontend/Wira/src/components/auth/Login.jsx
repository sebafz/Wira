import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import logoWira from "../../assets/logoWira.png";
import { getDashboardRouteForUser } from "../../utils/roleUtils";

const LoginContainer = styled.div`
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

const LoginCard = styled.div`
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
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

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
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
    border-color: #667eea;
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

  &:hover {
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

const ErrorMessage = styled.div`
  background: #fee;
  color: #c33;
  padding: 12px 16px;
  border-radius: 8px;
  border-left: 4px solid #c33;
  font-size: 0.9rem;
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

const LinkButtonSecondary = styled(LinkButton)`
  margin-top: 5px;
`;

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [redirecting, setRedirecting] = useState(false);

  const { login, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  // Limpiar errores cuando el usuario empiece a escribir
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000); // Limpiar error después de 5 segundos

      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Limpiar error cuando el usuario empiece a escribir
    if (error) {
      clearError();
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await login(formData.email, formData.password);

    if (result.success) {
      const targetRoute = getDashboardRouteForUser(result.user);
      navigate(targetRoute, { replace: true });
    } else if (
      result.message &&
      result.message.includes("verificar su email")
    ) {
      // Si el email no está verificado, redirigir a la página de verificación
      setRedirecting(true);
      setTimeout(() => {
        navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`);
      }, 2000); // Esperar 2 segundos para que el usuario vea el mensaje
    }
    // El error se mostrará automáticamente desde el AuthContext
  };

  return (
    <LoginContainer>
      <LoginCard>
        <Logo>
          <img src={logoWira} alt="Wira" />
          <p>Sistema de Licitaciones Mineras</p>
        </Logo>

        <Form onSubmit={handleSubmit}>
          {error && (
            <ErrorMessage>
              {error}
              {(error.includes("verificar su email") || redirecting) && (
                <div style={{ marginTop: "10px", fontSize: "0.9rem" }}>
                  {redirecting
                    ? "Redirigiendo a verificación..."
                    : "Redirigiendo a la página de verificación en 2 segundos..."}
                </div>
              )}
            </ErrorMessage>
          )}

          <InputGroup>
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="ejemplo@email.com"
              required
              disabled={loading || redirecting}
            />
          </InputGroup>

          <InputGroup>
            <Label htmlFor="password">Contraseña</Label>
            <Input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              disabled={loading || redirecting}
            />
          </InputGroup>

          <Button type="submit" disabled={loading || redirecting}>
            {redirecting ? (
              <>
                <LoadingSpinner />
                <span style={{ marginLeft: "8px" }}>Redirigiendo...</span>
              </>
            ) : loading ? (
              <>
                <LoadingSpinner />
                <span style={{ marginLeft: "8px" }}>Iniciando sesión...</span>
              </>
            ) : (
              "Iniciar sesión"
            )}
          </Button>
        </Form>

        <div style={{ textAlign: "center" }}>
          <LinkButton onClick={() => navigate("/forgot-password")}>
            ¿Olvidó su contraseña?
          </LinkButton>
          <br />
          <LinkButtonSecondary onClick={() => navigate("/register")}>
            ¿No tiene cuenta? Créela aquí
          </LinkButtonSecondary>
        </div>
      </LoginCard>
    </LoginContainer>
  );
};

export default Login;
