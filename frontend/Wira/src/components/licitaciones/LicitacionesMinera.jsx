import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DialogModal from "../shared/DialogModal";
import Navbar from "../shared/Navbar";
import CalificacionProveedorModal from "../calificaciones/CalificacionProveedorModal";
import { registrarCalificacionPostLicitacion } from "../../services/calificacionesService";
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

const LicitacionStatusContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
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

const PropuestasCountBadge = styled.span`
  background: #e3f2fd;
  color: #1976d2;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const PropuestasCountIcon = styled.span`
  font-size: 0.8rem;
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
  ${buttonBaseStyles};
  padding: 12px 24px;
  font-size: 1rem;
  border-radius: 10px;
  background: #fc6b0a;
  color: white;

  &:hover:not(:disabled) {
    background: #e55a09;
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
  ${buttonBaseStyles};
  padding: 12px 24px;
  font-size: 1rem;
  background: #dc3545;
  color: white;

  &:hover:not(:disabled) {
    background: #c82333;
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
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #ff9206;
`;

const DateIcon = styled.div`
  font-size: 1.5rem;
  margin-bottom: 8px;
`;

const DateLabel = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 5px;
  font-weight: 500;
`;

const DateValue = styled.div`
  font-size: 1rem;
  color: #333;
  font-weight: 600;
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

const ProjectCard = styled.div`
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #2eaa4a;
`;

const ProjectLabel = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 5px;
  font-weight: 500;
`;

const ProjectValue = styled.div`
  font-size: 1rem;
  color: #333;
  font-weight: 600;
`;

const ProjectLocation = styled.div`
  font-size: 0.8rem;
  color: #2eaa4a;
  margin-top: 2px;
  font-style: italic;
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
  margin-top: 20px;
`;

const PropuestasTitle = styled.h4`
  color: #333;
  font-size: 1.1rem;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const PropuestasSubtitle = styled.h5`
  color: #475569;
  font-size: 1rem;
  margin: 25px 0 12px;
`;

const ScoreInfoWrapper = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
`;

const ScoreInfoButton = styled.button`
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

  &:hover {
    background: #cbd5f5;
    transform: translateY(-1px);
  }

  &:focus {
    outline: 2px solid #2563eb;
    outline-offset: 2px;
  }
`;

const ScoreInfoOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 3000;
`;

const ScoreInfoPopup = styled.div`
  width: 420px;
  max-width: 80vw;
  background: #ffffff;
  border-radius: 12px;
  padding: 18px 20px 20px;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.2);
  border: 1px solid #e2e8f0;
`;

const ScoreInfoPopupTitle = styled.h5`
  margin: 0 0 10px;
  font-size: 1rem;
  color: #0f172a;
`;

const ScoreInfoPopupText = styled.p`
  margin: 0 0 10px;
  font-size: 0.9rem;
  color: #475569;
  line-height: 1.4;
`;

const ScoreInfoList = styled.ul`
  margin: 0 0 12px 18px;
  padding: 0;
  color: #1e293b;
  font-size: 0.9rem;
  line-height: 1.4;
`;

const ScoreInfoListItem = styled.li`
  margin-bottom: 6px;

  strong {
    color: #0f172a;
  }
`;

const ScoreInfoCloseButton = styled.button`
  margin-top: 4px;
  border: none;
  background: #0f172a;
  color: white;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 0.85rem;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s ease;

  &:hover {
    background: #1f2937;
  }
`;

const PropuestasHint = styled.p`
  margin: -10px 0 15px;
  color: #64748b;
  font-size: 0.9rem;
`;

const PropuestasList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const PropuestaCard = styled.div`
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }

  &:hover .seleccionar-ganadora-btn {
    opacity: 1;
    pointer-events: auto;
  }
`;

const PropuestaHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const PropuestaHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const PropuestaRankingBadge = styled.div`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 60px;
  justify-content: center;
  border: 1px solid;

  ${(props) => {
    if (props.variant === "invalid") {
      return `
        background: #fdecea;
        color: #b71c1c;
        border-color: #f5c2c7;
      `;
    }

    const position = props.position;
    if (position === 1) {
      return `
        background: linear-gradient(135deg, #ffd700 0%, #ffed4a 100%);
        color: #b7791f;
        border-color: #f6d55c;
      `;
    } else if (position === 2) {
      return `
        background: linear-gradient(135deg, #e5e5e5 0%, #f0f0f0 100%);
        color: #666;
        border-color: #d0d0d0;
      `;
    } else if (position === 3) {
      return `
        background: linear-gradient(135deg, #cd7f32 0%, #d4940a 100%);
        color: #fff;
        border-color: #b8860b;
      `;
    } else {
      return `
        background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
        color: #1976d2;
        border-color: #90caf9;
      `;
    }
  }}
`;

const PropuestaScore = styled.div`
  background: #e8f5e8;
  color: #2e7d32;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const PropuestaProveedor = styled.h5`
  color: #333;
  font-size: 1rem;
  margin: 0;
`;

const PropuestaEstado = styled.span`
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

const PropuestaInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
  font-size: 0.9rem;
  color: #666;
`;

const PropuestaAlert = styled.div`
  margin-bottom: 12px;
  padding: 12px;
  border-radius: 8px;
  background: #fef2f2;
  color: #b91c1c;
  font-size: 0.85rem;
  line-height: 1.4;
  border: 1px solid;
  border-color: #f5c2c7;
`;

const PropuestaAlertTitle = styled.span`
  font-weight: 700;
`;

const PropuestaAlertList = styled.ul`
  margin: 8px 0 0;
  padding-left: 18px;
`;

const PropuestaScoreSummary = styled.div`
  margin-bottom: 16px;
  padding: 12px 14px;
  border-radius: 8px;
  background: #e8f5e9;
  color: #1b5e20;
  font-weight: 600;
  font-size: 0.95rem;
`;

const SeleccionarGanadoraButton = styled.button`
  ${buttonBaseStyles};
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 8px 12px;
  font-size: 0.85rem;
  background: #28a745;
  color: white;
  border-radius: 8px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease, visibility 0.3s ease;
  z-index: 10;

  &:hover:not(:disabled) {
    background: #218838;
  }

  &:disabled {
    background: #cbd5f5;
    cursor: not-allowed;
    opacity: 0;
    pointer-events: none;
  }
`;

const PropuestaInfoItem = styled.div`
  display: flex;
  flex-direction: column;
`;

const PropuestaInfoLabel = styled.span`
  font-size: 0.8rem;
  color: #999;
  margin-bottom: 2px;
`;

const PropuestaInfoValue = styled.span`
  color: #333;
  font-weight: 500;
`;

const EmptyPropuestas = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #666;
`;

const EmptyPropuestasIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 10px;
`;

const EmptyPropuestasText = styled.p`
  margin: 0;
  font-size: 1rem;
`;

const LoadingPropuestas = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #666;
`;

const LoadingPropuestasSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid #e1e5e9;
  border-left: 2px solid #fc6b0a;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 10px;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
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
  ${buttonBaseStyles};
  padding: 10px 20px;
  font-size: 0.9rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const EditButton = styled(ActionButton)`
  background: #2563eb;
  color: white;

  &:hover:not(:disabled) {
    background: #1d4ed8;
  }
`;

const CloseLicitacionButton = styled(ActionButton)`
  background: #ffc107;
  color: #1f2937;

  &:hover:not(:disabled) {
    background: #e0a800;
  }
`;

const AdjudicarButton = styled(ActionButton)`
  background: #28a745;
  color: white;

  &:hover:not(:disabled) {
    background: #218838;
  }
`;

const DeleteButton = styled(ActionButton)`
  background: #dc3545;
  color: white;

  &:hover:not(:disabled) {
    background: #c82333;
  }
`;

// Styled components para el modal de propuesta
const PropuestaModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1200;
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
  margin: 0 40px 10px 0;
  line-height: 1.3;
`;

const PropuestaModalSubtitle = styled.div`
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  margin-top: 8px;
  font-weight: 400;
`;

const PropuestaModalBody = styled.div`
  padding: 30px;
`;

const PropuestaDetailSection = styled.div`
  margin-bottom: 30px;
`;

const PropuestaDetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
`;

const PropuestaInfoCard = styled.div`
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #28a745;
`;

const PropuestaDetailInfoLabel = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 5px;
  font-weight: 500;
`;

const PropuestaDetailInfoValue = styled.div`
  font-size: 1rem;
  color: #333;
  font-weight: 600;
`;

const PropuestaStatusCard = styled.div`
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #28a745;
`;

const PropuestaStatusIcon = styled.div`
  font-size: 1.5rem;
  margin-bottom: 8px;
`;

const PropuestaStatusLabel = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 5px;
  font-weight: 500;
`;

const PropuestaStatusValue = styled.div`
  font-size: 1rem;
  color: #333;
  font-weight: 600;
`;

const PropuestaDescription = styled.div`
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  line-height: 1.6;
  color: #555;
`;

const PropuestaArchivos = styled.div`
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
`;

const ArchivoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: white;
  border-radius: 6px;
  margin-bottom: 10px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const ArchivoIcon = styled.span`
  font-size: 1.2rem;
`;

const ArchivoName = styled.span`
  flex: 1;
  color: #333;
  cursor: pointer;
  text-decoration: underline;

  &:hover {
    color: #fc6b0a;
  }
`;

// Styled components para criterios de evaluación en propuestas
const PropuestaCriteriosSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 15px;
  margin-top: 15px;
`;

const PropuestaCriterioItem = styled.div`
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #8b8b8b;
`;

const PropuestaCriterioName = styled.div`
  font-weight: 600;
  color: #333;
  font-size: 1rem;
  margin-bottom: 8px;
`;

const PropuestaCriterioDescription = styled.div`
  color: #666;
  font-size: 0.85rem;
  margin-bottom: 10px;
  line-height: 1.3;
