import React, { useState, useEffect, useCallback, useMemo } from "react";
import styled from "styled-components";
import { useAuth } from "../../contexts/AuthContext";
import { apiService } from "../../services/apiService";
import Navbar from "../shared/Navbar";
import { buttonBaseStyles } from "../shared/buttonStyles";

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
        return "#d1fae5";
      case "unverified":
        return "#fef3c7";
      default:
        return "#e2e8f0";
    }
  }};
  color: ${(props) => {
    switch (props.type) {
      case "verified":
        return "#15803d";
      case "unverified":
        return "#92400e";
      default:
        return "#475569";
    }
  }};
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 600;
  margin-left: 6px;
`;

const BackButton = styled.button`
  background: #6c757d;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 20px;

  &:hover {
    background: #5a6268;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ProjectsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const ProjectCard = styled.div`
  margin-bottom: 5px;
  border-width: 1px;
  border-style: solid;
  border-color: #e1e5e9;
  border-radius: 8px;
  padding: 20px;
  background: #f8f9fa;
  box-shadow: none;
`;

const ProjectHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 10px;
`;

const ProjectName = styled.h3`
  color: #333;
  font-size: 1.2rem;
  margin: 0;
  font-weight: 600;
`;

const ProjectStatusText = styled.span`
  font-size: 0.85rem;
  font-weight: 500;
  color: ${(props) => (props.archived ? "#b91c1c" : "#475569")};
`;

const ProjectInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
  margin-top: 15px;
`;

const ProjectDetail = styled.div`
  .label {
    font-size: 0.8rem;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 2px;
  }

  .value {
    font-size: 0.95rem;
    color: #333;
    font-weight: 500;
  }
`;

const ProjectDescription = styled.p`
  color: #666;
  font-size: 0.95rem;
  line-height: 1.4;
  margin: 10px 0 0 0;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #666;
  font-style: italic;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 20px;
  color: #666;
`;

const ManagementCard = styled.div`
  background: #fff;
  border: 1px solid #e1e5e9;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 15px 35px rgba(15, 23, 42, 0.08);
`;

const ManagementGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
`;

const ManagementField = styled.label`
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.85rem;
  color: #475569;
`;

const FieldLabelRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
`;

const FieldInput = styled.input`
  border: 1px solid #d7dfe9;
  border-radius: 6px;
  padding: 10px 12px;
  font-size: 0.95rem;
  color: #0f172a;
  background: #fff;

  &:disabled {
    background: #f1f5f9;
    color: #94a3b8;
  }
`;

const FieldSelect = styled.select`
  border: 1px solid #d7dfe9;
  border-radius: 6px;
  padding: 10px 12px;
  font-size: 0.95rem;
  color: #0f172a;
  background: #fff;

  &:disabled {
    background: #f1f5f9;
    color: #94a3b8;
  }
`;

const FieldTextarea = styled.textarea`
  border: 1px solid #d7dfe9;
  border-radius: 6px;
  padding: 10px 12px;
  font-size: 0.95rem;
  color: #0f172a;
  resize: vertical;
  min-height: 90px;
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 16px;
`;

const PrimaryButton = styled.button`
  ${buttonBaseStyles};
  padding: 10px 20px;
  font-size: 0.9rem;
  background: #fc6b0a;
  color: white;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background: #e55a09;
  }
`;

const SecondaryButton = styled.button`
  ${buttonBaseStyles};
  padding: 10px 20px;
  font-size: 0.9rem;
  background: #6c757d;
  color: white;

  &:hover:not(:disabled) {
    background: #5a6268;
  }
`;

const DangerButton = styled.button`
  border: none;
  background: #dc2626;
  color: white;
  padding: 8px 14px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.85;
  }
`;

const ProjectsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
`;

const ProjectActions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
  width: 100%;
  margin-top: 16px;
