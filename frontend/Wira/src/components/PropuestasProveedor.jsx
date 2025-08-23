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
  margin: 0;
`;

const FiltersContainer = styled.div`
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
`;

const FiltersTitle = styled.h3`
  color: #333;
  font-size: 1.2rem;
  margin: 0 0 15px 0;
  padding-bottom: 10px;
  border-bottom: 2px solid #f0f0f0;
`;

const FiltersGrid = styled.div`
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
  border: none;
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
`;

const PropuestasContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
`;

const PropuestasHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #e1e5e9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
`;

const PropuestasTitle = styled.h3`
  color: #333;
  font-size: 1.3rem;
  margin: 0;
`;

const ResultsInfo = styled.div`
  color: #666;
  font-size: 0.9rem;
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

const PropuestasList = styled.div`
  max-height: 600px;
  overflow-y: auto;
`;

const PropuestaCard = styled.div`
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

const PropuestaHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 10px;
`;

const PropuestaTitle = styled.h4`
  color: #333;
  font-size: 1.1rem;
  margin: 0;
  flex: 1;
  min-width: 200px;
`;

const PropuestaStatus = styled.span`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  ${(props) => {
    switch (props.status) {
      case "Enviada":
        return "background: #e3f2fd; color: #1976d2;";
      case "En Revisión":
        return "background: #fff3e0; color: #f57c00;";
      case "Aprobada":
        return "background: #e8f5e8; color: #2e7d32;";
      case "Adjudicada":
        return "background: #e8f5e8; color: #2e7d32;";
      case "Rechazada":
        return "background: #ffebee; color: #d32f2f;";
      default:
        return "background: #f5f5f5; color: #666;";
    }
  }}
`;

const PropuestaMeta = styled.div`
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

const BrowseButton = styled.button`
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
`;

// Estilos para Toastify
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
`;

// Estilos para el Modal de Detalle
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

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
`;

const InfoCard = styled.div`
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #fc6b0a;
`;

const InfoLabel = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 5px;
  font-weight: 500;
`;

const InfoValue = styled.div`
  font-size: 1rem;
  color: #333;
  font-weight: 600;
`;

const StatusCard = styled.div`
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #28a745;
  text-align: center;
`;

const StatusIcon = styled.div`
  font-size: 1.5rem;
  margin-bottom: 8px;
`;

const StatusLabel = styled.div`
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 5px;
`;

const StatusValue = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: #28a745;
`;

const DetailDescription = styled.div`
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  line-height: 1.6;
  color: #555;
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
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.9rem;
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
`;

const EditButton = styled(ActionButton)`
  background: #308becff;
  color: white;

  &:hover {
    box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);
  }
`;

const DeleteButton = styled(ActionButton)`
  background: #dc3545;
  color: white;

  &:hover {
    box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3);
  }
`;

// Estilos para el modal de confirmación de eliminación
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
  color: #dc3545;
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

const CancelButton = styled(ConfirmButton)`
  background: #6c757d;
  color: white;

  &:hover {
    background: #5a6268;
  }
`;

const ConfirmDeleteButton = styled(ConfirmButton)`
  background: #dc3545;
  color: white;

  &:hover {
    background: #c82333;
    box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3);
  }
`;

// Styled components para criterios de evaluación
const CriteriosSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 15px;
  margin-top: 15px;
`;

const CriterioItem = styled.div`
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #8b8b8b;
`;

const CriterioName = styled.div`
  font-weight: 600;
  color: #333;
  font-size: 1rem;
  margin-bottom: 8px;
`;

const CriterioDescription = styled.div`
  color: #666;
  font-size: 0.85rem;
  margin-bottom: 10px;
  line-height: 1.3;
`;

const CriterioValue = styled.div`
  background: white;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #e1e5e9;
  font-size: 0.9rem;
  color: #333;
  font-weight: 500;
`;

// Styled component para archivos clickeables
const ArchivoName = styled.span`
  color: #333;
  cursor: pointer;
  text-decoration: underline;

  &:hover {
    color: #fc6b0a;
  }
`;

