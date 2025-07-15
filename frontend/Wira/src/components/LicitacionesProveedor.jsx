import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./Navbar";

const Container = styled.div`
  min-height: 100vh;
  background: #f8f9fa;
`;

const MainContent = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const PageHeader = styled.div`
  background: linear-gradient(135deg, #fc6b0a 0%, #ff8f42 100%);
  color: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(252, 107, 10, 0.3);
  margin-bottom: 30px;
`;

const PageTitle = styled.h1`
  color: white;
  font-size: 2rem;
  margin-bottom: 10px;
`;

const PageSubtitle = styled.p`
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.1rem;
  margin-bottom: 20px;
`;

const LicitacionesContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
`;

const FiltersContainer = styled.div`
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
  align-items: end;
`;

const FiltersTitle = styled.h3`
  grid-column: 1 / -1;
  color: #333;
  font-size: 1.2rem;
  margin: 0 0 15px 0;
  padding-bottom: 10px;
  border-bottom: 2px solid #f0f0f0;
`;

const FiltersGrid = styled.div`
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const FilterLabel = styled.label`
  font-size: 0.9rem;
  color: #555;
  margin-bottom: 5px;
  font-weight: 500;
`;

const FilterInput = styled.input`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;

  &:focus {
    outline: none;
    border-color: #fc6b0a;
    box-shadow: 0 0 0 2px rgba(252, 107, 10, 0.1);
  }
`;

const FilterSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
  background: white;

  &:focus {
    outline: none;
    border-color: #fc6b0a;
    box-shadow: 0 0 0 2px rgba(252, 107, 10, 0.1);
  }
`;

const FiltersActions = styled.div`
  grid-column: 1 / -1;
  display: flex;
  gap: 10px;
  justify-content: flex-start;
`;

const FilterButton = styled.button`
  background: linear-gradient(135deg, #fc6b0a 0%, #ff8f42 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(252, 107, 10, 0.3);
  }
`;

const ClearButton = styled.button`
  background: #6c757d;
  color: white;
  border: 0px solid #ddd;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
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

const LicitacionesHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #e1e5e9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
`;

const LicitacionesTitle = styled.h3`
  color: #333;
  font-size: 1.3rem;
  margin: 0;
`;

const ResultsInfo = styled.div`
  color: #666;
  font-size: 0.9rem;
`;

const LicitacionesList = styled.div`
  max-height: 600px;
  overflow-y: auto;
`;

const LicitacionCard = styled.div`
  padding: 20px;
  border-bottom: 1px solid #f1f3f4;
  transition: background-color 0.2s ease;
  cursor: pointer;

  &:hover {
    background-color: #f8f9fa;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const LicitacionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 10px;
`;

const LicitacionTitle = styled.h4`
  color: #333;
  font-size: 1.1rem;
  margin: 0;
  flex: 1;
  min-width: 200px;
`;

const LicitacionStatus = styled.span`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  ${(props) => {
    switch (props.status) {
      case "Publicada":
        return "background: #d4edda; color: #155724;";
      case "En Evaluación":
        return "background: #fff3cd; color: #856404;";
      case "Adjudicada":
        return "background: #cce5ff; color: #004085;";
      case "Cancelada":
        return "background: #f8d7da; color: #721c24;";
      case "Cerrada":
        return "background: #e2e3e5; color: #383d41;";
      default:
        return "background: #e2e3e5; color: #383d41;";
    }
  }}
`;

const TimeRemaining = styled.div`
  background: #fff3cd;
  color: #856404;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-left: 8px;
`;

const LicitacionMeta = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 12px;
`;

const MetaItem = styled.div`
  display: flex;
  flex-direction: column;
`;

const MetaLabel = styled.span`
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 2px;
`;

const MetaValue = styled.span`
  font-size: 0.9rem;
  color: #333;
  font-weight: 500;
`;

const CompanyInfo = styled.div`
  background: #f8f9fa;
  padding: 10px 15px;
  border-radius: 6px;
  margin-bottom: 12px;
  border-left: 3px solid #fc6b0a;
`;

const CompanyName = styled.div`
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
`;

const LicitacionDescription = styled.p`
  color: #666;
  font-size: 0.9rem;
  margin: 12px 0 0 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const EmptyState = styled.div`
  padding: 60px 20px;
  text-align: center;
  color: #666;
`;

const EmptyIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 20px;
`;

const EmptyTitle = styled.h3`
  color: #333;
  font-size: 1.3rem;
  margin-bottom: 10px;
`;

const EmptyDescription = styled.p`
  color: #666;
  font-size: 1rem;
  margin-bottom: 20px;
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

const SortContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const SortLabel = styled.span`
  color: #666;
  font-size: 0.9rem;
`;

const SortSelect = styled.select`
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
  background: white;

  &:focus {
    outline: none;
    border-color: #fc6b0a;
  }
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

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const ModalHeader = styled.div`
  background: linear-gradient(135deg, #fc6b0a 0%, #ff8f42 100%);
  color: white;
  padding: 25px;
  border-radius: 12px 12px 0 0;
  position: relative;
`;

const ModalTitle = styled.h2`
  color: white;
  font-size: 1.5rem;
  margin: 0 40px 10px 0;
  line-height: 1.3;
`;

const ModalDate = styled.div`
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  margin-top: 8px;
  font-weight: 400;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
  }
`;

const ModalBody = styled.div`
  padding: 30px;
`;

const DetailSection = styled.div`
  margin-bottom: 30px;
`;

const SectionTitle = styled.h3`
  color: #333;
  font-size: 1.2rem;
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 2px solid #f0f0f0;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 20px;
`;

const InfoCard = styled.div`
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #28a745;
`;

const DatesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
`;

const DateCard = styled.div`
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #ff9206;
  text-align: center;
`;

const DateIcon = styled.div`
  font-size: 1.5rem;
  margin-bottom: 8px;
`;

const DateLabel = styled.div`
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 5px;
`;

const DateValue = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: #ff9206;
`;

const BudgetCard = styled.div`
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #28a745;
`;

const BudgetLabel = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 5px;
  font-weight: 500;
`;

const BudgetValue = styled.div`
  font-size: 1rem;
  color: #333;
  font-weight: 600;
`;

const DetailLabel = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 5px;
  font-weight: 500;
`;

const DetailValue = styled.div`
  font-size: 1rem;
  color: #333;
  font-weight: 600;
`;

const DetailDescription = styled.div`
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  line-height: 1.6;
  color: #555;
`;

const CompanyDetailsCard = styled.div`
  background: #fff8e1;
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid #ff8f00;
  margin-bottom: 20px;
`;

const ModalActions = styled.div`
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  padding: 20px 30px;
  background: #f8f9fa;
  border-top: 1px solid #e1e5e9;
`;

const ActionButton = styled.button`
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    transform: translateY(-1px);
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

const PostularButton = styled(ActionButton)`
  background: #28a745;
  color: white;

  &:hover:not(:disabled) {
    background: #218838;
    box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
  }
`;

const AlreadyAppliedButton = styled(ActionButton)`
  background: #6c757d;
  color: white;
  cursor: not-allowed;
`;

const PropuestaModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  padding: 20px;
`;

const PropuestaModalContent = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const PropuestaModalHeader = styled.div`
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
  padding: 25px;
  border-radius: 12px 12px 0 0;
  position: relative;
`;

const PropuestaModalTitle = styled.h2`
  color: white;
  font-size: 1.5rem;
  margin: 0 40px 0 0;
  line-height: 1.3;
`;

const PropuestaModalBody = styled.div`
  padding: 30px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const FormLabel = styled.label`
  display: block;
  font-size: 0.9rem;
  color: #555;
  margin-bottom: 8px;
  font-weight: 500;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #28a745;
    box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.1);
  }

  &[type="number"] {
    text-align: right;
  }