`;

const PropuestaCriterioValue = styled.div`
  background: white;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #e1e5e9;
  font-size: 0.9rem;
  color: #333;
  font-weight: 500;
`;

const PropuestaActions = styled.div`
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  padding: 20px 30px;
  background: #f8f9fa;
  border-top: 1px solid #e1e5e9;
`;

const PropuestaActionButton = styled.button`
  ${buttonBaseStyles};
  padding: 10px 20px;
  font-size: 0.9rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const PropuestaCloseButton = styled(PropuestaActionButton)`
  background: #6c757d;
  color: white;

  &:hover:not(:disabled) {
    background: #5a6268;
  }
`;

// Componentes para modal de selección de ganador
const GanadorModal = styled.div`
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

const GanadorModalContent = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const GanadorModalHeader = styled.div`
  background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%);
  color: white;
  padding: 25px;
  border-radius: 12px 12px 0 0;
  position: relative;
`;

const GanadorModalTitle = styled.h2`
  color: white;
  font-size: 1.5rem;
  margin: 0 40px 0 0;
  line-height: 1.3;
`;

const GanadorModalBody = styled.div`
  padding: 30px;
`;

const GanadorInstruccion = styled.p`
  color: #666;
  font-size: 1rem;
  margin-bottom: 20px;
  line-height: 1.5;
`;

const GanadorPropuestasList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
`;

const GanadorPropuestaItem = styled.div`
  border: 2px solid ${(props) => (props.selected ? "#28a745" : "#e1e5e9")};
  border-radius: 8px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${(props) => (props.selected ? "#f8fff8" : "white")};

  &:hover {
    border-color: #28a745;
    background: #f8fff8;
  }

  &[data-disabled="true"] {
    opacity: 0.55;
    cursor: not-allowed;
  }

  &[data-disabled="true"]:hover {
    border-color: #e1e5e9;
    background: white;
  }
`;

const GanadorPropuestaHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const GanadorProveedorNombre = styled.div`
  font-weight: 600;
  color: #333;
  font-size: 1rem;
`;

const GanadorPropuestaRanking = styled.div`
  background: ${(props) =>
    props.position === 1
      ? "#ffd700"
      : props.position === 2
      ? "#c0c0c0"
      : props.position === 3
      ? "#cd7f32"
      : "#f8f9fa"};
  color: ${(props) => (props.position <= 3 ? "#333" : "#666")};
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
`;

const GanadorPropuestaInfo = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  font-size: 0.9rem;
  color: #666;
`;

const GanadorModalActions = styled.div`
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  padding: 20px 30px;
  background: #f8f9fa;
  border-top: 1px solid #e1e5e9;
`;

const GanadorConfirmButton = styled.button`
  ${buttonBaseStyles};
  padding: 12px 24px;
  font-size: 1rem;
  background: #28a745;
  color: white;

  &:hover:not(:disabled) {
    background: #218838;
  }
`;

const GanadorCancelButton = styled.button`
  ${buttonBaseStyles};
  padding: 12px 24px;
  font-size: 1rem;
  background: #6c757d;
  color: white;

  &:hover:not(:disabled) {
    background: #5a6268;
  }