const PropuestasProveedor = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  // Estados para datos
  const [propuestas, setPropuestas] = useState([]);
  const [filteredPropuestas, setFilteredPropuestas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Estado para el modal de detalle
  const [selectedPropuesta, setSelectedPropuesta] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Estado para el modal de confirmación de eliminación
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deletingPropuesta, setDeletingPropuesta] = useState(null);

  // Estados para filtros
  const [filters, setFilters] = useState({
    licitacion: "",
    estado: "",
    fechaDesde: "",
    fechaHasta: "",
  });

  // Estado para ordenamiento
  const [sortBy, setSortBy] = useState("fechaEnvio");

  // Estados disponibles para filtrar
  const estados = [
    "Adjudicada",
    "Aprobada",
    "En Revisión",
    "Enviada",
    "Rechazada",
  ];

  // Cargar propuestas al montar el componente
  useEffect(() => {
    if (user?.proveedor?.proveedorID) {
      fetchPropuestas();
    }
  }, [user]);

  // Aplicar filtros cuando cambien
  useEffect(() => {
    applyFilters();
  }, [propuestas, filters, sortBy]);

  // Efecto para cerrar modal con Escape
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === "Escape" && showModal) {
        handleCloseModal();
      }
    };

    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [showModal]);

  const fetchPropuestas = async () => {
    try {
      setLoading(true);
      setError("");

      const proveedorId = user?.proveedor?.proveedorID;
      if (!proveedorId) {
        setError("No se pudo obtener el ID del proveedor");
        return;
      }

      const response = await fetch(
        `http://localhost:5242/api/propuestas/proveedor/${proveedorId}`
      );

      if (response.ok) {
        const data = await response.json();
        setPropuestas(data);
      } else {
        setError("Error al cargar las propuestas");
        setPropuestas([]);
      }
    } catch (error) {
      setError("No se pudo conectar con el servidor");
      setPropuestas([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...propuestas];

    // Filtrar por nombre de licitación
    if (filters.licitacion) {
      filtered = filtered.filter((propuesta) =>
        propuesta.licitacionTitulo
          ?.toLowerCase()
          .includes(filters.licitacion.toLowerCase())
      );
    }

    // Filtrar por estado
    if (filters.estado) {
      filtered = filtered.filter(
        (propuesta) => propuesta.estadoNombre === filters.estado
      );
    }

    // Filtrar por fecha desde
    if (filters.fechaDesde) {
      filtered = filtered.filter((propuesta) => {
        const fechaEnvio = new Date(propuesta.fechaEnvio);
        const fechaDesde = new Date(filters.fechaDesde);
        return fechaEnvio >= fechaDesde;
      });
    }

    // Filtrar por fecha hasta
    if (filters.fechaHasta) {
      filtered = filtered.filter((propuesta) => {
        const fechaEnvio = new Date(propuesta.fechaEnvio);
        const fechaHasta = new Date(filters.fechaHasta);
        return fechaEnvio <= fechaHasta;
      });
    }

    // Ordenar
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "fechaEnvio":
          return new Date(b.fechaEnvio) - new Date(a.fechaEnvio);
        case "fechaEnvio_asc":
          return new Date(a.fechaEnvio) - new Date(b.fechaEnvio);
        case "licitacion":
          return (a.licitacionTitulo || "").localeCompare(
            b.licitacionTitulo || ""
          );
        case "estado":
          return (a.estadoNombre || "").localeCompare(b.estadoNombre || "");
        case "monto":
          return (b.presupuestoOfrecido || 0) - (a.presupuestoOfrecido || 0);
        default:
          return 0;
      }
    });

    setFilteredPropuestas(filtered);
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      licitacion: "",
      estado: "",
      fechaDesde: "",
      fechaHasta: "",
    });
  };

  const handleSortChange = (value) => {
    setSortBy(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No especificada";
    try {
      return new Date(dateString).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Fecha inválida";
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return "No especificado";
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount);
  };

  const formatStatus = (status) => {
    const statusMap = {
      Adjudicada: "Adjudicada",
      Aprobada: "Aprobada",
      "En Revisión": "En Revisión",
      Enviada: "Enviada",
      Rechazada: "Rechazada",
    };
    return statusMap[status] || status;
  };

  const handleBrowseLicitaciones = () => {
    navigate("/licitaciones-activas");
  };

  const getCompanyName = () => {
    return user?.proveedor?.nombre || "Empresa Proveedora";
  };

  const handlePropuestaClick = async (propuestaId) => {
    try {
      // Primero mostrar la propuesta básica
      const propuesta = propuestas.find((p) => p.propuestaID === propuestaId);
      if (propuesta) {
        setSelectedPropuesta(propuesta);
        setShowModal(true);

        // Luego cargar los detalles completos incluyendo criterios
        const response = await fetch(
          `http://localhost:5242/api/propuestas/${propuestaId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const detailedData = await response.json();
          setSelectedPropuesta(detailedData);
        }
      }
    } catch (error) {
      toast.error("Error al descargar detalles de la propuesta");
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPropuesta(null);
  };

  const handleModalOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCloseModal();
    }
  };

  const handleEditarPropuesta = (propuestaId) => {
    // Navegar a la página de edición de propuesta
    navigate(`/propuestas/editar/${propuestaId}`);
  };

  const handleEliminarPropuesta = async (propuesta) => {
    // Mostrar modal de confirmación
    setDeletingPropuesta(propuesta);
    setShowConfirmDelete(true);
  };

  const confirmDeletePropuesta = async () => {
    if (!deletingPropuesta) return;

    try {
      const response = await fetch(
        `http://localhost:5242/api/propuestas/${deletingPropuesta.propuestaID}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al eliminar la propuesta");
      }

      toast.success("Propuesta eliminada exitosamente");

      // Recargar la lista de propuestas
      fetchPropuestas();

      // Cerrar modales
      setShowConfirmDelete(false);
      setShowModal(false);
      setDeletingPropuesta(null);
      setSelectedPropuesta(null);
    } catch (error) {
      toast.error(error.message || "Error al eliminar la propuesta");
    }
  };

  const cancelDeletePropuesta = () => {
    setShowConfirmDelete(false);
    setDeletingPropuesta(null);
  };

  const handleDownloadArchivo = async (ArchivoID, nombreArchivo) => {
    try {
      // Validar que el ID del archivo existe
      if (!ArchivoID) {
        toast.error("ID de archivo no disponible - descarga no disponible");
        return;
      }

      // Validar que el token existe
      if (!token) {
        toast.error("No autorizado - por favor inicie sesión nuevamente");
        return;
      }

      const response = await fetch(
        `http://localhost:5242/api/archivos/${ArchivoID}/download`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al descargar el archivo");
      }

      // Crear blob con el contenido del archivo
      const blob = await response.blob();

      // Crear URL temporal para el blob
      const url = window.URL.createObjectURL(blob);

      // Crear elemento de descarga temporal
      const link = document.createElement("a");
      link.href = url;
      link.download = nombreArchivo || "archivo_descargado";
      document.body.appendChild(link);

      // Ejecutar descarga
      link.click();

      // Limpiar
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Error al descargar el archivo");
    }
  };

  if (loading) {
    return (
      <Container>
        <Navbar />
        <MainContent>
          <LoadingContainer>
            <LoadingSpinner />
            <LoadingText>Cargando tus propuestas...</LoadingText>
          </LoadingContainer>
        </MainContent>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Navbar />
        <MainContent>
          <ErrorContainer>
            <ErrorIcon>⚠️</ErrorIcon>
            <ErrorTitle>Error al cargar propuestas</ErrorTitle>
            <ErrorDescription>{error}</ErrorDescription>
            <RetryButton onClick={fetchPropuestas}>Reintentar</RetryButton>
          </ErrorContainer>
        </MainContent>
      </Container>
    );
  }

  return (
    <Container>
      <Navbar />

      <MainContent>
        <PageHeader>
          <PageTitle>Mis propuestas</PageTitle>
          <PageSubtitle>
            Gestione todas las propuestas enviadas por {getCompanyName()}
          </PageSubtitle>
        </PageHeader>

        <FiltersContainer>
          <FiltersTitle>Filtros de búsqueda</FiltersTitle>
          <FiltersGrid>
            <FilterGroup>
              <FilterLabel>Licitación</FilterLabel>
              <FilterInput
                type="text"
                placeholder="Buscar por nombre de licitación..."
                value={filters.licitacion}
                onChange={(e) =>
                  handleFilterChange("licitacion", e.target.value)
                }
              />
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Estado</FilterLabel>
              <FilterSelect
                value={filters.estado}
                onChange={(e) => handleFilterChange("estado", e.target.value)}
              >
                <option value="">Todos los estados</option>
                {estados.map((estado) => (
                  <option key={estado} value={estado}>
                    {formatStatus(estado)}
                  </option>
                ))}
              </FilterSelect>
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Fecha desde</FilterLabel>
              <FilterInput
                type="date"
                value={filters.fechaDesde}
                onChange={(e) =>
                  handleFilterChange("fechaDesde", e.target.value)
                }
              />
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Fecha hasta</FilterLabel>
              <FilterInput
                type="date"
                value={filters.fechaHasta}
                onChange={(e) =>
                  handleFilterChange("fechaHasta", e.target.value)
                }
              />
            </FilterGroup>
          </FiltersGrid>

          <FiltersActions>
            <FilterButton onClick={applyFilters}>Aplicar filtros</FilterButton>
            <ClearButton onClick={clearFilters}>Limpiar filtros</ClearButton>
          </FiltersActions>
        </FiltersContainer>

        <PropuestasContainer>
          <PropuestasHeader>
            <div>
              <PropuestasTitle>Mis propuestas</PropuestasTitle>
              <ResultsInfo>
                {loading
                  ? "Cargando..."
                  : `${filteredPropuestas.length} propuesta${
                      filteredPropuestas.length !== 1 ? "s" : ""
                    } encontrada${filteredPropuestas.length !== 1 ? "s" : ""}`}
              </ResultsInfo>
            </div>

            <SortContainer>
              <SortLabel>Ordenar por:</SortLabel>
              <SortSelect
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
              >
                <option value="fechaEnvio">Fecha envío (más reciente)</option>
                <option value="fechaEnvio_asc">
                  Fecha envío (más antiguo)
                </option>
                <option value="licitacion">Licitación (A-Z)</option>
                <option value="estado">Estado</option>
                <option value="monto">Monto (mayor a menor)</option>
              </SortSelect>
            </SortContainer>
          </PropuestasHeader>

          <PropuestasList>
            {filteredPropuestas.length === 0 ? (
              <EmptyState>
                <EmptyIcon>📋</EmptyIcon>
                <EmptyTitle>
                  {propuestas.length === 0
                    ? "No tienes propuestas enviadas"
                    : "No hay propuestas que coincidan con los filtros"}
                </EmptyTitle>
                <EmptyDescription>
                  {propuestas.length === 0
                    ? "Explora las licitaciones disponibles y envía tu primera propuesta."
                    : "Prueba ajustando los filtros de búsqueda."}
                </EmptyDescription>
                {propuestas.length === 0 && (
                  <BrowseButton onClick={handleBrowseLicitaciones}>
                    Explorar licitaciones
                  </BrowseButton>
                )}
              </EmptyState>
            ) : (
              filteredPropuestas.map((propuesta) => (
                <PropuestaCard
                  key={propuesta.propuestaID}
                  onClick={() => handlePropuestaClick(propuesta.propuestaID)}
                >
                  <PropuestaHeader>
                    <PropuestaTitle>
                      {propuesta.licitacionTitulo || "Licitación sin título"}
                    </PropuestaTitle>
                    <PropuestaStatus status={propuesta.estadoNombre}>
                      {formatStatus(propuesta.estadoNombre)}
                    </PropuestaStatus>
                  </PropuestaHeader>

                  <PropuestaMeta>
                    <MetaItem>
                      <MetaLabel>Fecha de envío</MetaLabel>
                      <MetaValue>{formatDate(propuesta.fechaEnvio)}</MetaValue>
                    </MetaItem>
                    <MetaItem>
                      <MetaLabel>Monto total</MetaLabel>
                      <MetaValue>
                        {formatCurrency(propuesta.presupuestoOfrecido)}
                      </MetaValue>
                    </MetaItem>
                    <MetaItem>
                      <MetaLabel>Fecha de entrega</MetaLabel>
                      <MetaValue>
                        {formatDate(propuesta.fechaEntrega)}
                      </MetaValue>
                    </MetaItem>
                    <MetaItem>
                      <MetaLabel>Minera</MetaLabel>
                      <MetaValue>
                        {propuesta.mineraNombre || "No disponible"}
                      </MetaValue>
                    </MetaItem>
                  </PropuestaMeta>
                </PropuestaCard>
              ))
            )}
          </PropuestasList>
        </PropuestasContainer>
      </MainContent>

      {/* Modal de Detalle de Propuesta */}
      {showModal && selectedPropuesta && (
        <ModalOverlay onClick={handleModalOverlayClick}>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>
                {selectedPropuesta.licitacionTitulo || "Propuesta"}
              </ModalTitle>
              <ModalDate>
                Enviada el {formatDate(selectedPropuesta.fechaEnvio)}
              </ModalDate>
              <CloseButton onClick={handleCloseModal}>×</CloseButton>
            </ModalHeader>

            <ModalBody>
              <DetailSection>
                <SectionTitle>Información general</SectionTitle>
                <DetailGrid>
                  <InfoCard>
                    <InfoLabel>Fecha de envío</InfoLabel>
                    <InfoValue>
                      {formatDate(selectedPropuesta.fechaEnvio)}
                    </InfoValue>
                  </InfoCard>
                  <InfoCard>
                    <InfoLabel>Monto total</InfoLabel>
                    <InfoValue>
                      {formatCurrency(selectedPropuesta.presupuestoOfrecido)}
                    </InfoValue>
                  </InfoCard>
                  <InfoCard>
                    <InfoLabel>Fecha de entrega</InfoLabel>
                    <InfoValue>
                      {formatDate(selectedPropuesta.fechaEntrega)}
                    </InfoValue>
                  </InfoCard>
                  <InfoCard style={{ borderLeftColor: "#28a745" }}>
                    <InfoLabel>Estado actual</InfoLabel>
                    <InfoValue style={{ color: "#28a745" }}>
                      {formatStatus(selectedPropuesta.estadoNombre)}
                    </InfoValue>
                  </InfoCard>
                </DetailGrid>
              </DetailSection>

              <DetailSection>
                <SectionTitle>Licitación</SectionTitle>
                <DetailGrid>
                  <InfoCard>
                    <InfoLabel>Título</InfoLabel>
                    <InfoValue>
                      {selectedPropuesta.licitacionTitulo || "No disponible"}
                    </InfoValue>
                  </InfoCard>
                  <InfoCard>
                    <InfoLabel>Minera</InfoLabel>
                    <InfoValue>
                      {selectedPropuesta.mineraNombre || "No disponible"}
                    </InfoValue>
                  </InfoCard>
                </DetailGrid>
              </DetailSection>

              {selectedPropuesta.descripcion && (
                <DetailSection>
                  <SectionTitle>Descripción de la propuesta</SectionTitle>
                  <DetailDescription>
                    {selectedPropuesta.descripcion}
                  </DetailDescription>
                </DetailSection>
              )}

              {/* Criterios de evaluación */}
              {(() => {
                const respuestasCriterios =
                  selectedPropuesta.respuestasCriterios ||
                  selectedPropuesta.RespuestasCriterios;
                return respuestasCriterios && respuestasCriterios.length > 0 ? (
                  <DetailSection>
                    <SectionTitle>Criterios de evaluación</SectionTitle>
                    <CriteriosSection>
                      {respuestasCriterios.map((respuesta, index) => (
                        <CriterioItem key={index}>
                          <CriterioName>
                            {respuesta.criterioNombre ||
                              respuesta.CriterioNombre ||
                              "Criterio"}
                          </CriterioName>

                          {(respuesta.criterioDescripcion ||
                            respuesta.CriterioDescripcion) && (
                            <CriterioDescription>
                              {respuesta.criterioDescripcion ||
                                respuesta.CriterioDescripcion}
                            </CriterioDescription>
                          )}

                          <InfoLabel>Valor ofrecido</InfoLabel>
                          <CriterioValue>
                            {respuesta.valorProveedor ||
                              respuesta.ValorProveedor ||
                              "No especificado"}
                          </CriterioValue>
                        </CriterioItem>
                      ))}
                    </CriteriosSection>
                  </DetailSection>
                ) : null;
              })()}

              {selectedPropuesta.calificacionFinal && (
                <DetailSection>
                  <SectionTitle>Calificación</SectionTitle>
                  <InfoCard>
                    <InfoLabel>Calificación final</InfoLabel>
                    <InfoValue>
                      {selectedPropuesta.calificacionFinal}/10
                    </InfoValue>
                  </InfoCard>
                </DetailSection>
              )}

              {/* Archivos adjuntos */}
              {(() => {
                const archivosAdjuntos =
                  selectedPropuesta.archivosAdjuntos ||
                  selectedPropuesta.ArchivosAdjuntos;
                return archivosAdjuntos && archivosAdjuntos.length > 0 ? (
                  <DetailSection>
                    <SectionTitle>Archivos adjuntos</SectionTitle>
                    <DetailDescription>
                      {archivosAdjuntos.map((archivo, index) => {
                        const archivoId =
                          archivo.archivoID || archivo.ArchivoID;
                        const nombreArchivo =
                          archivo.nombreArchivo || archivo.NombreArchivo;

                        return (
                          <div key={index} style={{ marginBottom: "8px" }}>
                            📎{" "}
                            <ArchivoName
                              onClick={() =>
                                handleDownloadArchivo(archivoId, nombreArchivo)
                              }
                            >
                              {nombreArchivo}
                            </ArchivoName>
                          </div>
                        );
                      })}
                    </DetailDescription>
                  </DetailSection>
                ) : null;
              })()}
            </ModalBody>

            <ModalActions>
              <EditButton
                onClick={() => {
                  handleEditarPropuesta(selectedPropuesta.propuestaID);
                }}
              >
                ✏️ Editar
              </EditButton>
              <DeleteButton
                onClick={() => handleEliminarPropuesta(selectedPropuesta)}
              >
                🗑️ Eliminar
              </DeleteButton>
            </ModalActions>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* Modal de confirmación de eliminación */}
      {showConfirmDelete && deletingPropuesta && (
        <ConfirmModal
          onClick={(e) =>
            e.target === e.currentTarget && cancelDeletePropuesta()
          }
        >
          <ConfirmContent>
            <ConfirmTitle>⚠️ Confirmar eliminación</ConfirmTitle>
            <ConfirmText>
              ¿Está seguro que desea eliminar la propuesta para
              <strong>
                {" "}
                "{deletingPropuesta.licitacionTitulo || "esta licitación"}"
              </strong>
              ?
              <br />
              <br />
              Esta acción no se puede deshacer.
            </ConfirmText>
            <ConfirmActions>
              <CancelButton onClick={cancelDeletePropuesta}>
                Cancelar
              </CancelButton>
              <ConfirmDeleteButton onClick={confirmDeletePropuesta}>
                Eliminar
              </ConfirmDeleteButton>
            </ConfirmActions>
          </ConfirmContent>
        </ConfirmModal>
      )}

      {/* Toast Container */}
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
    </Container>
  );
};

export default PropuestasProveedor;
