import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DialogModal from "../shared/DialogModal";
import Navbar from "../shared/Navbar";
import apiService from "../../services/apiService";

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
  background: #0f172a;
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
  font-size: 0.9rem;
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
  font-size: 0.9rem;
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
  font-size: 0.9rem;
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
  font-size: 0.9rem;
  margin-right: 10px;
`;

const CriterioWeight = styled.input`
  width: 80px;
  padding: 8px 12px;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  font-size: 0.9rem;
  text-align: center;
  margin-right: 10px;
`;

const CriterioSelect = styled.select`
  width: 150px;
  padding: 8px 12px;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  font-size: 0.9rem;
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

  &:hover {
    background: #218838;
  }
`;

const CriteriaInfoWrapper = styled.div`
  display: inline-flex;
  align-items: center;
`;

const CriteriaInfoButton = styled.button`
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: none;
  background: #e2e8f0;
  color: #0f172a;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease, transform 0.2s ease;
  margin-left: 6px;

  &:hover {
    background: #cbd5f5;
    transform: translateY(-1px);
  }

  &:focus {
    outline: 2px solid #2563eb;
    outline-offset: 2px;
  }
`;

const CriteriaInfoOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 3000;
`;

const CriteriaInfoPopup = styled.div`
  width: 460px;
  max-width: 90vw;
  background: #ffffff;
  border-radius: 12px;
  padding: 22px 24px 24px;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.2);
  border: 1px solid #e2e8f0;
`;

const CriteriaInfoPopupTitle = styled.h5`
  margin: 0 0 8px;
  font-size: 1.05rem;
  color: #0f172a;
`;

const CriteriaInfoPopupText = styled.p`
  margin: 0 0 10px;
  font-size: 0.9rem;
  color: #475569;
  line-height: 1.4;
`;

const CriteriaInfoList = styled.ul`
  margin: 0 0 12px 18px;
  padding: 0;
  color: #1e293b;
  font-size: 0.9rem;
  line-height: 1.4;
`;

const CriteriaInfoListItem = styled.li`
  margin-bottom: 8px;

  strong {
    color: #0f172a;
  }
`;

const CriteriaInfoSubList = styled.ul`
  margin: 6px 0 0 18px;
  padding: 0;
  color: #475569;
  list-style: disc;
  line-height: 1.4;

  li {
    margin-bottom: 4px;
  }
`;

const CriteriaInfoCloseButton = styled.button`
  margin-top: 8px;
  border: none;
  background: #0f172a;
  color: white;
  border-radius: 6px;
  padding: 8px 14px;
  font-size: 0.9rem;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s ease;

  &:hover {
    background: #1f2937;
  }
`;

const ToggleRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 12px;
`;

const ToggleLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  color: #444;
`;

const ToggleInput = styled.input`
  width: 18px;
  height: 18px;
`;

const RangeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 15px;
`;

const RangeField = styled.label`
  display: flex;
  flex-direction: column;
  font-size: 0.9rem;
  color: #555;
  flex: 1;
  min-width: 140px;
`;

const RangeInput = styled.input`
  margin-top: 6px;
  padding: 8px 12px;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  font-size: 0.95rem;
`;

const TipoConfigBanner = styled.div`
  margin-top: 15px;
  padding: 18px;
  border-radius: 8px;
  border: 1px dashed #ffb889;
  background: #fff4ec;
`;

const BannerTitle = styled.p`
  margin: 0 0 12px 0;
  font-weight: 600;
  color: #cc5804;
`;

const BannerSelect = styled.select`
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #f3c5a5;
  border-radius: 6px;
  font-size: 0.95rem;
  background: #fffaf5;

  &:focus {
    outline: none;
    border-color: #fc6b0a;
    box-shadow: 0 0 0 3px rgba(252, 107, 10, 0.15);
  }
`;

const OpcionesContainer = styled.div`
  margin-top: 15px;
  padding: 18px;
  border-radius: 8px;
  border: 1px dashed #ffb889;
  background: #fff4ec;
`;

const OpcionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: flex-start;
  margin-bottom: 10px;
`;

const OpcionInput = styled.input`
  flex: 1;
  min-width: 140px;
  padding: 8px 12px;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  font-size: 0.95rem;
`;

const OpcionPuntajeInput = styled.input`
  width: 120px;
  padding: 8px 12px;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  font-size: 0.95rem;
`;

const RemoveOptionButton = styled.button`
  background: #dc3545;
  color: white;
  border: none;
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;

  &:hover {
    background: #c82333;
  }
`;

const AddOptionButton = styled.button`
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;

  &:hover {
    background: #0069d9;
  }
`;

const BooleanChoiceRow = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
  margin-top: 12px;
  flex-wrap: wrap;
