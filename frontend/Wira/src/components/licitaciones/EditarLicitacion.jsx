import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../shared/Navbar";

const FormContainer = styled.div`
  min-height: 100vh;
  background: #f8f9fa;
`;

const MainContent = styled.main`
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const FormCard = styled.div`
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
`;

const FormTitle = styled.h1`
  color: #333;
  font-size: 2rem;
  margin-bottom: 10px;
  background: linear-gradient(135deg, #fc6b0a 0%, #ff8f42 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const FormSubtitle = styled.p`
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 30px;
`;

const FormGroup = styled.div`
  margin-bottom: 25px;
`;

const FormLabel = styled.label`
  display: block;
  color: #333;
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 1rem;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #fc6b0a;
    box-shadow: 0 0 0 3px rgba(252, 107, 10, 0.1);
  }

  &::placeholder {
    color: #999;
  }
`;

const FormTextarea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #fc6b0a;
    box-shadow: 0 0 0 3px rgba(252, 107, 10, 0.1);
  }

  &::placeholder {
    color: #999;
  }
`;

const FormSelect = styled.select`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #fc6b0a;
    box-shadow: 0 0 0 3px rgba(252, 107, 10, 0.1);
  }
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 30px;
`;

const PrimaryButton = styled.button`
  background: linear-gradient(135deg, #fc6b0a 0%, #ff8f42 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(252, 107, 10, 0.3);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const SecondaryButton = styled.button`
  background: #6c757d;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #5a6268;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const CharacterCount = styled.div`
  text-align: right;
  font-size: 0.9rem;
  color: #666;
  margin-top: 5px;
`;

const ErrorText = styled.div`
  color: #dc3545;
  font-size: 0.9rem;
  margin-top: 5px;
`;

const InfoText = styled.div`
  color: #6c757d;
  font-size: 0.9rem;
  margin-top: 5px;
  font-style: italic;
`;

const LoadingContainer = styled.div`
  padding: 60px 20px;
  text-align: center;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #e1e5e9;
  border-left: 4px solid #fc6b0a;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;

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
  font-size: 1rem;
`;

const ErrorContainer = styled.div`
  padding: 60px 20px;
  text-align: center;
  color: #666;
`;

const ErrorIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 20px;
  color: #dc3545;
`;

const ErrorTitle = styled.h3`
  color: #dc3545;
  font-size: 1.3rem;
  margin-bottom: 10px;
`;

const ErrorDescription = styled.p`
  color: #666;
  font-size: 1rem;
  margin-bottom: 20px;
`;

const RetryButton = styled.button`
  background: #dc3545;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #c82333;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

// Estilos personalizados para react-toastify
const ToastStyles = styled.div`
  .Toastify__toast--success {
    background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
    color: white;
  }

  .Toastify__toast--error {
    background: linear-gradient(135deg, #dc3545 0%, #fd7e8a 100%);
    color: white;
  }

  .Toastify__toast--info {
    background: linear-gradient(135deg, #fc6b0a 0%, #ff8f42 100%);
    color: white;
  }

  .Toastify__progress-bar--success {
    background: rgba(255, 255, 255, 0.7);
  }

  .Toastify__progress-bar--error {
    background: rgba(255, 255, 255, 0.7);
  }

  .Toastify__progress-bar--info {
    background: rgba(255, 255, 255, 0.7);
  }
`;

const ConfirmModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  padding: 20px;
`;

const ConfirmContent = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  max-width: 450px;
  width: 100%;
  padding: 30px;
  text-align: center;
`;

const ConfirmTitle = styled.h3`
  color: #fc6b0a;
  font-size: 1.3rem;
  margin-bottom: 15px;
`;

const ConfirmText = styled.p`
  color: #666;
  font-size: 1rem;
  margin-bottom: 25px;
  line-height: 1.5;
`;

const ConfirmActions = styled.div`
  display: flex;
  gap: 15px;
  justify-content: center;
`;

const ConfirmButton = styled.button`
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-1px);
  }