`;

const LicitacionesMinera = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  // Estados consolidados
  const [licitaciones, setLicitaciones] = useState([]);
  const [originalLicitaciones, setOriginalLicitaciones] = useState([]);
  const [propuestas, setPropuestas] = useState([]);
  const [rubros, setRubros] = useState([]);
  const [propuestasCount, setPropuestasCount] = useState({});
  const [propuestasProveedor, setPropuestasProveedor] = useState([]);

  // Estados de UI
  const [loading, setLoading] = useState(true);
  const [loadingPropuestas, setLoadingPropuestas] = useState(false);
  const [error, setError] = useState("");

  // Estados de modales
  const [selectedLicitacion, setSelectedLicitacion] = useState(null);
  const [selectedPropuesta, setSelectedPropuesta] = useState(null);
  const [selectedGanador, setSelectedGanador] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [showPropuestaModal, setShowPropuestaModal] = useState(false);
  const [showGanadorModal, setShowGanadorModal] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [showConfirmAdjudicar, setShowConfirmAdjudicar] = useState(false);
  const [showConfirmSeleccionarGanadora, setShowConfirmSeleccionarGanadora] =
    useState(false);
  const [showScoreInfo, setShowScoreInfo] = useState(false);
  const [showCalificacionModal, setShowCalificacionModal] = useState(false);
  const [calificacionTarget, setCalificacionTarget] = useState(null);
  const [submittingCalificacion, setSubmittingCalificacion] = useState(false);

  // Estados de acciones pendientes
  const [deletingLicitacion, setDeletingLicitacion] = useState(null);
  const [closingLicitacion, setClosingLicitacion] = useState(null);
  const [adjudicandoLicitacion, setAdjudicandoLicitacion] = useState(null);
  const [seleccionandoGanador, setSeleccionandoGanador] = useState(null);
  const [propuestaGanadora, setPropuestaGanadora] = useState(null);
  const [finalizandoLicitacion, setFinalizandoLicitacion] = useState(null);

  // Estados para filtros y ordenamiento
  const [filters, setFilters] = useState({
    titulo: "",
    estado: "",
    fechaDesde: "",
    fechaHasta: "",
    rubro: "",
  });
  const [sortBy, setSortBy] = useState("fechaCreacion");
  const [sortOrder, setSortOrder] = useState("desc");

  // Constantes
  const estados = [
    "Borrador",
    "Publicada",
    "En Evaluación",
    "Adjudicada",
    "Cancelada",
    "Cerrada",
  ];

  const selectedEstado =
    selectedLicitacion?.estadoNombre || selectedLicitacion?.EstadoNombre || "";
  const isSelectedEstadoAdjudicado =
    selectedEstado === "Adjudicada" || selectedEstado === "Cerrada";
  const canViewSelectedPropuestas =
    Boolean(selectedEstado) && selectedEstado !== "Publicada";
  const shouldShowScoreInfoIcon =
    selectedEstado === "En Evaluación" &&
    canViewSelectedPropuestas &&
    propuestas.length > 0;

  const handleToggleScoreInfo = (event) => {
    event.stopPropagation();
    setShowScoreInfo((prev) => !prev);
  };

  useEffect(() => {
    if (!shouldShowScoreInfoIcon && showScoreInfo) {
      setShowScoreInfo(false);
    }
  }, [shouldShowScoreInfoIcon, showScoreInfo]);

  useEffect(() => {
    if (!showModal) {
      setShowScoreInfo(false);
    }
  }, [showModal]);

  // Utilidades consolidadas
  const getUserMineraID = () =>
    user?.MineraID ||
    user?.Minera?.MineraID ||
    user?.minera?.mineraID ||
    user?.minera?.MineraID;

  const getCompanyName = () =>
    user?.Minera?.Nombre ||
    user?.minera?.nombre ||
    user?.minera?.Nombre ||
    "Empresa Minera";

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

  const getPropuestaCurrency = (propuesta) => ({
    codigo: propuesta?.monedaCodigo || propuesta?.MonedaCodigo,
    simbolo: propuesta?.monedaSimbolo || propuesta?.MonedaSimbolo,
    nombre: propuesta?.monedaNombre || propuesta?.MonedaNombre,
  });

  const formatCriterioValor = (respuesta) => {
    const rawValor =
      respuesta?.valorProveedor ??
      respuesta?.ValorProveedor ??
      respuesta?.valorBooleano ??
      respuesta?.ValorBooleano ??
      respuesta?.valorNumerico ??
      respuesta?.ValorNumerico ??
      respuesta?.valorTexto ??
      respuesta?.ValorTexto ??
      null;

    if (rawValor === null || rawValor === undefined || rawValor === "") {
      return "No especificado";
    }

    if (typeof rawValor === "boolean") {
      return rawValor ? "Sí" : "No";
    }

    if (
      typeof rawValor === "string" &&
      ["true", "false"].includes(rawValor.trim().toLowerCase())
    ) {
      return rawValor.trim().toLowerCase() === "true" ? "Sí" : "No";
    }

    return rawValor;
  };

  // Funciones de API consolidadas
  const apiRequest = async (url, options = {}) => {
    const API_BASE = (
      import.meta.env.VITE_API_URL || "http://localhost:5242/api"
    ).replace(/\/$/, "");

    // Normalize URL: replace hardcoded localhost base or prefix /api paths
    let finalUrl = url;
    try {
      if (typeof url === "string") {
        if (url.includes("localhost:5242")) {
          finalUrl = url.replace(/https?:\/\/localhost:5242\/api/, API_BASE);
        } else if (url.startsWith("/api")) {
          finalUrl = `${API_BASE}${url}`;
        }
      }
    } catch {
      finalUrl = url;
    }

    const defaultHeaders = { "Content-Type": "application/json" };
    if (token) defaultHeaders.Authorization = `Bearer ${token}`;

    return fetch(finalUrl, {
      headers: { ...defaultHeaders, ...options.headers },
      ...options,
    });
  };

  const handleDownloadArchivo = async (archivoID, nombreArchivo) => {
    try {
      const resp = await apiService.downloadArchivo(archivoID);
      const blob = resp.data;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = nombreArchivo;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al descargar archivo:", error);
      toast.error("Error al descargar el archivo");
    }
  };

  const fetchRubros = async () => {
    try {
      const response = await apiService.getRubros();
      const data = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.value)
        ? response.data.value
        : [];
      setRubros(data);
    } catch (error) {
      console.error("Error al cargar rubros:", error);
    }
  };

  const fetchPropuestasProveedor = async () => {
    try {
      const proveedorId = user?.proveedor?.proveedorID;
      if (!proveedorId) return;

      const response = await apiRequest(
        `http://localhost:5242/api/propuestas/proveedor/${proveedorId}`
      );

      if (response.ok) {
        const data = await response.json();
        setPropuestasProveedor(data);
      }
    } catch (error) {
      console.error("Error al cargar propuestas del proveedor:", error);
    }
  };

  const getLicitacionesStats = () => {
    const totalActivas = filteredLicitaciones.length;

    // Obtener IDs de licitaciones a las que ya se postuló
    const licitacionesPostuladas = propuestasProveedor.map(
      (propuesta) => propuesta.licitacionID || propuesta.LicitacionID
    );

    // Contar postuladas
    const postuladas = filteredLicitaciones.filter((licitacion) => {
      const licitacionId = licitacion.licitacionID || licitacion.LicitacionID;
      return licitacionesPostuladas.includes(licitacionId);
    }).length;

    // Contar disponibles (activas menos postuladas)
    const disponibles = totalActivas - postuladas;

    return {
      total: totalActivas,
      postuladas,
      disponibles,
    };
  };

  const fetchPropuestasCount = async (licitacionesList) => {
    try {
      const countPromises = licitacionesList.map(async (licitacion) => {
        const licitacionId = licitacion.licitacionID || licitacion.LicitacionID;
        try {
          const response = await apiRequest(
            `http://localhost:5242/api/propuestas/licitacion/${licitacionId}`
          );
          if (response.ok) {
            const propuestas = await response.json();
            return { licitacionId, count: propuestas.length };
          }
          return { licitacionId, count: 0 };
        } catch (error) {
          console.error("Error fetching propuestas count:", error);
          return { licitacionId, count: 0 };
        }
      });

      const countResults = await Promise.all(countPromises);
      const countMap = {};
      countResults.forEach(({ licitacionId, count }) => {
        countMap[licitacionId] = count;
      });
      setPropuestasCount(countMap);
    } catch (error) {
      console.error("Error al contar propuestas:", error);
    }
  };

  const applyFiltersAndSorting = (data) => {
    let filtered = [...data];

    // Aplicar filtros
    if (filters.titulo) {
      filtered = filtered.filter((l) =>
        (l.titulo || l.Titulo || "")
          .toLowerCase()
          .includes(filters.titulo.toLowerCase())
      );
    }
    if (filters.estado) {
      filtered = filtered.filter(
        (l) => (l.estadoNombre || l.EstadoNombre) === filters.estado
      );
    }
    if (filters.fechaDesde) {
      filtered = filtered.filter(
        (l) =>
          new Date(l.fechaInicio || l.FechaInicio) >=
          new Date(filters.fechaDesde)
      );
    }
    if (filters.fechaHasta) {
      filtered = filtered.filter(
        (l) =>
          new Date(l.fechaCierre || l.FechaCierre) <=
          new Date(filters.fechaHasta)
      );
    }
    if (filters.rubro) {
      filtered = filtered.filter(
        (l) => (l.rubroNombre || l.RubroNombre) === filters.rubro
      );
    }

    // Aplicar ordenamiento
    filtered.sort((a, b) => {
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
        default:
          valueA = new Date(a.fechaCreacion || a.FechaCreacion);
          valueB = new Date(b.fechaCreacion || b.FechaCreacion);
      }
      if (valueA < valueB) return sortOrder === "asc" ? -1 : 1;
      if (valueA > valueB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  };

  const fetchLicitaciones = async () => {
    try {
      setLoading(true);
      setError("");

      const mineraID = getUserMineraID();
      const response = await apiRequest(
        "http://localhost:5242/api/licitaciones"
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      let licitacionesMinera = [];

      if (mineraID) {
        licitacionesMinera = data.filter((licitacion) => {
          const licitacionMineraID = licitacion.mineraID || licitacion.MineraID;
          return (
            licitacionMineraID === mineraID ||
            parseInt(licitacionMineraID) === parseInt(mineraID) ||
            String(licitacionMineraID) === String(mineraID)
          );
        });
      }

      // Guardar datos originales sin filtros
      setOriginalLicitaciones(licitacionesMinera);
      setLicitaciones(licitacionesMinera);
      await fetchPropuestasCount(licitacionesMinera);
      return licitacionesMinera;
    } catch (error) {
      console.error("Error fetching licitaciones:", error);
      setError(
        "Error al cargar las licitaciones. Por favor, intente nuevamente."
      );
      toast.error("Error al cargar las licitaciones");
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchArchivosLicitacion = async (licitacionId) => {
    try {
      const response = await apiRequest(
        `http://localhost:5242/api/archivos/entidad/LICITACION/${licitacionId}`
      );

      if (response.ok) {
        const archivos = await response.json();
        setSelectedLicitacion((prev) => {
          if (prev) {
            const archivoAdjunto = archivos.length > 0 ? archivos[0] : null;
            return {
              ...prev,
              archivosAdjuntos: archivos,
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
      }
    } catch (error) {
      console.error("Error al cargar archivos de licitación:", error);
    }
  };

  const getScoreFromPropuesta = (propuesta) => {
    const rawScore =
      propuesta?.scoreCalculado ??
      propuesta?.ScoreCalculado ??
      propuesta?.scoreTotal ??
      propuesta?.ScoreTotal;

    const numericScore = Number(rawScore);
    return Number.isFinite(numericScore) ? numericScore : null;
  };

  const isPropuestaDescalificada = (propuesta) =>
    Boolean(
      propuesta?.descalificadaPorExcluyentes ??
        propuesta?.DescalificadaPorExcluyentes
    );

  const getCriteriosExcluyentesFallidos = (propuesta) => {
    const rawList =
      propuesta?.criteriosExcluyentesFallidos ??
      propuesta?.CriteriosExcluyentesFallidos;
    return Array.isArray(rawList) ? rawList : [];
  };

  const ordenarPropuestasPorPuntaje = (lista) => {
    if (!Array.isArray(lista)) return [];
    const copia = [...lista];

    copia.sort((a, b) => {
      const aDescalificada = isPropuestaDescalificada(a);
      const bDescalificada = isPropuestaDescalificada(b);
      if (aDescalificada !== bDescalificada) {
        return aDescalificada ? 1 : -1;
      }

      const aScore = getScoreFromPropuesta(a);
      const bScore = getScoreFromPropuesta(b);
      const aTieneScore = aScore !== null;
      const bTieneScore = bScore !== null;

      if (aTieneScore && bTieneScore) {
        return bScore - aScore;
      }
      if (aTieneScore) return -1;
      if (bTieneScore) return 1;
      return 0;
    });

    return copia;
  };

  const priorizarPropuestaGanadora = (lista, propuestaGanadora) => {
    if (!Array.isArray(lista) || !propuestaGanadora) {
      return Array.isArray(lista) ? lista : [];
    }

    const ganadoraId =
      propuestaGanadora.propuestaID || propuestaGanadora.PropuestaID;
    if (!ganadoraId) return lista;

    const propuestaEnLista = lista.find(
      (propuesta) =>
        (propuesta.propuestaID || propuesta.PropuestaID) === ganadoraId
    );

    const listaSinGanadora = lista.filter(
      (propuesta) =>
        (propuesta.propuestaID || propuesta.PropuestaID) !== ganadoraId
    );

    const propuestaFusionada = propuestaEnLista
      ? {
          ...propuestaEnLista,
          HistorialGanador:
            propuestaGanadora.HistorialGanador ||
            propuestaEnLista.HistorialGanador,
        }
      : { ...propuestaGanadora };

    return [propuestaFusionada, ...listaSinGanadora];
  };

  const obtenerPropuestaGanadoraActual = () => {
    if (!Array.isArray(propuestas) || propuestas.length === 0) {
      return null;
    }

    const propuestaMarcada = propuestas.find((propuesta) => {
      const historial =
        propuesta.HistorialGanador || propuesta.historialGanador || {};
      if (typeof historial.Ganador === "boolean") {
        return historial.Ganador;
      }
      if (typeof historial.ganador === "boolean") {
        return historial.ganador;
      }
      return false;
    });

    return propuestaMarcada || propuestas[0];
  };

  const renderPropuestasContenido = (
    lista,
    { resaltarGanadora = false, rankingOffset = 0 } = {}
  ) => {
    if (!Array.isArray(lista) || lista.length === 0) {
      return null;
    }

    let rankingCounter = rankingOffset;
    const mostrarRanking = !resaltarGanadora;

    return (
      <PropuestasList>
        {lista.map((propuesta, index) => {
          const proveedorNombre =
            propuesta.proveedorNombre ||
            propuesta.ProveedorNombre ||
            "Proveedor desconocido";
          const presupuesto =
            propuesta.presupuestoOfrecido || propuesta.PresupuestoOfrecido;
          const propuestaCurrency = getPropuestaCurrency(propuesta);
          const fechaEnvio = propuesta.fechaEnvio || propuesta.FechaEnvio;
          const estado = propuesta.estado || propuesta.Estado || "Enviada";
          const score = getScoreFromPropuesta(propuesta);
          const descalificada = isPropuestaDescalificada(propuesta);
          const criteriosFallidos = getCriteriosExcluyentesFallidos(propuesta);
          let rankingPosition = null;
          if (mostrarRanking && !descalificada && score !== null) {
            rankingPosition = ++rankingCounter;
          }
          const rankingBadgeVariant = descalificada ? "invalid" : undefined;
          const rankingBadgeLabel = descalificada
            ? "Fuera de evaluación"
            : rankingPosition
            ? `#${rankingPosition}`
            : "Sin puntaje";
          const esGanadora = resaltarGanadora;

          return (
            <PropuestaCard
              key={propuesta.propuestaID || propuesta.PropuestaID}
              onClick={() => handlePropuestaClick(propuesta)}
              style={
                esGanadora
                  ? {
                      background:
                        "linear-gradient(135deg, #f8fff8 0%, #e8f5e8 100%)",
                      border: "2px solid #28a745",
                      boxShadow: "0 4px 15px rgba(40, 167, 69, 0.2)",
                    }
                  : {}
              }
            >
              {selectedEstado === "En Evaluación" && (
                <SeleccionarGanadoraButton
                  className="seleccionar-ganadora-btn"
                  disabled={descalificada}
                  title={
                    descalificada
                      ? "No disponible: incumple criterios excluyentes"
                      : undefined
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSeleccionarPropuestaGanadora(propuesta);
                  }}
                >
                  🏆 Seleccionar como adjudicada
                </SeleccionarGanadoraButton>
              )}

              <PropuestaHeader>
                <PropuestaHeaderLeft>
                  {esGanadora ? (
                    <PropuestaRankingBadge
                      position={1}
                      style={{
                        background:
                          "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
                        color: "white",
                        borderColor: "#28a745",
                      }}
                    >
                      👑 Adjudicada
                    </PropuestaRankingBadge>
                  ) : (
                    <PropuestaRankingBadge
                      position={rankingPosition || undefined}
                      variant={rankingBadgeVariant}
                    >
                      {rankingBadgeLabel}
                    </PropuestaRankingBadge>
                  )}
                  {!descalificada && score !== null && (
                    <PropuestaScore>⭐ {score.toFixed(1)}</PropuestaScore>
                  )}
                  <PropuestaProveedor>{proveedorNombre}</PropuestaProveedor>
                </PropuestaHeaderLeft>
                <PropuestaEstado status={esGanadora ? "Adjudicada" : estado}>
                  {esGanadora ? "Adjudicada" : estado}
                </PropuestaEstado>
              </PropuestaHeader>

              <PropuestaInfo>
                <PropuestaInfoItem>
                  <PropuestaInfoLabel>Presupuesto</PropuestaInfoLabel>
                  <PropuestaInfoValue>
                    {formatCurrency(presupuesto, propuestaCurrency)}
                  </PropuestaInfoValue>
                </PropuestaInfoItem>
                <PropuestaInfoItem>
                  <PropuestaInfoLabel>Fecha de envío</PropuestaInfoLabel>
                  <PropuestaInfoValue>
                    {formatDate(fechaEnvio)}
                  </PropuestaInfoValue>
                </PropuestaInfoItem>
                {esGanadora && propuesta.HistorialGanador && (
                  <PropuestaInfoItem>
                    <PropuestaInfoLabel>
                      Fecha de adjudicación
                    </PropuestaInfoLabel>
                    <PropuestaInfoValue>
                      {formatDate(
                        propuesta.HistorialGanador.FechaParticipacion
                      )}
                    </PropuestaInfoValue>
                  </PropuestaInfoItem>
                )}
              </PropuestaInfo>

              {descalificada && (
                <PropuestaAlert>
                  <PropuestaAlertTitle>
                    Fuera de evaluación por criterio excluyente.
                  </PropuestaAlertTitle>
                  {criteriosFallidos.length > 0 && (
                    <PropuestaAlertList>
                      {criteriosFallidos.map((criterio) => (
                        <li key={`${criterio}-${index}`}>{criterio}</li>
                      ))}
                    </PropuestaAlertList>
                  )}
                </PropuestaAlert>
              )}
            </PropuestaCard>
          );
        })}
      </PropuestasList>
    );
  };

  // const fetchPropuestaGanadora = async (licitacionId) => {
  //   try {
  //     const response = await apiRequest(
  //       `http://localhost:5242/api/historial-proveedor-licitacion/licitacion/${licitacionId}/propuesta-ganadora`
  //     );

  //     if (response.ok) {
  //       const propuestaGanadora = await response.json();
  //       return [propuestaGanadora];
  //     } else if (response.status === 404) {
  //       console.warn("No se encontró ganador para esta licitación");
  //       return [];
  //     } else {
  //       console.error(
  //         "Error al cargar propuesta ganadora:",
  //         response.statusText
  //       );
  //       return [];
  //     }
  //   } catch (error) {
  //     console.error("Error al cargar propuesta ganadora:", error);
  //     return [];
  //   }
  // };

  const fetchPropuestas = async (licitacionId) => {
    try {
      setLoadingPropuestas(true);
      const licitacionActual = licitaciones.find(
        (l) => (l.licitacionID || l.LicitacionID) === licitacionId
      );
      const estadoLicitacion =
        licitacionActual?.estadoNombre || licitacionActual?.EstadoNombre;

      if (estadoLicitacion === "Cerrada") {
        const propuestaGanadoraResponse = await apiRequest(
          `http://localhost:5242/api/historial-proveedor-licitacion/licitacion/${licitacionId}/propuesta-ganadora`
        );

        if (propuestaGanadoraResponse.ok) {
          const propuestaGanadora = await propuestaGanadoraResponse.json();
          setPropuestas([propuestaGanadora]);
        } else if (propuestaGanadoraResponse.status === 404) {
          setPropuestas([]);
        } else {
          console.error(
            "Error al cargar propuesta ganadora:",
            propuestaGanadoraResponse.statusText
          );
          setPropuestas([]);
        }
      } else if (estadoLicitacion === "Adjudicada") {
        const [propuestasResponse, propuestaGanadoraResponse] =
          await Promise.all([
            apiRequest(
              `http://localhost:5242/api/propuestas/licitacion/${licitacionId}`
            ),
            apiRequest(
              `http://localhost:5242/api/historial-proveedor-licitacion/licitacion/${licitacionId}/propuesta-ganadora`
            ),
          ]);

        if (propuestasResponse.ok) {
          const propuestasData = await propuestasResponse.json();
          let propuestasOrdenadas = ordenarPropuestasPorPuntaje(propuestasData);

          if (propuestaGanadoraResponse.ok) {
            const propuestaGanadora = await propuestaGanadoraResponse.json();
            propuestasOrdenadas = priorizarPropuestaGanadora(
              propuestasOrdenadas,
              propuestaGanadora
            );
          } else if (
            propuestaGanadoraResponse.status &&
            propuestaGanadoraResponse.status !== 404
          ) {
            console.error(
              "Error al cargar propuesta ganadora:",
              propuestaGanadoraResponse.statusText
            );
          }

          setPropuestas(propuestasOrdenadas);
        } else {
          console.error(
            "Error al cargar propuestas:",
            propuestasResponse.statusText
          );
          setPropuestas([]);
        }
      } else {
        // Para otros estados, cargar todas las propuestas
        const response = await apiRequest(
          `http://localhost:5242/api/propuestas/licitacion/${licitacionId}`
        );

        if (response.ok) {
          const data = await response.json();

          // Estados que muestran ranking completo
          const estadosConRanking = ["En Evaluación", "Adjudicada"];

          if (estadosConRanking.includes(estadoLicitacion)) {
            const propuestasOrdenadas = ordenarPropuestasPorPuntaje(data);
            setPropuestas(propuestasOrdenadas);
          } else {
            // Para otros estados (Publicada, etc.) mostrar propuestas sin ranking
            setPropuestas(data);
          }
        } else {
          console.error("Error al cargar propuestas:", response.statusText);
          setPropuestas([]);
        }
      }
    } catch (error) {
      console.error("Error al cargar propuestas:", error);
      setPropuestas([]);
    } finally {
      setLoadingPropuestas(false);
    }
  };

  // Handlers de filtros y ordenamiento
  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      titulo: "",
      estado: "",
      fechaDesde: "",
      fechaHasta: "",
      rubro: "",
    });
    setSortBy("fechaCreacion");
    setSortOrder("desc");
    // Restaurar datos originales
    setLicitaciones(originalLicitaciones);
  };

  const handleSortChange = (value) => {
    const [field, order] = value.split("-");
    setSortBy(field);
    setSortOrder(order);
  };

  // Handlers de navegación y modales
  const handleCrearLicitacion = () => navigate("/crear-licitacion");

  const handleEditarLicitacion = (licitacionId) =>
    navigate(`/editar-licitacion/${licitacionId}`);

  const handleLicitacionClick = (licitacionId) => {
    const licitacion = licitaciones.find(
      (l) => (l.licitacionID || l.LicitacionID) === licitacionId
    );
    if (licitacion) {
      setSelectedLicitacion(licitacion);
      setShowModal(true);
      fetchPropuestas(licitacionId);
      fetchArchivosLicitacion(licitacionId);
    }
  };

  const handlePropuestaClick = async (propuesta) => {
    try {
      const propuestaId = propuesta.propuestaID || propuesta.PropuestaID;
      const response = await apiRequest(
        `http://localhost:5242/api/propuestas/${propuestaId}`
      );

      if (response.ok) {
        const propuestaDetallada = await response.json();
        setSelectedPropuesta(propuestaDetallada);
        setShowPropuestaModal(true);
      } else {
        toast.error("Error al cargar los detalles de la propuesta");
      }
    } catch (error) {
      console.error("Error al cargar propuesta:", error);
      toast.error("Error al cargar los detalles de la propuesta");
    }
  };

  // Handlers de cierre de modales
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedLicitacion(null);
    setPropuestas([]);
  };

  const handleClosePropuestaModal = () => {
    setShowPropuestaModal(false);
    setSelectedPropuesta(null);
  };

  const handleModalOverlayClick = (e) => {
    if (e.target === e.currentTarget) handleCloseModal();
  };

  const handleModalOverlayClickPropuesta = (e) => {
    if (e.target === e.currentTarget) handleClosePropuestaModal();
  };

  // Handlers de acciones principales
  const handleDeleteLicitacion = (licitacion) => {
    setDeletingLicitacion(licitacion);
    setShowConfirmDelete(true);
  };

  const handleCloseLicitacion = (licitacion) => {
    setClosingLicitacion(licitacion);
    setShowConfirmClose(true);
  };

  // const handleAdjudicarLicitacion = (licitacion) => {
  //   setAdjudicandoLicitacion(licitacion);
  //   setShowConfirmAdjudicar(true);
  // };

  const handleFinalizarLicitacion = (licitacion) => {
    const propuestaGanadoraActual = obtenerPropuestaGanadoraActual();

    if (!propuestaGanadoraActual) {
      toast.error("Necesitas una propuesta adjudicada antes de calificar");
      return;
    }

    setFinalizandoLicitacion(licitacion);
    setCalificacionTarget({
      licitacion,
      propuesta: propuestaGanadoraActual,
    });
    setShowCalificacionModal(true);
  };

  // const handleSeleccionarGanador = async (licitacion) => {
  //   setSeleccionandoGanador(licitacion);
  //   const licitacionId = licitacion.licitacionID || licitacion.LicitacionID;

  //   try {
  //     const response = await apiRequest(
  //       `http://localhost:5242/api/propuestas/licitacion/${licitacionId}`
  //     );
  //     if (!response.ok)
  //       throw new Error(`Error al cargar propuestas: ${response.status}`);

  //     const propuestasData = await response.json();
  //     const criteriosResponse = await apiRequest(
  //       `http://localhost:5242/api/licitaciones/${licitacionId}/criterios`
  //     );

  //     if (criteriosResponse.ok) {
  //       const criterios = await criteriosResponse.json();
  //       const propuestasRankeadas = await rankearPropuestas(
  //         propuestasData,
  //         criterios
  //       );
  //       setPropuestas(propuestasRankeadas);
  //       setSelectedGanador(propuestasRankeadas[0] || null);
  //     } else {
  //       const propuestasOrdenadas = propuestasData
  //         .sort((a, b) => {
  //           const presupuestoA =
  //             a.presupuestoOfrecido || a.PresupuestoOfrecido || 0;
  //           const presupuestoB =
  //             b.presupuestoOfrecido || b.PresupuestoOfrecido || 0;
  //           return presupuestoA - presupuestoB;
  //         })
  //         .map((propuesta) => ({
  //           ...propuesta,
  //           scoreTotal: 0,
  //           scoreCalculado: 0,
  //         }));

  //       setPropuestas(propuestasOrdenadas);
  //       setSelectedGanador(propuestasOrdenadas[0] || null);
  //     }
  //     setShowGanadorModal(true);
  //   } catch (error) {
  //     toast.error(`Error al cargar las propuestas: ${error.message}`);
  //   }
  // };

  const handleSeleccionarPropuestaGanadora = (propuesta) => {
    if (isPropuestaDescalificada(propuesta)) {
      toast.error(
        "No podés seleccionar una propuesta que incumple criterios excluyentes"
      );
      return;
    }

    setPropuestaGanadora(propuesta);
    setShowConfirmSeleccionarGanadora(true);
  };

  const closeCalificacionModal = () => {
    setShowCalificacionModal(false);
    setCalificacionTarget(null);
    setFinalizandoLicitacion(null);
  };

  const handleSubmitCalificacion = async ({
    puntualidad,
    calidad,
    comunicacion,
    comentarios,
  }) => {
    if (!calificacionTarget?.licitacion || !calificacionTarget?.propuesta) {
      toast.error("No encontramos la informacion necesaria para calificar");
      return;
    }

    const licitacionId = calificacionTarget.licitacion.licitacionID;
    const proveedorId = calificacionTarget.propuesta.proveedorID;

    if (!licitacionId || !proveedorId) {
      toast.error("No pudimos identificar la licitacion seleccionada");
      return;
    }

    try {
      setSubmittingCalificacion(true);
      await registrarCalificacionPostLicitacion({
        token,
        licitacionId,
        proveedorId,
        puntualidad,
        calidad,
        comunicacion,
        comentarios,
      });

      toast.success("Calificacion registrada y licitacion cerrada");
      closeCalificacionModal();

      const licitacionesActualizadas = await fetchLicitaciones();
      if (Array.isArray(licitacionesActualizadas)) {
        const licitacionRefrescada = licitacionesActualizadas.find((item) => {
          const itemId = item.licitacionID || item.LicitacionID;
          return String(itemId) === String(licitacionId);
        });

        if (licitacionRefrescada) {
          setSelectedLicitacion(licitacionRefrescada);
          setShowModal(true);
          fetchPropuestas(licitacionId);
          fetchArchivosLicitacion(licitacionId);
        }
      }
    } catch (error) {
      console.error("Error al calificar proveedor:", error);
      toast.error(error.message || "No pudimos registrar la calificacion");
    } finally {
      setSubmittingCalificacion(false);
      setFinalizandoLicitacion(null);
    }
  };

  // Funciones de confirmación consolidadas
  const executeAction = async (
    action,
    licitacionId,
    successMessage,
    errorMessage
  ) => {
    try {
      const isDelete = action === "delete";
      const url = isDelete
        ? `http://localhost:5242/api/licitaciones/${licitacionId}`
        : `http://localhost:5242/api/licitaciones/${licitacionId}/${action}`;

      const response = await apiRequest(url, {
        method: isDelete ? "DELETE" : "PUT",
      });

      if (!response.ok)
        throw new Error(`Error ${response.status}: ${response.statusText}`);

      toast.success(successMessage);
      await fetchLicitaciones();

      // Cerrar todos los modales
      setShowModal(false);
      setSelectedLicitacion(null);

      return true;
    } catch (error) {
      console.error(`Error en ${action}:`, error);
      toast.error(errorMessage);
      return false;
    }
  };

  const confirmDeleteLicitacion = async () => {
    if (!deletingLicitacion) return;

    const licitacionId =
      deletingLicitacion.licitacionID || deletingLicitacion.LicitacionID;
    const success = await executeAction(
      "delete",
      licitacionId,
      "Licitación cancelada exitosamente",
      "Error al cancelar la licitación"
    );

    if (success) {
      setShowConfirmDelete(false);
      setDeletingLicitacion(null);
    }
  };

  const confirmCloseLicitacion = async () => {
    if (!closingLicitacion) return;

    const licitacionId =
      closingLicitacion.licitacionID || closingLicitacion.LicitacionID;
    const success = await executeAction(
      "cerrar",
      licitacionId,
      "Licitación pasada a evaluación exitosamente",
      "Error al pasar la licitación a evaluación"
    );

    if (success) {
      setShowConfirmClose(false);
      setClosingLicitacion(null);
    }
  };

  const confirmAdjudicarLicitacion = async () => {
    if (!adjudicandoLicitacion) return;

    const licitacionId =
      adjudicandoLicitacion.licitacionID || adjudicandoLicitacion.LicitacionID;
    const success = await executeAction(
      "adjudicar",
      licitacionId,
      "Licitación marcada como adjudicada exitosamente",
      "Error al adjudicar la licitación"
    );

    if (success) {
      setShowConfirmAdjudicar(false);
      setAdjudicandoLicitacion(null);
    }
  };

  const confirmSeleccionarGanador = async () => {
    if (!seleccionandoGanador || !selectedGanador) {
      toast.error("Error: No hay licitación o ganador seleccionado");
      return;
    }

    try {
      const licitacionId =
        seleccionandoGanador.licitacionID || seleccionandoGanador.LicitacionID;
      const proveedorId =
        selectedGanador.proveedorID || selectedGanador.ProveedorID;

      // Registrar en historial
      const historialData = {
        ProveedorID: proveedorId,
        LicitacionID: licitacionId,
        Resultado: "GANADOR",
        Ganador: true,
        Observaciones: "Seleccionado como ganador de la licitación",
      };

      const historialResponse = await apiRequest(
        "http://localhost:5242/api/historial-proveedor-licitacion",
        {
          method: "POST",
          body: JSON.stringify(historialData),
        }
      );

      if (!historialResponse.ok) {
        throw new Error(
          `Error al registrar el historial: ${historialResponse.status}`
        );
      }

      // Cerrar licitación (pasar a "En Evaluación")
      const licitacionResponse = await apiRequest(
        `http://localhost:5242/api/licitaciones/${licitacionId}/cerrar`,
        {
          method: "PUT",
        }
      );

      if (!licitacionResponse.ok) {
        throw new Error(
          `Error al actualizar el estado de la licitación: ${licitacionResponse.status}`
        );
      }

      toast.success(
        "Ganador seleccionado y licitación pasada a evaluación exitosamente"
      );

      // Cerrar modales y recargar
      setShowGanadorModal(false);
      setShowModal(false);
      setSeleccionandoGanador(null);
      setSelectedGanador(null);
      setSelectedLicitacion(null);
      await fetchLicitaciones();
    } catch (error) {
      toast.error(`Error al seleccionar el ganador: ${error.message}`);
    }
  };

  const confirmSeleccionarPropuestaGanadora = async () => {
    if (!propuestaGanadora || !selectedLicitacion) {
      toast.error("Error: No hay propuesta o licitación seleccionada");
      return;
    }

    try {
      const licitacionId =
        selectedLicitacion.licitacionID || selectedLicitacion.LicitacionID;
      const proveedorId =
        propuestaGanadora.proveedorID || propuestaGanadora.ProveedorID;

      // Registrar en historial
      const historialData = {
        ProveedorID: proveedorId,
        LicitacionID: licitacionId,
        Resultado: "GANADOR",
        Ganador: true,
        Observaciones: "Seleccionado como ganador de la licitación",
      };

      const historialResponse = await apiRequest(
        "http://localhost:5242/api/historial-proveedor-licitacion",
        {
          method: "POST",
          body: JSON.stringify(historialData),
        }
      );

      if (!historialResponse.ok) {
        throw new Error(
          `Error al registrar el historial: ${historialResponse.status}`
        );
      }

      // Adjudicar licitación
      const licitacionResponse = await apiRequest(
        `http://localhost:5242/api/licitaciones/${licitacionId}/adjudicar`,
        {
          method: "PUT",
        }
      );

      if (!licitacionResponse.ok) {
        throw new Error(
          `Error al adjudicar la licitación: ${licitacionResponse.status}`
        );
      }

      toast.success(
        "Propuesta seleccionada como ganadora y licitación adjudicada exitosamente"
      );

      // Actualizar vista con la información más reciente
      setShowConfirmSeleccionarGanadora(false);
      setPropuestaGanadora(null);

      const licitacionesActualizadas = await fetchLicitaciones();
      if (Array.isArray(licitacionesActualizadas)) {
        const licitacionRefrescada = licitacionesActualizadas.find((item) => {
          const itemId = item.licitacionID || item.LicitacionID;
          return String(itemId) === String(licitacionId);
        });

        if (licitacionRefrescada) {
          setSelectedLicitacion(licitacionRefrescada);
          setShowModal(true);
          fetchPropuestas(licitacionId);
          fetchArchivosLicitacion(licitacionId);
        } else {
          setShowModal(false);
          setSelectedLicitacion(null);
        }
      }
    } catch (error) {
      console.error("Error al seleccionar propuesta ganadora:", error);
      toast.error(
        `Error al seleccionar la propuesta ganadora: ${error.message}`
      );
    }
  };

  // Handlers de cancelación
  const cancelDeleteLicitacion = () => {
    setShowConfirmDelete(false);
    setDeletingLicitacion(null);
  };

  const cancelCloseLicitacion = () => {
    setShowConfirmClose(false);
    setClosingLicitacion(null);
  };

  const cancelAdjudicarLicitacion = () => {
    setShowConfirmAdjudicar(false);
    setAdjudicandoLicitacion(null);
  };

  const cancelSeleccionarGanador = () => {
    setShowGanadorModal(false);
    setSeleccionandoGanador(null);
    setSelectedGanador(null);
    setPropuestas([]);
  };

  const cancelSeleccionarPropuestaGanadora = () => {
    setShowConfirmSeleccionarGanadora(false);
    setPropuestaGanadora(null);
  };

  // useEffect consolidado
  useEffect(() => {
    if (user && token) {
      fetchLicitaciones();
      fetchRubros();
      // Solo cargar propuestas si es un proveedor
      if (user?.proveedor?.proveedorID) {
        fetchPropuestasProveedor();
      }
    }
  }, [user, token]); // Conservativo: no agregamos funciones para evitar bucles infinitos

  // useEffect para filtros y ordenamiento
  useEffect(() => {
    if (originalLicitaciones.length > 0) {
      const filtered = applyFiltersAndSorting(originalLicitaciones);
      setLicitaciones(filtered);
    }
  }, [filters, sortBy, sortOrder, originalLicitaciones]); // Conservativo: applyFiltersAndSorting es estable

  // Datos filtrados para renderizado
  const filteredLicitaciones = licitaciones;
  const propuestasGanadora = isSelectedEstadoAdjudicado
    ? propuestas.slice(0, 1)
    : [];
  const propuestasRestantes = isSelectedEstadoAdjudicado
    ? propuestas.slice(1)
    : propuestas;
  const showPropuestasRecibidasListado =
    selectedEstado === "Adjudicada" && propuestasRestantes.length > 0;
  const selectedLicitacionCurrency = selectedLicitacion
    ? getLicitacionCurrency(selectedLicitacion)
    : null;
  const selectedPropuestaCurrency = selectedPropuesta
    ? getPropuestaCurrency(selectedPropuesta)
    : null;

  // Componente principal JSX
  return (
    <Container>
      <Navbar />
      <MainContent>
        {/* Header */}
        <PageHeader>
          <PageTitle>Mis licitaciones</PageTitle>
          <PageSubtitle>
            Gestione las licitaciones de {getCompanyName()}.
          </PageSubtitle>
        </PageHeader>

        {/* Filtros */}
        <FiltersContainer>
          <FiltersTitle>Filtros de búsqueda</FiltersTitle>
          <FiltersGrid>
            <FilterGroup>
              <FilterLabel>Título</FilterLabel>
              <FilterInput
                type="text"
                placeholder="Buscar por título..."
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
            <FilterButton onClick={fetchLicitaciones}>
              Aplicar filtros
            </FilterButton>
            <ClearButton onClick={clearFilters}>Limpiar</ClearButton>
          </FiltersActions>
        </FiltersContainer>

        {/* Contenedor principal de licitaciones */}
        <LicitacionesContainer>
          {/* Header con ordenamiento */}
          <LicitacionesHeader>
            <div>
              <LicitacionesTitle>Licitaciones</LicitacionesTitle>
              <ResultsInfo>
                {(() => {
                  const stats = getLicitacionesStats();
                  return `${stats.total} licitaciones activas (${stats.postuladas} postuladas, ${stats.disponibles} disponibles)`;
                })()}
              </ResultsInfo>
            </div>
            <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
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
                  <option value="estado-desc">Estado (Z-A)</option>
                </SortSelect>
              </SortContainer>
              <CreateButton onClick={handleCrearLicitacion}>
                Nueva licitación
              </CreateButton>
            </div>
          </LicitacionesHeader>

          {/* Lista de licitaciones */}
          {loading ? (
            <LoadingContainer>
              <LoadingSpinner />
              <LoadingText>Cargando licitaciones...</LoadingText>
            </LoadingContainer>
          ) : error ? (
            <ErrorContainer>
              <ErrorIcon>⚠️</ErrorIcon>
              <ErrorTitle>Error al cargar las licitaciones</ErrorTitle>
              <ErrorDescription>{error}</ErrorDescription>
              <RetryButton onClick={fetchLicitaciones}>
                🔄 Reintentar
              </RetryButton>
            </ErrorContainer>
          ) : filteredLicitaciones.length === 0 ? (
            <EmptyState>
              <EmptyIcon>📋</EmptyIcon>
              <EmptyTitle>No hay licitaciones</EmptyTitle>
              <EmptyDescription>
                No tiene licitaciones creadas todavía. ¡Cree su primera
                licitación!
              </EmptyDescription>
              <CreateButton onClick={handleCrearLicitacion}>
                Crear primera licitación
              </CreateButton>
            </EmptyState>
          ) : (
            <LicitacionesList>
              {filteredLicitaciones.map((licitacion) => {
                const licitacionId =
                  licitacion.licitacionID || licitacion.LicitacionID;
                const titulo = licitacion.titulo || licitacion.Titulo;
                const estadoNombre =
                  licitacion.estadoNombre || licitacion.EstadoNombre;
                const descripcion =
                  licitacion.descripcion || licitacion.Descripcion;
                const fechaInicio =
                  licitacion.fechaInicio || licitacion.FechaInicio;
                const fechaCierre =
                  licitacion.fechaCierre || licitacion.FechaCierre;
                const presupuestoMax =
                  licitacion.presupuestoMaximo || licitacion.PresupuestoMaximo;
                const rubroNombre =
                  licitacion.rubroNombre || licitacion.RubroNombre;
                const monedaInfo = getLicitacionCurrency(licitacion);
                const count = propuestasCount[licitacionId] || 0;

                return (
                  <LicitacionCard
                    key={licitacionId}
                    onClick={() => handleLicitacionClick(licitacionId)}
                  >
                    <LicitacionHeader>
                      <LicitacionTitle>{titulo}</LicitacionTitle>
                      <LicitacionStatusContainer>
                        <LicitacionStatus status={estadoNombre}>
                          {estadoNombre}
                        </LicitacionStatus>
                        <PropuestasCountBadge>
                          {count} {count === 1 ? "propuesta" : "propuestas"}
                        </PropuestasCountBadge>
                      </LicitacionStatusContainer>
                    </LicitacionHeader>

                    <LicitacionMeta>
                      <MetaItem>
                        <MetaLabel>Fecha de inicio</MetaLabel>
                        <MetaValue>{formatDate(fechaInicio)}</MetaValue>
                      </MetaItem>
                      <MetaItem>
                        <MetaLabel>Fecha de cierre</MetaLabel>
                        <MetaValue>{formatDate(fechaCierre)}</MetaValue>
                      </MetaItem>
                      <MetaItem>
                        <MetaLabel>Presupuesto máximo</MetaLabel>
                        <MetaValue>
                          {formatCurrency(presupuestoMax, monedaInfo)}
                        </MetaValue>
                      </MetaItem>
                      <MetaItem>
                        <MetaLabel>Rubro</MetaLabel>
                        <MetaValue>
                          {rubroNombre || "No especificado"}
                        </MetaValue>
                      </MetaItem>
                    </LicitacionMeta>

                    {descripcion && (
                      <LicitacionDescription>
                        {descripcion}
                      </LicitacionDescription>
                    )}
                  </LicitacionCard>
                );
              })}
            </LicitacionesList>
          )}
        </LicitacionesContainer>

        {/* Modal de detalle de licitación */}
        {showModal && selectedLicitacion && (
          <ModalOverlay onClick={handleModalOverlayClick}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <CloseButton onClick={handleCloseModal}>×</CloseButton>
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
              </ModalHeader>

              <ModalBody>
                {/* Información general */}
                <DetailSection>
                  <SectionTitle>Información General</SectionTitle>
                  <DetailGrid>
                    <BudgetCard>
                      <BudgetLabel>Presupuesto máximo</BudgetLabel>
                      <BudgetValue>
                        {formatCurrency(
                          selectedLicitacion.presupuestoMaximo ||
                            selectedLicitacion.PresupuestoMaximo,
                          selectedLicitacionCurrency
                        )}
                      </BudgetValue>
                    </BudgetCard>

                    <ProjectCard>
                      <ProjectLabel>Proyecto/Rubro</ProjectLabel>
                      <ProjectValue>
                        {selectedLicitacion.rubroNombre ||
                          selectedLicitacion.RubroNombre ||
                          "No especificado"}
                      </ProjectValue>
                      <ProjectLocation>
                        {selectedLicitacion.ubicacion ||
                          selectedLicitacion.Ubicacion ||
                          "Ubicación no especificada"}
                      </ProjectLocation>
                    </ProjectCard>
                  </DetailGrid>

                  {/* Fechas importantes */}
                  <DatesGrid>
                    <DateCard>
                      <DateLabel>Fecha de inicio</DateLabel>
                      <DateValue>
                        {formatDate(
                          selectedLicitacion.fechaInicio ||
                            selectedLicitacion.FechaInicio
                        )}
                      </DateValue>
                    </DateCard>

                    <DateCard>
                      <DateLabel>Fecha de cierre</DateLabel>
                      <DateValue>
                        {formatDate(
                          selectedLicitacion.fechaCierre ||
                            selectedLicitacion.FechaCierre
                        )}
                      </DateValue>
                    </DateCard>

                    <DateCard>
                      <DateLabel>Adjudicación</DateLabel>
                      <DateValue>
                        {formatDate(
                          selectedLicitacion.fechaAdjudicacion ||
                            selectedLicitacion.FechaAdjudicacion
                        )}
                      </DateValue>
                    </DateCard>
                  </DatesGrid>

                  {/* Descripción */}
                  {(selectedLicitacion.descripcion ||
                    selectedLicitacion.Descripcion) && (
                    <>
                      <SectionTitle>Descripción</SectionTitle>
                      <DetailDescription>
                        {selectedLicitacion.descripcion ||
                          selectedLicitacion.Descripcion}
                      </DetailDescription>
                    </>
                  )}

                  {/* Archivos adjuntos */}
                  {selectedLicitacion.archivosAdjuntos &&
                    selectedLicitacion.archivosAdjuntos.length > 0 && (
                      <>
                        <SectionTitle>Archivos Adjuntos</SectionTitle>
                        <PropuestaArchivos>
                          {selectedLicitacion.archivosAdjuntos.map(
                            (archivo) => (
                              <ArchivoItem
                                key={archivo.archivoID || archivo.ArchivoID}
                              >
                                <ArchivoIcon>📎</ArchivoIcon>
                                <ArchivoName
                                  onClick={() =>
                                    handleDownloadArchivo(
                                      archivo.archivoID || archivo.ArchivoID,
                                      archivo.nombreArchivo ||
                                        archivo.NombreArchivo
                                    )
                                  }
                                >
                                  {archivo.nombreArchivo ||
                                    archivo.NombreArchivo}
                                </ArchivoName>
                              </ArchivoItem>
                            )
                          )}
                        </PropuestaArchivos>
                      </>
                    )}
                </DetailSection>

                {/* Propuestas */}
                <PropuestasSection>
                  <PropuestasTitle>
                    {isSelectedEstadoAdjudicado
                      ? `Propuesta ganadora (${
                          propuestasGanadora.length === 0
                            ? "sin definir"
                            : propuestasGanadora.length
                        })`
                      : `Propuestas recibidas (${propuestas.length})`}
                    {shouldShowScoreInfoIcon && (
                      <ScoreInfoWrapper>
                        <ScoreInfoButton
                          type="button"
                          aria-label="Explicación del puntaje"
                          onClick={handleToggleScoreInfo}
                        >
                          i
                        </ScoreInfoButton>
                      </ScoreInfoWrapper>
                    )}
                  </PropuestasTitle>
                  {selectedEstado === "Publicada" && (
                    <PropuestasHint>
                      Las propuestas se verán una vez que la licitación se
                      cierre.
                    </PropuestasHint>
                  )}

                  {canViewSelectedPropuestas &&
                    (loadingPropuestas ? (
                      <LoadingPropuestas>
                        <LoadingPropuestasSpinner />
                        <PropuestasText>Cargando propuestas...</PropuestasText>
                      </LoadingPropuestas>
                    ) : isSelectedEstadoAdjudicado ? (
                      <>
                        {propuestasGanadora.length === 0 ? (
                          <EmptyPropuestas>
                            <EmptyPropuestasText>
                              Todavía no se ha definido una propuesta ganadora.
                            </EmptyPropuestasText>
                          </EmptyPropuestas>
                        ) : (
                          renderPropuestasContenido(propuestasGanadora, {
                            resaltarGanadora: true,
                          })
                        )}

                        {showPropuestasRecibidasListado && (
                          <>
                            <PropuestasSubtitle>
                              Propuestas recibidas ({propuestasRestantes.length}
                              )
                            </PropuestasSubtitle>
                            {propuestasRestantes.length === 0 ? (
                              <EmptyPropuestas>
                                <EmptyPropuestasText>
                                  No hay otras propuestas recibidas.
                                </EmptyPropuestasText>
                              </EmptyPropuestas>
                            ) : (
                              renderPropuestasContenido(propuestasRestantes, {
                                rankingOffset: propuestasGanadora.length,
                              })
                            )}
                          </>
                        )}
                      </>
                    ) : propuestas.length === 0 ? (
                      <EmptyPropuestas>
                        <EmptyPropuestasText>
                          Todavía no hay propuestas recibidas.
                        </EmptyPropuestasText>
                      </EmptyPropuestas>
                    ) : (
                      renderPropuestasContenido(propuestas)
                    ))}
                </PropuestasSection>
              </ModalBody>

              {/* Acciones del modal */}
              <ModalActions>
                {(selectedLicitacion.estadoNombre ||
                  selectedLicitacion.EstadoNombre) === "Publicada" && (
                  <>
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

                    <CloseLicitacionButton
                      onClick={() => handleCloseLicitacion(selectedLicitacion)}
                    >
                      ⏰ Pasar a evaluación
                    </CloseLicitacionButton>
                  </>
                )}

                {(selectedLicitacion.estadoNombre ||
                  selectedLicitacion.EstadoNombre) === "Adjudicada" && (
                  <CloseLicitacionButton
                    onClick={() =>
                      handleFinalizarLicitacion(selectedLicitacion)
                    }
                  >
                    🏅 Calificar al proveedor
                  </CloseLicitacionButton>
                )}

                {!["Cerrada", "Adjudicada", "Cancelada"].includes(
                  selectedLicitacion.estadoNombre ||
                    selectedLicitacion.EstadoNombre
                ) && (
                  <DeleteButton
                    onClick={() => handleDeleteLicitacion(selectedLicitacion)}
                  >
                    🗑️ Eliminar
                  </DeleteButton>
                )}
              </ModalActions>
            </ModalContent>
          </ModalOverlay>
        )}

        {showScoreInfo && shouldShowScoreInfoIcon && (
          <ScoreInfoOverlay onClick={() => setShowScoreInfo(false)}>
            <ScoreInfoPopup onClick={(event) => event.stopPropagation()}>
              <ScoreInfoPopupTitle>
                ¿Cómo se calcula el puntaje?
              </ScoreInfoPopupTitle>
              <ScoreInfoPopupText>
                Cada respuesta se lleva a un valor entre 0 y 1 según su tipo y
                luego se pondera por el peso del criterio. La suma se escala a
                una nota de 0 a 100.
              </ScoreInfoPopupText>
              <ScoreInfoList>
                <ScoreInfoListItem>
                  <strong>Numéricos:</strong> se comparan con el rango
                  mínimo/máximo y se invierten si "menor es mejor".
                </ScoreInfoListItem>
                <ScoreInfoListItem>
                  <strong>Booleanos:</strong> obtienen 1 punto si coinciden con
                  el valor requerido, de lo contrario 0.
                </ScoreInfoListItem>
                <ScoreInfoListItem>
                  <strong>Escalas:</strong> usan el puntaje de la opción elegida
                  respecto al valor máximo definido.
                </ScoreInfoListItem>
              </ScoreInfoList>
              <ScoreInfoPopupText>
                Si falla un criterio excluyente la propuesta queda fuera del
                ranking.
              </ScoreInfoPopupText>
              <ScoreInfoCloseButton
                type="button"
                onClick={() => setShowScoreInfo(false)}
              >
                Entendido
              </ScoreInfoCloseButton>
            </ScoreInfoPopup>
          </ScoreInfoOverlay>
        )}

        {/* Modales de confirmación */}
        <DialogModal
          isOpen={showConfirmDelete}
          title="⚠️ Confirmar eliminación"
          variant="red"
          description={
            <>
              ¿Está seguro de que desea eliminar la licitación "
              {deletingLicitacion?.titulo || deletingLicitacion?.Titulo}"?
              <br />
              Esta acción no se puede deshacer y la licitación dejará de ser
              visible para todos los proveedores.
            </>
          }
          confirmText="Eliminar"
          cancelText="Cancelar"
          onConfirm={confirmDeleteLicitacion}
          onCancel={cancelDeleteLicitacion}
        />

        <DialogModal
          isOpen={showConfirmClose}
          title="⏰ Confirmar paso a evaluación"
          variant="yellow"
          description={
            <>
              ¿Desea cerrar la licitación "
              {closingLicitacion?.titulo || closingLicitacion?.Titulo}" de forma
              temprana y pasarla a evaluación?
              <br />
              No podrá recibir más propuestas luego de confirmarlo.
            </>
          }
          confirmText="Pasar a evaluación"
          cancelText="Cancelar"
          onConfirm={confirmCloseLicitacion}
          onCancel={cancelCloseLicitacion}
        />

        <DialogModal
          isOpen={showConfirmAdjudicar}
          title="✅ Confirmar adjudicación"
          variant="green"
          description={
            <>
              ¿Desea marcar la licitación "
              {adjudicandoLicitacion?.titulo || adjudicandoLicitacion?.Titulo}"
              como adjudicada?
            </>
          }
          confirmText="Adjudicar"
          cancelText="Cancelar"
          onConfirm={confirmAdjudicarLicitacion}
          onCancel={cancelAdjudicarLicitacion}
        />

        {/* Modal de confirmación para seleccionar propuesta ganadora */}
        <DialogModal
          isOpen={showConfirmSeleccionarGanadora}
          title="🏆 Confirmar adjudicación"
          variant="green"
          description={
            <>
              ¿Desea seleccionar la propuesta de "
              {propuestaGanadora?.proveedorNombre ||
                propuestaGanadora?.ProveedorNombre}
              " como adjudicada?
              <br />
              No podrá revertir esta acción.
            </>
          }
          confirmText="Confirmar"
          cancelText="Cancelar"
          onConfirm={confirmSeleccionarPropuestaGanadora}
          onCancel={cancelSeleccionarPropuestaGanadora}
        />

        <CalificacionProveedorModal
          isOpen={showCalificacionModal}
          licitacionTitulo={
            finalizandoLicitacion?.titulo || finalizandoLicitacion?.Titulo
          }
          proveedorNombre={
            calificacionTarget?.propuesta?.proveedorNombre ||
            calificacionTarget?.propuesta?.ProveedorNombre
          }
          fechaAdjudicacion={
            calificacionTarget?.propuesta?.HistorialGanador
              ?.FechaParticipacion ||
            calificacionTarget?.propuesta?.HistorialGanador?.fechaParticipacion
          }
          onCancel={closeCalificacionModal}
          onSubmit={handleSubmitCalificacion}
          isSubmitting={submittingCalificacion}
        />

        {/* Modal de selección de ganador */}
        {showGanadorModal && (
          <GanadorModal>
            <GanadorModalContent>
              <GanadorModalHeader>
                <CloseButton onClick={cancelSeleccionarGanador}>×</CloseButton>
                <GanadorModalTitle>Seleccionar ganador</GanadorModalTitle>
              </GanadorModalHeader>

              <GanadorModalBody>
                <GanadorInstruccion>
                  Seleccione la propuesta ganadora de la licitación. Las
                  propuestas están ordenadas por puntuación.
                </GanadorInstruccion>

                {(() => {
                  let ganadorRankingCounter = 0;
                  return (
                    <GanadorPropuestasList>
                      {propuestas.map((propuesta) => {
                        const monedaInfo = getPropuestaCurrency(propuesta);
                        const score = getScoreFromPropuesta(propuesta);
                        const descalificada =
                          isPropuestaDescalificada(propuesta);
                        const rankingPosition =
                          !descalificada && score !== null
                            ? ++ganadorRankingCounter
                            : null;
                        const handleSelect = () => {
                          if (descalificada) {
                            toast.error(
                              "No podés adjudicar una propuesta excluida"
                            );
                            return;
                          }
                          setSelectedGanador(propuesta);
                        };

                        return (
                          <GanadorPropuestaItem
                            key={propuesta.propuestaID || propuesta.PropuestaID}
                            selected={
                              selectedGanador &&
                              (selectedGanador.propuestaID ||
                                selectedGanador.PropuestaID) ===
                                (propuesta.propuestaID || propuesta.PropuestaID)
                            }
                            data-disabled={descalificada}
                            onClick={handleSelect}
                          >
                            <GanadorPropuestaHeader>
                              <GanadorProveedorNombre>
                                {propuesta.proveedorNombre ||
                                  propuesta.ProveedorNombre}
                              </GanadorProveedorNombre>
                              <GanadorPropuestaRanking
                                position={rankingPosition || undefined}
                              >
                                {descalificada
                                  ? "Fuera de evaluación"
                                  : rankingPosition
                                  ? `Puesto #${rankingPosition}`
                                  : "Sin puntaje"}
                              </GanadorPropuestaRanking>
                            </GanadorPropuestaHeader>

                            <GanadorPropuestaInfo>
                              <div>
                                <strong>Presupuesto:</strong>{" "}
                                {formatCurrency(
                                  propuesta.presupuestoOfrecido ||
                                    propuesta.PresupuestoOfrecido,
                                  monedaInfo
                                )}
                              </div>
                              <div>
                                <strong>Puntuación:</strong>{" "}
                                {score !== null ? score.toFixed(1) : "N/D"}
                              </div>
                            </GanadorPropuestaInfo>

                            {descalificada && (
                              <PropuestaAlert style={{ marginTop: 10 }}>
                                <PropuestaAlertTitle>
                                  No elegible.
                                </PropuestaAlertTitle>
                              </PropuestaAlert>
                            )}
                          </GanadorPropuestaItem>
                        );
                      })}
                    </GanadorPropuestasList>
                  );
                })()}
              </GanadorModalBody>

              <GanadorModalActions>
                <GanadorConfirmButton
                  onClick={confirmSeleccionarGanador}
                  disabled={
                    !selectedGanador ||
                    (selectedGanador &&
                      isPropuestaDescalificada(selectedGanador))
                  }
                >
                  Confirmar Ganador
                </GanadorConfirmButton>
                <GanadorCancelButton onClick={cancelSeleccionarGanador}>
                  Cancelar
                </GanadorCancelButton>
              </GanadorModalActions>
            </GanadorModalContent>
          </GanadorModal>
        )}

        {/* Modal de detalle de propuesta */}
        {showPropuestaModal && selectedPropuesta && (
          <PropuestaModalOverlay onClick={handleModalOverlayClickPropuesta}>
            <PropuestaModalContent onClick={(e) => e.stopPropagation()}>
              <PropuestaModalHeader>
                <CloseButton onClick={handleClosePropuestaModal}>×</CloseButton>
                <PropuestaModalTitle>
                  Propuesta de{" "}
                  {selectedPropuesta.proveedorNombre ||
                    selectedPropuesta.ProveedorNombre}
                </PropuestaModalTitle>
                <PropuestaModalSubtitle>
                  Enviada el{" "}
                  {formatDate(
                    selectedPropuesta.fechaEnvio || selectedPropuesta.FechaEnvio
                  )}
                </PropuestaModalSubtitle>
              </PropuestaModalHeader>

              <PropuestaModalBody>
                {(() => {
                  const detalleScore = getScoreFromPropuesta(selectedPropuesta);
                  const detalleDescalificada =
                    isPropuestaDescalificada(selectedPropuesta);
                  const detalleCriteriosFallidos =
                    getCriteriosExcluyentesFallidos(selectedPropuesta);

                  return (
                    <>
                      {detalleScore !== null && (
                        <PropuestaScoreSummary>
                          Puntaje normalizado: {detalleScore.toFixed(1)} / 100
                        </PropuestaScoreSummary>
                      )}
                      {detalleDescalificada && (
                        <PropuestaAlert>
                          <PropuestaAlertTitle>
                            Esta propuesta no se consideró para el cálculo.
                          </PropuestaAlertTitle>
                          {detalleCriteriosFallidos.length > 0 && (
                            <PropuestaAlertList>
                              {detalleCriteriosFallidos.map((criterio) => (
                                <li key={`detalle-${criterio}`}>{criterio}</li>
                              ))}
                            </PropuestaAlertList>
                          )}
                        </PropuestaAlert>
                      )}
                    </>
                  );
                })()}
                <PropuestaDetailSection>
                  <SectionTitle>Información de la propuesta</SectionTitle>
                  <PropuestaDetailGrid>
                    <PropuestaInfoCard>
                      <PropuestaDetailInfoLabel>
                        Presupuesto ofrecido
                      </PropuestaDetailInfoLabel>
                      <PropuestaDetailInfoValue>
                        {formatCurrency(
                          selectedPropuesta.presupuestoOfrecido ||
                            selectedPropuesta.PresupuestoOfrecido,
                          selectedPropuestaCurrency
                        )}
                      </PropuestaDetailInfoValue>
                    </PropuestaInfoCard>

                    <PropuestaStatusCard>
                      <PropuestaStatusLabel>Estado</PropuestaStatusLabel>
                      <PropuestaStatusValue>
                        {selectedPropuesta.estado ||
                          selectedPropuesta.Estado ||
                          "Enviada"}
                      </PropuestaStatusValue>
                    </PropuestaStatusCard>
                  </PropuestaDetailGrid>

                  {/* Descripción de la propuesta */}
                  {(selectedPropuesta.descripcion ||
                    selectedPropuesta.Descripcion) && (
                    <>
                      <SectionTitle>Descripción</SectionTitle>
                      <PropuestaDescription>
                        {selectedPropuesta.descripcion ||
                          selectedPropuesta.Descripcion}
                      </PropuestaDescription>
                    </>
                  )}

                  {/* Criterios de evaluación */}
                  {selectedPropuesta.respuestasCriterios &&
                    selectedPropuesta.respuestasCriterios.length > 0 && (
                      <>
                        <SectionTitle>Criterios de evaluación</SectionTitle>
                        <PropuestaCriteriosSection>
                          {selectedPropuesta.respuestasCriterios.map(
                            (respuesta) => (
                              <PropuestaCriterioItem
                                key={
                                  respuesta.criterioID || respuesta.CriterioID
                                }
                              >
                                <PropuestaCriterioName>
                                  {respuesta.criterioNombre ||
                                    respuesta.CriterioNombre ||
                                    "Criterio"}
                                </PropuestaCriterioName>
                                <PropuestaCriterioDescription>
                                  {respuesta.criterioDescripcion ||
                                    respuesta.CriterioDescripcion ||
                                    "Sin descripción"}
                                </PropuestaCriterioDescription>
                                <PropuestaCriterioValue>
                                  {formatCriterioValor(respuesta)}
                                </PropuestaCriterioValue>
                              </PropuestaCriterioItem>
                            )
                          )}
                        </PropuestaCriteriosSection>
                      </>
                    )}
                </PropuestaDetailSection>
              </PropuestaModalBody>

              <PropuestaActions>
                <PropuestaCloseButton onClick={handleClosePropuestaModal}>
                  Cerrar
                </PropuestaCloseButton>
              </PropuestaActions>
            </PropuestaModalContent>
          </PropuestaModalOverlay>
        )}
      </MainContent>

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
      />
    </Container>
  );
};

export default LicitacionesMinera;