`;

const BooleanChoiceLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.95rem;
  color: #444;
`;

const BooleanChoiceInput = styled.input`
  width: 16px;
  height: 16px;
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

const tipoCriterioOptions = [
  { value: "Numerico", label: "Valor numérico" },
  { value: "Booleano", label: "Sí / No" },
  { value: "Descriptivo", label: "Respuesta descriptiva" },
  { value: "Escala", label: "Escala personalizada" },
];

const createCriterio = (criterioId, overrides = {}) => ({
  id: criterioId,
  nombre: "",
  descripcion: "",
  peso: 0,
  tipo: "Numerico",
  mayorMejor: true,
  esExcluyente: false,
  esPuntuable: true,
  valorMinimo: "",
  valorMaximo: "",
  valorRequeridoBooleano: null,
  opciones: [],
  ...overrides,
});

const createOpcion = (overrides = {}) => ({
  tempId: `opt_${Math.random().toString(36).slice(2, 9)}`,
  valor: "",
  descripcion: "",
  puntaje: "",
  orden: 0,
  ...overrides,
});

const getOptionKey = (option, fallback) =>
  option.opcionID ?? option.OpcionID ?? option.tempId ?? fallback;

const resolveTipoValue = (tipoValue) => {
  if (typeof tipoValue === "string" && tipoValue) {
    return tipoValue;
  }

  if (typeof tipoValue === "number") {
    switch (tipoValue) {
      case 2:
        return "Booleano";
      case 3:
        return "Descriptivo";
      case 4:
        return "Escala";
      default:
        return "Numerico";
    }
  }

  return "Numerico";
};

const normalizeDecimalInput = (value) =>
  value === null || value === undefined ? "" : String(value);

const normalizeMoneda = (moneda) => ({
  id: moneda?.monedaID ?? moneda?.MonedaID ?? moneda?.id ?? 0,
  codigo: moneda?.codigo ?? moneda?.Codigo ?? "",
  nombre: moneda?.nombre ?? moneda?.Nombre ?? "",
  simbolo: moneda?.simbolo ?? moneda?.Simbolo ?? "",
});

const EditarLicitacion = () => {
  const { user } = useAuth();
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
  const [showCriteriaInfo, setShowCriteriaInfo] = useState(false);

  // Estados del formulario
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    rubroID: "",
    monedaID: "",
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
  const [monedas, setMonedas] = useState([]);
  const [loadingMonedas, setLoadingMonedas] = useState(true);
  const [monedasError, setMonedasError] = useState("");
  const [errors, setErrors] = useState({});

  // Estado para criterios de evaluación
  const [criterios, setCriterios] = useState(() => [
    createCriterio(1, {
      nombre: "Precio",
      descripcion: "Costo total de la propuesta",
      peso: 25,
      tipo: "Numerico",
      mayorMejor: false,
    }),
    createCriterio(2, {
      nombre: "Experiencia",
      descripcion: "Años de experiencia en el rubro",
      peso: 25,
    }),
    createCriterio(3, {
      nombre: "Proyectos realizados",
      descripcion:
        "Cantidad de proyectos realizados con características comparables",
      peso: 25,
    }),
    createCriterio(4, {
      nombre: "Tiempo de entrega",
      descripcion: "Plazo de entrega propuesto (en días)",
      peso: 25,
      tipo: "Numerico",
      mayorMejor: false,
    }),
  ]);

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

      if (user?.minera?.mineraID) {
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
  }, [id, user?.minera?.mineraID]);

  useEffect(() => {
    const fetchMonedas = async () => {
      try {
        setLoadingMonedas(true);
        setMonedasError("");
        const response = await apiService.getMonedas();
        const payload = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.value)
          ? response.data.value
          : [];
        const normalized = payload
          .map((moneda) => normalizeMoneda(moneda))
          .filter((moneda) => moneda.id);
        setMonedas(normalized);
        if (normalized.length > 0) {
          setFormData((prev) =>
            prev.monedaID
              ? prev
              : { ...prev, monedaID: String(normalized[0].id) }
          );
        }
      } catch (error) {
        console.error("Error fetching monedas:", error);
        setMonedasError("No se pudieron cargar las monedas disponibles.");
        setMonedas([]);
      } finally {
        setLoadingMonedas(false);
      }
    };

    fetchMonedas();
  }, []);

  const fetchLicitacion = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const resp = await apiService.getLicitacionById(id);
      const licitacion = resp.data || {};

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
        throw new Error("No tiene permisos para editar esta licitación");
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
        monedaID: String(licitacion.monedaID || licitacion.MonedaID || ""),
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
        const mappedCriterios = criteriosData.map((criterio, index) => {
          const tipo = resolveTipoValue(criterio.tipo ?? criterio.Tipo);
          const esNumerico = tipo === "Numerico";
          const esEscala = tipo === "Escala";
          const esBooleano = tipo === "Booleano";
          const esDescriptivo = tipo === "Descriptivo";

          const valorMinimo = criterio.valorMinimo ?? criterio.ValorMinimo;
          const valorMaximo = criterio.valorMaximo ?? criterio.ValorMaximo;
          const mayorMejorValue = esNumerico
            ? criterio.mayorMejor ?? criterio.MayorMejor ?? true
            : null;

          const opciones = esEscala
            ? (criterio.opciones || criterio.Opciones || []).map(
                (opcion, idx) =>
                  createOpcion({
                    opcionID: opcion.opcionID || opcion.OpcionID,
                    tempId: `opt_${
                      opcion.opcionID || opcion.OpcionID || idx + 1
                    }`,
                    valor: opcion.valor || opcion.Valor || "",
                    descripcion: opcion.descripcion || opcion.Descripcion || "",
                    puntaje:
                      criterio.esPuntuable || criterio.EsPuntuable
                        ? normalizeDecimalInput(
                            opcion.puntaje ?? opcion.Puntaje ?? ""
                          )
                        : null,
                    orden: opcion.orden || opcion.Orden || idx + 1,
                  })
              )
            : [];

          return createCriterio(
            criterio.criterioID || criterio.CriterioID || index + 1,
            {
              nombre: criterio.nombre || criterio.Nombre || "",
              descripcion: criterio.descripcion || criterio.Descripcion || "",
              peso: parseFloat(criterio.peso || criterio.Peso || 0),
              tipo,
              mayorMejor: mayorMejorValue,
              esExcluyente:
                criterio.esExcluyente ?? criterio.EsExcluyente ?? false,
              esPuntuable:
                criterio.esPuntuable ?? criterio.EsPuntuable ?? !esDescriptivo,
              valorMinimo: esNumerico ? normalizeDecimalInput(valorMinimo) : "",
              valorMaximo: esNumerico ? normalizeDecimalInput(valorMaximo) : "",
              valorRequeridoBooleano: esBooleano
                ? criterio.valorRequeridoBooleano ??
                  criterio.ValorRequeridoBooleano ??
                  null
                : null,
              opciones,
            }
          );
        });
        setCriterios(mappedCriterios);
      } else {
        setCriterios([
          createCriterio(1, {
            nombre: "Precio",
            descripcion: "Costo total de la propuesta",
            peso: 50,
            tipo: "Numerico",
            mayorMejor: false,
          }),
          createCriterio(2, {
            nombre: "Experiencia",
            descripcion: "Años de experiencia en el rubro",
            peso: 50,
          }),
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

  const toUtcISOString = useCallback((value) => {
    if (!value) return null;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
  }, []);

  const fetchRubros = useCallback(async () => {
    try {
      setLoadingRubros(true);
      setRubrosError("");
      const response = await apiService.getRubros();
      const data = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.value)
        ? response.data.value
        : [];
      setRubros(data);
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

      const mineraId = user?.minera?.mineraID;

      if (!mineraId) {
        setProyectosError(
          "No se pudo obtener el ID de la minera del usuario."
        );
        setProyectosMineros([]);
        return;
      }

      const response = await apiService.getProyectosMinerosByMinera(mineraId);
      const data = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.value)
        ? response.data.value
        : [];
      setProyectosMineros(data);
    } catch (error) {
      console.error("Error fetching proyectos mineros:", error);
      const message =
        error.response?.data?.message ||
        (typeof error.response?.data === "string"
          ? error.response.data
          : "No se pudo conectar con el servidor.");
      setProyectosError(message);
      setProyectosMineros([]);
    } finally {
      setLoadingProyectos(false);
    }
  }, [user?.minera?.mineraID]);

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
      const response = await apiService.downloadArchivo(archivoID);
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = nombreArchivo;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al desacargar el archivo:", error);
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
      prev.map((criterio) => {
        if (criterio.id !== id) return criterio;

        const updated = { ...criterio, [field]: value };

        if (field === "tipo") {
          const existingOptions = criterio.opciones || [];
          if (
            value === "Numerico" &&
            (criterio.mayorMejor === null || criterio.mayorMejor === undefined)
          ) {
            updated.mayorMejor = true;
          }

          if (value !== "Numerico") {
            updated.valorMinimo = "";
            updated.valorMaximo = "";
            updated.mayorMejor = null;
          }

          if (value !== "Booleano") {
            updated.valorRequeridoBooleano = null;
          }

          if (value !== "Escala") {
            updated.opciones = [];
          } else if (!existingOptions.length) {
            updated.opciones = [
              createOpcion({ orden: 1 }),
              createOpcion({ orden: 2 }),
            ];
          } else {
            updated.opciones = existingOptions;
          }
        }

        if (field === "esPuntuable" && !value) {
          updated.esPuntuable = false;
          updated.valorRequeridoBooleano = null;
        }

        if (updated.tipo === "Descriptivo") {
          updated.esExcluyente = false;
          updated.esPuntuable = false;
          updated.valorRequeridoBooleano = null;
        }

        if (updated.tipo !== "Escala" && updated.opciones?.length) {
          updated.opciones = [];
        }

        return updated;
      })
    );
  };

  const addCriterio = () => {
    const newId = criterios.length
      ? Math.max(...criterios.map((c) => c.id)) + 1
      : 1;
    const newCriteriosList = [...criterios, createCriterio(newId)];

    // Redistribuir pesos automáticamente
    const redistributedCriterios =
      redistributePesosMultiplosDe5(newCriteriosList);
    setCriterios(redistributedCriterios);
  };

  const removeCriterio = (id) => {
    const newCriteriosList = criterios.filter((criterio) => criterio.id !== id);

    if (newCriteriosList.length > 0) {
      const redistributedCriterios =
        redistributePesosMultiplosDe5(newCriteriosList);
      setCriterios(redistributedCriterios);
    } else {
      setCriterios(newCriteriosList);
    }
  };

  const addCriterioOption = (criterioId) => {
    setCriterios((prev) =>
      prev.map((criterio) =>
        criterio.id === criterioId
          ? {
              ...criterio,
              opciones: [
                ...(criterio.opciones || []),
                createOpcion({ orden: (criterio.opciones?.length || 0) + 1 }),
              ],
            }
          : criterio
      )
    );
  };

  const removeCriterioOption = (criterioId, optionId) => {
    setCriterios((prev) =>
      prev.map((criterio) => {
        if (criterio.id !== criterioId) return criterio;

        const remaining = (criterio.opciones || []).filter(
          (opcion) => getOptionKey(opcion, opcion.orden) !== optionId
        );

        return {
          ...criterio,
          opciones: remaining.map((opcion, index) => ({
            ...opcion,
            orden: index + 1,
          })),
        };
      })
    );
  };

  const handleOpcionChange = (criterioId, optionId, field, value) => {
    setCriterios((prev) =>
      prev.map((criterio) => {
        if (criterio.id !== criterioId) return criterio;

        return {
          ...criterio,
          opciones: (criterio.opciones || []).map((opcion) => {
            const key = getOptionKey(opcion, opcion.orden);
            if (key !== optionId) return opcion;
            return {
              ...opcion,
              [field]: value,
            };
          }),
        };
      })
    );
  };

  const getTotalPeso = () => {
    return criterios.reduce(
      (sum, criterio) => sum + parseFloat(criterio.peso || 0),
      0
    );
  };

  const getSelectedMoneda = () =>
    monedas.find((moneda) => String(moneda.id) === String(formData.monedaID));

  const selectedMoneda = getSelectedMoneda();

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

    if (!formData.monedaID) {
      newErrors.monedaID = "Debe seleccionar una moneda";
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

      if (criterio.tipo === "Numerico") {
        if (criterio.mayorMejor === null || criterio.mayorMejor === undefined) {
          newErrors[`criterio_${criterio.id}_modo`] =
            "Selecciona si valores mayores o menores puntúan mejor";
        }

        const hasMin =
          criterio.valorMinimo !== "" &&
          criterio.valorMinimo !== null &&
          criterio.valorMinimo !== undefined;
        const hasMax =
          criterio.valorMaximo !== "" &&
          criterio.valorMaximo !== null &&
          criterio.valorMaximo !== undefined;

        if (criterio.esExcluyente && !hasMin) {
          newErrors[`criterio_${criterio.id}_min`] =
            "Define un valor mínimo para los criterios excluyentes";
        }

        if (criterio.esExcluyente && !hasMax) {
          newErrors[`criterio_${criterio.id}_max`] =
            "Define un valor máximo para los criterios excluyentes";
        }

        if (hasMin) {
          const minValue = parseFloat(criterio.valorMinimo);
          if (Number.isNaN(minValue)) {
            newErrors[`criterio_${criterio.id}_min`] =
              "El valor mínimo debe ser numérico";
          }
        }

        if (hasMax) {
          const maxValue = parseFloat(criterio.valorMaximo);
          if (Number.isNaN(maxValue)) {
            newErrors[`criterio_${criterio.id}_max`] =
              "El valor máximo debe ser numérico";
          }
        }

        if (hasMin && hasMax) {
          const minValue = parseFloat(criterio.valorMinimo);
          const maxValue = parseFloat(criterio.valorMaximo);
          if (!Number.isNaN(minValue) && !Number.isNaN(maxValue)) {
            if (minValue > maxValue) {
              newErrors[`criterio_${criterio.id}_range`] =
                "El mínimo no puede ser mayor que el máximo";
            }
          }
        }
      }

      if (criterio.tipo === "Escala") {
        if (!criterio.opciones || criterio.opciones.length < 2) {
          newErrors[`criterio_${criterio.id}_opciones`] =
            "Agregue al menos dos opciones para la escala";
        }

        (criterio.opciones || []).forEach((opcion, index) => {
          const optionKey = getOptionKey(opcion, `idx_${criterio.id}_${index}`);
          if (!opcion.valor?.trim()) {
            newErrors[`criterio_${criterio.id}_opcion_${optionKey}_valor`] =
              "La etiqueta es obligatoria";
          }

          if (criterio.esPuntuable || criterio.esExcluyente) {
            const puntajeValue =
              opcion.puntaje === "" ? NaN : parseFloat(opcion.puntaje);
            if (Number.isNaN(puntajeValue)) {
              newErrors[`criterio_${criterio.id}_opcion_${optionKey}_puntaje`] =
                "Indique un puntaje válido";
            }
          }
        });
      }

      if (
        criterio.tipo === "Booleano" &&
        (criterio.esPuntuable || criterio.esExcluyente) &&
        (criterio.valorRequeridoBooleano === null ||
          criterio.valorRequeridoBooleano === undefined)
      ) {
        newErrors[`criterio_${criterio.id}_booleano`] =
          "Seleccione la respuesta correcta para este criterio";
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

    const criteriosPayload = criterios.map((criterio) => {
      const esNumerico = criterio.tipo === "Numerico";
      const esEscala = criterio.tipo === "Escala";
      const esDescriptivo = criterio.tipo === "Descriptivo";
      const esBooleano = criterio.tipo === "Booleano";

      const rawMin = esNumerico ? criterio.valorMinimo : null;
      const rawMax = esNumerico ? criterio.valorMaximo : null;
      const minValue =
        rawMin === null || rawMin === "" ? null : parseFloat(rawMin);
      const maxValue =
        rawMax === null || rawMax === "" ? null : parseFloat(rawMax);

      const opciones = esEscala
        ? (criterio.opciones || []).map((opcion, index) => {
            const puntajeValue =
              criterio.esPuntuable && opcion.puntaje !== ""
                ? parseFloat(opcion.puntaje)
                : null;

            return {
              Valor: opcion.valor,
              Descripcion: opcion.descripcion,
              Puntaje:
                criterio.esPuntuable &&
                puntajeValue !== null &&
                !Number.isNaN(puntajeValue)
                  ? puntajeValue
                  : null,
              Orden: index + 1,
            };
          })
        : [];

      return {
        Nombre: criterio.nombre,
        Descripcion: criterio.descripcion,
        Peso: parseFloat(criterio.peso),
        MayorMejor:
          esNumerico && criterio.mayorMejor !== undefined
            ? criterio.mayorMejor
            : null,
        Tipo: criterio.tipo,
        EsExcluyente: esDescriptivo ? false : !!criterio.esExcluyente,
        EsPuntuable: esDescriptivo ? false : !!criterio.esPuntuable,
        ValorMinimo:
          esNumerico && minValue !== null && !Number.isNaN(minValue)
            ? minValue
            : null,
        ValorMaximo:
          esNumerico && maxValue !== null && !Number.isNaN(maxValue)
            ? maxValue
            : null,
        ValorRequeridoBooleano:
          esBooleano && criterio.esPuntuable
            ? criterio.valorRequeridoBooleano
            : null,
        Opciones: opciones,
      };
    });

    const fechaInicioUtc = toUtcISOString(formData.fechaInicio);
    const fechaCierreUtc = toUtcISOString(formData.fechaCierre);

    if (!fechaInicioUtc || !fechaCierreUtc) {
      toast.error("No pudimos interpretar las fechas ingresadas.");
      return;
    }

    const dataToSend = {
      titulo: formData.titulo.trim(),
      descripcion: formData.descripcion.trim(),
      rubroID: parseInt(formData.rubroID),
      MonedaID: parseInt(formData.monedaID),
      fechaInicio: fechaInicioUtc,
      fechaCierre: fechaCierreUtc,
      presupuestoEstimado: formData.presupuestoEstimado
        ? parseFloat(formData.presupuestoEstimado)
        : null,
      condiciones: formData.condiciones.trim() || null,
      ProyectoMineroID: formData.proyectoMineroID
        ? parseInt(formData.proyectoMineroID)
        : null,
      Criterios: criteriosPayload,
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
        const formDataFile = new FormData();
        formDataFile.append("File", selectedFile);
        formDataFile.append("EntidadTipo", "LICITACION");
        formDataFile.append("EntidadID", id);

        const uploadResp = await apiService.uploadArchivo(formDataFile);
        const uploadResult = uploadResp.data || {};
        archivoID = uploadResult.archivoID || uploadResult.ArchivoID || null;
      }

      // Actualizar licitación
      const updateData = {
        ...pendingFormData,
        ArchivoID:
          archivoID ||
          (selectedFile?.isExisting ? selectedFile.archivoID : null),
      };

      await apiService.updateLicitacion(id, updateData);

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
            Modifique los datos de la licitación de {getCompanyName()}.
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
              <FormLabel htmlFor="proyectoMineroID">Proyecto minero</FormLabel>
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
                    No hay proyectos mineros registrados. Puede crear uno desde
                    la configuración de su perfil.
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
              <FormLabel htmlFor="monedaID">
                Moneda de la licitación *
              </FormLabel>
              <FormSelect
                id="monedaID"
                name="monedaID"
                value={formData.monedaID}
                onChange={handleInputChange}
                disabled={loadingMonedas || monedas.length === 0}
                required
              >
                <option value="">
                  {loadingMonedas
                    ? "Cargando monedas..."
                    : monedas.length === 0
                    ? "No hay monedas disponibles"
                    : "Seleccione moneda"}
                </option>
                {monedas.map((moneda) => (
                  <option key={moneda.id} value={moneda.id}>
                    {moneda.nombre}
                    {moneda.codigo ? ` (${moneda.codigo})` : ""}
                  </option>
                ))}
              </FormSelect>
              {errors.monedaID && <ErrorText>{errors.monedaID}</ErrorText>}
              {monedasError && (
                <InfoText style={{ color: "#fc6b0a", marginTop: "5px" }}>
                  ⚠️ {monedasError}
                </InfoText>
              )}
            </FormGroup>

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
              <InfoText>
                Opcional: monto estimado en{" "}
                {selectedMoneda
                  ? selectedMoneda.nombre
                  : "la moneda seleccionada"}
                {selectedMoneda?.simbolo
                  ? ` (${selectedMoneda.simbolo})`
                  : selectedMoneda?.codigo
                  ? ` (${selectedMoneda.codigo})`
                  : ""}
              </InfoText>
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
                <CriteriaInfoWrapper>
                  <CriteriaInfoButton
                    type="button"
                    aria-label="Información sobre los criterios de evaluación"
                    onClick={() => setShowCriteriaInfo(true)}
                  >
                    i
                  </CriteriaInfoButton>
                </CriteriaInfoWrapper>
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
                      placeholder="Nombre del criterio *"
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
                      value={criterio.tipo}
                      onChange={(e) =>
                        handleCriterioChange(
                          criterio.id,
                          "tipo",
                          e.target.value
                        )
                      }
                      aria-label="Tipo de criterio"
                      title="Tipo de criterio"
                    >
                      {tipoCriterioOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
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
                    placeholder="Descripción del criterio"
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

                  <ToggleRow>
                    <ToggleLabel>
                      <ToggleInput
                        type="checkbox"
                        checked={!!criterio.esExcluyente}
                        onChange={(e) =>
                          handleCriterioChange(
                            criterio.id,
                            "esExcluyente",
                            e.target.checked
                          )
                        }
                        disabled={criterio.tipo === "Descriptivo"}
                      />
                      Criterio excluyente
                    </ToggleLabel>
                    <ToggleLabel>
                      <ToggleInput
                        type="checkbox"
                        checked={!!criterio.esPuntuable}
                        onChange={(e) =>
                          handleCriterioChange(
                            criterio.id,
                            "esPuntuable",
                            e.target.checked
                          )
                        }
                        disabled={criterio.tipo === "Descriptivo"}
                      />
                      Aporta puntaje
                    </ToggleLabel>
                  </ToggleRow>

                  {criterio.tipo === "Descriptivo" && (
                    <InfoText>
                      Las respuestas descriptivas sirven como contexto, pero no
                      impactan en puntajes ni pueden excluir proveedores.
                    </InfoText>
                  )}

                  {criterio.tipo === "Booleano" && (
                    <TipoConfigBanner>
                      <BannerTitle>Configuración de puntaje</BannerTitle>
                      {criterio.esPuntuable || criterio.esExcluyente ? (
                        <>
                          <BooleanChoiceRow>
                            <BooleanChoiceLabel>
                              <BooleanChoiceInput
                                type="radio"
                                name={`criterio_booleano_${criterio.id}`}
                                checked={
                                  criterio.valorRequeridoBooleano === true
                                }
                                onChange={() =>
                                  handleCriterioChange(
                                    criterio.id,
                                    "valorRequeridoBooleano",
                                    true
                                  )
                                }
                              />
                              Sí / Verdadero
                            </BooleanChoiceLabel>
                            <BooleanChoiceLabel>
                              <BooleanChoiceInput
                                type="radio"
                                name={`criterio_booleano_${criterio.id}`}
                                checked={
                                  criterio.valorRequeridoBooleano === false
                                }
                                onChange={() =>
                                  handleCriterioChange(
                                    criterio.id,
                                    "valorRequeridoBooleano",
                                    false
                                  )
                                }
                              />
                              No / Falso
                            </BooleanChoiceLabel>
                          </BooleanChoiceRow>
                          <InfoText>
                            {criterio.esExcluyente && !criterio.esPuntuable
                              ? "Seleccione qué respuesta debe cumplirse para evitar la descalificación."
                              : "Seleccione qué respuesta otorga puntaje para este criterio."}
                          </InfoText>
                          {errors[`criterio_${criterio.id}_booleano`] && (
                            <ErrorText>
                              {errors[`criterio_${criterio.id}_booleano`]}
                            </ErrorText>
                          )}
                        </>
                      ) : (
                        <InfoText>
                          Active "Aporta puntaje" si quiere evaluar esta
                          respuesta como válida o inválida.
                        </InfoText>
                      )}
                    </TipoConfigBanner>
                  )}

                  {criterio.tipo === "Numerico" && (
                    <TipoConfigBanner>
                      <BannerTitle>Configuración numérica</BannerTitle>
                      <BannerSelect
                        value={criterio.mayorMejor === false ? "false" : "true"}
                        onChange={(e) =>
                          handleCriterioChange(
                            criterio.id,
                            "mayorMejor",
                            e.target.value === "true"
                          )
                        }
                      >
                        <option value="true">Mayor es mejor</option>
                        <option value="false">Menor es mejor</option>
                      </BannerSelect>
                      <RangeRow>
                        <RangeField>
                          Valor mínimo
                          <RangeInput
                            type="number"
                            placeholder="Ej: 0"
                            value={criterio.valorMinimo || ""}
                            onChange={(e) =>
                              handleCriterioChange(
                                criterio.id,
                                "valorMinimo",
                                e.target.value
                              )
                            }
                          />
                        </RangeField>
                        <RangeField>
                          Valor máximo
                          <RangeInput
                            type="number"
                            placeholder="Ej: 100"
                            value={criterio.valorMaximo || ""}
                            onChange={(e) =>
                              handleCriterioChange(
                                criterio.id,
                                "valorMaximo",
                                e.target.value
                              )
                            }
                          />
                        </RangeField>
                      </RangeRow>
                      {errors[`criterio_${criterio.id}_min`] && (
                        <ErrorText>
                          {errors[`criterio_${criterio.id}_min`]}
                        </ErrorText>
                      )}
                      {errors[`criterio_${criterio.id}_max`] && (
                        <ErrorText>
                          {errors[`criterio_${criterio.id}_max`]}
                        </ErrorText>
                      )}
                      {errors[`criterio_${criterio.id}_range`] && (
                        <ErrorText>
                          {errors[`criterio_${criterio.id}_range`]}
                        </ErrorText>
                      )}
                      {errors[`criterio_${criterio.id}_modo`] && (
                        <ErrorText>
                          {errors[`criterio_${criterio.id}_modo`]}
                        </ErrorText>
                      )}
                    </TipoConfigBanner>
                  )}

                  {criterio.tipo === "Escala" && (
                    <OpcionesContainer>
                      <BannerTitle>Configuración de escala</BannerTitle>
                      {(criterio.opciones?.length ?? 0) === 0 && (
                        <InfoText>
                          Agregue los distintos valores que los proveedores
                          podrán seleccionar.
                        </InfoText>
                      )}
                      {(criterio.opciones || []).map((opcion, index) => {
                        const optionKey = getOptionKey(
                          opcion,
                          `idx_${criterio.id}_${index}`
                        );
                        const valorError =
                          errors[
                            `criterio_${criterio.id}_opcion_${optionKey}_valor`
                          ];
                        const puntajeError =
                          errors[
                            `criterio_${criterio.id}_opcion_${optionKey}_puntaje`
                          ];
                        return (
                          <div key={optionKey}>
                            <OpcionRow>
                              <OpcionInput
                                placeholder="Etiqueta"
                                value={opcion.valor || ""}
                                onChange={(e) =>
                                  handleOpcionChange(
                                    criterio.id,
                                    optionKey,
                                    "valor",
                                    e.target.value
                                  )
                                }
                              />
                              <OpcionInput
                                placeholder="Descripción"
                                value={opcion.descripcion || ""}
                                onChange={(e) =>
                                  handleOpcionChange(
                                    criterio.id,
                                    optionKey,
                                    "descripcion",
                                    e.target.value
                                  )
                                }
                              />
                              <OpcionPuntajeInput
                                type="number"
                                step="0.5"
                                placeholder="Puntaje"
                                value={opcion.puntaje ?? ""}
                                onChange={(e) =>
                                  handleOpcionChange(
                                    criterio.id,
                                    optionKey,
                                    "puntaje",
                                    e.target.value
                                  )
                                }
                                disabled={
                                  !criterio.esPuntuable &&
                                  !criterio.esExcluyente
                                }
                              />
                              <RemoveOptionButton
                                type="button"
                                onClick={() =>
                                  removeCriterioOption(criterio.id, optionKey)
                                }
                                title="Eliminar opción"
                              >
                                ×
                              </RemoveOptionButton>
                            </OpcionRow>
                            {valorError && <ErrorText>{valorError}</ErrorText>}
                            {puntajeError && (
                              <ErrorText>{puntajeError}</ErrorText>
                            )}
                          </div>
                        );
                      })}
                      <AddOptionButton
                        type="button"
                        onClick={() => addCriterioOption(criterio.id)}
                      >
                        + Agregar opción
                      </AddOptionButton>
                      {errors[`criterio_${criterio.id}_opciones`] && (
                        <ErrorText>
                          {errors[`criterio_${criterio.id}_opciones`]}
                        </ErrorText>
                      )}
                    </OpcionesContainer>
                  )}

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
                licitación.
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

      {showCriteriaInfo && (
        <CriteriaInfoOverlay onClick={() => setShowCriteriaInfo(false)}>
          <CriteriaInfoPopup onClick={(event) => event.stopPropagation()}>
            <CriteriaInfoPopupTitle>
              ¿Qué son los criterios de evaluación?
            </CriteriaInfoPopupTitle>
            <CriteriaInfoPopupText>
              Definen cómo se comparan las propuestas y qué información es
              obligatoria para los proveedores.
            </CriteriaInfoPopupText>
            <CriteriaInfoList>
              <CriteriaInfoListItem>
                <strong>Pesos y redistribución:</strong> Cada criterio aporta un
                porcentaje del puntaje total. Deben sumar 100% y, al agregar o
                quitar criterios, se reajustan automáticamente usando múltiplos
                de 5 (puede ajustarlos luego).
              </CriteriaInfoListItem>
              <CriteriaInfoListItem>
                <strong>Tipos disponibles:</strong>
                <CriteriaInfoSubList>
                  <li>
                    Valor numérico: define si "mayor" o "menor" es mejor y
                    permite límites mínimos/máximos.
                  </li>
                  <li>
                    Sí/No: selecciona la respuesta correcta si el criterio
                    aporta puntaje.
                  </li>
                  <li>
                    Escala personalizada: crea opciones ordenadas y, si
                    corresponde, asigna puntaje a cada una.
                  </li>
                  <li>
                    Respuesta descriptiva: recolecta texto libre y no suma ni
                    resta puntos.
                  </li>
                </CriteriaInfoSubList>
              </CriteriaInfoListItem>
              <CriteriaInfoListItem>
                <strong>Configuraciones adicionales:</strong>
                <CriteriaInfoSubList>
                  <li>
                    Criterio excluyente: descarta propuestas que no cumplan.
                  </li>
                  <li>
                    Aporta puntaje: controla si el criterio suma puntos (los
                    descriptivos siempre quedan desactivados).
                  </li>
                </CriteriaInfoSubList>
              </CriteriaInfoListItem>
            </CriteriaInfoList>
            <CriteriaInfoPopupText>
              Use estos campos para explicar claramente qué espera recibir y
              cómo se calculará la nota final.
            </CriteriaInfoPopupText>
            <CriteriaInfoCloseButton
              type="button"
              onClick={() => setShowCriteriaInfo(false)}
            >
              Entendido
            </CriteriaInfoCloseButton>
          </CriteriaInfoPopup>
        </CriteriaInfoOverlay>
      )}

      {/* Modal de confirmación de actualización */}
      <DialogModal
        isOpen={showConfirmUpdate}
        title="💾 Confirmar actualización"
        variant="yellow"
        description={
          <>
            ¿Está seguro que desea actualizar la licitación
            <strong> "{formData.titulo}"</strong>?
            <br />
            Los cambios se guardarán permanentemente.
          </>
        }
        confirmText="Actualizar"
        cancelText="Cancelar"
        onConfirm={confirmUpdate}
        onCancel={cancelUpdate}
      />

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
