import React, { useState } from "react";
import styled from "styled-components";
// import { useAuth } from "../../contexts/AuthContext"; // Currently not used
import { useNavigate } from "react-router-dom";
import { apiService } from "../../services/apiService";
import logoWira from "../../assets/logoWira.png";

const RegisterContainer = styled.div`
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

const RegisterCard = styled.div`
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
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

const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 30px;

  .step {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
    font-weight: bold;
    margin: 0 10px;

    &.active {
      background: linear-gradient(135deg, #fc6b0a 0%, #ff8f42 100%);
      color: white;
    }

    &.completed {
      background: #28a745;
      color: white;
    }

    &.pending {
      background: #e1e5e9;
      color: #666;
    }
  }

  .line {
    width: 40px;
    height: 2px;
    background: #e1e5e9;
    margin-top: 14px;

    &.completed {
      background: #28a745;
    }
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
    border-color: #fc6b0a;
  }

  &::placeholder {
    color: #999;
  }
`;

const Select = styled.select`
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #fc6b0a;
  }
`;

const UserTypeSelector = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin: 20px 0;
`;

const UserTypeCard = styled.div`
  padding: 20px;
  border: 2px solid ${(props) => (props.selected ? "#fc6b0a" : "#e1e5e9")};
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${(props) =>
    props.selected ? "rgba(252, 107, 10, 0.1)" : "white"};

  &:hover {
    border-color: #fc6b0a;
    background: rgba(252, 107, 10, 0.05);
  }

  .icon {
    font-size: 2rem;
    margin-bottom: 10px;
  }

  .title {
    font-weight: 600;
    color: #333;
    margin-bottom: 5px;
  }

  .description {
    font-size: 0.8rem;
    color: #666;
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
  flex: 1;

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

const SecondaryButton = styled(Button)`
  background: #6c757d;
  flex: 0 0 auto;
  padding: 14px 20px;
  font-size: 1rem;
  min-width: 80px;

  &:hover {
    box-shadow: 0 8px 25px rgba(108, 117, 125, 0.3);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 20px;
`;

const ErrorMessage = styled.div`
  background: #fee;
  color: #c33;
  padding: 12px 16px;
  border-radius: 8px;
  border-left: 4px solid #c33;
  font-size: 0.9rem;
`;

const SuccessMessage = styled.div`
  background: #e8f5e8;
  color: #2d5016;
  padding: 12px 16px;
  border-radius: 8px;
  border-left: 4px solid #28a745;
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

const Register = () => {
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [mineras, setMineras] = useState([]);
  const [proveedores, setProveedores] = useState([]);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    nombre: "",
    apellido: "",
    dni: "",
    // Campos para Minera
    mineraId: "",
    // Campos para Proveedor
    proveedorId: "",
  });

  const navigate = useNavigate();

  // Cargar listas de mineras y proveedores
  React.useEffect(() => {
    const loadData = async () => {
      try {
        const [minerasRes, proveedoresRes] = await Promise.all([
          apiService.getMineras(),
          apiService.getProveedores(),
        ]);
        setMineras(minerasRes.data);
        setProveedores(proveedoresRes.data);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleUserTypeSelect = (type) => {
    setUserType(type);
    setError("");
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!userType) {
        setError("Por favor seleccione si es Minera o Proveedor");
        return;
      }
      if (!formData.email) {
        setError("Por favor ingrese su email");
        return;
      }
      setStep(2);
    }
  };

  const handlePrevStep = () => {
    setStep(step - 1);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validaciones
      if (formData.password !== formData.confirmPassword) {
        setError("Las contraseñas no coinciden");
        setLoading(false);
        return;
      }

      if (!formData.nombre.trim()) {
        setError("Por favor ingrese su nombre");
        setLoading(false);
        return;
      }

      if (!formData.apellido.trim()) {
        setError("Por favor ingrese su apellido");
        setLoading(false);
        return;
      }

      if (!formData.dni.trim()) {
        setError("Por favor ingrese su DNI");
        setLoading(false);
        return;
      }

      if (formData.password.length < 6) {
        setError("La contraseña debe tener al menos 6 caracteres");
        setLoading(false);
        return;
      }

      if (userType === "minera" && !formData.mineraId) {
        setError("Por favor seleccione una minera");
        setLoading(false);
        return;
      }

      if (userType === "proveedor" && !formData.proveedorId) {
        setError("Por favor seleccione un proveedor");
        setLoading(false);
        return;
      }

      // Preparar datos para envío
      const registrationData = {
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        nombre: formData.nombre,
        apellido: formData.apellido,
        dni: formData.dni,
        tipoCuenta: userType === "minera" ? "Minera" : "Proveedor",
        ...(userType === "minera"
          ? { mineraID: parseInt(formData.mineraId) }
          : {}),
        ...(userType === "proveedor"
          ? { proveedorID: parseInt(formData.proveedorId) }
          : {}),
      };

      const response = await apiService.register(registrationData);

      if (response.data.success) {
        setSuccess(
          "Cuenta creada exitosamente. Redirigiendo a verificación..."
        );
        // Redirigir a la página de verificación de email
        navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`);
      } else {
        setError(response.data.message || "Error al crear la cuenta");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.errors ||
        "Error al crear la cuenta";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <>
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
        />
      </InputGroup>

      <div>
        <Label>Tipo de usuario</Label>
        <UserTypeSelector>
          <UserTypeCard
            selected={userType === "minera"}
            onClick={() => handleUserTypeSelect("minera")}
          >
            <div className="icon">⛏️</div>
            <div className="title">Minera</div>
            <div className="description">
              Empresa minera que publica licitaciones
            </div>
          </UserTypeCard>

          <UserTypeCard
            selected={userType === "proveedor"}
            onClick={() => handleUserTypeSelect("proveedor")}
          >
            <div className="icon">🏭</div>
            <div className="title">Proveedor</div>
            <div className="description">
              Empresa proveedora que participa en licitaciones
            </div>
          </UserTypeCard>
        </UserTypeSelector>
      </div>

      <Button type="button" onClick={handleNextStep}>
        Continuar
      </Button>
    </>
  );

  const renderStep2 = () => (
    <>
      <InputGroup>
        <Label htmlFor="nombre">Nombre</Label>
        <Input
          type="text"
          id="nombre"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          placeholder="Nombre"
          required
        />
      </InputGroup>

      <InputGroup>
        <Label htmlFor="apellido">Apellido</Label>
        <Input
          type="text"
          id="apellido"
          name="apellido"
          value={formData.apellido}
          onChange={handleChange}
          placeholder="Apellido"
          required
        />
      </InputGroup>

      <InputGroup>
        <Label htmlFor="dni">DNI</Label>
        <Input
          type="text"
          id="dni"
          name="dni"
          value={formData.dni}
          onChange={handleChange}
          placeholder="Ingrese su DNI"
          required
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
          placeholder="Mínimo 6 caracteres"
          required
        />
      </InputGroup>

      <InputGroup>
        <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
        <Input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Repita su contraseña"
          required
        />
      </InputGroup>

      {userType === "minera" && (
        <InputGroup>
          <Label htmlFor="mineraId">Seleccione su minera</Label>
          <Select
            id="mineraId"
            name="mineraId"
            value={formData.mineraId}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione una minera...</option>
            {mineras.map((minera) => (
              <option key={minera.mineraID} value={minera.mineraID}>
                {minera.nombre}
              </option>
            ))}
          </Select>
        </InputGroup>
      )}

      {userType === "proveedor" && (
        <InputGroup>
          <Label htmlFor="proveedorId">Seleccione su empresa</Label>
          <Select
            id="proveedorId"
            name="proveedorId"
            value={formData.proveedorId}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione un proveedor...</option>
            {proveedores.map((proveedor) => (
              <option key={proveedor.proveedorID} value={proveedor.proveedorID}>
                {proveedor.nombre}
              </option>
            ))}
          </Select>
        </InputGroup>
      )}

      <ButtonGroup>
        <SecondaryButton type="button" onClick={handlePrevStep}>
          Atrás
        </SecondaryButton>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <LoadingSpinner />
              <span style={{ marginLeft: "8px" }}>Creando cuenta...</span>
            </>
          ) : (
            "Crear cuenta"
          )}
        </Button>
      </ButtonGroup>
    </>
  );

  return (
    <RegisterContainer>
      <RegisterCard>
        <Logo>
          <img src={logoWira} alt="Wira" />
          <p>Crear nueva cuenta</p>
        </Logo>

        <StepIndicator>
          <div className={step >= 1 ? "step active" : "step pending"}>1</div>
          <div className={step >= 1 ? "line completed" : "line"}></div>
          <div className={step >= 2 ? "step active" : "step pending"}>2</div>
        </StepIndicator>

        <Form onSubmit={handleSubmit}>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && <SuccessMessage>{success}</SuccessMessage>}

          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
        </Form>

        <div style={{ textAlign: "center" }}>
          <LinkButton onClick={() => navigate("/login")}>
            ¿Ya tenés cuenta? Iniciá sesión
          </LinkButton>
        </div>
      </RegisterCard>
    </RegisterContainer>
  );
};

export default Register;
