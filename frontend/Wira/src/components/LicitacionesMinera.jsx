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

const CreateButton = styled.button`
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

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
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
  background: #e3f2fd;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #2196f3;
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
  color: #1976d2;
`;

const BudgetCard = styled.div`
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #28a745;
`;

const BudgetIcon = styled.div`
  font-size: 1.5rem;
  margin-bottom: 8px;
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

const PropuestasSection = styled.div`
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  color: #666;
`;

const PropuestasIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 15px;
  opacity: 0.5;
`;

const PropuestasText = styled.p`
  font-size: 1rem;
  margin: 0;
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
  max-width: 400px;
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

const ConfirmDeleteButton = styled(ConfirmButton)`
  background: #dc3545;
  color: white;

  &:hover {
    background: #c82333;
  }
`;

const CancelButton = styled(ConfirmButton)`
  background: #6c757d;
  color: white;

  &:hover {
    background: #5a6268;
  }
`;

const LicitacionesMinera = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Estados para datos
  const [licitaciones, setLicitaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Estado para el modal de detalle
  const [selectedLicitacion, setSelectedLicitacion] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Estado para el modal de confirmación de eliminación
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deletingLicitacion, setDeletingLicitacion] = useState(null);

  // Estados para filtros
  const [filters, setFilters] = useState({
    titulo: "",
    estado: "",
    fechaDesde: "",
    fechaHasta: "",
    rubro: "",
  });

  // Estados para ordenamiento
  const [sortBy, setSortBy] = useState("fechaCreacion");
  const [sortOrder, setSortOrder] = useState("desc");

  // Estados para datos adicionales
  const [estados] = useState([
    "Borrador",
    "Publicada",
    "En Evaluación",
    "Adjudicada",
    "Cancelada",
    "Cerrada",
  ]);
  const [rubros, setRubros] = useState([]);

  // Cargar datos iniciales
  useEffect(() => {
    fetchLicitaciones();
    fetchRubros();
  }, [user]);

  // Aplicar filtros y ordenamiento cuando cambien
  useEffect(() => {
    if (user) {
      fetchLicitaciones();
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
      document.body.style.overflow = "hidden"; // Prevenir scroll del fondo
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "unset";
    };
  }, [showModal]);

  const fetchLicitaciones = async () => {
    try {
      setLoading(true);
      setError("");

      // Obtener MineraID manejando tanto PascalCase como camelCase
      const mineraID =
        user?.MineraID ||
        user?.Minera?.MineraID ||
        user?.minera?.mineraID ||
        user?.minera?.MineraID;

      const response = await fetch("http://localhost:5242/api/licitaciones");
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Filtrar por minera del usuario autenticado
      let licitacionesMinera = [];

      if (mineraID) {
        licitacionesMinera = data.filter((licitacion) => {
          // La API devuelve con camelCase, no PascalCase
          const licitacionMineraID = licitacion.mineraID || licitacion.MineraID;
          const userMineraID = mineraID;

          // Comparar tanto como números como strings
          return (
            licitacionMineraID === userMineraID ||
            parseInt(licitacionMineraID) === parseInt(userMineraID) ||
            String(licitacionMineraID) === String(userMineraID)
          );
        });

        // Aplicar filtros adicionales
        if (filters.titulo) {
          licitacionesMinera = licitacionesMinera.filter((l) =>
            (l.titulo || l.Titulo || "")
              .toLowerCase()
              .includes(filters.titulo.toLowerCase())
          );
        }

        if (filters.estado) {
          licitacionesMinera = licitacionesMinera.filter(
            (l) => (l.estadoNombre || l.EstadoNombre) === filters.estado
          );
        }

        if (filters.fechaDesde) {
          licitacionesMinera = licitacionesMinera.filter(
            (l) =>
              new Date(l.fechaInicio || l.FechaInicio) >=
              new Date(filters.fechaDesde)
          );
        }

        if (filters.fechaHasta) {
          licitacionesMinera = licitacionesMinera.filter(
            (l) =>
              new Date(l.fechaCierre || l.FechaCierre) <=
              new Date(filters.fechaHasta)
          );
        }

        if (filters.rubro) {
          licitacionesMinera = licitacionesMinera.filter(
            (l) => (l.rubroNombre || l.RubroNombre) === filters.rubro
          );
        }

        // Aplicar ordenamiento
        licitacionesMinera.sort((a, b) => {
          let valueA, valueB;

          switch (sortBy) {
            case "titulo":
              valueA = (a.titulo || a.Titulo || "").toLowerCase();
              valueB = (b.titulo || b.Titulo || "").toLowerCase();
              break;
            case "fechaInicio":
              valueA = new Date(a.fechaInicio || a.FechaInicio);
              valueB = new Date(b.fechaInicio || b.FechaInicio);
              break;
            case "fechaCierre":
              valueA = new Date(a.fechaCierre || a.FechaCierre);
              valueB = new Date(b.fechaCierre || b.FechaCierre);
              break;
            case "estado":
              valueA = a.estadoNombre || a.EstadoNombre || "";
              valueB = b.estadoNombre || b.EstadoNombre || "";
              break;
            case "rubro":
              valueA = a.rubroNombre || a.RubroNombre || "";
              valueB = b.rubroNombre || b.RubroNombre || "";
              break;
            case "fechaCreacion":
            default:
              valueA = new Date(a.fechaCreacion || a.FechaCreacion);
              valueB = new Date(b.fechaCreacion || b.FechaCreacion);
              break;
          }

          if (valueA < valueB) return sortOrder === "asc" ? -1 : 1;
          if (valueA > valueB) return sortOrder === "asc" ? 1 : -1;
          return 0;
        });
      }

      setLicitaciones(licitacionesMinera);
    } catch (error) {
      console.error("Error al cargar licitaciones:", error);
      setError(
        "Error al cargar las licitaciones. Por favor, intente nuevamente."
      );
      toast.error("Error al cargar las licitaciones");
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

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      titulo: "",
      estado: "",
      fechaDesde: "",
      fechaHasta: "",
      rubro: "",
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

  const handleCrearLicitacion = () => {
    navigate("/crear-licitacion");
  };

  const handleEditarLicitacion = (licitacionId) => {
    navigate(`/editar-licitacion/${licitacionId}`);
  };

  const handleDeleteLicitacion = (licitacion) => {
    setDeletingLicitacion(licitacion);
    setShowConfirmDelete(true);
  };

  const confirmDeleteLicitacion = async () => {
    if (!deletingLicitacion) return;

    try {
      const licitacionId =
        deletingLicitacion.licitacionID || deletingLicitacion.LicitacionID;

      const response = await fetch(
        `http://localhost:5242/api/licitaciones/${licitacionId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      toast.success("Licitación eliminada exitosamente");

      // Cerrar modales
      setShowConfirmDelete(false);
      setShowModal(false);
      setDeletingLicitacion(null);
      setSelectedLicitacion(null);

      // Recargar las licitaciones
      await fetchLicitaciones();
    } catch (error) {
      console.error("Error al eliminar licitación:", error);
      toast.error(
        "Error al eliminar la licitación. Por favor, intente nuevamente."
      );
    }
  };

  const cancelDeleteLicitacion = () => {
    setShowConfirmDelete(false);
    setDeletingLicitacion(null);
  };

  const getCompanyName = () => {
    return (
      user?.Minera?.Nombre ||
      user?.minera?.nombre ||
      user?.minera?.Nombre ||
      "Empresa Minera"
    );
  };

  return (
    <Container>
      <Navbar />

      <MainContent>
        <PageHeader>
          <PageTitle>Mis licitaciones</PageTitle>
          <PageSubtitle>
            Gestione todas las licitaciones de {getCompanyName()}
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
              <FilterLabel>Estado</FilterLabel>
              <FilterSelect
                value={filters.estado}
                onChange={(e) => handleFilterChange("estado", e.target.value)}
              >
                <option value="">Todos los estados</option>
                {estados.map((estado) => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </FilterSelect>
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
              <FilterLabel>Fecha inicio desde</FilterLabel>
              <FilterInput
                type="date"
                value={filters.fechaDesde}
                onChange={(e) =>
                  handleFilterChange("fechaDesde", e.target.value)
                }
              />
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Fecha cierre hasta</FilterLabel>
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
            <FilterButton onClick={fetchLicitaciones}>
              Aplicar filtros
            </FilterButton>
            <ClearButton onClick={clearFilters}>Limpiar filtros</ClearButton>
          </FiltersActions>
        </FiltersContainer>

        <LicitacionesContainer>
          <LicitacionesHeader>
            <div>
              <LicitacionesTitle>Licitaciones</LicitacionesTitle>
              <ResultsInfo>
                {loading
                  ? "Cargando..."
                  : `${licitaciones.length} licitación(es) encontrada(s)`}
              </ResultsInfo>
            </div>

            <SortContainer>
              <SortLabel>Ordenar por:</SortLabel>
              <SortSelect
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => handleSortChange(e.target.value)}
              >
                <option value="fechaCreacion-desc">
                  Fecha creación (más reciente)
                </option>
                <option value="fechaCreacion-asc">
                  Fecha creación (más antigua)
                </option>
                <option value="titulo-asc">Título (A-Z)</option>
                <option value="titulo-desc">Título (Z-A)</option>
                <option value="fechaInicio-desc">
                  Fecha inicio (más reciente)
                </option>
                <option value="fechaInicio-asc">
                  Fecha inicio (más antigua)
                </option>
                <option value="fechaCierre-desc">
                  Fecha cierre (más reciente)
                </option>
                <option value="fechaCierre-asc">
                  Fecha cierre (más antigua)
                </option>
                <option value="estado-asc">Estado (A-Z)</option>
                <option value="rubro-asc">Rubro (A-Z)</option>
              </SortSelect>
            </SortContainer>
          </LicitacionesHeader>

          <LicitacionesList>
            {loading ? (
              <LoadingContainer>
                <LoadingSpinner />
                <LoadingText>Cargando licitaciones...</LoadingText>
              </LoadingContainer>
            ) : error ? (
              <ErrorContainer>
                <ErrorIcon>⚠️</ErrorIcon>
                <ErrorTitle>Error al cargar datos</ErrorTitle>
                <ErrorDescription>{error}</ErrorDescription>
                <RetryButton onClick={fetchLicitaciones}>
                  Reintentar
                </RetryButton>
              </ErrorContainer>
            ) : licitaciones.length === 0 ? (
              <EmptyState>
                <EmptyIcon>📝</EmptyIcon>
                <EmptyTitle>No hay licitaciones</EmptyTitle>
                <EmptyDescription>
                  No se encontraron licitaciones que coincidan con los filtros
                  aplicados.
                  {Object.values(filters).every((f) => !f) && (
                    <span>
                      <br />
                      Comience creando su primera licitación.
                    </span>
                  )}
                </EmptyDescription>
                {Object.values(filters).every((f) => !f) && (
                  <CreateButton onClick={handleCrearLicitacion}>
                    Crear primera licitación
                  </CreateButton>
                )}
              </EmptyState>
            ) : (
              licitaciones.map((licitacion) => (
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
                    <LicitacionStatus
                      status={
                        licitacion.estadoNombre || licitacion.EstadoNombre
                      }
                    >
                      {licitacion.estadoNombre || licitacion.EstadoNombre}
                    </LicitacionStatus>
                  </LicitacionHeader>

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
                      <MetaLabel>Fecha inicio</MetaLabel>
                      <MetaValue>
                        {formatDate(
                          licitacion.fechaInicio || licitacion.FechaInicio
                        )}
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
              ))
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
                Creada el{" "}
                {formatDate(
                  selectedLicitacion.fechaCreacion ||
                    selectedLicitacion.FechaCreacion
                )}
              </ModalDate>
              <CloseButton onClick={handleCloseModal}>×</CloseButton>
            </ModalHeader>

            <ModalBody>
              <DetailSection>
                <SectionTitle>Información General</SectionTitle>

                {/* Primera fila - Estado y Rubro */}
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

                {/* Segunda fila - Fechas importantes */}
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

                {/* Tercera fila - Presupuesto */}
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
                console.log("Evaluando sección archivo adjunto:", {
                  archivoNombre,
                  existe: !!archivoNombre,
                  selectedLicitacion,
                });
                return archivoNombre ? (
                  <DetailSection>
                    <SectionTitle>Archivo adjunto</SectionTitle>
                    <DetailDescription>📎 {archivoNombre}</DetailDescription>
                  </DetailSection>
                ) : null;
              })()}

              <DetailSection>
                <SectionTitle>Propuestas</SectionTitle>
                <PropuestasSection>
                  <PropuestasIcon>📋</PropuestasIcon>
                  <PropuestasText>
                    La gestión de propuestas estará disponible próximamente.
                    <br />
                    Aquí podrá ver y evaluar todas las propuestas recibidas para
                    esta licitación.
                  </PropuestasText>
                </PropuestasSection>
              </DetailSection>
            </ModalBody>

            <ModalActions>
              <EditButton
                onClick={() =>
                  handleEditarLicitacion(
                    selectedLicitacion.licitacionID ||
                      selectedLicitacion.LicitacionID
                  )
                }
              >
                ✏️ Editar
              </EditButton>
              <DeleteButton
                onClick={() => handleDeleteLicitacion(selectedLicitacion)}
              >
                🗑️ Eliminar
              </DeleteButton>
            </ModalActions>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* Modal de confirmación de eliminación */}
      {showConfirmDelete && deletingLicitacion && (
        <ConfirmModal
          onClick={(e) =>
            e.target === e.currentTarget && cancelDeleteLicitacion()
          }
        >
          <ConfirmContent>
            <ConfirmTitle>⚠️ Confirmar eliminación</ConfirmTitle>
            <ConfirmText>
              ¿Está seguro que desea eliminar la licitación
              <strong>
                {" "}
                "{deletingLicitacion.titulo || deletingLicitacion.Titulo}"
              </strong>
              ?
              <br />
              <br />
              Esta acción no se puede deshacer.
            </ConfirmText>
            <ConfirmActions>
              <CancelButton onClick={cancelDeleteLicitacion}>
                Cancelar
              </CancelButton>
              <ConfirmDeleteButton onClick={confirmDeleteLicitacion}>
                Eliminar
              </ConfirmDeleteButton>
            </ConfirmActions>
          </ConfirmContent>
        </ConfirmModal>
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

export default LicitacionesMinera;