`;

const ConfirmUpdateButton = styled(ConfirmButton)`
  background: linear-gradient(135deg, #fc6b0a 0%, #ff8f42 100%);
  color: white;

  &:hover {
    box-shadow: 0 4px 15px rgba(252, 107, 10, 0.3);
  }
`;

const CancelConfirmButton = styled(ConfirmButton)`
  background: #6c757d;
  color: white;

  &:hover {
    background: #5a6268;
  }
`;

const CriteriosSection = styled.div`
  margin-top: 30px;
  padding: 25px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 2px dashed #e1e5e9;
`;

const SectionTitle = styled.h3`
  color: #333;
  font-size: 1.3rem;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const CriterioItem = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 15px;
  border: 1px solid #e1e5e9;
`;

const CriterioHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const CriterioName = styled.input`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  font-size: 1rem;
  margin-right: 10px;
`;

const CriterioWeight = styled.input`
  width: 80px;
  padding: 8px 12px;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  font-size: 1rem;
  text-align: center;
  margin-right: 10px;
`;

const CriterioSelect = styled.select`
  width: 150px;
  padding: 8px 12px;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  font-size: 1rem;
  margin-right: 10px;
`;

const RemoveButton = styled.button`
  background: #dc3545;
  color: white;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;

  &:hover {
    background: #c82333;
  }
`;

const AddCriterioButton = styled.button`
  background: #28a745;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  margin-top: 15px;

  &:hover {
    background: #218838;
  }
`;

const InfoTooltip = styled.div`
  position: relative;
  display: inline-block;
  margin-left: 8px;
  cursor: help;
`;

const InfoIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: transparent;
  color: #6c757d;
  border: 2px solid #6c757d;
  border-radius: 50%;
  font-size: 12px;
  font-weight: bold;

  &:hover + div {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }
`;

const TooltipContent = styled.div`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(-10px);
  background: #333;
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.85rem;
  line-height: 1.4;
  white-space: nowrap;
  max-width: 350px;
  white-space: normal;
  width: max-content;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;

  &::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 5px solid transparent;
    border-top-color: #333;
  }

  @media (max-width: 768px) {
    max-width: 280px;
    left: 0;
    transform: translateX(0) translateY(-10px);

    &::after {
      left: 20px;
      transform: translateX(0);
    }
  }
`;

const FileUploadSection = styled.div`
  margin-top: 25px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 2px dashed #e1e5e9;
`;

const FileUploadContainer = styled.div`
  position: relative;
`;

const FileDropZone = styled.div`
  border: 2px dashed ${(props) => (props.isDragOver ? "#fc6b0a" : "#e1e5e9")};
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${(props) => (props.isDragOver ? "#fff5f0" : "white")};

  &:hover {
    border-color: #fc6b0a;
    background: #fff5f0;
  }
`;

const FileInput = styled.input`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
`;

const FileUploadIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 15px;
  color: #fc6b0a;
`;

const FileUploadText = styled.div`
  color: #333;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 8px;
`;

const FileUploadSubtext = styled.div`
  color: #666;
  font-size: 0.9rem;
`;

const SelectedFileContainer = styled.div`
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  padding: 15px;
  margin-top: 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const FileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const FileIcon = styled.div`
  font-size: 1.5rem;
  color: #fc6b0a;
`;

const FileDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const FileName = styled.div`
  color: #333;
  font-weight: 600;
  font-size: 0.9rem;
`;

const FileSize = styled.div`
  color: #666;
  font-size: 0.8rem;
`;

const RemoveFileButton = styled.button`
  background: #dc3545;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #c82333;
  }
`;

const DownloadFileButton = styled.button`
  background: #28a745;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-right: 8px;

  &:hover {
    background: #218838;
  }
`;

const FileActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FileErrorMessage = styled.div`
  color: #dc3545;
  font-size: 0.9rem;
  margin-top: 10px;
  text-align: center;
`;

const EditarLicitacion = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  // Estados principales
  const [loading, setLoading] = useState(true);
  const [loadingRubros, setLoadingRubros] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [rubrosError, setRubrosError] = useState("");

  // Estado para el modal de confirmación
  const [showConfirmUpdate, setShowConfirmUpdate] = useState(false);
  const [pendingFormData, setPendingFormData] = useState(null);

  // Estados del formulario
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    rubroID: "",
    proyectoMineroID: "",
    fechaInicio: "",
    fechaCierre: "",
    presupuestoEstimado: "",
    condiciones: "",
  });

  const [rubros, setRubros] = useState([]);
  const [proyectosMineros, setProyectosMineros] = useState([]);
  const [loadingProyectos, setLoadingProyectos] = useState(true);
  const [proyectosError, setProyectosError] = useState("");
  const [errors, setErrors] = useState({});

  // Estado para criterios de evaluación
  const [criterios, setCriterios] = useState([]);

  // Estados para archivos
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Cargar datos iniciales
  useEffect(() => {
    console.log("EditarLicitacion useEffect called:", {
      id,
      user,
      userMineraID: user?.MineraID,
      usermineraID: user?.mineraID,
    });

    const fetchData = async () => {
      const promises = [fetchLicitacion(), fetchRubros()];

      if (user?.MineraID || user?.mineraID) {
        promises.push(fetchProyectosMineros());
      } else {
        setLoadingProyectos(false);
      }

      await Promise.all(promises);
    };

    if (id) {
      fetchData();
    } else {
      setError("ID de licitación no proporcionado");
      setLoading(false);
    }
  }, [id, user?.MineraID, user?.mineraID]);

  const fetchLicitacion = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `http://localhost:5242/api/licitaciones/${id}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Licitación no encontrada");
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const licitacion = await response.json();

      // Verificar que la licitación pertenece al usuario
      const userMineraID =
        user?.MineraID ||
        user?.Minera?.MineraID ||
        user?.minera?.mineraID ||
        user?.minera?.MineraID;

      const licitacionMineraID = licitacion.mineraID || licitacion.MineraID;

      if (
        userMineraID &&
        licitacionMineraID &&
        String(userMineraID) !== String(licitacionMineraID)
      ) {
        throw new Error("No tienes permisos para editar esta licitación");
      }

      // Formatear las fechas para los inputs datetime-local
      const formatDateForInput = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16);
      };

      // Poblar el formulario con los datos de la licitación
      setFormData({
        titulo: licitacion.titulo || licitacion.Titulo || "",
        descripcion: licitacion.descripcion || licitacion.Descripcion || "",
        rubroID: String(licitacion.rubroID || licitacion.RubroID || ""),
        proyectoMineroID: String(
          licitacion.proyectoMineroID || licitacion.ProyectoMineroID || ""
        ),
        fechaInicio: formatDateForInput(
          licitacion.fechaInicio || licitacion.FechaInicio
        ),
        fechaCierre: formatDateForInput(
          licitacion.fechaCierre || licitacion.FechaCierre
        ),
        presupuestoEstimado: String(
          licitacion.presupuestoEstimado || licitacion.PresupuestoEstimado || ""
        ),
        condiciones: licitacion.condiciones || licitacion.Condiciones || "",
      });

      // Cargar criterios de evaluación
      const criteriosData = licitacion.criterios || licitacion.Criterios || [];
      if (criteriosData.length > 0) {
        const mappedCriterios = criteriosData.map((criterio, index) => ({
          id: criterio.criterioID || criterio.CriterioID || index + 1,
          nombre: criterio.nombre || criterio.Nombre || "",
          descripcion: criterio.descripcion || criterio.Descripcion || "",
          peso: parseFloat(criterio.peso || criterio.Peso || 0),
          modoEvaluacion:
            criterio.modoEvaluacion || criterio.ModoEvaluacion || "MAYOR_MEJOR",
        }));
        setCriterios(mappedCriterios);
      } else {
        // Criterios por defecto si no hay ninguno
        setCriterios([
          {
            id: 1,
            nombre: "Precio",
            descripcion: "Costo total de la propuesta (en pesos argentinos)",
            peso: 50,
            modoEvaluacion: "MENOR_MEJOR",
          },
          {
            id: 2,
            nombre: "Experiencia",
            descripcion: "Años de experiencia en el rubro",
            peso: 50,
            modoEvaluacion: "MAYOR_MEJOR",
          },
        ]);
      }

      // Si hay archivo adjunto, mostrarlo
      if (licitacion.archivoNombre) {
        setSelectedFile({
          name: licitacion.archivoNombre,
          archivoID: licitacion.archivoID,
          isExisting: true,
        });
      }
    } catch (error) {
      setError(error.message || "Error al cargar la licitación");
    } finally {
      setLoading(false);
    }
  }, [id]); // Agregamos id como dependencia porque lo usa

  const fetchRubros = useCallback(async () => {
    try {
      setLoadingRubros(true);
      setRubrosError("");

      const response = await fetch("http://localhost:5242/api/rubros");

      if (response.ok) {
        const data = await response.json();
        setRubros(data);
      } else {
        throw new Error("Error al cargar rubros");
      }
    } catch (error) {
      console.error("Error fetching rubros:", error);
      setRubrosError(
        "Error al cargar rubros. Algunos campos pueden no funcionar correctamente."
      );
    } finally {
      setLoadingRubros(false);
    }
  }, []);

  const fetchProyectosMineros = useCallback(async () => {
    try {
      setLoadingProyectos(true);
      setProyectosError("");

      const mineraId = user?.MineraID || user?.mineraID;
      if (!mineraId) {
        setProyectosError("No se pudo obtener el ID de la minera del usuario.");
        setProyectosMineros([]);
        return;
      }

      const response = await fetch(
        `http://localhost:5242/api/proyectosmineros/minera/${mineraId}`
      );

      if (response.ok) {
        const data = await response.json();
        setProyectosMineros(data);
      } else {
        // const errorMsg = `Error del servidor: ${response.status} ${response.statusText}`;
        setProyectosError(
          "Error al cargar proyectos mineros desde el servidor."
        );
        setProyectosMineros([]);
      }
    } catch (error) {
      console.error("Error fetching proyectos mineros:", error);
      setProyectosError("No se pudo conectar con el servidor.");
      setProyectosMineros([]);
    } finally {
      setLoadingProyectos(false);
    }
  }, [user?.MineraID, user?.mineraID]); // Solo necesita user IDs

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpiar error al cambiar el valor
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Funciones para manejo de archivos
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const validateFile = (file) => {
    const maxSize = 50 * 1024 * 1024; // 50MB para licitaciones
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain",
      "image/jpeg",
      "image/png",
      "image/gif",
    ];

    if (file.size > maxSize) {
      return "El archivo es demasiado grande. Máximo 50MB.";
    }

    if (!allowedTypes.includes(file.type)) {
      return "Tipo de archivo no permitido. Use PDF, DOC, DOCX, XLS, XLSX, TXT, JPG, PNG o GIF.";
    }

    return null;
  };

  const handleFileSelect = (file) => {
    const error = validateFile(file);
    if (error) {
      setUploadError(error);
      return;
    }

    setSelectedFile(file);
    setUploadError("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setUploadError("");
  };

  const downloadFile = async (archivoID, nombreArchivo) => {
    try {
      const response = await fetch(
        `http://localhost:5242/api/archivos/descargar/${archivoID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al descargar el archivo");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = nombreArchivo;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Error al descargar el archivo");
    }
  };

  const redistributePesosMultiplosDe5 = (criteriosList) => {
    const totalCriterios = criteriosList.length;
    if (totalCriterios === 0) return criteriosList;

    // Calcular peso base como múltiplo de 5
    const pesoBase = Math.floor(100 / totalCriterios / 5) * 5;
    const pesoAsignado = pesoBase * totalCriterios;
    const resto = 100 - pesoAsignado;

    return criteriosList.map((criterio, index) => ({
      ...criterio,
      peso: index < resto / 5 ? pesoBase + 5 : pesoBase,
    }));
  };

  const handleCriterioChange = (id, field, value) => {
    setCriterios((prev) =>
      prev.map((criterio) =>
        criterio.id === id ? { ...criterio, [field]: value } : criterio
      )
    );
  };

  const addCriterio = () => {
    const newId = Math.max(...criterios.map((c) => c.id)) + 1;
    const newCriteriosList = [
      ...criterios,
      {
        id: newId,
        nombre: "",
        descripcion: "",
        peso: 0,
        modoEvaluacion: "MAYOR_MEJOR",
      },
    ];

    // Redistribuir pesos automáticamente
    const redistributedCriterios =
      redistributePesosMultiplosDe5(newCriteriosList);
    setCriterios(redistributedCriterios);
  };

  const removeCriterio = (id) => {
    const newCriteriosList = criterios.filter((criterio) => criterio.id !== id);

    // Solo redistribuir si quedan criterios
    if (newCriteriosList.length > 0) {
      const redistributedCriterios =
        redistributePesosMultiplosDe5(newCriteriosList);
      setCriterios(redistributedCriterios);
    } else {
      setCriterios(newCriteriosList);
    }
  };

  const getTotalPeso = () => {
    return criterios.reduce(
      (sum, criterio) => sum + parseFloat(criterio.peso || 0),
      0
    );
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.titulo.trim()) {
      newErrors.titulo = "El título es obligatorio";
    }

    if (!formData.descripcion.trim()) {
      newErrors.descripcion = "La descripción es obligatoria";
    }

    if (!formData.rubroID) {
      newErrors.rubroID = "Debe seleccionar un rubro";
    }

    if (!formData.fechaInicio) {
      newErrors.fechaInicio = "La fecha de inicio es obligatoria";
    }

    if (!formData.fechaCierre) {
      newErrors.fechaCierre = "La fecha de cierre es obligatoria";
    }

    // Validar que la fecha de cierre sea posterior a la fecha de inicio
    if (formData.fechaInicio && formData.fechaCierre) {
      const fechaInicio = new Date(formData.fechaInicio);
      const fechaCierre = new Date(formData.fechaCierre);

      if (fechaCierre <= fechaInicio) {
        newErrors.fechaCierre =
          "La fecha de cierre debe ser posterior a la fecha de inicio";
      }
    }

    // Validar criterios
    const totalPeso = getTotalPeso();
    if (Math.abs(totalPeso - 100) > 0.01) {
      newErrors.criterios =
        "El peso total de los criterios debe sumar exactamente 100%";
    }

    criterios.forEach((criterio) => {
      if (!criterio.nombre.trim()) {
        newErrors[`criterio_${criterio.id}_nombre`] =
          "El nombre del criterio es requerido";
      }
      if (!criterio.peso || criterio.peso <= 0) {
        newErrors[`criterio_${criterio.id}_peso`] =
          "El peso debe ser mayor a 0";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Por favor, corrija los errores en el formulario");
      return;
    }

    // Preparar datos para mostrar en el modal de confirmación
    const dataToSend = {
      titulo: formData.titulo.trim(),
      descripcion: formData.descripcion.trim(),
      rubroID: parseInt(formData.rubroID),
      fechaInicio: new Date(formData.fechaInicio).toISOString(),
      fechaCierre: new Date(formData.fechaCierre).toISOString(),
      presupuestoEstimado: formData.presupuestoEstimado
        ? parseFloat(formData.presupuestoEstimado)
        : null,
      condiciones: formData.condiciones.trim() || null,
      ProyectoMineroID: formData.proyectoMineroID
        ? parseInt(formData.proyectoMineroID)
        : null,
      criterios: criterios.map((c) => ({
        Nombre: c.nombre,
        Descripcion: c.descripcion,
        Peso: parseFloat(c.peso),
        ModoEvaluacion: c.modoEvaluacion,
      })),
    };

    setPendingFormData(dataToSend);
    setShowConfirmUpdate(true);
  };

  const confirmUpdate = async () => {
    if (!pendingFormData) return;

    setSubmitting(true);
    setShowConfirmUpdate(false);

    try {
      // Subir archivo si hay uno nuevo
      let archivoID = null;
      if (selectedFile && !selectedFile.isExisting) {
        const formData = new FormData();
        formData.append("File", selectedFile);
        formData.append("EntidadTipo", "LICITACION");
        formData.append("EntidadID", id);

        const uploadResponse = await fetch(
          "http://localhost:5242/api/archivos/upload",
          {
            method: "POST",
            body: formData,
          }
        );

        if (!uploadResponse.ok) {
          throw new Error("Error al subir el archivo");
        }

        const uploadResult = await uploadResponse.json();
        archivoID = uploadResult.archivoID || uploadResult.ArchivoID;
      }

      // Actualizar licitación
      const updateData = {
        ...pendingFormData,
        ArchivoID:
          archivoID ||
          (selectedFile?.isExisting ? selectedFile.archivoID : null),
      };

      const response = await fetch(
        `http://localhost:5242/api/licitaciones/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(
          errorData || `Error ${response.status}: ${response.statusText}`
        );
      }

      toast.success("Licitación actualizada exitosamente");

      // Redirigir a la página de licitaciones después de un breve delay
      setTimeout(() => {
        navigate("/mis-licitaciones");
      }, 1500);
    } catch (error) {
      console.error("Error updating licitacion:", error);
      toast.error(
        "Error al actualizar la licitación. Por favor, intente nuevamente."
      );
    } finally {
      setSubmitting(false);
      setPendingFormData(null);
    }
  };

  const cancelUpdate = () => {
    setShowConfirmUpdate(false);
    setPendingFormData(null);
  };

  const handleCancel = () => {
    navigate("/mis-licitaciones");
  };

  const getCompanyName = () => {
    return user?.Minera?.Nombre || user?.minera?.nombre || "Empresa Minera";
  };

  // Mostrar spinner de carga inicial
  if (loading) {
    return (
      <FormContainer>
        <Navbar />
        <MainContent>
          <FormCard>
            <LoadingContainer>
              <LoadingSpinner />
              <LoadingText>Cargando licitación...</LoadingText>
            </LoadingContainer>
          </FormCard>
        </MainContent>
      </FormContainer>
    );
  }

  // Mostrar error si no se pudo cargar
  if (error) {
    return (
      <FormContainer>
        <Navbar />
        <MainContent>
          <FormCard>
            <ErrorContainer>
              <ErrorIcon>⚠️</ErrorIcon>
              <ErrorTitle>Error al cargar licitación</ErrorTitle>
              <ErrorDescription>{error}</ErrorDescription>
              <RetryButton onClick={() => window.location.reload()}>
                Reintentar
              </RetryButton>
            </ErrorContainer>
          </FormCard>
        </MainContent>
      </FormContainer>
    );
  }

  return (
    <FormContainer>
      <Navbar />

      <MainContent>
        <FormCard>
          <FormTitle>Editar licitación</FormTitle>
          <FormSubtitle>
            Modifica los datos de la licitación de {getCompanyName()}
          </FormSubtitle>

          <form onSubmit={handleSubmit}>
            <FormGroup>
              <FormLabel htmlFor="titulo">Título de la licitación *</FormLabel>
              <FormInput
                type="text"
                id="titulo"
                name="titulo"
                value={formData.titulo}
                onChange={handleInputChange}
                placeholder="Ej: Suministro de equipos de seguridad industrial"
                required
                maxLength={255}
              />
              <CharacterCount>
                {formData.titulo.length}/255 caracteres
              </CharacterCount>
              {errors.titulo && <ErrorText>{errors.titulo}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <FormLabel htmlFor="descripcion">Descripción *</FormLabel>
              <FormTextarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                placeholder="Describe los detalles de la licitación, requisitos específicos, condiciones, etc."
                required
                maxLength={2000}
              />
              <CharacterCount>
                {formData.descripcion.length}/2000 caracteres
              </CharacterCount>
              {errors.descripcion && (
                <ErrorText>{errors.descripcion}</ErrorText>
              )}
            </FormGroup>

            <FormGroup>
              <FormLabel htmlFor="rubroID">Rubro *</FormLabel>
              <FormSelect
                id="rubroID"
                name="rubroID"
                value={formData.rubroID}
                onChange={handleInputChange}
                required
                disabled={loadingRubros || rubros.length === 0}
              >
                <option value="">
                  {loadingRubros
                    ? "Cargando rubros..."
                    : rubros.length === 0
                    ? "No hay rubros disponibles"
                    : "Seleccionar rubro"}
                </option>
                {rubros.map((rubro) => (
                  <option key={rubro.rubroID} value={rubro.rubroID}>
                    {rubro.nombre}
                  </option>
                ))}
              </FormSelect>
              {errors.rubroID && <ErrorText>{errors.rubroID}</ErrorText>}
              {rubrosError && (
                <InfoText style={{ color: "#fc6b0a", marginTop: "5px" }}>
                  ⚠️ {rubrosError}
                </InfoText>
              )}
            </FormGroup>

            <FormGroup>
              <FormLabel htmlFor="proyectoMineroID">
                Proyecto minero
                <InfoTooltip>
                  <InfoIcon>?</InfoIcon>
                  <TooltipContent>
                    Seleccione el proyecto minero al cual pertenece esta
                    licitación. Este campo es opcional y te ayudará a organizar
                    mejor tus licitaciones.
                  </TooltipContent>
                </InfoTooltip>
              </FormLabel>
              <FormSelect
                id="proyectoMineroID"
                name="proyectoMineroID"
                value={formData.proyectoMineroID}
                onChange={handleInputChange}
                disabled={loadingProyectos}
              >
                <option value="">
                  {loadingProyectos
                    ? "Cargando proyectos..."
                    : proyectosMineros.length === 0
                    ? "No hay proyectos disponibles"
                    : "Sin proyecto asignado"}
                </option>
                {proyectosMineros.map((proyecto) => (
                  <option
                    key={proyecto.proyectoMineroID}
                    value={proyecto.proyectoMineroID}
                  >
                    {proyecto.nombre}{" "}
                    {proyecto.ubicacion && `- ${proyecto.ubicacion}`}
                  </option>
                ))}
              </FormSelect>
              {errors.proyectoMineroID && (
                <ErrorText>{errors.proyectoMineroID}</ErrorText>
              )}
              {proyectosError && (
                <InfoText style={{ color: "#fc6b0a", marginTop: "5px" }}>
                  ⚠️ {proyectosError}
                </InfoText>
              )}
              {proyectosMineros.length === 0 &&
                !loadingProyectos &&
                !proyectosError && (
                  <InfoText style={{ color: "#6c757d", marginTop: "5px" }}>
                    No hay proyectos mineros registrados. Puedes crear uno desde
                    la configuración de tu perfil.
                  </InfoText>
                )}
            </FormGroup>

            <FormRow>
              <FormGroup>
                <FormLabel htmlFor="fechaInicio">Fecha de inicio *</FormLabel>
                <FormInput
                  type="datetime-local"
                  id="fechaInicio"
                  name="fechaInicio"
                  value={formData.fechaInicio}
                  onChange={handleInputChange}
                  required
                />
                {errors.fechaInicio && (
                  <ErrorText>{errors.fechaInicio}</ErrorText>
                )}
              </FormGroup>

              <FormGroup>
                <FormLabel htmlFor="fechaCierre">Fecha de cierre *</FormLabel>
                <FormInput
                  type="datetime-local"
                  id="fechaCierre"
                  name="fechaCierre"
                  value={formData.fechaCierre}
                  onChange={handleInputChange}
                  required
                />
                {errors.fechaCierre && (
                  <ErrorText>{errors.fechaCierre}</ErrorText>
                )}
              </FormGroup>
            </FormRow>

            <FormGroup>
              <FormLabel htmlFor="presupuestoEstimado">
                Presupuesto estimado
              </FormLabel>
              <FormInput
                type="number"
                id="presupuestoEstimado"
                name="presupuestoEstimado"
                value={formData.presupuestoEstimado}
                onChange={handleInputChange}
                placeholder="Ej: 50000"
                step="0.01"
                min="0"
              />
              <InfoText>Opcional: Monto estimado en pesos argentinos</InfoText>
            </FormGroup>

            <FormGroup>
              <FormLabel htmlFor="condiciones">Condiciones</FormLabel>
              <FormTextarea
                id="condiciones"
                name="condiciones"
                value={formData.condiciones}
                onChange={handleInputChange}
                placeholder="Términos y condiciones específicas, requisitos legales, documentación requerida, etc."
                maxLength={2000}
              />
              <CharacterCount>
                {formData.condiciones.length}/2000 caracteres
              </CharacterCount>
              <InfoText>
                Opcional: Condiciones específicas para la licitación
              </InfoText>
            </FormGroup>

            <CriteriosSection>
              <SectionTitle>
                Criterios de evaluación
                <InfoTooltip>
                  <InfoIcon>i</InfoIcon>
                  <TooltipContent>
                    <strong>¿Qué son los criterios de evaluación?</strong>
                    <br />
                    Los criterios determinan cómo se evaluarán las propuestas de
                    los proveedores.
                    <br />
                    <br />
                    <strong>Pesos:</strong> Cada criterio tiene un peso (%) que
                    indica su importancia. La suma debe ser 100%.
                    <br />
                    <br />
                    <strong>Redistribución automática:</strong> Al agregar o
                    eliminar criterios, los pesos se redistribuyen
                    automáticamente usando múltiplos de 5.
                    <br />
                    <br />
                    <strong>Evaluación:</strong>
                    <br />
                    • "Mayor es mejor": Valores más altos obtienen mejor
                    puntuación
                    <br />
                    • "Menor es mejor": Valores más bajos obtienen mejor
                    puntuación
                    <br />
                    <br />
                    Puedes modificar los pesos manualmente después de la
                    redistribución automática.
                  </TooltipContent>
                </InfoTooltip>
                {getTotalPeso() !== 100 && (
                  <span
                    style={{
                      color: "#dc3545",
                      fontSize: "0.9rem",
                      marginLeft: "10px",
                    }}
                  >
                    (Total: {getTotalPeso().toFixed(1)}% - debe sumar 100%)
                  </span>
                )}
              </SectionTitle>

              {criterios.map((criterio) => (
                <CriterioItem key={criterio.id}>
                  <CriterioHeader>
                    <CriterioName
                      placeholder="Nombre del criterio"
                      value={criterio.nombre}
                      onChange={(e) =>
                        handleCriterioChange(
                          criterio.id,
                          "nombre",
                          e.target.value
                        )
                      }
                    />
                    <CriterioWeight
                      type="number"
                      placeholder="Peso %"
                      min="0"
                      max="100"
                      step="0.1"
                      value={criterio.peso}
                      onChange={(e) =>
                        handleCriterioChange(
                          criterio.id,
                          "peso",
                          parseFloat(e.target.value) || 0
                        )
                      }
                    />
                    <CriterioSelect
                      value={criterio.modoEvaluacion}
                      onChange={(e) =>
                        handleCriterioChange(
                          criterio.id,
                          "modoEvaluacion",
                          e.target.value
                        )
                      }
                    >
                      <option value="MAYOR_MEJOR">Mayor es mejor</option>
                      <option value="MENOR_MEJOR">Menor es mejor</option>
                    </CriterioSelect>
                    {criterios.length > 1 && (
                      <RemoveButton
                        type="button"
                        onClick={() => removeCriterio(criterio.id)}
                        title="Eliminar criterio"
                      >
                        ×
                      </RemoveButton>
                    )}
                  </CriterioHeader>

                  <FormTextarea
                    placeholder="Descripción del criterio (opcional)"
                    value={criterio.descripcion}
                    onChange={(e) =>
                      handleCriterioChange(
                        criterio.id,
                        "descripcion",
                        e.target.value
                      )
                    }
                    style={{ minHeight: "80px" }}
                  />

                  {errors[`criterio_${criterio.id}_nombre`] && (
                    <ErrorText>
                      {errors[`criterio_${criterio.id}_nombre`]}
                    </ErrorText>
                  )}
                  {errors[`criterio_${criterio.id}_peso`] && (
                    <ErrorText>
                      {errors[`criterio_${criterio.id}_peso`]}
                    </ErrorText>
                  )}
                </CriterioItem>
              ))}

              <AddCriterioButton type="button" onClick={addCriterio}>
                + Agregar criterio
              </AddCriterioButton>

              {errors.criterios && (
                <ErrorText style={{ marginTop: "10px" }}>
                  {errors.criterios}
                </ErrorText>
              )}
            </CriteriosSection>

            <FileUploadSection>
              <FormLabel>Archivo adjunto</FormLabel>
              <InfoText style={{ marginBottom: "15px" }}>
                Puede adjuntar un documento que complemente la información de la
                licitación
              </InfoText>

              <FileUploadContainer>
                <FileDropZone
                  isDragOver={isDragOver}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <FileInput
                    id="licitacionFileInput"
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif"
                  />
                  <FileUploadIcon>📎</FileUploadIcon>
                  <FileUploadText>
                    Haga clic aquí o arrastre un archivo
                  </FileUploadText>
                  <FileUploadSubtext>
                    PDF, DOC, DOCX, XLS, XLSX, TXT, JPG, PNG, GIF (máx. 50MB)
                  </FileUploadSubtext>
                </FileDropZone>

                {selectedFile && (
                  <SelectedFileContainer>
                    <FileInfo>
                      <FileIcon>📄</FileIcon>
                      <FileDetails>
                        <FileName>{selectedFile.name}</FileName>
                        {selectedFile.size && (
                          <FileSize>
                            {formatFileSize(selectedFile.size)}
                          </FileSize>
                        )}
                        {selectedFile.isExisting && (
                          <InfoText>Archivo actual</InfoText>
                        )}
                        {selectedFile.size && (
                          <InfoText>
                            Archivo nuevo
                            {selectedFile.isExisting
                              ? " (reemplazará el actual)"
                              : ""}
                          </InfoText>
                        )}
                      </FileDetails>
                    </FileInfo>
                    <FileActions>
                      {selectedFile.isExisting && selectedFile.archivoID && (
                        <DownloadFileButton
                          onClick={() =>
                            downloadFile(
                              selectedFile.archivoID,
                              selectedFile.name
                            )
                          }
                        >
                          Descargar
                        </DownloadFileButton>
                      )}
                      <RemoveFileButton onClick={removeFile}>
                        Quitar
                      </RemoveFileButton>
                    </FileActions>
                  </SelectedFileContainer>
                )}

                {uploadError && (
                  <FileErrorMessage>{uploadError}</FileErrorMessage>
                )}
              </FileUploadContainer>
            </FileUploadSection>

            <ButtonGroup>
              <PrimaryButton
                type="submit"
                disabled={
                  submitting ||
                  loadingRubros ||
                  rubros.length === 0 ||
                  !formData.titulo.trim() ||
                  !formData.descripcion.trim() ||
                  !formData.rubroID ||
                  !formData.fechaInicio ||
                  !formData.fechaCierre ||
                  getTotalPeso() !== 100 ||
                  showConfirmUpdate
                }
              >
                {submitting ? "Actualizando..." : "Actualizar licitación"}
              </PrimaryButton>
              <SecondaryButton
                type="button"
                onClick={handleCancel}
                disabled={submitting || showConfirmUpdate}
              >
                Cancelar
              </SecondaryButton>
            </ButtonGroup>
          </form>
        </FormCard>
      </MainContent>

      {/* Modal de confirmación de actualización */}
      {showConfirmUpdate && (
        <ConfirmModal
          onClick={(e) => e.target === e.currentTarget && cancelUpdate()}
        >
          <ConfirmContent>
            <ConfirmTitle>💾 Confirmar actualización</ConfirmTitle>
            <ConfirmText>
              ¿Está seguro que desea actualizar la licitación
              <strong> "{formData.titulo}"</strong>?
              <br />
              <br />
              Los cambios se guardarán permanentemente.
            </ConfirmText>
            <ConfirmActions>
              <CancelConfirmButton onClick={cancelUpdate}>
                Cancelar
              </CancelConfirmButton>
              <ConfirmUpdateButton onClick={confirmUpdate}>
                Actualizar
              </ConfirmUpdateButton>
            </ConfirmActions>
          </ConfirmContent>
        </ConfirmModal>
      )}

      <ToastStyles>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          style={{ zIndex: 9999 }}
        />
      </ToastStyles>
    </FormContainer>
  );
};

export default EditarLicitacion;