`;

const FormTextarea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  font-family: inherit;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #28a745;
    box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.1);
  }
`;

const FormHint = styled.div`
  font-size: 0.8rem;
  color: #666;
  margin-top: 5px;
`;

const PropuestaModalActions = styled.div`
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  padding: 20px 30px;
  background: #f8f9fa;
  border-top: 1px solid #e1e5e9;
`;

const PropuestaSubmitButton = styled(ActionButton)`
  background: #28a745;
  color: white;

  &:hover:not(:disabled) {
    background: #218838;
    box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
  }
`;

const PropuestaCancelButton = styled(ActionButton)`
  background: #6c757d;
  color: white;

  &:hover:not(:disabled) {
    background: #5a6268;
  }
`;

const CriterioCard = styled.div`
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 15px;
  background: #f8f9fa;
`;

const CriterioHeader = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 10px;
`;

const CriterioNombre = styled.h4`
  color: #333;
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
`;

const CriterioPeso = styled.span`
  background: #fc6b0a;
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
`;

const CriterioDescripcion = styled.p`
  color: #666;
  font-size: 0.9rem;
  margin: 0 0 15px 0;
  line-height: 1.4;
`;

const CriterioInput = styled.div`
  margin-top: 15px;
`;

// Styled components para archivo adjunto
const FileUploadContainer = styled.div`
  margin-top: 20px;
