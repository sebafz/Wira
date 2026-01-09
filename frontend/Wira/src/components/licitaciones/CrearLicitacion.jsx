import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
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

const FileUploadContainer = styled.div`
  margin-top: 20px;
`;

const FileDropZone = styled.div`
  border: 2px dashed ${(props) => (props.isDragOver ? "#fc6b0a" : "#e1e5e9")};
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  background: ${(props) =>
    props.isDragOver ? "rgba(252, 107, 10, 0.05)" : "#f8f9fa"};
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;

  &:hover {
    border-color: #fc6b0a;
    background: rgba(252, 107, 10, 0.05);
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
  font-size: 2.5rem;
  color: #fc6b0a;
  margin-bottom: 15px;
`;

const FileUploadText = styled.p`
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 5px;
  font-weight: 500;
`;

const FileUploadSubtext = styled.p`
  color: #999;
  font-size: 0.9rem;
  margin: 0;
`;

const SelectedFileContainer = styled.div`
  margin-top: 15px;
  padding: 15px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e1e5e9;
  display: flex;
  align-items: center;
  justify-content: between;
`;

const FileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
`;

const FileIcon = styled.div`
  color: #fc6b0a;
  font-size: 1.5rem;
`;

const FileDetails = styled.div`
  flex: 1;
`;

const FileName = styled.p`
  margin: 0;
  font-weight: 500;
  color: #333;
`;

const FileSize = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: #666;
`;

const RemoveFileButton = styled.button`
  background: #dc3545;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background: #c82333;
  }
`;

const ErrorMessage = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 12px 16px;
  border-radius: 8px;
  margin-top: 15px;
  border: 1px solid #f5c6cb;
  font-size: 0.9rem;
`;

const SuccessMessage = styled.div`
  background: #d4edda;
  color: #155724;
  padding: 12px 16px;
  border-radius: 8px;
  margin-top: 15px;
  border: 1px solid #c3e6cb;
  font-size: 0.9rem;
`;

const ConfirmDescriptionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  color: #0f172a;
  font-size: 0.95rem;
  line-height: 1.45;

  p {
    margin: 0;
  }
`;

const ConfirmDetails = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ConfirmDetailRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: baseline;
`;

const ConfirmDetailLabel = styled.span`
  font-weight: 600;
  color: #0b152e;
`;

const ConfirmDetailValue = styled.span`
  color: #111827;
`;

// Estilos personalizados para react-toastify
const ToastStyles = styled.div`
  .Toastify__toast--success {
    background: #ffffff;
    color: #1f2933;
    border: 1px solid #e2e8f0;
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
    background: white;
  }

  .Toastify__progress-bar--error {
    background: rgba(255, 255, 255, 0.7);
  }

  .Toastify__progress-bar--info {
    background: rgba(255, 255, 255, 0.7);
  }
