import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { useAuth } from "../../contexts/AuthContext";
// import { useNavigate } from "react-router-dom"; // Currently not used
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DialogModal from "../shared/DialogModal";
import Navbar from "../shared/Navbar";
import { buttonBaseStyles } from "../shared/buttonStyles";
import apiService from "../../services/apiService";

const Container = styled.div`
  min-height: 100vh;
  background: #f8f9fa;
`;

const MainContent = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const PageHeader = styled.header`
  margin-bottom: 30px;
`;

const PageTitle = styled.h1`
  color: #0f172a;
  font-size: 2rem;
  margin: 0 0 10px;
`;

const PageSubtitle = styled.p`
  color: #475569;
  font-size: 1.1rem;
  margin: 0;
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
  ${buttonBaseStyles};
  padding: 10px 20px;
  font-size: 0.9rem;
  background: #fc6b0a;
  color: white;

  &:hover:not(:disabled) {
    background: #e55a09;
  }
`;

const ClearButton = styled.button`
  ${buttonBaseStyles};
  padding: 10px 20px;
  font-size: 0.9rem;
  background: #6c757d;
  color: white;

  &:hover:not(:disabled) {
    background: #5a6268;
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

const AppliedIndicator = styled.div`
  background: #e2d5f0;
  color: #6f42c1;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-left: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
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
  ${buttonBaseStyles};
  padding: 12px 24px;
  font-size: 1rem;
  background: #dc3545;
  color: white;

  &:hover:not(:disabled) {
    background: #c82333;
  }
`;

const DATE_INPUT_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;

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
  ${buttonBaseStyles};
  padding: 12px 24px;
  font-size: 1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const PostularButton = styled(ActionButton)`
  background: #28a745;
  color: white;

  &:hover:not(:disabled) {
    background: #218838;
  }
`;

const AlreadyAppliedButton = styled(ActionButton)`
  background: #94a3b8;
  color: white;
  cursor: not-allowed;
  box-shadow: none;

  &:hover {
    background: #94a3b8;
    transform: none;
    box-shadow: none;
  }
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
  max-width: 900px;
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
  font-size: 1rem;
  color: #555;
  margin-bottom: 8px;
  font-weight: 600;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
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
  font-size: 0.9rem;
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
  font-size: 0.9rem;
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

const CriterioDescripcion = styled.p`
  color: #666;
  font-size: 0.9rem;
  margin: 0 0 15px 0;
  line-height: 1.4;
`;

const CriterioInput = styled.div`
  margin-top: 15px;
`;

const CriterioHint = styled.div`
  font-size: 0.9rem;
  color: #555;
  margin-bottom: 8px;
  font-style: italic;
`;

const CriterioSelect = styled.select`
  width: 100%;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
  background: white;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #28a745;
    box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.1);
  }
`;

const BooleanChoiceRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 8px;
`;

const BooleanChoiceLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border: 1px solid #e1e5e9;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  color: #333;
  background: #fff;

  &:hover {
    border-color: #28a745;
  }
`;

const BooleanChoiceInput = styled.input`
  accent-color: #28a745;
`;

const NoOptionsText = styled.div`
  font-size: 0.9rem;
  color: #888;
`;