`;

const FileDropZone = styled.div`
  border: 2px dashed ${(props) => (props.isDragOver ? "#28a745" : "#e1e5e9")};
  border-radius: 12px;
  padding: 30px 20px;
  text-align: center;
  background: ${(props) =>
    props.isDragOver ? "rgba(40, 167, 69, 0.05)" : "#f8f9fa"};
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;

  &:hover {
    border-color: #28a745;
    background: rgba(40, 167, 69, 0.05);
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
  font-size: 2rem;
  color: #28a745;
  margin-bottom: 10px;
`;

const FileUploadText = styled.p`
  color: #666;
  font-size: 1rem;
  margin-bottom: 5px;
  font-weight: 500;
`;

const FileUploadSubtext = styled.p`
  color: #999;
  font-size: 0.8rem;
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
  justify-content: space-between;
`;

const FileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
`;

const FileIcon = styled.div`
  color: #28a745;
  font-size: 1.5rem;
`;

const FileDetails = styled.div`
  flex: 1;
`;

const FileName = styled.p`
  margin: 0;
  font-weight: 500;
  color: #333;
  font-size: 0.9rem;
`;

const FileSize = styled.p`
  margin: 0;
  font-size: 0.8rem;
  color: #666;
`;

const RemoveFileButton = styled.button`
  background: #dc3545;
  color: white;
  border: none;
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background: #c82333;
  }
`;

const FileErrorMessage = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 10px 12px;
  border-radius: 6px;
  margin-top: 10px;
  border: 1px solid #f5c6cb;
  font-size: 0.8rem;
`;

const LicitacionesProveedor = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Estados para datos
  const [licitaciones, setLicitaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Estado para el modal de detalle
  const [selectedLicitacion, setSelectedLicitacion] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Estados para propuestas del usuario
  const [userPropuestas, setUserPropuestas] = useState([]);
  const [postulando, setPostulando] = useState(false);
  const [showPropuestaModal, setShowPropuestaModal] = useState(false);
  const [propuestaForm, setPropuestaForm] = useState({
    descripcion: "",
    presupuestoOfrecido: "",
    fechaEntrega: "",
  });
  const [criteriosLicitacion, setCriteriosLicitacion] = useState([]);
  const [respuestasCriterios, setRespuestasCriterios] = useState({});
  const [loadingCriterios, setLoadingCriterios] = useState(false);

  // Estados para archivo adjunto en propuesta
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Estados para filtros
  const [filters, setFilters] = useState({
    titulo: "",
    rubro: "",
    presupuestoMin: "",
    presupuestoMax: "",
    fechaCierreDesde: "",
    fechaCierreHasta: "",
    minera: "",
  });

  // Estados para ordenamiento
  const [sortBy, setSortBy] = useState("fechaCierre");
  const [sortOrder, setSortOrder] = useState("asc");

  // Estados para datos adicionales
  const [rubros, setRubros] = useState([]);
  const [mineras, setMineras] = useState([]);

  // Cargar datos iniciales
  useEffect(() => {
    fetchLicitacionesActivas();
    fetchRubros();
    fetchMineras();
    fetchUserPropuestas();
  }, [user]);

  // Aplicar filtros y ordenamiento cuando cambien
  useEffect(() => {
    if (user) {
      fetchLicitacionesActivas();
    }
  }, [filters, sortBy, sortOrder, user]);

  // Efecto para cerrar modal con Escape
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === "Escape" && showModal) {
        handleCloseModal();
      }
    };

    if (showModal) {
      document.addEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "unset";
    };
  }, [showModal]);

  const fetchLicitacionesActivas = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("http://localhost:5242/api/licitaciones");
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Filtrar solo licitaciones activas (Publicada y En Evaluación)
      let licitacionesActivas = data.filter((licitacion) => {
        const estado = licitacion.estadoNombre || licitacion.EstadoNombre;
        return estado === "Publicada" || estado === "En Evaluación";
      });

      // Aplicar filtros adicionales
      if (filters.titulo) {
        licitacionesActivas = licitacionesActivas.filter((l) =>
          (l.titulo || l.Titulo || "")
            .toLowerCase()
            .includes(filters.titulo.toLowerCase())
        );
      }

      if (filters.rubro) {
        licitacionesActivas = licitacionesActivas.filter(
          (l) => (l.rubroNombre || l.RubroNombre) === filters.rubro
        );
      }

      if (filters.presupuestoMin) {
        licitacionesActivas = licitacionesActivas.filter(
          (l) =>
            (l.presupuestoEstimado || l.PresupuestoEstimado || 0) >=
            parseFloat(filters.presupuestoMin)
        );
      }

      if (filters.presupuestoMax) {
        licitacionesActivas = licitacionesActivas.filter(
          (l) =>
            (l.presupuestoEstimado || l.PresupuestoEstimado || 0) <=
            parseFloat(filters.presupuestoMax)
        );
      }

      if (filters.fechaCierreDesde) {
        licitacionesActivas = licitacionesActivas.filter(
          (l) =>
            new Date(l.fechaCierre || l.FechaCierre) >=
            new Date(filters.fechaCierreDesde)
        );
      }

      if (filters.fechaCierreHasta) {
        licitacionesActivas = licitacionesActivas.filter(
          (l) =>
            new Date(l.fechaCierre || l.FechaCierre) <=
            new Date(filters.fechaCierreHasta)
        );
      }

      if (filters.minera) {
        licitacionesActivas = licitacionesActivas.filter(
          (l) => (l.mineraNombre || l.MineraNombre) === filters.minera
        );
      }

      // Aplicar ordenamiento
      licitacionesActivas.sort((a, b) => {
        let valueA, valueB;

        switch (sortBy) {
          case "titulo":
            valueA = (a.titulo || a.Titulo || "").toLowerCase();
            valueB = (b.titulo || b.Titulo || "").toLowerCase();
            break;
          case "fechaCierre":
            valueA = new Date(a.fechaCierre || a.FechaCierre);
            valueB = new Date(b.fechaCierre || b.FechaCierre);
            break;
          case "presupuesto":
            valueA = a.presupuestoEstimado || a.PresupuestoEstimado || 0;
            valueB = b.presupuestoEstimado || b.PresupuestoEstimado || 0;
            break;
          case "rubro":
            valueA = a.rubroNombre || a.RubroNombre || "";
            valueB = b.rubroNombre || b.RubroNombre || "";
            break;
          case "minera":
            valueA = a.mineraNombre || a.MineraNombre || "";
            valueB = b.mineraNombre || b.MineraNombre || "";
            break;
          default:
            valueA = new Date(a.fechaCierre || a.FechaCierre);
            valueB = new Date(b.fechaCierre || b.FechaCierre);
            break;
        }

        if (valueA < valueB) return sortOrder === "asc" ? -1 : 1;
        if (valueA > valueB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });

      setLicitaciones(licitacionesActivas);
    } catch (error) {
      console.error("Error al cargar licitaciones:", error);
      setError(
        "Error al cargar las licitaciones activas. Por favor, intente nuevamente."
      );
      toast.error("Error al cargar las licitaciones activas");
    } finally {
      setLoading(false);
    }
  };

  const fetchRubros = async () => {
    try {
      const response = await fetch("http://localhost:5242/api/rubros");
      if (response.ok) {
        const data = await response.json();
        setRubros(data);
      }
    } catch (error) {
      console.error("Error al cargar rubros:", error);
    }
  };

  const fetchMineras = async () => {
    try {
      const response = await fetch("http://localhost:5242/api/mineras");
      if (response.ok) {
        const data = await response.json();
        setMineras(data);
      }
    } catch (error) {
      console.error("Error al cargar mineras:", error);
    }
  };

  const fetchUserPropuestas = async () => {
    try {
      const proveedorID =
        user?.ProveedorID ||
        user?.Proveedor?.ProveedorID ||
        user?.proveedor?.proveedorID ||
        user?.proveedor?.ProveedorID;

      if (!proveedorID) return;

      const response = await fetch(
        `http://localhost:5242/api/propuestas/proveedor/${proveedorID}`
      );
      if (response.ok) {
        const data = await response.json();
        setUserPropuestas(data);
      }
    } catch (error) {
      console.error("Error al cargar propuestas del usuario:", error);
    }
  };

  const fetchCriteriosLicitacion = async (licitacionId) => {
    try {
      setLoadingCriterios(true);

      const response = await fetch(
        `http://localhost:5242/api/licitaciones/${licitacionId}/criterios`
      );

      if (response.ok) {
        const data = await response.json();
        setCriteriosLicitacion(data);

        // Inicializar respuestas vacías para cada criterio
        const respuestasIniciales = {};
        data.forEach((criterio) => {
          respuestasIniciales[
            criterio.criterioID || criterio.CriterioID || criterio.id
          ] = "";
        });
        setRespuestasCriterios(respuestasIniciales);
      } else {
        console.error("Error al cargar criterios:", response.statusText);
        setCriteriosLicitacion([]);
        setRespuestasCriterios({});
      }
    } catch (error) {
      console.error("Error al cargar criterios de licitación:", error);
      setCriteriosLicitacion([]);
      setRespuestasCriterios({});
    } finally {
      setLoadingCriterios(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      titulo: "",
      rubro: "",
      presupuestoMin: "",
      presupuestoMax: "",
      fechaCierreDesde: "",
      fechaCierreHasta: "",
      minera: "",
    });
  };

  const handleSortChange = (value) => {
    const [field, order] = value.split("-");
    setSortBy(field);
    setSortOrder(order);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No especificada";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Fecha inválida";

      return date.toLocaleDateString("es-AR", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Fecha inválida";
    }
  };

  const formatCurrency = (amount) => {
    if (!amount || amount === 0) return "No especificado";
    try {
      return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
      }).format(amount);
    } catch {
      return "No especificado";
    }
  };

  const calculateTimeRemaining = (fechaCierre) => {
    if (!fechaCierre) return null;

    const now = new Date();
    const cierre = new Date(fechaCierre);
    const diffTime = cierre - now;

    if (diffTime <= 0) return "Vencida";

    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "1 día";
    if (diffDays <= 7) return `${diffDays} días`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} semanas`;
    return `${Math.ceil(diffDays / 30)} meses`;
  };

  const handleLicitacionClick = (licitacionId) => {
    const licitacion = licitaciones.find(
      (l) => (l.licitacionID || l.LicitacionID) === licitacionId
    );
    if (licitacion) {
      setSelectedLicitacion(licitacion);
      setShowModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedLicitacion(null);
  };

  const handleModalOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCloseModal();
    }
  };

  const hasUserApplied = (licitacionId) => {
    return userPropuestas.some(
      (propuesta) =>
        (propuesta.licitacionID || propuesta.LicitacionID) === licitacionId
    );
  };

  const handlePostularse = async (licitacionId) => {
    // Cargar criterios de la licitación
    await fetchCriteriosLicitacion(licitacionId);
    setShowPropuestaModal(true);
  };

  const handleCreatePropuesta = async () => {
    try {
      setPostulando(true);

      const proveedorID =
        user?.ProveedorID ||
        user?.Proveedor?.ProveedorID ||
        user?.proveedor?.proveedorID ||
        user?.proveedor?.ProveedorID;

      if (!proveedorID) {
        toast.error("Error: No se pudo identificar el proveedor");
        return;
      }

      const licitacionId =
        selectedLicitacion.licitacionID || selectedLicitacion.LicitacionID;

      // Validar que se hayan completado todas las respuestas a criterios requeridos
      if (criteriosLicitacion.length > 0) {
        const criteriosSinRespuesta = criteriosLicitacion.filter(
          (criterio) =>
            !respuestasCriterios[
              criterio.criterioID || criterio.CriterioID || criterio.id
            ]?.trim()
        );

        if (criteriosSinRespuesta.length > 0) {
          toast.error("Por favor, complete todos los criterios de evaluación");
          return;
        }
      }

      // Preparar respuestas a los criterios
      const respuestasCriteriosArray = Object.keys(respuestasCriterios)
        .filter((criterioId) => respuestasCriterios[criterioId]?.trim())
        .map((criterioId) => ({
          CriterioID: parseInt(criterioId),
          ValorProveedor: respuestasCriterios[criterioId].trim(),
        }));

      const response = await fetch("http://localhost:5242/api/propuestas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          LicitacionID: licitacionId,
          ProveedorID: proveedorID,
          Descripcion: propuestaForm.descripcion,
          PresupuestoOfrecido: parseFloat(propuestaForm.presupuestoOfrecido),
          FechaEntrega: propuestaForm.fechaEntrega
            ? new Date(propuestaForm.fechaEntrega).toISOString()
            : null,
          RespuestasCriterios: respuestasCriteriosArray,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `Error ${response.status}: ${response.statusText}`
        );
      }

      const propuestaData = await response.json();

      // Si hay archivo adjunto, subirlo
      if (selectedFile) {
        try {
          const formData = new FormData();
          formData.append("archivo", selectedFile);
          formData.append("entidadTipo", "PROPUESTA");
          formData.append(
            "entidadId",
            propuestaData.propuestaID || propuestaData.PropuestaID
          );

          const uploadResponse = await fetch(
            "http://localhost:5242/api/archivos",
            {
              method: "POST",
              body: formData,
            }
          );

          if (!uploadResponse.ok) {
            console.error("Error al subir archivo:", uploadResponse.statusText);
            toast.warn(
              "Propuesta creada, pero hubo un error al subir el archivo adjunto"
            );
          }
        } catch (uploadError) {
          console.error("Error al subir archivo:", uploadError);
          toast.warn(
            "Propuesta creada, pero hubo un error al subir el archivo adjunto"
          );
        }
      }

      toast.success("¡Propuesta enviada exitosamente!");
      setShowPropuestaModal(false);
      handleCloseModal();

      // Limpiar formulario
      setPropuestaForm({
        descripcion: "",
        presupuestoOfrecido: "",
        fechaEntrega: "",
      });
      setRespuestasCriterios({});
      setCriteriosLicitacion([]);
      setSelectedFile(null);
      setUploadError("");

      // Recargar las propuestas del usuario
      await fetchUserPropuestas();
    } catch (error) {
      console.error("Error al postularse:", error);
      toast.error(
        error.message ||
          "Error al enviar la propuesta. Por favor, intente nuevamente."
      );
    } finally {
      setPostulando(false);
    }
  };

  const handleCancelPropuesta = () => {
    setShowPropuestaModal(false);
    setPropuestaForm({
      descripcion: "",
      presupuestoOfrecido: "",
      fechaEntrega: "",
    });
    setRespuestasCriterios({});
    setCriteriosLicitacion([]);
    setSelectedFile(null);
    setUploadError("");
  };

  const handleRespuestaCriterioChange = (criterioId, valor) => {
    setRespuestasCriterios((prev) => ({
      ...prev,
      [criterioId]: valor,
    }));
  };

  // Funciones para manejo de archivos en propuesta
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const validateFile = (file) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
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
      return "El archivo no puede ser mayor a 10MB";
    }

    if (!allowedTypes.includes(file.type)) {
      return "Tipo de archivo no permitido. Use: PDF, DOC, DOCX, XLS, XLSX, TXT, JPG, PNG, GIF";
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

  const getCompanyName = () => {
    return (
      user?.Proveedor?.Nombre ||
      user?.proveedor?.nombre ||
      user?.proveedor?.Nombre ||
      "Empresa Proveedora"
    );
  };

  return (
    <Container>
      <Navbar />

      <MainContent>
        <PageHeader>
          <PageTitle>Licitaciones activas</PageTitle>
          <PageSubtitle>
            Explore las oportunidades de negocio disponibles para{" "}
            {getCompanyName()}
          </PageSubtitle>
        </PageHeader>

        <FiltersContainer>
          <FiltersTitle>Filtros</FiltersTitle>
          <FiltersGrid>
            <FilterGroup>
              <FilterLabel>Buscar por título</FilterLabel>
              <FilterInput
                type="text"
                placeholder="Título de la licitación..."
                value={filters.titulo}
                onChange={(e) => handleFilterChange("titulo", e.target.value)}
              />
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Rubro</FilterLabel>
              <FilterSelect
                value={filters.rubro}
                onChange={(e) => handleFilterChange("rubro", e.target.value)}
              >
                <option value="">Todos los rubros</option>
                {rubros.map((rubro) => (
                  <option
                    key={rubro.rubroID || rubro.RubroID}
                    value={rubro.nombre || rubro.Nombre}
                  >
                    {rubro.nombre || rubro.Nombre}
                  </option>
                ))}
              </FilterSelect>
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Minera</FilterLabel>
              <FilterSelect
                value={filters.minera}
                onChange={(e) => handleFilterChange("minera", e.target.value)}
              >
                <option value="">Todas las mineras</option>
                {mineras.map((minera) => (
                  <option
                    key={minera.mineraID || minera.MineraID}
                    value={minera.nombre || minera.Nombre}
                  >
                    {minera.nombre || minera.Nombre}
                  </option>
                ))}
              </FilterSelect>
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Presupuesto mínimo</FilterLabel>
              <FilterInput
                type="number"
                placeholder="Ej: 100000"
                value={filters.presupuestoMin}
                onChange={(e) =>
                  handleFilterChange("presupuestoMin", e.target.value)
                }
              />
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Presupuesto máximo</FilterLabel>
              <FilterInput
                type="number"
                placeholder="Ej: 1000000"
                value={filters.presupuestoMax}
                onChange={(e) =>
                  handleFilterChange("presupuestoMax", e.target.value)
                }
              />
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Cierre desde</FilterLabel>
              <FilterInput
                type="date"
                value={filters.fechaCierreDesde}
                onChange={(e) =>
                  handleFilterChange("fechaCierreDesde", e.target.value)
                }
              />
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Cierre hasta</FilterLabel>
              <FilterInput
                type="date"
                value={filters.fechaCierreHasta}
                onChange={(e) =>
                  handleFilterChange("fechaCierreHasta", e.target.value)
                }
              />
            </FilterGroup>
          </FiltersGrid>

          <FiltersActions>
            <FilterButton onClick={fetchLicitacionesActivas}>
              Aplicar filtros
            </FilterButton>
            <ClearButton onClick={clearFilters}>Limpiar filtros</ClearButton>
          </FiltersActions>
        </FiltersContainer>

        <LicitacionesContainer>
          <LicitacionesHeader>
            <div>
              <LicitacionesTitle>Licitaciones activas</LicitacionesTitle>
              <ResultsInfo>
                {loading
                  ? "Cargando..."
                  : `${licitaciones.length} licitación(es) activa(s)`}
              </ResultsInfo>
            </div>

            <SortContainer>
              <SortLabel>Ordenar por:</SortLabel>
              <SortSelect
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => handleSortChange(e.target.value)}
              >
                <option value="fechaCierre-asc">
                  Fecha cierre (más próxima)
                </option>
                <option value="fechaCierre-desc">
                  Fecha cierre (más lejana)
                </option>
                <option value="titulo-asc">Título (A-Z)</option>
                <option value="titulo-desc">Título (Z-A)</option>
                <option value="presupuesto-desc">
                  Presupuesto (mayor a menor)
                </option>
                <option value="presupuesto-asc">
                  Presupuesto (menor a mayor)
                </option>
                <option value="rubro-asc">Rubro (A-Z)</option>
                <option value="minera-asc">Minera (A-Z)</option>
              </SortSelect>
            </SortContainer>
          </LicitacionesHeader>

          <LicitacionesList>
            {loading ? (
              <LoadingContainer>
                <LoadingSpinner />
                <LoadingText>Cargando licitaciones activas...</LoadingText>
              </LoadingContainer>
            ) : error ? (
              <ErrorContainer>
                <ErrorIcon>⚠️</ErrorIcon>
                <ErrorTitle>Error al cargar datos</ErrorTitle>
                <ErrorDescription>{error}</ErrorDescription>
                <RetryButton onClick={fetchLicitacionesActivas}>
                  Reintentar
                </RetryButton>
              </ErrorContainer>
            ) : licitaciones.length === 0 ? (
              <EmptyState>
                <EmptyIcon>🔍</EmptyIcon>
                <EmptyTitle>No hay licitaciones activas</EmptyTitle>
                <EmptyDescription>
                  No se encontraron licitaciones activas que coincidan con los
                  filtros aplicados.
                  <br />
                  Intente ajustar los criterios de búsqueda.
                </EmptyDescription>
              </EmptyState>
            ) : (
              licitaciones.map((licitacion) => {
                const timeRemaining = calculateTimeRemaining(
                  licitacion.fechaCierre || licitacion.FechaCierre
                );
                const hasApplied = hasUserApplied(
                  licitacion.licitacionID || licitacion.LicitacionID
                );

                return (
                  <LicitacionCard
                    key={licitacion.licitacionID || licitacion.LicitacionID}
                    onClick={() =>
                      handleLicitacionClick(
                        licitacion.licitacionID || licitacion.LicitacionID
                      )
                    }
                  >
                    <LicitacionHeader>
                      <LicitacionTitle>
                        {licitacion.titulo || licitacion.Titulo}
                      </LicitacionTitle>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <LicitacionStatus
                          status={
                            licitacion.estadoNombre || licitacion.EstadoNombre
                          }
                        >
                          {licitacion.estadoNombre || licitacion.EstadoNombre}
                        </LicitacionStatus>
                        {timeRemaining && timeRemaining !== "Vencida" && (
                          <TimeRemaining>{timeRemaining}</TimeRemaining>
                        )}
                        {hasApplied && (
                          <TimeRemaining
                            style={{
                              background: "#e2d5f0",
                              color: "#6f42c1",
                              marginLeft: "8px",
                            }}
                          >
                            Ya postulado
                          </TimeRemaining>
                        )}
                      </div>
                    </LicitacionHeader>

                    <CompanyInfo>
                      <CompanyName>
                        {licitacion.mineraNombre || licitacion.MineraNombre}
                      </CompanyName>
                    </CompanyInfo>

                    <LicitacionMeta>
                      <MetaItem>
                        <MetaLabel>Rubro</MetaLabel>
                        <MetaValue>
                          {licitacion.rubroNombre ||
                            licitacion.RubroNombre ||
                            "No especificado"}
                        </MetaValue>
                      </MetaItem>
                      <MetaItem>
                        <MetaLabel>Fecha cierre</MetaLabel>
                        <MetaValue>
                          {formatDate(
                            licitacion.fechaCierre || licitacion.FechaCierre
                          )}
                        </MetaValue>
                      </MetaItem>
                      <MetaItem>
                        <MetaLabel>Presupuesto estimado</MetaLabel>
                        <MetaValue>
                          {formatCurrency(
                            licitacion.presupuestoEstimado ||
                              licitacion.PresupuestoEstimado
                          )}
                        </MetaValue>
                      </MetaItem>
                    </LicitacionMeta>

                    {(licitacion.descripcion || licitacion.Descripcion) && (
                      <LicitacionDescription>
                        {licitacion.descripcion || licitacion.Descripcion}
                      </LicitacionDescription>
                    )}
                  </LicitacionCard>
                );
              })
            )}
          </LicitacionesList>
        </LicitacionesContainer>
      </MainContent>

      {/* Modal de detalle de licitación */}
      {showModal && selectedLicitacion && (
        <ModalOverlay onClick={handleModalOverlayClick}>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>
                {selectedLicitacion.titulo || selectedLicitacion.Titulo}
              </ModalTitle>
              <ModalDate>
                Publicada el{" "}
                {formatDate(
                  selectedLicitacion.fechaCreacion ||
                    selectedLicitacion.FechaCreacion
                )}
              </ModalDate>
              <CloseButton onClick={handleCloseModal}>×</CloseButton>
            </ModalHeader>

            <ModalBody>
              <DetailSection>
                <SectionTitle>Información de la empresa</SectionTitle>
                <CompanyDetailsCard>
                  <DetailLabel>Empresa</DetailLabel>
                  <DetailValue>
                    {selectedLicitacion.mineraNombre ||
                      selectedLicitacion.MineraNombre}
                  </DetailValue>
                </CompanyDetailsCard>
              </DetailSection>

              <DetailSection>
                <SectionTitle>Información general</SectionTitle>

                <InfoGrid>
                  <InfoCard>
                    <DetailLabel>Estado</DetailLabel>
                    <DetailValue>
                      {selectedLicitacion.estadoNombre ||
                        selectedLicitacion.EstadoNombre}
                    </DetailValue>
                  </InfoCard>
                  <InfoCard>
                    <DetailLabel>Rubro</DetailLabel>
                    <DetailValue>
                      {selectedLicitacion.rubroNombre ||
                        selectedLicitacion.RubroNombre ||
                        "No especificado"}
                    </DetailValue>
                  </InfoCard>
                </InfoGrid>

                <DatesGrid>
                  <DateCard>
                    <DateIcon>🚀</DateIcon>
                    <DateLabel>Fecha de inicio</DateLabel>
                    <DateValue>
                      {formatDate(
                        selectedLicitacion.fechaInicio ||
                          selectedLicitacion.FechaInicio
                      )}
                    </DateValue>
                  </DateCard>
                  <DateCard>
                    <DateIcon>⏰</DateIcon>
                    <DateLabel>Fecha de cierre</DateLabel>
                    <DateValue>
                      {formatDate(
                        selectedLicitacion.fechaCierre ||
                          selectedLicitacion.FechaCierre
                      )}
                    </DateValue>
                  </DateCard>
                </DatesGrid>

                <InfoGrid
                  style={{ gridTemplateColumns: "1fr", marginTop: "15px" }}
                >
                  <BudgetCard>
                    <BudgetLabel>Presupuesto estimado</BudgetLabel>
                    <BudgetValue>
                      {formatCurrency(
                        selectedLicitacion.presupuestoEstimado ||
                          selectedLicitacion.PresupuestoEstimado
                      )}
                    </BudgetValue>
                  </BudgetCard>
                </InfoGrid>
              </DetailSection>

              {(selectedLicitacion.descripcion ||
                selectedLicitacion.Descripcion) && (
                <DetailSection>
                  <SectionTitle>Descripción</SectionTitle>
                  <DetailDescription>
                    {selectedLicitacion.descripcion ||
                      selectedLicitacion.Descripcion}
                  </DetailDescription>
                </DetailSection>
              )}

              {(selectedLicitacion.condiciones ||
                selectedLicitacion.Condiciones) && (
                <DetailSection>
                  <SectionTitle>Condiciones</SectionTitle>
                  <DetailDescription>
                    {selectedLicitacion.condiciones ||
                      selectedLicitacion.Condiciones}
                  </DetailDescription>
                </DetailSection>
              )}

              {(() => {
                const archivoNombre =
                  selectedLicitacion.archivoNombre ||
                  selectedLicitacion.ArchivoNombre;
                return archivoNombre ? (
                  <DetailSection>
                    <SectionTitle>Archivo adjunto</SectionTitle>
                    <DetailDescription>📎 {archivoNombre}</DetailDescription>
                  </DetailSection>
                ) : null;
              })()}
            </ModalBody>

            <ModalActions>
              {hasUserApplied(
                selectedLicitacion.licitacionID ||
                  selectedLicitacion.LicitacionID
              ) ? (
                <AlreadyAppliedButton disabled>
                  ✓ Ya enviaste tu propuesta
                </AlreadyAppliedButton>
              ) : (
                <PostularButton
                  onClick={() =>
                    handlePostularse(
                      selectedLicitacion.licitacionID ||
                        selectedLicitacion.LicitacionID
                    )
                  }
                  disabled={postulando}
                >
                  📝 Enviar propuesta
                </PostularButton>
              )}
            </ModalActions>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* Modal de crear propuesta */}
      {showPropuestaModal && selectedLicitacion && (
        <PropuestaModal
          onClick={(e) =>
            e.target === e.currentTarget && handleCancelPropuesta()
          }
        >
          <PropuestaModalContent>
            <PropuestaModalHeader>
              <PropuestaModalTitle>
                Enviar propuesta para:{" "}
                {selectedLicitacion.titulo || selectedLicitacion.Titulo}
              </PropuestaModalTitle>
              <CloseButton onClick={handleCancelPropuesta}>×</CloseButton>
            </PropuestaModalHeader>

            <PropuestaModalBody>
              <FormGroup>
                <FormLabel>Descripción de la propuesta *</FormLabel>
                <FormTextarea
                  value={propuestaForm.descripcion}
                  onChange={(e) =>
                    setPropuestaForm((prev) => ({
                      ...prev,
                      descripcion: e.target.value,
                    }))
                  }
                  placeholder="Describa su propuesta, experiencia y cómo planea abordar este proyecto..."
                  required
                />
                <FormHint>
                  Detalle su experiencia, metodología y valor agregado que
                  aporta al proyecto
                </FormHint>
              </FormGroup>

              <FormGroup>
                <FormLabel>Presupuesto ofrecido (ARS) *</FormLabel>
                <FormInput
                  type="number"
                  value={propuestaForm.presupuestoOfrecido}
                  onChange={(e) =>
                    setPropuestaForm((prev) => ({
                      ...prev,
                      presupuestoOfrecido: e.target.value,
                    }))
                  }
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
                <FormHint>
                  Presupuesto estimado:{" "}
                  {formatCurrency(
                    selectedLicitacion.presupuestoEstimado ||
                      selectedLicitacion.PresupuestoEstimado
                  )}
                </FormHint>
              </FormGroup>

              <FormGroup>
                <FormLabel>Fecha de entrega estimada</FormLabel>
                <FormInput
                  type="date"
                  value={propuestaForm.fechaEntrega}
                  onChange={(e) =>
                    setPropuestaForm((prev) => ({
                      ...prev,
                      fechaEntrega: e.target.value,
                    }))
                  }
                  min={new Date().toISOString().split("T")[0]}
                />
                <FormHint>
                  Fecha límite de la licitación:{" "}
                  {formatDate(
                    selectedLicitacion.fechaCierre ||
                      selectedLicitacion.FechaCierre
                  )}
                </FormHint>
              </FormGroup>

              {/* Criterios de Evaluación */}
              {loadingCriterios ? (
                <FormGroup>
                  <FormLabel>Criterios de Evaluación</FormLabel>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      padding: "20px",
                      color: "#666",
                    }}
                  >
                    Cargando criterios...
                  </div>
                </FormGroup>
              ) : (
                criteriosLicitacion.length > 0 && (
                  <FormGroup>
                    <FormLabel>Criterios de evaluación</FormLabel>
                    <FormHint style={{ marginBottom: "15px" }}>
                      Complete los valores para cada criterio de evaluación de
                      esta licitación
                    </FormHint>
                    {criteriosLicitacion.map((criterio) => (
                      <CriterioCard
                        key={
                          criterio.criterioID ||
                          criterio.CriterioID ||
                          criterio.id
                        }
                      >
                        <CriterioHeader>
                          <CriterioNombre>{criterio.nombre}</CriterioNombre>
                        </CriterioHeader>
                        {criterio.descripcion && (
                          <CriterioDescripcion>
                            {criterio.descripcion}
                          </CriterioDescripcion>
                        )}
                        <CriterioInput>
                          <FormLabel>Valor ofrecido *</FormLabel>
                          <FormInput
                            type="text"
                            value={
                              respuestasCriterios[
                                criterio.criterioID ||
                                  criterio.CriterioID ||
                                  criterio.id
                              ] || ""
                            }
                            onChange={(e) =>
                              handleRespuestaCriterioChange(
                                criterio.criterioID ||
                                  criterio.CriterioID ||
                                  criterio.id,
                                e.target.value
                              )
                            }
                            placeholder="Ingrese su valor para este criterio"
                            required
                          />
                        </CriterioInput>
                      </CriterioCard>
                    ))}
                  </FormGroup>
                )
              )}

              {/* Archivo Adjunto */}
              <FormGroup>
                <FormLabel>Archivo adjunto</FormLabel>
                <FormHint style={{ marginBottom: "15px" }}>
                  Puede adjuntar documentos adicionales que respalden su
                  propuesta
                </FormHint>

                <FileUploadContainer>
                  <FileDropZone
                    isDragOver={isDragOver}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() =>
                      document.getElementById("propuestaFileInput").click()
                    }
                  >
                    <FileInput
                      id="propuestaFileInput"
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif"
                    />
                    <FileUploadIcon>📎</FileUploadIcon>
                    <FileUploadText>
                      Haga clic aquí o arrastre un archivo
                    </FileUploadText>
                    <FileUploadSubtext>
                      PDF, DOC, DOCX, XLS, XLSX, TXT, JPG, PNG, GIF (máx. 10MB)
                    </FileUploadSubtext>
                  </FileDropZone>

                  {selectedFile && (
                    <SelectedFileContainer>
                      <FileInfo>
                        <FileIcon>📄</FileIcon>
                        <FileDetails>
                          <FileName>{selectedFile.name}</FileName>
                          <FileSize>
                            {formatFileSize(selectedFile.size)}
                          </FileSize>
                        </FileDetails>
                      </FileInfo>
                      <RemoveFileButton onClick={removeFile}>
                        Quitar
                      </RemoveFileButton>
                    </SelectedFileContainer>
                  )}

                  {uploadError && (
                    <FileErrorMessage>{uploadError}</FileErrorMessage>
                  )}
                </FileUploadContainer>
              </FormGroup>
            </PropuestaModalBody>

            <PropuestaModalActions>
              <PropuestaCancelButton onClick={handleCancelPropuesta}>
                Cancelar
              </PropuestaCancelButton>
              <PropuestaSubmitButton
                onClick={handleCreatePropuesta}
                disabled={
                  postulando ||
                  !propuestaForm.descripcion.trim() ||
                  !propuestaForm.presupuestoOfrecido ||
                  (criteriosLicitacion.length > 0 &&
                    criteriosLicitacion.some(
                      (criterio) =>
                        !respuestasCriterios[
                          criterio.criterioID ||
                            criterio.CriterioID ||
                            criterio.id
                        ]?.trim()
                    )) ||
                  (selectedFile && !!uploadError)
                }
              >
                {postulando ? "Enviando..." : "Enviar propuesta"}
              </PropuestaSubmitButton>
            </PropuestaModalActions>
          </PropuestaModalContent>
        </PropuestaModal>
      )}

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
    </Container>
  );
};

export default LicitacionesProveedor;