`;

const CrearLicitacion = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const tipoCriterioOptions = [
    { value: "Numerico", label: "Valor numérico" },
    { value: "Booleano", label: "Sí / No" },
    { value: "Descriptivo", label: "Respuesta descriptiva" },
    { value: "Escala", label: "Escala personalizada" },
  ];

  const createCriterio = (id, overrides = {}) => ({
    id,
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
    option.opcionID ?? option.tempId ?? fallback;

  const normalizeMoneda = (moneda) => ({
    id: moneda?.monedaID ?? moneda?.MonedaID ?? moneda?.id ?? 0,
    codigo: moneda?.codigo ?? moneda?.Codigo ?? "",
    nombre: moneda?.nombre ?? moneda?.Nombre ?? "",
    simbolo: moneda?.simbolo ?? moneda?.Simbolo ?? "",
  });

  // Obtener la fecha y hora actual en formato ISO local
  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    rubroID: "",
    monedaID: "",
    proyectoMineroID: "",
    fechaInicio: getCurrentDateTime(),
    fechaCierre: "",
    presupuestoEstimado: "",
    condiciones: "",
  });

  const [criterios, setCriterios] = useState(() => [
    createCriterio(1, {
      nombre: "Precio total ofertado",
      descripcion: "Monto final propuesto para la adjudicación",
      peso: 30,
      tipo: "Numerico",
      mayorMejor: false,
    }),
    createCriterio(2, {
      nombre: "Tiempo de entrega comprometido",
      descripcion: "Cantidad de días calendario hasta la puesta en marcha",
      peso: 25,
      tipo: "Numerico",
      mayorMejor: false,
    }),
    createCriterio(3, {
      nombre: "Cumplimiento normativo y de seguridad",
      descripcion: "Acreditación de habilitaciones, permisos y políticas ESG",
      peso: 20,
      tipo: "Booleano",
      mayorMejor: null,
      esExcluyente: true,
      esPuntuable: true,
      valorRequeridoBooleano: true,
    }),
    createCriterio(4, {
      nombre: "Gestión de riesgos y contingencias",
      descripcion:
        "Robustez del plan de mitigación y respuesta ante incidentes",
      peso: 25,
      tipo: "Escala",
      mayorMejor: null,
      esPuntuable: true,
      opciones: [
        createOpcion({
          valor: "Plan integral",
          descripcion: "Identifica riesgos críticos, responsables y reservas",
          puntaje: 10,
          orden: 1,
        }),
        createOpcion({
          valor: "Plan sólido",
          descripcion: "Cobertura de riesgos principales con acciones claras",
          puntaje: 7,
          orden: 2,
        }),
        createOpcion({
          valor: "Plan básico",
          descripcion: "Solo cubre riesgos frecuentes sin contingencias",
          puntaje: 4,
          orden: 3,
        }),
        createOpcion({
          valor: "Plan insuficiente",
          descripcion: "No evidencia un enfoque sistemático de mitigación",
          puntaje: 0,
          orden: 4,
        }),
      ],
    }),
  ]);

  const [rubros, setRubros] = useState([]);
  const [proyectosMineros, setProyectosMineros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingRubros, setLoadingRubros] = useState(true);
  const [loadingProyectos, setLoadingProyectos] = useState(true);
  const [errors, setErrors] = useState({});

  // Estado para archivos adjuntos
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [rubrosError, setRubrosError] = useState("");
  const [proyectosError, setProyectosError] = useState("");
  const [monedas, setMonedas] = useState([]);
  const [loadingMonedas, setLoadingMonedas] = useState(true);
  const [monedasError, setMonedasError] = useState("");

  // Estado para modal de confirmación
  const [showConfirmCreate, setShowConfirmCreate] = useState(false);
  const [showCriteriaInfo, setShowCriteriaInfo] = useState(false);
  // const [pendingFormData, setPendingFormData] = useState(null); // Used for confirmation modal

  // Cargar rubros y proyectos mineros al montar el componente
  useEffect(() => {
    const fetchRubros = async () => {
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
        const message =
          error.response?.data?.message ||
          (typeof error.response?.data === "string"
            ? error.response.data
            : "No se pudo conectar con el servidor.");
        setRubrosError(message);
        setRubros([]);
      } finally {
        setLoadingRubros(false);
      }
    };

    const fetchProyectosMineros = async () => {
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

        const response = await apiService.getProyectosMinerosByMinera(
          mineraId
        );
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
    };

    fetchRubros();
    if (user?.minera?.mineraID) {
      fetchProyectosMineros();
    } else {
      setLoadingProyectos(false);
    }
  }, [user?.minera?.mineraID]);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpiar error al cambiar el valor
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
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

  const addCriterioOption = (criterioId) => {
    setCriterios((prev) =>
      prev.map((criterio) =>
        criterio.id === criterioId
          ? {
              ...criterio,
              opciones: [
                ...(criterio.opciones || []),
                createOpcion({
                  orden: (criterio.opciones?.length || 0) + 1,
                }),
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

    // Solo redistribuir si quedan criterios
    if (newCriteriosList.length > 0) {
      const redistributedCriterios =
        redistributePesosMultiplosDe5(newCriteriosList);
      setCriterios(redistributedCriterios);
    } else {
      setCriterios(newCriteriosList);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.titulo.trim()) newErrors.titulo = "El título es requerido";
    if (!formData.descripcion.trim())
      newErrors.descripcion = "La descripción es requerida";
    if (!formData.rubroID) newErrors.rubroID = "Debe seleccionar un rubro";
    if (!formData.monedaID) newErrors.monedaID = "Debe seleccionar una moneda";
    if (!formData.fechaInicio)
      newErrors.fechaInicio = "La fecha de inicio es requerida";
    if (!formData.fechaCierre)
      newErrors.fechaCierre = "La fecha de cierre es requerida";

    if (formData.fechaInicio && formData.fechaCierre) {
      if (new Date(formData.fechaInicio) >= new Date(formData.fechaCierre)) {
        newErrors.fechaCierre =
          "La fecha de cierre debe ser posterior a la fecha de inicio";
      }
    }

    // Validar criterios
    const totalPeso = criterios.reduce(
      (sum, criterio) => sum + parseFloat(criterio.peso || 0),
      0
    );
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
      return;
    }

    // Mostrar modal de confirmación
    setShowConfirmCreate(true);
    // setPendingFormData({ ...formData }); // Currently not used
  };

  const confirmCreate = async () => {
    setLoading(true);
    setShowConfirmCreate(false);

    try {
      // Crear licitación primero
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

      const licitacionData = {
        MineraID: user?.minera?.mineraID || 1, // Obtener el ID de la minera del usuario autenticado
        RubroID: parseInt(formData.rubroID),
        MonedaID: parseInt(formData.monedaID),
        ProyectoMineroID: formData.proyectoMineroID
          ? parseInt(formData.proyectoMineroID)
          : null,
        Titulo: formData.titulo,
        Descripcion: formData.descripcion,
        FechaInicio: formData.fechaInicio,
        FechaCierre: formData.fechaCierre,
        PresupuestoEstimado: formData.presupuestoEstimado
          ? parseFloat(formData.presupuestoEstimado)
          : null,
        Condiciones: formData.condiciones,
        ArchivoID: null, // Inicialmente null, se actualizará si hay archivo
        Criterios: criteriosPayload,
      };

      if (!token) {
        throw new Error(
          "Su sesión caducó, por favor inicie sesión nuevamente."
        );
      }

      const response = await apiService.createLicitacion(licitacionData);
      const result = response.data || {};
      const licitacionId =
        result.licitacionID ||
        result.LicitacionID ||
        result.id ||
        result.Id ||
        null;

      // Subir archivo si hay uno seleccionado
      if (selectedFile && licitacionId) {
        toast.info("📎 Subiendo archivo adjunto...", {
          position: "top-right",
          autoClose: false,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: false,
          draggable: false,
          toastId: "uploading", // ID único para poder cerrarlo después
        });

        const formDataFile = new FormData();
        formDataFile.append("File", selectedFile);
        formDataFile.append("EntidadTipo", "LICITACION");
        formDataFile.append("EntidadID", licitacionId.toString());
        try {
          const uploadResponse = await apiService.uploadArchivo(formDataFile);
          console.log("Archivo subido:", uploadResponse.data);
        } catch (uploadError) {
          console.error("Error al subir archivo:", uploadError);
          const uploadMessage =
            uploadError.response?.data?.message ||
            (typeof uploadError.response?.data === "string"
              ? uploadError.response.data
              : uploadError.message || "Error al subir el archivo");
          throw new Error(`Error al subir el archivo: ${uploadMessage}`);
        } finally {
          toast.dismiss("uploading");
        }
      }

      toast.success(
        "Licitación creada exitosamente. Será redirigido al inicio...",
        {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );

      // Esperar un poco antes de navegar para que el usuario vea la notificación
      setTimeout(() => {
        navigate("/dashboard-minera");
      }, 3000);
    } catch (error) {
      console.error("Error al crear licitación:", error);
      const errorMessage =
        error.response?.data?.message ||
        (typeof error.response?.data === "string"
          ? error.response.data
          : error.message || "Ocurrió un error inesperado");
      toast.error(`❌ Error al crear la licitación: ${errorMessage}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const cancelCreate = () => {
    setShowConfirmCreate(false);
    // setPendingFormData(null); // Currently not used
  };

  const handleCancel = () => {
    navigate("/dashboard-minera");
  };

  const getCompanyName = () => {
    return user?.Minera?.Nombre || user?.minera?.nombre || "Empresa Minera";
  };

  const getTotalPeso = () => {
    return criterios.reduce(
      (sum, criterio) => sum + parseFloat(criterio.peso || 0),
      0
    );
  };

  const getSelectedMoneda = () =>
    monedas.find((moneda) => String(moneda.id) === String(formData.monedaID));

  const formatFechaCierre = () => {
    if (!formData.fechaCierre) {
      return "Sin fecha definida";
    }

    return new Date(formData.fechaCierre).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const selectedMoneda = getSelectedMoneda();

  // Funciones para manejo de archivos
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const validateFile = (file) => {
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "image/jpeg",
      "image/png",
      "image/gif",
      "text/plain",
    ];

    if (file.size > maxSize) {
      return "El archivo no puede ser mayor a 50MB";
    }

    if (!allowedTypes.includes(file.type)) {
      return "Tipo de archivo no permitido. Solo se permiten PDF, Word, Excel, imágenes y archivos de texto";
    }

    return null;
  };

  const handleFileSelect = (file) => {
    setUploadError("");
    setUploadSuccess("");

    const error = validateFile(file);
    if (error) {
      setUploadError(error);
      return;
    }

    setSelectedFile(file);
    setUploadSuccess(`Archivo "${file.name}" seleccionado correctamente`);
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

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setUploadError("");
    setUploadSuccess("");
  };

  return (
    <FormContainer>
      <Navbar />

      <MainContent>
        <FormCard>
          <FormTitle>Nueva licitación</FormTitle>
          <FormSubtitle>
            Cree una nueva licitación para {getCompanyName()}.
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
                    : "Seleccione rubro"}
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
                  <InfoText>
                    No hay proyectos mineros registrados. Puede crear uno desde
                    la configuración de su perfil. La licitación se creará sin
                    proyecto asignado.
                    <br />
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
                      placeholder="Nombre del criterio  *"
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
                          Active "Criterio excluyente" o "Aporta puntaje" si
                          quiere evaluar esta respuesta como válida o inválida.
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

            <FileUploadContainer>
              <FormGroup>
                <FormLabel htmlFor="files">Archivos adjuntos</FormLabel>
                <FileDropZone
                  isDragOver={isDragOver}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <FileUploadIcon>📎</FileUploadIcon>
                  <FileUploadText>
                    Arrastre y suelte su archivo aquí
                  </FileUploadText>
                  <FileUploadSubtext>
                    O haga clic para seleccionar archivo (máx. 50MB)
                  </FileUploadSubtext>
                  <FileInput
                    type="file"
                    id="files"
                    name="files"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt"
                  />
                </FileDropZone>
              </FormGroup>

              {/* Mostrar archivos seleccionados */}
              {selectedFile && (
                <SelectedFileContainer>
                  <FileInfo>
                    <FileIcon>📄</FileIcon>
                    <FileDetails>
                      <FileName>{selectedFile.name}</FileName>
                      <FileSize>{formatFileSize(selectedFile.size)}</FileSize>
                    </FileDetails>
                  </FileInfo>
                  <RemoveFileButton type="button" onClick={removeFile}>
                    Eliminar
                  </RemoveFileButton>
                </SelectedFileContainer>
              )}

              {/* Mensajes de éxito o error al subir archivos */}
              {uploadSuccess && (
                <SuccessMessage>{uploadSuccess}</SuccessMessage>
              )}
              {uploadError && <ErrorMessage>{uploadError}</ErrorMessage>}
            </FileUploadContainer>

            <ButtonGroup>
              <PrimaryButton
                type="submit"
                disabled={
                  loading ||
                  loadingRubros ||
                  loadingProyectos ||
                  rubros.length === 0 ||
                  !formData.titulo.trim() ||
                  !formData.descripcion.trim() ||
                  !formData.rubroID ||
                  !formData.fechaInicio ||
                  !formData.fechaCierre ||
                  getTotalPeso() !== 100 ||
                  showConfirmCreate
                }
              >
                {loading ? "Creando..." : "Crear licitación"}
              </PrimaryButton>
              <SecondaryButton
                type="button"
                onClick={handleCancel}
                disabled={loading || showConfirmCreate}
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

      <DialogModal
        isOpen={showConfirmCreate}
        title="🏗️ Confirmar creación de licitación"
        variant="yellow"
        description={
          <ConfirmDescriptionWrapper>
            <p>¿Está seguro que desea crear esta licitación?</p>
            <ConfirmDetails>
              <ConfirmDetailRow>
                <ConfirmDetailLabel>Título:</ConfirmDetailLabel>
                <ConfirmDetailValue>
                  {formData.titulo?.trim() ? formData.titulo : "Sin título"}
                </ConfirmDetailValue>
              </ConfirmDetailRow>
              <ConfirmDetailRow>
                <ConfirmDetailLabel>Fecha de cierre:</ConfirmDetailLabel>
                <ConfirmDetailValue>{formatFechaCierre()}</ConfirmDetailValue>
              </ConfirmDetailRow>
            </ConfirmDetails>
            <p>
              Una vez creada, la licitación será visible para todos los
              proveedores.
            </p>
          </ConfirmDescriptionWrapper>
        }
        confirmText={loading ? "Creando..." : "Crear licitación"}
        confirmDisabled={loading}
        onConfirm={confirmCreate}
        onCancel={cancelCreate}
      />

      {/* Toast Container para las notificaciones */}
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

export default CrearLicitacion;