`;

const ActionButton = styled.button`
  border: none;
  background: ${(props) =>
    props.variant === "ghost" ? "transparent" : "#e2e8f0"};
  color: ${(props) => (props.danger ? "#dc2626" : "#0f172a")};
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  border: ${(props) =>
    props.variant === "ghost" ? "1px solid #e2e8f0" : "none"};

  &:hover {
    background: ${(props) =>
      props.variant === "ghost" ? "#f8fafc" : "#cbd5f5"};
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 3000;
`;

const ModalCard = styled.div`
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 520px;
  padding: 28px;
  box-shadow: 0 30px 60px rgba(15, 23, 42, 0.25);
`;

const ModalTitle = styled.h3`
  margin: 0 0 10px;
  color: #0f172a;
`;

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
`;

const InlineHelper = styled.p`
  font-size: 0.85rem;
  color: #94a3b8;
  margin: 0;
`;

const MINERA_ADMIN_ROLE = "MINERA_ADMINISTRADOR";
const PROVEEDOR_ADMIN_ROLE = "PROVEEDOR_ADMINISTRADOR";

const ROLE_DESCRIPTIONS = {
  ADMIN_SISTEMA: "Administrador del sistema",
  MINERA_ADMINISTRADOR: "Administrador de minera",
  MINERA_USUARIO: "Usuario de minera",
  PROVEEDOR_ADMINISTRADOR: "Administrador de proveedor",
  PROVEEDOR_USUARIO: "Usuario de proveedor",
};

const buildMineraFormState = (minera = null) => ({
  nombre: minera?.Nombre || minera?.nombre || "",
  razonSocial: minera?.RazonSocial || minera?.razonSocial || "",
  cuit: minera?.CUIT || minera?.cuit || "",
  emailContacto: minera?.EmailContacto || minera?.emailContacto || "",
  telefono: minera?.Telefono || minera?.telefono || "",
  activo:
    typeof minera?.Activo === "boolean"
      ? minera.Activo
      : typeof minera?.activo === "boolean"
      ? minera.activo
      : true,
});

const buildProveedorFormState = (proveedor = null) => ({
  nombre: proveedor?.Nombre || proveedor?.nombre || "",
  razonSocial: proveedor?.RazonSocial || proveedor?.razonSocial || "",
  cuit: proveedor?.CUIT || proveedor?.cuit || "",
  emailContacto: proveedor?.EmailContacto || proveedor?.emailContacto || "",
  telefono: proveedor?.Telefono || proveedor?.telefono || "",
  rubroID: proveedor?.RubroID ?? proveedor?.rubroID ?? null,
  activo:
    typeof proveedor?.Activo === "boolean"
      ? proveedor.Activo
      : typeof proveedor?.activo === "boolean"
      ? proveedor.activo
      : true,
});

const buildProjectFormState = (proyecto = null) => ({
  proyectoMineroID:
    proyecto?.ProyectoMineroID || proyecto?.proyectoMineroID || null,
  nombre: proyecto?.Nombre || proyecto?.nombre || "",
  ubicacion: proyecto?.Ubicacion || proyecto?.ubicacion || "",
  descripcion: proyecto?.Descripcion || proyecto?.descripcion || "",
  fechaInicio: proyecto?.FechaInicio || proyecto?.fechaInicio || "",
});

const buildPersonalFormState = (currentUser = null) => ({
  nombre: currentUser?.Nombre || currentUser?.nombre || "",
  apellido: currentUser?.Apellido || currentUser?.apellido || "",
  telefono: currentUser?.Telefono || currentUser?.telefono || "",
});

const getUserMineraId = (currentUser) => {
  const minera = currentUser?.minera || currentUser?.Minera;
  if (!minera) return null;
  return minera.MineraID || minera.mineraID || minera.EmpresaID || null;
};

const getUserProveedorId = (currentUser) => {
  const proveedor = currentUser?.proveedor || currentUser?.Proveedor;
  if (!proveedor) return null;
  return (
    proveedor.ProveedorID ||
    proveedor.proveedorID ||
    proveedor.EmpresaID ||
    proveedor.empresaID ||
    null
  );
};

const Profile = () => {
  const { user, updateUser } = useAuth();
  const roles = user?.roles || [];
  const isMineraAdmin = roles.includes(MINERA_ADMIN_ROLE);
  const isProveedorAdmin = roles.includes(PROVEEDOR_ADMIN_ROLE);
  const userMineraId = getUserMineraId(user);
  const userProveedorId = getUserProveedorId(user);
  const canManageProjects = isMineraAdmin && !!userMineraId;

  // Estado para la edición de datos personales
  const [personalForm, setPersonalForm] = useState(() =>
    buildPersonalFormState(user)
  );
  const [personalSaving, setPersonalSaving] = useState(false);
  const [personalFeedback, setPersonalFeedback] = useState({
    error: "",
    success: "",
  });
  const isPersonalFormDirty = useMemo(() => {
    const baseline = buildPersonalFormState(user);
    return (
      baseline.nombre !== personalForm.nombre ||
      baseline.apellido !== personalForm.apellido ||
      (baseline.telefono || "") !== (personalForm.telefono || "")
    );
  }, [personalForm, user]);

  // Estado para proyectos mineros
  const [proyectosMineros, setProyectosMineros] = useState([]);
  const [loadingProyectos, setLoadingProyectos] = useState(false);
  const [proyectosError, setProyectosError] = useState("");

  // Estado para la minera (solo administradores)
  const [mineraDetails, setMineraDetails] = useState(null);
  const [mineraForm, setMineraForm] = useState(() => buildMineraFormState());
  const [mineraLoading, setMineraLoading] = useState(false);
  const [mineraSaving, setMineraSaving] = useState(false);
  const [mineraFeedback, setMineraFeedback] = useState({
    error: "",
    success: "",
  });
  const isMineraFormDirty = useMemo(() => {
    const baseline = buildMineraFormState(mineraDetails);
    return (
      baseline.nombre !== mineraForm.nombre ||
      baseline.razonSocial !== mineraForm.razonSocial ||
      (baseline.cuit || "") !== (mineraForm.cuit || "") ||
      (baseline.emailContacto || "") !== (mineraForm.emailContacto || "") ||
      (baseline.telefono || "") !== (mineraForm.telefono || "") ||
      baseline.activo !== mineraForm.activo
    );
  }, [mineraDetails, mineraForm]);

  // Estado para el proveedor (solo administradores de proveedor)
  const [proveedorDetails, setProveedorDetails] = useState(null);
  const [proveedorForm, setProveedorForm] = useState(() =>
    buildProveedorFormState()
  );
  const [proveedorLoading, setProveedorLoading] = useState(false);
  const [proveedorSaving, setProveedorSaving] = useState(false);
  const [proveedorFeedback, setProveedorFeedback] = useState({
    error: "",
    success: "",
  });
  const [rubros, setRubros] = useState([]);
  const isProveedorFormDirty = useMemo(() => {
    const baseline = buildProveedorFormState(proveedorDetails);
    return (
      baseline.nombre !== proveedorForm.nombre ||
      baseline.razonSocial !== proveedorForm.razonSocial ||
      (baseline.cuit || "") !== (proveedorForm.cuit || "") ||
      (baseline.emailContacto || "") !== (proveedorForm.emailContacto || "") ||
      (baseline.telefono || "") !== (proveedorForm.telefono || "") ||
      (baseline.rubroID || null) !== (proveedorForm.rubroID || null) ||
      baseline.activo !== proveedorForm.activo
    );
  }, [proveedorDetails, proveedorForm]);

  // Estado para el modal de proyectos
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [projectFormMode, setProjectFormMode] = useState("create");
  const [projectForm, setProjectForm] = useState(() => buildProjectFormState());
  const [projectError, setProjectError] = useState("");
  const [projectSubmitting, setProjectSubmitting] = useState(false);

  useEffect(() => {
    setPersonalForm(buildPersonalFormState(user));
  }, [user]);

  const handleResetPersonalForm = () => {
    setPersonalForm(buildPersonalFormState(user));
    setPersonalFeedback({ error: "", success: "" });
  };

  const handlePersonalFieldChange = (field, value) => {
    setPersonalForm((prev) => ({ ...prev, [field]: value }));
    setPersonalFeedback({ error: "", success: "" });
  };

  const handleSavePersonal = async (event) => {
    event.preventDefault();
    if (personalSaving) {
      return;
    }

    const nombre = personalForm.nombre.trim();
    const apellido = personalForm.apellido.trim();
    const telefonoValue = (personalForm.telefono || "").trim();

    if (!nombre) {
      setPersonalFeedback({
        error: "El nombre es obligatorio.",
        success: "",
      });
      return;
    }

    const payload = {
      Nombre: nombre,
      Apellido: apellido || null,
      Telefono: telefonoValue || null,
    };

    setPersonalSaving(true);
    setPersonalFeedback({ error: "", success: "" });

    try {
      await apiService.updateProfile(payload);

      await updateUser({
        ...user,
        Nombre: nombre,
        nombre: nombre,
        Apellido: apellido || null,
        apellido: apellido || null,
        Telefono: telefonoValue || null,
        telefono: telefonoValue || null,
      });

      setPersonalFeedback({
        error: "",
        success: "Datos personales actualizados.",
      });
      setTimeout(() => setPersonalFeedback({ error: "", success: "" }), 3500);
    } catch (error) {
      console.error("Error al actualizar los datos personales", error);
      const message =
        error.response?.data?.message || "No se pudieron guardar los cambios.";
      setPersonalFeedback({ error: message, success: "" });
    } finally {
      setPersonalSaving(false);
    }
  };

  const handleMineraFieldChange = (field, value) => {
    setMineraForm((prev) => ({ ...prev, [field]: value }));
    setMineraFeedback({ error: "", success: "" });
  };

  const handleResetMineraForm = () => {
    setMineraForm(buildMineraFormState(mineraDetails));
    setMineraFeedback({ error: "", success: "" });
  };

  const handleMineraSave = async (event) => {
    event.preventDefault();
    if (mineraSaving || !isMineraAdmin || !userMineraId) {
      return;
    }

    const nombre = mineraForm.nombre.trim();
    const razonSocial = mineraForm.razonSocial.trim();

    if (!nombre || !razonSocial) {
      setMineraFeedback({
        error: "Nombre y razón social son obligatorios.",
        success: "",
      });
      return;
    }

    const payload = {
      nombre,
      razonSocial,
      cuit: mineraForm.cuit,
      emailContacto: (mineraForm.emailContacto || "").trim() || null,
      telefono: (mineraForm.telefono || "").trim() || null,
      activo: mineraForm.activo,
    };

    setMineraSaving(true);
    setMineraFeedback({ error: "", success: "" });

    try {
      const response = await apiService.updateMinera(userMineraId, payload);
      const updatedMinera = response?.data?.minera || null;

      if (updatedMinera) {
        setMineraDetails(updatedMinera);
        setMineraForm(buildMineraFormState(updatedMinera));

        const mergedMinera = {
          ...(user?.minera || {}),
          ...updatedMinera,
          nombre:
            updatedMinera.Nombre || updatedMinera.nombre || mineraForm.nombre,
          Nombre:
            updatedMinera.Nombre || updatedMinera.nombre || mineraForm.nombre,
          razonSocial:
            updatedMinera.RazonSocial ||
            updatedMinera.razonSocial ||
            mineraForm.razonSocial,
          RazonSocial:
            updatedMinera.RazonSocial ||
            updatedMinera.razonSocial ||
            mineraForm.razonSocial,
          EmailContacto:
            updatedMinera.EmailContacto ??
            updatedMinera.emailContacto ??
            mineraForm.emailContacto,
          emailContacto:
            updatedMinera.EmailContacto ??
            updatedMinera.emailContacto ??
            mineraForm.emailContacto,
          Telefono:
            updatedMinera.Telefono ??
            updatedMinera.telefono ??
            mineraForm.telefono,
          telefono:
            updatedMinera.Telefono ??
            updatedMinera.telefono ??
            mineraForm.telefono,
          CUIT: updatedMinera.CUIT || updatedMinera.cuit || mineraForm.cuit,
          cuit: updatedMinera.CUIT || updatedMinera.cuit || mineraForm.cuit,
        };

        await updateUser({ ...user, minera: mergedMinera });
      }

      setMineraFeedback({
        error: "",
        success: "Datos de la minera actualizados.",
      });
      setTimeout(() => setMineraFeedback({ error: "", success: "" }), 3500);
    } catch (error) {
      console.error("Error al actualizar la minera", error);
      const message =
        error.response?.data?.message ||
        "No se pudieron guardar los cambios en la minera.";
      setMineraFeedback({ error: message, success: "" });
    } finally {
      setMineraSaving(false);
    }
  };

  const handleProveedorFieldChange = (field, value) => {
    const nextValue =
      field === "rubroID" ? (value ? Number(value) : null) : value;
    setProveedorForm((prev) => ({ ...prev, [field]: nextValue }));
    setProveedorFeedback({ error: "", success: "" });
  };

  const handleResetProveedorForm = () => {
    setProveedorForm(buildProveedorFormState(proveedorDetails));
    setProveedorFeedback({ error: "", success: "" });
  };

  const handleProveedorSave = async (event) => {
    event.preventDefault();
    if (proveedorSaving || !isProveedorAdmin || !userProveedorId) {
      return;
    }

    const nombre = proveedorForm.nombre.trim();
    const razonSocial = proveedorForm.razonSocial.trim();
    const cuit = (proveedorForm.cuit || "").trim();

    if (!nombre || !razonSocial || !cuit) {
      setProveedorFeedback({
        error: "Nombre, razón social y CUIT son obligatorios.",
        success: "",
      });
      return;
    }

    const payload = {
      nombre,
      razonSocial,
      cuit,
      emailContacto: (proveedorForm.emailContacto || "").trim() || null,
      telefono: (proveedorForm.telefono || "").trim() || null,
      rubroID: proveedorForm.rubroID || null,
      activo: proveedorForm.activo,
    };

    setProveedorSaving(true);
    setProveedorFeedback({ error: "", success: "" });

    try {
      const response = await apiService.updateProveedor(
        userProveedorId,
        payload
      );
      const updatedProveedor = response?.data?.proveedor || null;

      if (updatedProveedor) {
        setProveedorDetails(updatedProveedor);
        setProveedorForm(buildProveedorFormState(updatedProveedor));

        const mergedProveedor = {
          ...(user?.proveedor || {}),
          ...updatedProveedor,
          Nombre: updatedProveedor.Nombre || updatedProveedor.nombre || nombre,
          nombre: updatedProveedor.Nombre || updatedProveedor.nombre || nombre,
          RazonSocial:
            updatedProveedor.RazonSocial ||
            updatedProveedor.razonSocial ||
            razonSocial,
          razonSocial:
            updatedProveedor.RazonSocial ||
            updatedProveedor.razonSocial ||
            razonSocial,
          EmailContacto:
            updatedProveedor.EmailContacto ??
            updatedProveedor.emailContacto ??
            proveedorForm.emailContacto,
          emailContacto:
            updatedProveedor.EmailContacto ??
            updatedProveedor.emailContacto ??
            proveedorForm.emailContacto,
          Telefono:
            updatedProveedor.Telefono ??
            updatedProveedor.telefono ??
            proveedorForm.telefono,
          telefono:
            updatedProveedor.Telefono ??
            updatedProveedor.telefono ??
            proveedorForm.telefono,
          CUIT: updatedProveedor.CUIT || updatedProveedor.cuit || cuit,
          cuit: updatedProveedor.CUIT || updatedProveedor.cuit || cuit,
          RubroID:
            updatedProveedor.RubroID ??
            updatedProveedor.rubroID ??
            proveedorForm.rubroID,
          rubroID:
            updatedProveedor.RubroID ??
            updatedProveedor.rubroID ??
            proveedorForm.rubroID,
          RubroNombre:
            updatedProveedor.RubroNombre ??
            updatedProveedor.rubroNombre ??
            null,
          rubroNombre:
            updatedProveedor.RubroNombre ??
            updatedProveedor.rubroNombre ??
            null,
        };

        await updateUser({ ...user, proveedor: mergedProveedor });
      }

      setProveedorFeedback({
        error: "",
        success: "Datos del proveedor actualizados.",
      });
      setTimeout(() => setProveedorFeedback({ error: "", success: "" }), 3500);
    } catch (error) {
      console.error("Error al actualizar el proveedor", error);
      const message =
        error.response?.data?.message ||
        "No se pudieron guardar los cambios en el proveedor.";
      setProveedorFeedback({ error: message, success: "" });
    } finally {
      setProveedorSaving(false);
    }
  };

  const openProjectModal = (mode = "create", proyecto = null) => {
    setProjectFormMode(mode);
    setProjectForm(buildProjectFormState(proyecto));
    setProjectError("");
    setProjectModalOpen(true);
  };

  const closeProjectModal = () => {
    setProjectModalOpen(false);
    setProjectForm(buildProjectFormState());
    setProjectError("");
    setProjectSubmitting(false);
  };

  const handleProjectFieldChange = (field, value) => {
    setProjectForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleProjectSubmit = async (event) => {
    event.preventDefault();
    if (projectSubmitting) {
      return;
    }

    if (!userMineraId) {
      setProjectError("No se encontró la minera asociada al usuario.");
      return;
    }

    const nombre = projectForm.nombre.trim();
    if (!nombre) {
      setProjectError("El nombre del proyecto es obligatorio.");
      return;
    }

    const fechaInicioValue = projectForm.fechaInicio
      ? new Date(projectForm.fechaInicio).toISOString()
      : null;

    const payload = {
      nombre,
      ubicacion: (projectForm.ubicacion || "").trim() || null,
      descripcion: (projectForm.descripcion || "").trim() || null,
      fechaInicio: fechaInicioValue,
    };

    setProjectSubmitting(true);
    setProjectError("");

    try {
      if (projectFormMode === "create") {
        await apiService.createProyectoMinero({
          ...payload,
          mineraID: userMineraId,
        });
      } else {
        await apiService.updateProyectoMinero(
          projectForm.proyectoMineroID,
          payload
        );
      }

      await fetchProyectosMineros();
      closeProjectModal();
    } catch (error) {
      console.error("Error al guardar el proyecto minero", error);
      const message =
        error.response?.data?.message || "No se pudo guardar el proyecto.";
      setProjectError(message);
    } finally {
      setProjectSubmitting(false);
    }
  };

  const handleDeleteProject = async (proyecto) => {
    const projectId =
      proyecto?.ProyectoMineroID || proyecto?.proyectoMineroID || null;
    if (!projectId) return;

    const confirmed = window.confirm(
      `¿Desea eliminar el proyecto "${
        proyecto?.Nombre || proyecto?.nombre || "Sin nombre"
      }"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await apiService.deleteProyectoMinero(projectId);
      await fetchProyectosMineros();
    } catch (error) {
      console.error("Error al eliminar el proyecto minero", error);
      const message =
        error.response?.data?.message || "No se pudo eliminar el proyecto.";
      setProyectosError(message);
    }
  };

  const fetchProyectosMineros = useCallback(async () => {
    if (!userMineraId) {
      setProyectosMineros([]);
      return;
    }

    try {
      setLoadingProyectos(true);
      setProyectosError("");
      const response = await apiService.getProyectosMinerosByMinera(
        userMineraId
      );
      setProyectosMineros(response.data || []);
    } catch (error) {
      console.error("Error al obtener los proyectos mineros", error);
      const message =
        error.response?.data?.message || "Error al cargar proyectos mineros";
      setProyectosError(message);
      setProyectosMineros([]);
    } finally {
      setLoadingProyectos(false);
    }
  }, [userMineraId]);

  useEffect(() => {
    fetchProyectosMineros();
  }, [fetchProyectosMineros]);

  const fetchMineraDetails = useCallback(async () => {
    if (!isMineraAdmin || !userMineraId) {
      setMineraDetails(null);
      setMineraForm(buildMineraFormState());
      return;
    }

    try {
      setMineraLoading(true);
      setMineraFeedback({ error: "", success: "" });
      const response = await apiService.getMineraById(userMineraId);
      const minera = response.data?.minera || response.data;
      setMineraDetails(minera);
      setMineraForm(buildMineraFormState(minera));
    } catch (error) {
      console.error("Error al obtener la información de la minera", error);
      const message =
        error.response?.data?.message ||
        "No se pudo obtener la información de la minera.";
      setMineraFeedback({ error: message, success: "" });
    } finally {
      setMineraLoading(false);
    }
  }, [isMineraAdmin, userMineraId]);

  useEffect(() => {
    fetchMineraDetails();
  }, [fetchMineraDetails]);

  const fetchProveedorDetails = useCallback(async () => {
    if (!isProveedorAdmin || !userProveedorId) {
      setProveedorDetails(null);
      setProveedorForm(buildProveedorFormState());
      return;
    }

    try {
      setProveedorLoading(true);
      setProveedorFeedback({ error: "", success: "" });
      const response = await apiService.getProveedorById(userProveedorId);
      const proveedor = response.data?.proveedor || response.data;
      setProveedorDetails(proveedor);
      setProveedorForm(buildProveedorFormState(proveedor));
    } catch (error) {
      console.error("Error al obtener la información del proveedor", error);
      const message =
        error.response?.data?.message ||
        "No se pudo obtener la información del proveedor.";
      setProveedorFeedback({ error: message, success: "" });
    } finally {
      setProveedorLoading(false);
    }
  }, [isProveedorAdmin, userProveedorId]);

  useEffect(() => {
    fetchProveedorDetails();
  }, [fetchProveedorDetails]);

  const fetchRubros = useCallback(async () => {
    if (!isProveedorAdmin) {
      setRubros([]);
      return;
    }

    try {
      const response = await apiService.getProveedoresRubros();
      setRubros(response.data || []);
    } catch (error) {
      console.error("Error al cargar los rubros de proveedores", error);
    }
  }, [isProveedorAdmin]);

  useEffect(() => {
    fetchRubros();
  }, [fetchRubros]);

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

  const getUserDescription = () => {
    const explicitDescription =
      user?.Descripcion ||
      user?.descripcion ||
      user?.DescripcionPerfil ||
      user?.descripcionPerfil ||
      "";

    if (explicitDescription.trim().length > 0) {
      return explicitDescription;
    }

    const [primaryRole] = roles;
    if (primaryRole) {
      return ROLE_DESCRIPTIONS[primaryRole] || primaryRole;
    }

    return "Sin descripción";
  };

  const companyInfo = useMemo(() => {
    const mineraSource =
      (isMineraAdmin && mineraDetails) || user?.minera || null;

    const proveedorSource =
      (isProveedorAdmin && proveedorDetails) || user?.proveedor || null;

    if (mineraSource) {
      return {
        kind: "minera",
        type: "Información de la minera",
        name: mineraSource.Nombre || mineraSource.nombre || "Sin nombre",
        razonSocial:
          mineraSource.RazonSocial || mineraSource.razonSocial || "No definida",
        cuit: mineraSource.CUIT || mineraSource.cuit || "N/D",
        email: mineraSource.EmailContacto || mineraSource.emailContacto || "",
        telefono: mineraSource.Telefono || mineraSource.telefono || "",
      };
    }

    if (proveedorSource) {
      return {
        kind: "proveedor",
        type: "Información del proveedor",
        name: proveedorSource.Nombre || proveedorSource.nombre || "Sin nombre",
        razonSocial:
          proveedorSource.RazonSocial ||
          proveedorSource.razonSocial ||
          "No definida",
        cuit: proveedorSource.CUIT || proveedorSource.cuit || "N/D",
        rubroID: proveedorSource.RubroID || proveedorSource.rubroID || null,
        rubroNombre:
          proveedorSource.RubroNombre ||
          proveedorSource.rubroNombre ||
          proveedorSource.Especialidad ||
          proveedorSource.especialidad ||
          "",
        email:
          proveedorSource.EmailContacto || proveedorSource.emailContacto || "",
        telefono: proveedorSource.Telefono || proveedorSource.telefono || "",
      };
    }

    return null;
  }, [isMineraAdmin, mineraDetails, isProveedorAdmin, proveedorDetails, user]);

  const formatProjectStatus = (status) => {
    const statusMap = {
      ACTIVO: "Activo",
      EN_PLANIFICACION: "En planificación",
      PAUSADO: "Pausado",
      COMPLETADO: "Completado",
    };
    return statusMap[status] || status;
  };

  const isProjectActive = (proyecto) => {
    const explicit =
      proyecto?.Activo ?? proyecto?.activo ?? proyecto?.isActive ?? null;
    if (typeof explicit === "boolean") return explicit;

    const estado = (proyecto?.Estado || proyecto?.estado || "")
      .toString()
      .toUpperCase();

    if (!estado) return true;
    return estado !== "INACTIVO" && estado !== "BAJA" && estado !== "INACTIVO";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No especificada";
    try {
      return new Date(dateString).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Fecha inválida";
    }
  };

  const sortedProyectos = useMemo(() => {
    return [...proyectosMineros].sort((a, b) => {
      const aInactive = isProjectActive(a) ? 0 : 1;
      const bInactive = isProjectActive(b) ? 0 : 1;
      if (aInactive === bInactive) return 0;
      return aInactive - bInactive;
    });
  }, [proyectosMineros]);

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <ProfileContainer>
      <Navbar />

      <MainContent>
        <BackButton onClick={handleGoBack}>Volver</BackButton>

        <ProfileCard>
          <ProfileHeader>
            <ProfileAvatar>{getUserInitials()}</ProfileAvatar>
            <ProfileName>
              {user?.Nombre || user?.nombre || "Usuario"}
            </ProfileName>
            <ProfileRole>{getUserDescription()}</ProfileRole>
          </ProfileHeader>

          <ProfileBody>
            <Section>
              <SectionTitle>Información personal</SectionTitle>
              <ManagementCard>
                <form onSubmit={handleSavePersonal}>
                  <ManagementGrid>
                    <ManagementField>
                      Nombre
                      <FieldInput
                        type="text"
                        value={personalForm.nombre}
                        onChange={(event) =>
                          handlePersonalFieldChange(
                            "nombre",
                            event.target.value
                          )
                        }
                        placeholder="Nombre"
                        disabled={personalSaving}
                        required
                      />
                    </ManagementField>

                    <ManagementField>
                      Apellido
                      <FieldInput
                        type="text"
                        value={personalForm.apellido}
                        onChange={(event) =>
                          handlePersonalFieldChange(
                            "apellido",
                            event.target.value
                          )
                        }
                        placeholder="Apellido"
                        disabled={personalSaving}
                      />
                    </ManagementField>

                    <ManagementField>
                      <FieldLabelRow>
                        <span>Email</span>
                        <Badge
                          type={user?.validadoEmail ? "verified" : "unverified"}
                        >
                          {user?.validadoEmail ? "Verificado" : "No verificado"}
                        </Badge>
                      </FieldLabelRow>
                      <FieldInput
                        type="email"
                        value={user?.email || ""}
                        disabled
                      />
                    </ManagementField>

                    <ManagementField>
                      DNI (solo lectura)
                      <FieldInput
                        type="text"
                        value={user?.DNI || user?.dni || "No disponible"}
                        disabled
                      />
                    </ManagementField>

                    <ManagementField>
                      Teléfono
                      <FieldInput
                        type="text"
                        value={personalForm.telefono}
                        onChange={(event) =>
                          handlePersonalFieldChange(
                            "telefono",
                            event.target.value
                          )
                        }
                        placeholder="Número de contacto"
                        disabled={personalSaving}
                      />
                    </ManagementField>
                  </ManagementGrid>

                  {personalFeedback.error && (
                    <ErrorMessage>{personalFeedback.error}</ErrorMessage>
                  )}
                  {personalFeedback.success && (
                    <SuccessMessage>{personalFeedback.success}</SuccessMessage>
                  )}

                  <FormActions>
                    <SecondaryButton
                      type="button"
                      onClick={handleResetPersonalForm}
                      disabled={!isPersonalFormDirty || personalSaving}
                    >
                      Descartar cambios
                    </SecondaryButton>
                    <PrimaryButton type="submit" disabled={personalSaving}>
                      {personalSaving ? "Guardando..." : "Guardar cambios"}
                    </PrimaryButton>
                  </FormActions>
                </form>
              </ManagementCard>
            </Section>

            {companyInfo && (
              <Section>
                <SectionTitle>{companyInfo.type}</SectionTitle>

                {companyInfo.kind === "minera" && isMineraAdmin ? (
                  <ManagementCard>
                    {mineraLoading ? (
                      <LoadingState>
                        Cargando datos de la minera...
                      </LoadingState>
                    ) : (
                      <form onSubmit={handleMineraSave}>
                        <ManagementGrid>
                          <ManagementField>
                            Nombre comercial
                            <FieldInput
                              type="text"
                              value={mineraForm.nombre}
                              onChange={(e) =>
                                handleMineraFieldChange(
                                  "nombre",
                                  e.target.value
                                )
                              }
                              placeholder="Nombre de la minera"
                              disabled={mineraSaving}
                              required
                            />
                          </ManagementField>

                          <ManagementField>
                            Razón social
                            <FieldInput
                              type="text"
                              value={mineraForm.razonSocial}
                              onChange={(e) =>
                                handleMineraFieldChange(
                                  "razonSocial",
                                  e.target.value
                                )
                              }
                              placeholder="Nombre legal registrado"
                              disabled={mineraSaving}
                              required
                            />
                          </ManagementField>

                          <ManagementField>
                            CUIT
                            <FieldInput
                              type="text"
                              value={mineraForm.cuit}
                              onChange={(e) =>
                                handleMineraFieldChange("cuit", e.target.value)
                              }
                              placeholder="Sin guiones"
                              disabled={mineraSaving}
                            />
                          </ManagementField>

                          <ManagementField>
                            Email de contacto
                            <FieldInput
                              type="email"
                              value={mineraForm.emailContacto}
                              onChange={(e) =>
                                handleMineraFieldChange(
                                  "emailContacto",
                                  e.target.value
                                )
                              }
                              placeholder="contacto@minera.com"
                              disabled={mineraSaving}
                            />
                          </ManagementField>

                          <ManagementField>
                            Teléfono
                            <FieldInput
                              type="text"
                              value={mineraForm.telefono}
                              onChange={(e) =>
                                handleMineraFieldChange(
                                  "telefono",
                                  e.target.value
                                )
                              }
                              placeholder="Código de país + número"
                              disabled={mineraSaving}
                            />
                          </ManagementField>
                        </ManagementGrid>

                        {mineraFeedback.error && (
                          <ErrorMessage>{mineraFeedback.error}</ErrorMessage>
                        )}
                        {mineraFeedback.success && (
                          <SuccessMessage>
                            {mineraFeedback.success}
                          </SuccessMessage>
                        )}

                        <FormActions>
                          <SecondaryButton
                            type="button"
                            onClick={handleResetMineraForm}
                            disabled={!isMineraFormDirty || mineraSaving}
                          >
                            Descartar cambios
                          </SecondaryButton>
                          <PrimaryButton type="submit" disabled={mineraSaving}>
                            {mineraSaving ? "Guardando..." : "Guardar cambios"}
                          </PrimaryButton>
                        </FormActions>
                      </form>
                    )}
                  </ManagementCard>
                ) : companyInfo.kind === "proveedor" && isProveedorAdmin ? (
                  <ManagementCard>
                    {proveedorLoading ? (
                      <LoadingState>
                        Cargando datos del proveedor...
                      </LoadingState>
                    ) : (
                      <form onSubmit={handleProveedorSave}>
                        <ManagementGrid>
                          <ManagementField>
                            Nombre comercial
                            <FieldInput
                              type="text"
                              value={proveedorForm.nombre}
                              onChange={(e) =>
                                handleProveedorFieldChange(
                                  "nombre",
                                  e.target.value
                                )
                              }
                              placeholder="Nombre de la empresa"
                              disabled={proveedorSaving}
                              required
                            />
                          </ManagementField>

                          <ManagementField>
                            Razón social
                            <FieldInput
                              type="text"
                              value={proveedorForm.razonSocial}
                              onChange={(e) =>
                                handleProveedorFieldChange(
                                  "razonSocial",
                                  e.target.value
                                )
                              }
                              placeholder="Nombre legal registrado"
                              disabled={proveedorSaving}
                              required
                            />
                          </ManagementField>

                          <ManagementField>
                            CUIT
                            <FieldInput
                              type="text"
                              value={proveedorForm.cuit}
                              onChange={(e) =>
                                handleProveedorFieldChange(
                                  "cuit",
                                  e.target.value
                                )
                              }
                              placeholder="Sin guiones"
                              disabled
                            />
                            <InlineHelper>
                              El CUIT se muestra solo para referencia.
                            </InlineHelper>
                          </ManagementField>

                          <ManagementField>
                            Rubro / Especialidad
                            <FieldSelect
                              value={proveedorForm.rubroID ?? ""}
                              onChange={(e) =>
                                handleProveedorFieldChange(
                                  "rubroID",
                                  e.target.value
                                )
                              }
                              disabled={proveedorSaving}
                            >
                              <option value="">Seleccioná el rubro</option>
                              {rubros.map((rubro) => {
                                const rubroId =
                                  rubro.RubroID || rubro.rubroID || rubro.id;
                                const rubroNombre =
                                  rubro.Nombre || rubro.nombre;
                                return (
                                  <option
                                    key={rubroId || rubroNombre}
                                    value={rubroId ?? ""}
                                  >
                                    {rubroNombre}
                                  </option>
                                );
                              })}
                            </FieldSelect>
                          </ManagementField>

                          <ManagementField>
                            Email de contacto
                            <FieldInput
                              type="email"
                              value={proveedorForm.emailContacto}
                              onChange={(e) =>
                                handleProveedorFieldChange(
                                  "emailContacto",
                                  e.target.value
                                )
                              }
                              placeholder="contacto@empresa.com"
                              disabled={proveedorSaving}
                            />
                          </ManagementField>

                          <ManagementField>
                            Teléfono
                            <FieldInput
                              type="text"
                              value={proveedorForm.telefono}
                              onChange={(e) =>
                                handleProveedorFieldChange(
                                  "telefono",
                                  e.target.value
                                )
                              }
                              placeholder="Código de país + número"
                              disabled={proveedorSaving}
                            />
                          </ManagementField>
                        </ManagementGrid>

                        {proveedorFeedback.error && (
                          <ErrorMessage>{proveedorFeedback.error}</ErrorMessage>
                        )}
                        {proveedorFeedback.success && (
                          <SuccessMessage>
                            {proveedorFeedback.success}
                          </SuccessMessage>
                        )}

                        <FormActions>
                          <SecondaryButton
                            type="button"
                            onClick={handleResetProveedorForm}
                            disabled={!isProveedorFormDirty || proveedorSaving}
                          >
                            Descartar cambios
                          </SecondaryButton>
                          <PrimaryButton
                            type="submit"
                            disabled={proveedorSaving}
                          >
                            {proveedorSaving
                              ? "Guardando..."
                              : "Guardar cambios"}
                          </PrimaryButton>
                        </FormActions>
                      </form>
                    )}
                  </ManagementCard>
                ) : (
                  <InfoGrid>
                    <InfoItem>
                      <div className="label">Nombre de la empresa</div>
                      <div className="value">{companyInfo.name}</div>
                    </InfoItem>
                    {companyInfo.razonSocial && (
                      <InfoItem>
                        <div className="label">Razón social</div>
                        <div className="value">{companyInfo.razonSocial}</div>
                      </InfoItem>
                    )}
                    <InfoItem>
                      <div className="label">CUIT</div>
                      <div className="value">{companyInfo.cuit}</div>
                    </InfoItem>
                    {companyInfo.kind === "proveedor" &&
                      companyInfo.rubroNombre && (
                        <InfoItem>
                          <div className="label">Especialidad</div>
                          <div className="value">{companyInfo.rubroNombre}</div>
                        </InfoItem>
                      )}
                    {companyInfo.email && (
                      <InfoItem>
                        <div className="label">Email de contacto</div>
                        <div className="value">{companyInfo.email}</div>
                      </InfoItem>
                    )}
                    {companyInfo.telefono && (
                      <InfoItem>
                        <div className="label">Teléfono</div>
                        <div className="value">{companyInfo.telefono}</div>
                      </InfoItem>
                    )}
                  </InfoGrid>
                )}
              </Section>
            )}

            {/* Sección de proyectos mineros - solo para usuarios de minera */}
            {user?.minera && (
              <Section>
                <ProjectsHeader>
                  <SectionTitle>
                    Proyectos mineros ({proyectosMineros.length})
                  </SectionTitle>
                  {canManageProjects && (
                    <PrimaryButton
                      type="button"
                      onClick={() => openProjectModal("create")}
                    >
                      Nuevo proyecto
                    </PrimaryButton>
                  )}
                </ProjectsHeader>

                {loadingProyectos ? (
                  <LoadingState>Cargando proyectos...</LoadingState>
                ) : proyectosError ? (
                  <ErrorMessage>{proyectosError}</ErrorMessage>
                ) : proyectosMineros.length === 0 ? (
                  <EmptyState>
                    No hay proyectos mineros registrados.
                    <br />
                    {canManageProjects
                      ? "Crea tu primer proyecto para comenzar a publicar licitaciones."
                      : "Los proyectos se pueden gestionar desde el panel principal."}
                  </EmptyState>
                ) : (
                  <ProjectsList>
                    {sortedProyectos.map((proyecto) => {
                      const projectId =
                        proyecto.proyectoMineroID ||
                        proyecto.ProyectoMineroID ||
                        proyecto.id;
                      const projectName =
                        proyecto.nombre || proyecto.Nombre || "Sin nombre";
                      const projectEstado =
                        proyecto.estado || proyecto.Estado || "";
                      const projectIsActive = isProjectActive(proyecto);
                      const projectDisplayStatus = projectIsActive
                        ? projectEstado
                          ? formatProjectStatus(projectEstado)
                          : "Activo"
                        : "Archivado";
                      const projectDescripcion =
                        proyecto.descripcion || proyecto.Descripcion || "";
                      const projectUbicacion =
                        proyecto.ubicacion || proyecto.Ubicacion || "";
                      const projectFechaInicio =
                        proyecto.fechaInicio || proyecto.FechaInicio || null;
                      const projectFechaFin =
                        proyecto.fechaFinalizacionEstimada ||
                        proyecto.FechaFinalizacionEstimada ||
                        null;
                      const rawPresupuesto =
                        proyecto.presupuesto ?? proyecto.Presupuesto ?? null;
                      const projectPresupuesto =
                        typeof rawPresupuesto === "number"
                          ? rawPresupuesto
                          : rawPresupuesto
                          ? Number(rawPresupuesto)
                          : null;

                      return (
                        <ProjectCard key={projectId || projectName}>
                          <ProjectHeader>
                            <ProjectName>{projectName}</ProjectName>
                            {projectDisplayStatus && (
                              <ProjectStatusText archived={!projectIsActive}>
                                Estado: {projectDisplayStatus}
                              </ProjectStatusText>
                            )}
                          </ProjectHeader>

                          {projectDescripcion && (
                            <ProjectDescription>
                              {projectDescripcion}
                            </ProjectDescription>
                          )}

                          <ProjectInfo>
                            {projectUbicacion && (
                              <ProjectDetail>
                                <div className="label">Ubicación</div>
                                <div className="value">{projectUbicacion}</div>
                              </ProjectDetail>
                            )}

                            <ProjectDetail>
                              <div className="label">Fecha de inicio</div>
                              <div className="value">
                                {formatDate(projectFechaInicio)}
                              </div>
                            </ProjectDetail>

                            {projectFechaFin && (
                              <ProjectDetail>
                                <div className="label">
                                  Finalización estimada
                                </div>
                                <div className="value">
                                  {formatDate(projectFechaFin)}
                                </div>
                              </ProjectDetail>
                            )}

                            {projectPresupuesto !== null &&
                              !Number.isNaN(projectPresupuesto) && (
                                <ProjectDetail>
                                  <div className="label">Presupuesto</div>
                                  <div className="value">
                                    $
                                    {projectPresupuesto.toLocaleString("es-AR")}
                                  </div>
                                </ProjectDetail>
                              )}
                          </ProjectInfo>

                          {canManageProjects && (
                            <ProjectActions>
                              <ActionButton
                                type="button"
                                onClick={() =>
                                  openProjectModal("edit", proyecto)
                                }
                              >
                                Editar
                              </ActionButton>
                              <ActionButton
                                type="button"
                                info
                                variant="ghost"
                                onClick={() => handleDeleteProject(proyecto)}
                              >
                                Archivar
                              </ActionButton>
                            </ProjectActions>
                          )}
                        </ProjectCard>
                      );
                    })}
                  </ProjectsList>
                )}
              </Section>
            )}
          </ProfileBody>
        </ProfileCard>
      </MainContent>

      {projectModalOpen && (
        <ModalOverlay>
          <ModalCard>
            <ModalTitle>
              {projectFormMode === "create"
                ? "Nuevo proyecto minero"
                : "Editar proyecto minero"}
            </ModalTitle>

            <form onSubmit={handleProjectSubmit}>
              <ModalBody>
                <ManagementField>
                  Nombre del proyecto *
                  <FieldInput
                    type="text"
                    value={projectForm.nombre}
                    onChange={(e) =>
                      handleProjectFieldChange("nombre", e.target.value)
                    }
                    placeholder="Ej: Proyecto Andino"
                    required
                    disabled={projectSubmitting}
                  />
                </ManagementField>

                <ManagementField>
                  Ubicación
                  <FieldInput
                    type="text"
                    value={projectForm.ubicacion}
                    onChange={(e) =>
                      handleProjectFieldChange("ubicacion", e.target.value)
                    }
                    placeholder="Proyecto, provincia"
                    disabled={projectSubmitting}
                  />
                </ManagementField>

                <ManagementField>
                  Descripción
                  <FieldTextarea
                    value={projectForm.descripcion}
                    onChange={(e) =>
                      handleProjectFieldChange("descripcion", e.target.value)
                    }
                    placeholder="Resumen breve del proyecto"
                    disabled={projectSubmitting}
                  />
                </ManagementField>

                <ManagementField>
                  Fecha de inicio
                  <FieldInput
                    type="date"
                    value={projectForm.fechaInicio || ""}
                    onChange={(e) =>
                      handleProjectFieldChange("fechaInicio", e.target.value)
                    }
                    disabled={projectSubmitting}
                  />
                </ManagementField>
              </ModalBody>

              {projectError && <ErrorMessage>{projectError}</ErrorMessage>}

              <ModalActions>
                <SecondaryButton
                  type="button"
                  onClick={closeProjectModal}
                  disabled={projectSubmitting}
                >
                  Cancelar
                </SecondaryButton>
                <PrimaryButton type="submit" disabled={projectSubmitting}>
                  {projectSubmitting
                    ? "Guardando..."
                    : projectFormMode === "create"
                    ? "Crear proyecto"
                    : "Guardar cambios"}
                </PrimaryButton>
              </ModalActions>
            </form>
          </ModalCard>
        </ModalOverlay>
      )}
    </ProfileContainer>
  );
};

export default Profile;