// Styled components para archivo adjunto
const ArchivoName = styled.span`
  flex: 1;
  color: #333;
  cursor: pointer;
  text-decoration: underline;

  &:hover {
    color: #fc6b0a;
  }
`;

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
  font-size: 0.9rem;
  margin: 0;
  font-style: italic;
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
  ${buttonBaseStyles};
  padding: 6px 12px;
  font-size: 0.85rem;
  border-radius: 6px;
  background: #dc3545;
  color: white;
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.25);

  &:hover:not(:disabled) {
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

const resolveTipoCriterio = (tipoValue) => {
  if (typeof tipoValue === "string" && tipoValue.trim()) {
    const normalized = tipoValue.trim().toLowerCase();
    if (normalized.includes("boolean")) return "Booleano";
    if (normalized.includes("escala")) return "Escala";
    if (normalized.includes("descript")) return "Descriptivo";
    return "Numerico";
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

const toNumberOrFallback = (value, fallback) => {
  if (typeof value === "number" && !Number.isNaN(value)) {
    return value;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const toNumberOrNull = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const parseBooleanValue = (value) => {
  if (typeof value === "boolean") {
    return value;
  }
  if (value === null || value === undefined) {
    return null;
  }
  if (value === 1 || value === "1" || value === "true" || value === "TRUE") {
    return true;
  }
  if (value === 0 || value === "0" || value === "false" || value === "FALSE") {
    return false;
  }
  return null;
};

const normalizeCriterioOpcion = (opcion, index) => {
  const opcionID = toNumberOrFallback(
    opcion?.opcionID ?? opcion?.OpcionID ?? opcion?.id ?? index + 1,
    index + 1
  );

  return {
    id: String(opcionID),
    opcionID,
    valor: opcion?.valor ?? opcion?.Valor ?? `Opción ${index + 1}`,
    descripcion: opcion?.descripcion ?? opcion?.Descripcion ?? "",
    puntaje: toNumberOrNull(opcion?.puntaje ?? opcion?.Puntaje),
    orden: opcion?.orden ?? opcion?.Orden ?? index + 1,
  };
};

const normalizeCriterioResponse = (criterio, index) => {
  const criterioID = toNumberOrFallback(
    criterio?.criterioID ?? criterio?.CriterioID ?? criterio?.id ?? index + 1,
    index + 1
  );
  const tipo = resolveTipoCriterio(criterio?.tipo ?? criterio?.Tipo);
  const mayorMejorValue = criterio?.mayorMejor ?? criterio?.MayorMejor;
  const valorRequeridoBooleanoValue =
    criterio?.valorRequeridoBooleano ?? criterio?.ValorRequeridoBooleano;

  const opciones =
    tipo === "Escala"
      ? (criterio?.opciones ?? criterio?.Opciones ?? []).map((opcion, idx) =>
          normalizeCriterioOpcion(opcion, idx)
        )
      : [];

  return {
    id: String(criterioID),
    criterioID,
    nombre: criterio?.nombre ?? criterio?.Nombre ?? `Criterio ${index + 1}`,
    descripcion: criterio?.descripcion ?? criterio?.Descripcion ?? "",
    peso: toNumberOrNull(criterio?.peso ?? criterio?.Peso) ?? 0,
    tipo,
    mayorMejor: typeof mayorMejorValue === "boolean" ? mayorMejorValue : null,
    valorMinimo: toNumberOrNull(criterio?.valorMinimo ?? criterio?.ValorMinimo),
    valorMaximo: toNumberOrNull(criterio?.valorMaximo ?? criterio?.ValorMaximo),
    valorRequeridoBooleano: parseBooleanValue(valorRequeridoBooleanoValue),
    esExcluyente: Boolean(
      criterio?.esExcluyente ?? criterio?.EsExcluyente ?? false
    ),
    esPuntuable:
      tipo === "Descriptivo"
        ? false
        : Boolean(criterio?.esPuntuable ?? criterio?.EsPuntuable ?? true),
    opciones,
  };
};

const createRespuestaInicial = () => ({
  valorTexto: "",
  valorNumerico: "",
  valorBooleano: null,
  opcionSeleccionadaId: "",
});

const LicitacionesProveedor = () => {
  const { user, token } = useAuth();
  // const navigate = useNavigate(); // Currently not used

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

  // Estado para modal de confirmación
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  // Estados para filtros
  const [filters, setFilters] = useState({
    titulo: "",
    rubro: "",
    presupuestoMin: "",
    presupuestoMax: "",
    fechaCierreDesde: "",
    fechaCierreHasta: "",
    minera: "",
    estadoPostulacion: "todas", // "todas", "postuladas", "no_postuladas"
  });

  // Estados para ordenamiento
  const [sortBy, setSortBy] = useState("fechaCierre");
  const [sortOrder, setSortOrder] = useState("asc");

  // Estados para datos adicionales
  const [rubros, setRubros] = useState([]);
  const [mineras, setMineras] = useState([]);

  const toUtcISOString = useCallback((value) => {
    if (!value) return null;
    const parsed =
      value instanceof Date ? new Date(value.getTime()) : new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
  }, []);

  const toUtcDate = useCallback(
    (value) => {
      const isoValue = toUtcISOString(value);
      return isoValue ? new Date(isoValue) : null;
    },
    [toUtcISOString]
  );

  const dateInputToUtcDate = useCallback(
    (value, { endOfDay = false } = {}) => {
      if (!value) return null;
      const match = DATE_INPUT_REGEX.exec(value);
      if (!match) {
        return toUtcDate(value);
      }

      const [, yearStr, monthStr, dayStr] = match;
      const year = Number(yearStr);
      const month = Number(monthStr);
      const day = Number(dayStr);

      if ([year, month, day].some((num) => Number.isNaN(num))) {
        return null;
      }

      const hours = endOfDay ? 23 : 0;
      const minutes = endOfDay ? 59 : 0;
      const seconds = endOfDay ? 59 : 0;
      const milliseconds = endOfDay ? 999 : 0;

      return new Date(
        Date.UTC(year, month - 1, day, hours, minutes, seconds, milliseconds)
      );
    },
    [toUtcDate]
  );

  // Cargar datos iniciales
  useEffect(() => {
    fetchLicitacionesActivas();
    fetchRubros();
    fetchMineras();
    fetchUserPropuestas();
    // Note: ESLint suggests adding functions to dependencies, but this would cause infinite re-renders
    // since these functions get recreated on each render. Using conservative dependency list instead.
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Aplicar filtros y ordenamiento cuando cambien
  useEffect(() => {
    if (user) {
      fetchLicitacionesActivas();
    }
    // Note: ESLint suggests adding fetchLicitacionesActivas to dependencies, but this would cause
    // infinite re-renders since the function gets recreated on each render. Using conservative deps.
  }, [filters, sortBy, sortOrder, user]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const fetchLicitacionesActivas = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const res = await apiService.getLicitaciones();
      const data = res?.data ?? [];

      // Filtrar solo licitaciones activas (Publicada y En Evaluación)
      let licitacionesActivas = data.filter((licitacion) => {
        const estado = licitacion.estadoNombre || licitacion.EstadoNombre;
        return estado === "Publicada" || estado === "En Evaluación";
      });

      // Aplicar filtros adicionales
      const fechaCierreDesdeUtc = dateInputToUtcDate(filters.fechaCierreDesde);
      const fechaCierreHastaUtc = dateInputToUtcDate(filters.fechaCierreHasta, {
        endOfDay: true,
      });
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

      if (fechaCierreDesdeUtc) {
        licitacionesActivas = licitacionesActivas.filter((l) => {
          const cierreDate = toUtcDate(l.fechaCierre || l.FechaCierre);
          return cierreDate ? cierreDate >= fechaCierreDesdeUtc : false;
        });
      }

      if (fechaCierreHastaUtc) {
        licitacionesActivas = licitacionesActivas.filter((l) => {
          const cierreDate = toUtcDate(l.fechaCierre || l.FechaCierre);
          return cierreDate ? cierreDate <= fechaCierreHastaUtc : false;
        });
      }

      if (filters.minera) {
        licitacionesActivas = licitacionesActivas.filter(
          (l) => (l.mineraNombre || l.MineraNombre) === filters.minera
        );
      }

      // Filtrar por estado de postulación
      if (filters.estadoPostulacion === "postuladas") {
        licitacionesActivas = licitacionesActivas.filter((l) =>
          hasUserApplied(l.licitacionID || l.LicitacionID)
        );
      } else if (filters.estadoPostulacion === "no_postuladas") {
        licitacionesActivas = licitacionesActivas.filter(
          (l) => !hasUserApplied(l.licitacionID || l.LicitacionID)
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
            valueA = toUtcDate(a.fechaCierre || a.FechaCierre)?.getTime() || 0;
            valueB = toUtcDate(b.fechaCierre || b.FechaCierre)?.getTime() || 0;
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
            valueA = toUtcDate(a.fechaCierre || a.FechaCierre)?.getTime() || 0;
            valueB = toUtcDate(b.fechaCierre || b.FechaCierre)?.getTime() || 0;
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
  }, [filters, sortBy, sortOrder, userPropuestas]); // Conservative dependencies

  const fetchRubros = async () => {
    try {
      const res = await apiService.getRubros();
      setRubros(res?.data ?? []);
    } catch (error) {
      console.error("Error al cargar rubros:", error);
    }
  };

  const fetchMineras = async () => {
    try {
      const res = await apiService.getMineras();
      setMineras(res?.data ?? []);
    } catch (error) {
      console.error("Error al cargar mineras:", error);
    }
  };

  const fetchUserPropuestas = useCallback(async () => {
    try {
      const proveedorID =
        user?.ProveedorID ||
        user?.Proveedor?.ProveedorID ||
        user?.proveedor?.proveedorID ||
        user?.proveedor?.ProveedorID;

      if (!proveedorID) return;

      const res = await apiService.get(`/propuestas/proveedor/${proveedorID}`);
      setUserPropuestas(res?.data ?? []);
    } catch (error) {
      console.error("Error al cargar propuestas del usuario:", error);
    }
  }, [user]); // Conservative dependencies

  const fetchCriteriosLicitacion = async (licitacionId) => {
    try {
      setLoadingCriterios(true);

      const res = await apiService.getCriteriosLicitacion(licitacionId);
      const data = res?.data ?? [];
      const normalized = data.map((criterio, index) =>
        normalizeCriterioResponse(criterio, index)
      );
      setCriteriosLicitacion(normalized);

      const respuestasIniciales = {};
      normalized.forEach((criterio) => {
        respuestasIniciales[criterio.id] = createRespuestaInicial();
      });
      setRespuestasCriterios(respuestasIniciales);
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
      estadoPostulacion: "todas",
    });
  };

  const handleSortChange = (value) => {
    const [field, order] = value.split("-");
    setSortBy(field);
    setSortOrder(order);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No especificada";

    const date = toUtcDate(dateString);
    if (!date) return "Fecha inválida";

    return date.toLocaleDateString("es-AR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount, monedaInfo) => {
    if (amount === null || amount === undefined) return "No especificado";
    const numericAmount = Number(amount);
    if (Number.isNaN(numericAmount)) return "No especificado";

    const currencyCode =
      monedaInfo?.codigo ||
      monedaInfo?.Codigo ||
      monedaInfo?.monedaCodigo ||
      monedaInfo?.MonedaCodigo ||
      "ARS";
    const currencySymbol =
      monedaInfo?.simbolo ||
      monedaInfo?.Simbolo ||
      monedaInfo?.monedaSimbolo ||
      monedaInfo?.MonedaSimbolo;

    try {
      return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(numericAmount);
    } catch {
      const formatted = numericAmount.toLocaleString("es-AR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      if (currencySymbol) {
        return `${currencySymbol} ${formatted}`;
      }
      return `${currencyCode} ${formatted}`;
    }
  };

  const getLicitacionCurrency = (licitacion) => ({
    codigo: licitacion?.monedaCodigo || licitacion?.MonedaCodigo,
    simbolo: licitacion?.monedaSimbolo || licitacion?.MonedaSimbolo,
    nombre: licitacion?.monedaNombre || licitacion?.MonedaNombre,
  });

  const getCurrencyAbbreviation = (currency) => {
    if (!currency) return "ARS";

    return (
      currency?.codigo ||
      currency?.Codigo ||
      currency?.monedaCodigo ||
      currency?.MonedaCodigo ||
      currency?.simbolo ||
      currency?.Simbolo ||
      currency?.monedaSimbolo ||
      currency?.MonedaSimbolo ||
      "ARS"
    );
  };

  const calculateTimeRemaining = (fechaCierre) => {
    if (!fechaCierre) return null;

    const now = toUtcDate(new Date()) || new Date();
    const cierre = toUtcDate(fechaCierre);
    if (!cierre) return null;
    const diffTime = cierre.getTime() - now.getTime();

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
      // Cargar archivos adjuntos para esta licitación
      fetchArchivosLicitacion(licitacionId);
    }
  };

  // Función para obtener archivos adjuntos de una licitación
  const fetchArchivosLicitacion = async (licitacionId) => {
    try {
      const res = await apiService.getArchivosByLicitacion(licitacionId);
      const archivos = res?.data ?? [];

      // Actualizar la licitación seleccionada con los archivos
      setSelectedLicitacion((prev) => {
        if (prev) {
          const archivoAdjunto = archivos.length > 0 ? archivos[0] : null;
          return {
            ...prev,
            archivosAdjuntos: archivos,
            // Para mantener compatibilidad con el código existente
            archivoNombre:
              archivoAdjunto?.nombreArchivo || archivoAdjunto?.NombreArchivo,
            ArchivoNombre:
              archivoAdjunto?.nombreArchivo || archivoAdjunto?.NombreArchivo,
            archivoID: archivoAdjunto?.archivoID || archivoAdjunto?.ArchivoID,
            ArchivoID: archivoAdjunto?.archivoID || archivoAdjunto?.ArchivoID,
          };
        }
        return prev;
      });
    } catch (error) {
      console.error("Error al cargar archivos de licitación:", error);
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
    // Mostrar modal de confirmación
    setShowConfirmSubmit(true);
  };

  const confirmSubmit = async () => {
    try {
      // Cerrar modal de confirmación
      setShowConfirmSubmit(false);
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
          (criterio) => !isRespuestaCompleta(criterio)
        );

        if (criteriosSinRespuesta.length > 0) {
          toast.error("Por favor, complete todos los criterios de evaluación");
          return;
        }
      }

      // Preparar respuestas a los criterios
      const respuestasCriteriosArray = criteriosLicitacion
        .map((criterio) => buildRespuestaPayload(criterio))
        .filter((respuesta) => respuesta !== null);

      const createRes = await apiService.post("/propuestas", {
        LicitacionID: licitacionId,
        ProveedorID: proveedorID,
        Descripcion: propuestaForm.descripcion,
        PresupuestoOfrecido: parseFloat(propuestaForm.presupuestoOfrecido),
        MonedaID:
          selectedLicitacion.monedaID ||
          selectedLicitacion.MonedaID ||
          selectedLicitacion.moneda?.monedaID ||
          selectedLicitacion.Moneda?.MonedaID,
        FechaEntrega: propuestaForm.fechaEntrega
          ? toUtcISOString(propuestaForm.fechaEntrega)
          : null,
        RespuestasCriterios: respuestasCriteriosArray,
      });

      const propuestaData = createRes?.data;

      // Intentar múltiples variaciones del campo ID
      const propuestaId =
        propuestaData?.PropuestaID ||
        propuestaData?.propuestaID ||
        propuestaData?.id ||
        propuestaData?.ID;

      // Crear registro en historial con ganador como null (vacío)
      try {
        await apiService.post("/historial-proveedor-licitacion", {
          ProveedorID: proveedorID,
          LicitacionID: licitacionId,
          Resultado: "EN_PROCESO",
          Observaciones: "Propuesta enviada - En proceso de evaluación",
          FechaParticipacion: toUtcISOString(new Date()),
        });
      } catch (historialError) {
        console.warn("Error al crear registro de historial:", historialError);
        // No lanzamos error para no interrumpir el flujo principal
      }

      // Si hay archivo adjunto, subirlo
      if (selectedFile && propuestaId) {
        try {
          // Mostrar notificación de subida
          toast.info("📎 Subiendo archivo adjunto...", {
            position: "top-right",
            autoClose: false,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: false,
            draggable: false,
            toastId: "uploading-propuesta",
          });

          const formData = new FormData();
          formData.append("File", selectedFile);
          formData.append("EntidadTipo", "PROPUESTA");
          formData.append("EntidadID", propuestaId.toString());

          const uploadRes = await apiService.uploadArchivo(formData);

          // Cerrar la notificación de subida
          toast.dismiss("uploading-propuesta");

          if (!uploadRes || !uploadRes.data) {
            toast.warn(
              "Propuesta creada exitosamente, pero hubo un error al subir el archivo adjunto"
            );
          } else {
            toast.success("✅ Propuesta y archivo enviados exitosamente!");
          }
        } catch (uploadError) {
          console.error("Upload error:", uploadError);
          toast.warn(
            "Propuesta creada exitosamente, pero hubo un error al subir el archivo adjunto"
          );
        }
      } else if (selectedFile && !propuestaId) {
        toast.warn(
          "Propuesta creada exitosamente, pero no se pudo subir el archivo adjunto (ID no disponible)"
        );
      }

      // Mostrar mensaje de éxito general
      if (selectedFile && propuestaId) {
        // El mensaje de éxito se muestra después de subir el archivo
      } else {
        toast.success("¡Propuesta enviada exitosamente!");
      }
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
      toast.error(
        error.message ||
          "Error al enviar la propuesta. Por favor, intente nuevamente."
      );
    } finally {
      setPostulando(false);
    }
  };

  const cancelSubmit = () => {
    setShowConfirmSubmit(false);
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

  const selectedLicitacionCurrency = selectedLicitacion
    ? getLicitacionCurrency(selectedLicitacion)
    : null;
  const selectedPropuestaCurrencyAbbr = getCurrencyAbbreviation(
    selectedLicitacionCurrency
  );

  const updateRespuestaCriterio = (criterioId, updates) => {
    setRespuestasCriterios((prev) => ({
      ...prev,
      [criterioId]: {
        ...(prev[criterioId] || createRespuestaInicial()),
        ...updates,
      },
    }));
  };

  const handleTextoRespuestaChange = (criterioId, value) => {
    updateRespuestaCriterio(criterioId, { valorTexto: value });
  };

  const handleNumericoRespuestaChange = (criterioId, value) => {
    updateRespuestaCriterio(criterioId, { valorNumerico: value });
  };

  const handleBooleanRespuestaChange = (criterioId, value) => {
    updateRespuestaCriterio(criterioId, { valorBooleano: value });
  };

  const handleEscalaRespuestaChange = (criterioId, value) => {
    updateRespuestaCriterio(criterioId, { opcionSeleccionadaId: value });
  };

  const isRespuestaCompleta = useCallback(
    (criterio) => {
      const respuesta = respuestasCriterios[criterio.id];
      if (!respuesta) {
        return false;
      }

      switch (criterio.tipo) {
        case "Numerico": {
          if (
            respuesta.valorNumerico === "" ||
            respuesta.valorNumerico === null
          ) {
            return false;
          }
          const numericValue = parseFloat(respuesta.valorNumerico);
          if (Number.isNaN(numericValue)) {
            return false;
          }
          if (
            criterio.valorMinimo !== null &&
            criterio.valorMinimo !== undefined &&
            numericValue < criterio.valorMinimo
          ) {
            return false;
          }
          if (
            criterio.valorMaximo !== null &&
            criterio.valorMaximo !== undefined &&
            numericValue > criterio.valorMaximo
          ) {
            return false;
          }
          return true;
        }
        case "Booleano":
          return typeof respuesta.valorBooleano === "boolean";
        case "Escala":
          return Boolean(respuesta.opcionSeleccionadaId);
        case "Descriptivo":
        default:
          return Boolean(respuesta.valorTexto?.trim());
      }
    },
    [respuestasCriterios]
  );

  const buildRespuestaPayload = useCallback(
    (criterio) => {
      const respuesta = respuestasCriterios[criterio.id];
      if (!respuesta) {
        return null;
      }

      const basePayload = {
        CriterioID: criterio.criterioID,
      };

      switch (criterio.tipo) {
        case "Numerico": {
          const numericValue = parseFloat(respuesta.valorNumerico);
          if (Number.isNaN(numericValue)) {
            return null;
          }
          return {
            ...basePayload,
            ValorProveedor: respuesta.valorNumerico.toString(),
            ValorNumerico: numericValue,
          };
        }
        case "Booleano": {
          if (typeof respuesta.valorBooleano !== "boolean") {
            return null;
          }
          return {
            ...basePayload,
            ValorProveedor: respuesta.valorBooleano ? "true" : "false",
            ValorBooleano: respuesta.valorBooleano,
          };
        }
        case "Escala": {
          if (!respuesta.opcionSeleccionadaId) {
            return null;
          }
          const opcionSeleccionada = criterio.opciones.find(
            (opcion) => opcion.id === respuesta.opcionSeleccionadaId
          );
          const parsedOpcionId =
            opcionSeleccionada?.opcionID ??
            Number(respuesta.opcionSeleccionadaId);
          return {
            ...basePayload,
            ValorProveedor: opcionSeleccionada?.valor || "",
            CriterioOpcionID: Number.isNaN(parsedOpcionId)
              ? null
              : parsedOpcionId,
          };
        }
        case "Descriptivo":
        default: {
          const texto = respuesta.valorTexto?.trim();
          if (!texto) {
            return null;
          }
          return {
            ...basePayload,
            ValorProveedor: texto,
          };
        }
      }
    },
    [respuestasCriterios]
  );

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

      const res = await apiService.downloadArchivoById(ArchivoID);
      if (!res || !res.data) throw new Error("Error al descargar el archivo");
      const blob = res.data;

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
      console.error("Download error:", error);
      toast.error("Error al descargar el archivo");
    }
  };

  const getCompanyName = () => {
    return (
      user?.Proveedor?.Nombre ||
      user?.proveedor?.nombre ||
      user?.proveedor?.Nombre ||
      "Empresa Proveedora"
    );
  };

  // Función para obtener el mensaje de estado vacío
  const getEmptyStateMessage = () => {
    switch (filters.estadoPostulacion) {
      case "postuladas":
        return {
          title: "No tiene propuestas enviadas",
          description:
            "Aún no tiene propuestas enviadas para ninguna licitación activa. Explore las licitaciones disponibles y envíe su primera propuesta.",
        };
      case "no_postuladas":
        return {
          title: "No hay licitaciones disponibles",
          description:
            "Ya ha enviado propuestas para todas las licitaciones activas que coinciden con sus filtros, o no hay licitaciones disponibles en este momento.",
        };
      default:
        return {
          title: "No hay licitaciones activas",
          description:
            "No se encontraron licitaciones activas que coincidan con los filtros aplicados. Intente ajustar los criterios de búsqueda.",
        };
    }
  };

  // Función para obtener el texto de resultados
  const getResultsText = () => {
    if (loading) return "Cargando...";

    const totalCount = licitaciones.length;
    const appliedCount = licitaciones.filter((l) =>
      hasUserApplied(l.licitacionID || l.LicitacionID)
    ).length;
    const notAppliedCount = totalCount - appliedCount;

    switch (filters.estadoPostulacion) {
      case "postuladas":
        return totalCount === 1
          ? "1 licitación ya postulada"
          : `${totalCount} licitaciones ya postuladas`;
      case "no_postuladas":
        return totalCount === 1
          ? "1 licitación disponible para postular"
          : `${totalCount} licitaciones disponibles para postular`;
      default: {
        const licSing = totalCount === 1 ? "licitación" : "licitaciones";
        const postSing = appliedCount === 1 ? "postulada" : "postuladas";
        const dispSing = notAppliedCount === 1 ? "disponible" : "disponibles";
        const activaWord = totalCount === 1 ? "activa" : "activas";
        return `${totalCount} ${licSing} ${activaWord} (${appliedCount} ${postSing}, ${notAppliedCount} ${dispSing})`;
      }
    }
  };

  const hasIncompleteCriterios =
    criteriosLicitacion.length > 0 &&
    criteriosLicitacion.some((criterio) => !isRespuestaCompleta(criterio));

  return (
    <Container>
      <Navbar />

      <MainContent>
        <PageHeader>
          <PageTitle>Licitaciones activas</PageTitle>
          <PageSubtitle>
            Explore las oportunidades de negocio disponibles para{" "}
            {getCompanyName()}.
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

            <FilterGroup>
              <FilterLabel>Estado de postulación</FilterLabel>
              <FilterSelect
                value={filters.estadoPostulacion}
                onChange={(e) =>
                  handleFilterChange("estadoPostulacion", e.target.value)
                }
              >
                <option value="todas">Todas las licitaciones</option>
                <option value="no_postuladas">No postuladas</option>
                <option value="postuladas">Ya postuladas</option>
              </FilterSelect>
            </FilterGroup>
          </FiltersGrid>

          <FiltersActions>
            <FilterButton onClick={fetchLicitacionesActivas}>
              Aplicar filtros
            </FilterButton>
            <ClearButton onClick={clearFilters}>Limpiar</ClearButton>
          </FiltersActions>
        </FiltersContainer>

        <LicitacionesContainer>
          <LicitacionesHeader>
            <div>
              <LicitacionesTitle>Licitaciones</LicitacionesTitle>
              <ResultsInfo>{getResultsText()}</ResultsInfo>
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
                <EmptyTitle>{getEmptyStateMessage().title}</EmptyTitle>
                <EmptyDescription>
                  {getEmptyStateMessage().description}
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
                const monedaInfo = getLicitacionCurrency(licitacion);

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
                          <AppliedIndicator>✓ Ya postulado</AppliedIndicator>
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
                              licitacion.PresupuestoEstimado,
                            monedaInfo
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
                          selectedLicitacion.PresupuestoEstimado,
                        selectedLicitacionCurrency
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
                const archivoId =
                  selectedLicitacion.archivoID || selectedLicitacion.ArchivoID;
                return archivoNombre ? (
                  <DetailSection>
                    <SectionTitle>Archivo adjunto</SectionTitle>
                    <DetailDescription>
                      📎{" "}
                      <ArchivoName
                        onClick={() =>
                          handleDownloadArchivo(archivoId, archivoNombre)
                        }
                      >
                        {archivoNombre}
                      </ArchivoName>
                    </DetailDescription>
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
              </FormGroup>

              <FormGroup>
                <FormLabel>
                  {`Presupuesto ofrecido (${selectedPropuestaCurrencyAbbr}) *`}
                </FormLabel>
                <FormInput
                  type="number"
                  value={propuestaForm.presupuestoOfrecido}
                  onChange={(e) =>
                    setPropuestaForm((prev) => ({
                      ...prev,
                      presupuestoOfrecido: e.target.value,
                    }))
                  }
                  placeholder={
                    selectedLicitacionCurrency?.simbolo
                      ? `${selectedLicitacionCurrency.simbolo} 0.00`
                      : "0.00"
                  }
                  min="0"
                  step="0.01"
                  required
                />
                <FormHint>
                  Presupuesto estimado:{" "}
                  {formatCurrency(
                    selectedLicitacion.presupuestoEstimado ||
                      selectedLicitacion.PresupuestoEstimado,
                    selectedLicitacionCurrency
                  )}
                  .
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
                  .
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
                      esta licitación.
                    </FormHint>
                    {criteriosLicitacion.map((criterio) => {
                      const respuesta =
                        respuestasCriterios[criterio.id] ||
                        createRespuestaInicial();
                      const rangoTexto = (() => {
                        if (
                          criterio.valorMinimo !== null &&
                          criterio.valorMinimo !== undefined &&
                          criterio.valorMaximo !== null &&
                          criterio.valorMaximo !== undefined
                        ) {
                          return `Rango permitido: ${criterio.valorMinimo} - ${criterio.valorMaximo}.`;
                        }
                        if (
                          criterio.valorMinimo !== null &&
                          criterio.valorMinimo !== undefined
                        ) {
                          return `Mínimo permitido: ${criterio.valorMinimo}.`;
                        }
                        if (
                          criterio.valorMaximo !== null &&
                          criterio.valorMaximo !== undefined
                        ) {
                          return `Máximo permitido: ${criterio.valorMaximo}.`;
                        }
                        return null;
                      })();

                      return (
                        <CriterioCard key={criterio.id}>
                          <CriterioHeader>
                            <CriterioNombre>{criterio.nombre}</CriterioNombre>
                          </CriterioHeader>
                          <CriterioHint>
                            {criterio.esExcluyente ? "Criterio excluyente" : ""}
                            {!criterio.esPuntuable ? "No puntuable" : ""}
                          </CriterioHint>
                          {criterio.descripcion && (
                            <CriterioDescripcion>
                              {criterio.descripcion}
                            </CriterioDescripcion>
                          )}
                          <CriterioInput>
                            {(() => {
                              switch (criterio.tipo) {
                                case "Descriptivo":
                                  return (
                                    <>
                                      <FormLabel>Respuesta *</FormLabel>
                                      <FormTextarea
                                        value={respuesta.valorTexto}
                                        onChange={(e) =>
                                          handleTextoRespuestaChange(
                                            criterio.id,
                                            e.target.value
                                          )
                                        }
                                        placeholder="Describa su aporte para este criterio"
                                      />
                                    </>
                                  );
                                case "Numerico":
                                  return (
                                    <>
                                      <FormLabel>Valor numérico *</FormLabel>
                                      <FormInput
                                        type="number"
                                        value={respuesta.valorNumerico}
                                        onChange={(e) =>
                                          handleNumericoRespuestaChange(
                                            criterio.id,
                                            e.target.value
                                          )
                                        }
                                        step="0.01"
                                      />
                                      {rangoTexto && (
                                        <FormHint>{rangoTexto}</FormHint>
                                      )}
                                      {criterio.mayorMejor !== null && (
                                        <FormHint>
                                          {criterio.mayorMejor
                                            ? "Valores mayores obtienen mejor puntuación."
                                            : "Valores menores obtienen mejor puntuación."}
                                        </FormHint>
                                      )}
                                    </>
                                  );
                                case "Booleano":
                                  return (
                                    <>
                                      <FormLabel>
                                        Selecciona una opción *
                                      </FormLabel>
                                      <BooleanChoiceRow>
                                        <BooleanChoiceLabel>
                                          <BooleanChoiceInput
                                            type="radio"
                                            name={`criterio_booleano_${criterio.id}`}
                                            checked={
                                              respuesta.valorBooleano === true
                                            }
                                            onChange={() =>
                                              handleBooleanRespuestaChange(
                                                criterio.id,
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
                                              respuesta.valorBooleano === false
                                            }
                                            onChange={() =>
                                              handleBooleanRespuestaChange(
                                                criterio.id,
                                                false
                                              )
                                            }
                                          />
                                          No / Falso
                                        </BooleanChoiceLabel>
                                      </BooleanChoiceRow>
                                      {typeof criterio.valorRequeridoBooleano ===
                                        "boolean" && (
                                        <FormHint>
                                          {`Esta licitación espera una respuesta ${
                                            criterio.valorRequeridoBooleano
                                              ? "afirmativa"
                                              : "negativa"
                                          }.`}
                                        </FormHint>
                                      )}
                                    </>
                                  );
                                case "Escala":
                                  return (
                                    <>
                                      <FormLabel>
                                        Selecciona un valor *
                                      </FormLabel>
                                      {criterio.opciones.length > 0 ? (
                                        <CriterioSelect
                                          value={respuesta.opcionSeleccionadaId}
                                          onChange={(e) =>
                                            handleEscalaRespuestaChange(
                                              criterio.id,
                                              e.target.value
                                            )
                                          }
                                        >
                                          <option value="">
                                            Seleccionar opción
                                          </option>
                                          {criterio.opciones.map((opcion) => (
                                            <option
                                              key={opcion.id}
                                              value={opcion.id}
                                            >
                                              {opcion.valor}
                                            </option>
                                          ))}
                                        </CriterioSelect>
                                      ) : (
                                        <NoOptionsText>
                                          Esta escala aún no tiene opciones
                                          configuradas.
                                        </NoOptionsText>
                                      )}
                                    </>
                                  );
                                default:
                                  return (
                                    <>
                                      <FormLabel>Valor ofrecido *</FormLabel>
                                      <FormInput
                                        type="text"
                                        value={respuesta.valorTexto}
                                        onChange={(e) =>
                                          handleTextoRespuestaChange(
                                            criterio.id,
                                            e.target.value
                                          )
                                        }
                                        placeholder="Ingrese su valor para este criterio"
                                      />
                                    </>
                                  );
                              }
                            })()}
                          </CriterioInput>
                        </CriterioCard>
                      );
                    })}
                  </FormGroup>
                )
              )}

              {/* Archivo Adjunto */}
              <FormGroup>
                <FormLabel>Archivo adjunto</FormLabel>
                <FormHint style={{ marginBottom: "15px" }}>
                  Puede adjuntar documentos adicionales que respalden su
                  propuesta.
                </FormHint>

                <FileUploadContainer>
                  <FileDropZone
                    isDragOver={isDragOver}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
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
                  hasIncompleteCriterios ||
                  (selectedFile && !!uploadError)
                }
              >
                {postulando ? "Enviando..." : "Enviar propuesta"}
              </PropuestaSubmitButton>
            </PropuestaModalActions>
          </PropuestaModalContent>
        </PropuestaModal>
      )}

      {/* Modal de confirmación para enviar propuesta */}
      <DialogModal
        isOpen={showConfirmSubmit && !!selectedLicitacion}
        title="⚠️ Confirmar envío de propuesta"
        variant="green"
        description={
          <>
            ¿Está seguro que desea enviar su propuesta para la licitación "
            {selectedLicitacion?.titulo || selectedLicitacion?.Titulo}" ?
            <br />
            Una vez enviada, no podrá modificar ni eliminar su propuesta.
          </>
        }
        confirmText={postulando ? "Enviando..." : "Confirmar y enviar"}
        confirmDisabled={postulando}
        cancelText="Cancelar"
        onConfirm={confirmSubmit}
        onCancel={cancelSubmit}
      />

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
