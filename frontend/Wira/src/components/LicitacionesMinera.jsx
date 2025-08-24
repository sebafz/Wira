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
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
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

const SeleccionarGanadoraButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  opacity: 0;
  pointer-events: none;
  transition: all 0.3s ease;
  z-index: 10;

  &:hover {
    background: linear-gradient(135deg, #218838 0%, #1e8e7a 100%);
    transform: scale(1.05);
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

const CloseLicitacionButton = styled(ActionButton)`
  background: #ffc107;
  color: #212529;

  &:hover {
    box-shadow: 0 4px 15px rgba(255, 193, 7, 0.3);
  }
`;

const AdjudicarButton = styled(ActionButton)`
  background: #28a745;
  color: white;

  &:hover {
    box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
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

const ConfirmSuccessTitle = styled.h3`
  color: #28a745;
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

const ConfirmSuccessButton = styled(ConfirmButton)`
  background: #28a745;
  color: white;

  &:hover {
    background: #218838;
  }
`;

const ConfirmYellowTitle = styled.h3`
  color: #ffc107;
  font-size: 1.3rem;
  margin-bottom: 15px;
`;

const ConfirmYellowButton = styled(ConfirmButton)`
  background: #ffc107;
  color: #212529;

  &:hover {
    background: #e0a800;
  }
`;

const CancelButton = styled(ConfirmButton)`
  background: #6c757d;
  color: white;

  &:hover {
    background: #5a6268;
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

const PropuestaCloseButton = styled(PropuestaActionButton)`
  background: #6c757d;
  color: white;

  &:hover {
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
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
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
    box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const GanadorCancelButton = styled.button`
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
  const [showConfirmFinalizar, setShowConfirmFinalizar] = useState(false);

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

  // Funciones de API consolidadas
  const apiRequest = async (url, options = {}) => {
    const defaultHeaders = { "Content-Type": "application/json" };
    if (token) defaultHeaders.Authorization = `Bearer ${token}`;

    return fetch(url, {
      headers: { ...defaultHeaders, ...options.headers },
      ...options,
    });
  };

  const handleDownloadArchivo = async (archivoID, nombreArchivo) => {
    try {
      const response = await apiRequest(
        `http://localhost:5242/api/archivos/${archivoID}/download`
      );
      if (!response.ok) throw new Error("Error al descargar el archivo");

      const blob = await response.blob();
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
      const response = await apiRequest("http://localhost:5242/api/rubros");
      if (response.ok) {
        const data = await response.json();
        setRubros(data);
      }
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
    } catch (error) {
      setError(
        "Error al cargar las licitaciones. Por favor, intente nuevamente."
      );
      toast.error("Error al cargar las licitaciones");
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

  const calcularScorePropuesta = (propuesta, criterios) => {
    if (
      !propuesta.respuestasCriterios ||
      !criterios ||
      criterios.length === 0
    ) {
      return 0;
    }

    let scoreTotal = 0;
    let pesoTotal = 0;

    criterios.forEach((criterio) => {
      const criterioID = criterio.criterioID || criterio.CriterioID;
      const respuesta = propuesta.respuestasCriterios.find(
        (r) => (r.criterioID || r.CriterioID) === criterioID
      );

      if (respuesta && respuesta.valorProveedor) {
        const peso = criterio.peso || criterio.Peso || 0;
        const valorNumerico = parseFloat(respuesta.valorProveedor);

        if (!isNaN(valorNumerico) && peso > 0) {
          const modoEvaluacion =
            criterio.modoEvaluacion || criterio.ModoEvaluacion || "MAYOR_MEJOR";

          let valorNormalizado;
          if (modoEvaluacion === "MENOR_MEJOR") {
            valorNormalizado = 100 / (1 + valorNumerico);
          } else {
            valorNormalizado = valorNumerico;
          }

          scoreTotal += valorNormalizado * peso;
          pesoTotal += peso;
        }
      }
    });

    return pesoTotal > 0 ? scoreTotal / pesoTotal : 0;
  };

  const rankearPropuestas = async (propuestas, criterios) => {
    try {
      const propuestasDetalladas = await Promise.all(
        propuestas.map(async (propuesta) => {
          try {
            const response = await apiRequest(
              `http://localhost:5242/api/propuestas/${propuesta.propuestaID}`
            );
            return response.ok ? await response.json() : propuesta;
          } catch (error) {
            console.error(
              `Error al cargar detalles de propuesta ${propuesta.propuestaID}:`,
              error
            );
            return propuesta;
          }
        })
      );

      const propuestasConScore = propuestasDetalladas.map((propuesta) => {
        const score = calcularScorePropuesta(propuesta, criterios);
        return { ...propuesta, scoreCalculado: score, scoreTotal: score };
      });

      return propuestasConScore.sort(
        (a, b) => b.scoreCalculado - a.scoreCalculado
      );
    } catch (error) {
      console.error("Error al rankear propuestas:", error);
      return propuestas;
    }
  };

  const fetchPropuestaGanadora = async (licitacionId) => {
    try {
      const response = await apiRequest(
        `http://localhost:5242/api/historial-proveedor-licitacion/licitacion/${licitacionId}/propuesta-ganadora`
      );

      if (response.ok) {
        const propuestaGanadora = await response.json();
        return [propuestaGanadora];
      } else if (response.status === 404) {
        console.warn("No se encontró ganador para esta licitación");
        return [];
      } else {
        console.error(
          "Error al cargar propuesta ganadora:",
          response.statusText
        );
        return [];
      }
    } catch (error) {
      console.error("Error al cargar propuesta ganadora:", error);
      return [];
    }
  };

  const fetchPropuestas = async (licitacionId) => {
    try {
      setLoadingPropuestas(true);
      const licitacionActual = licitaciones.find(
        (l) => (l.licitacionID || l.LicitacionID) === licitacionId
      );
      const estadoLicitacion =
        licitacionActual?.estadoNombre || licitacionActual?.EstadoNombre;

      // Si está adjudicada o cerrada, solo mostrar la propuesta ganadora
      if (estadoLicitacion === "Adjudicada" || estadoLicitacion === "Cerrada") {
        const propuestaGanadoraResponse = await apiRequest(
          `http://localhost:5242/api/historial-proveedor-licitacion/licitacion/${licitacionId}/propuesta-ganadora`
        );

        if (propuestaGanadoraResponse.ok) {
          const propuestaGanadora = await propuestaGanadoraResponse.json();
          setPropuestas([propuestaGanadora]);
        } else if (propuestaGanadoraResponse.status === 404) {
          // No hay ganador registrado aún
          setPropuestas([]);
        } else {
          console.error(
            "Error al cargar propuesta ganadora:",
            propuestaGanadoraResponse.statusText
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
          const estadosConRanking = ["En Evaluación"];

          if (estadosConRanking.includes(estadoLicitacion)) {
            const criteriosResponse = await apiRequest(
              `http://localhost:5242/api/licitaciones/${licitacionId}/criterios`
            );

            if (criteriosResponse.ok) {
              const criterios = await criteriosResponse.json();
              const propuestasRankeadas = await rankearPropuestas(
                data,
                criterios
              );
              setPropuestas(propuestasRankeadas);
            } else {
              // Si no hay criterios, ordenar por presupuesto
              const propuestasOrdenadas = data
                .sort((a, b) => {
                  const presupuestoA =
                    a.presupuestoOfrecido || a.PresupuestoOfrecido || 0;
                  const presupuestoB =
                    b.presupuestoOfrecido || b.PresupuestoOfrecido || 0;
                  return presupuestoA - presupuestoB;
                })
                .map((propuesta) => ({
                  ...propuesta,
                  scoreCalculado: 0,
                  scoreTotal: 0,
                }));
              setPropuestas(propuestasOrdenadas);
            }
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

  const handleAdjudicarLicitacion = (licitacion) => {
    setAdjudicandoLicitacion(licitacion);
    setShowConfirmAdjudicar(true);
  };

  const handleFinalizarLicitacion = (licitacion) => {
    setFinalizandoLicitacion(licitacion);
    setShowConfirmFinalizar(true);
  };

  const handleSeleccionarGanador = async (licitacion) => {
    setSeleccionandoGanador(licitacion);
    const licitacionId = licitacion.licitacionID || licitacion.LicitacionID;

    try {
      const response = await apiRequest(
        `http://localhost:5242/api/propuestas/licitacion/${licitacionId}`
      );
      if (!response.ok)
        throw new Error(`Error al cargar propuestas: ${response.status}`);

      const propuestasData = await response.json();
      const criteriosResponse = await apiRequest(
        `http://localhost:5242/api/licitaciones/${licitacionId}/criterios`
      );

      if (criteriosResponse.ok) {
        const criterios = await criteriosResponse.json();
        const propuestasRankeadas = await rankearPropuestas(
          propuestasData,
          criterios
        );
        setPropuestas(propuestasRankeadas);
        setSelectedGanador(propuestasRankeadas[0] || null);
      } else {
        const propuestasOrdenadas = propuestasData
          .sort((a, b) => {
            const presupuestoA =
              a.presupuestoOfrecido || a.PresupuestoOfrecido || 0;
            const presupuestoB =
              b.presupuestoOfrecido || b.PresupuestoOfrecido || 0;
            return presupuestoA - presupuestoB;
          })
          .map((propuesta) => ({
            ...propuesta,
            scoreTotal: 0,
            scoreCalculado: 0,
          }));

        setPropuestas(propuestasOrdenadas);
        setSelectedGanador(propuestasOrdenadas[0] || null);
      }
      setShowGanadorModal(true);
    } catch (error) {
      toast.error(`Error al cargar las propuestas: ${error.message}`);
    }
  };

  const handleSeleccionarPropuestaGanadora = (propuesta) => {
    setPropuestaGanadora(propuesta);
    setShowConfirmSeleccionarGanadora(true);
  };

  // Funciones de confirmación consolidadas
  const executeAction = async (
    action,
    licitacionId,
    successMessage,
    errorMessage
  ) => {
    try {
      const response = await apiRequest(
        `http://localhost:5242/api/licitaciones/${licitacionId}/${action}`,
        {
          method: action === "delete" ? "DELETE" : "PUT",
        }
      );

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
      "Licitación eliminada exitosamente",
      "Error al eliminar la licitación"
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

  const confirmFinalizarLicitacion = async () => {
    if (!finalizandoLicitacion) return;

    const licitacionId =
      finalizandoLicitacion.licitacionID || finalizandoLicitacion.LicitacionID;
    const success = await executeAction(
      "finalizar",
      licitacionId,
      "Licitación finalizada exitosamente",
      "Error al finalizar la licitación"
    );

    if (success) {
      setShowConfirmFinalizar(false);
      setFinalizandoLicitacion(null);
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

      // Cerrar modales y recargar
      setShowConfirmSeleccionarGanadora(false);
      setShowModal(false);
      setPropuestaGanadora(null);
      setSelectedLicitacion(null);
      await fetchLicitaciones();
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

  const cancelFinalizarLicitacion = () => {
    setShowConfirmFinalizar(false);
    setFinalizandoLicitacion(null);
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
  }, [user, token]);

  // useEffect para filtros y ordenamiento
  useEffect(() => {
    if (originalLicitaciones.length > 0) {
      const filtered = applyFiltersAndSorting(originalLicitaciones);
      setLicitaciones(filtered);
    }
  }, [filters, sortBy, sortOrder, originalLicitaciones]);

  // Datos filtrados para renderizado
  const filteredLicitaciones = licitaciones;

  // Componente principal JSX
  return (
    <Container>
      <Navbar />
      <MainContent>
        {/* Header */}
        <PageHeader>
          <PageTitle>Mis licitaciones</PageTitle>
          <PageSubtitle>
            Gestiona las licitaciones de {getCompanyName()}
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
                No tiene licitaciones creadas aún. ¡Cree su primera licitación!
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
                        <MetaValue>{formatCurrency(presupuestoMax)}</MetaValue>
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
                            selectedLicitacion.PresupuestoMaximo
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
                    {(selectedLicitacion.estadoNombre ||
                      selectedLicitacion.EstadoNombre) === "Adjudicada" ||
                    (selectedLicitacion.estadoNombre ||
                      selectedLicitacion.EstadoNombre) === "Cerrada"
                      ? `Propuesta ganadora (${
                          propuestas.length === 0 ? "sin definir" : "1"
                        })`
                      : `Propuestas recibidas (${propuestas.length})`}
                  </PropuestasTitle>

                  {loadingPropuestas ? (
                    <LoadingPropuestas>
                      <LoadingPropuestasSpinner />
                      <PropuestasText>Cargando propuestas...</PropuestasText>
                    </LoadingPropuestas>
                  ) : propuestas.length === 0 ? (
                    <EmptyPropuestas>
                      <EmptyPropuestasText>
                        {(selectedLicitacion.estadoNombre ||
                          selectedLicitacion.EstadoNombre) === "Adjudicada" ||
                        (selectedLicitacion.estadoNombre ||
                          selectedLicitacion.EstadoNombre) === "Cerrada"
                          ? "No se ha definido una propuesta ganadora aún."
                          : "No hay propuestas recibidas aún."}
                      </EmptyPropuestasText>
                    </EmptyPropuestas>
                  ) : (
                    <PropuestasList>
                      {propuestas.map((propuesta, index) => {
                        const proveedorNombre =
                          propuesta.proveedorNombre ||
                          propuesta.ProveedorNombre ||
                          "Proveedor desconocido";
                        const presupuesto =
                          propuesta.presupuestoOfrecido ||
                          propuesta.PresupuestoOfrecido;
                        const fechaEnvio =
                          propuesta.fechaEnvio || propuesta.FechaEnvio;
                        const estado =
                          propuesta.estado || propuesta.Estado || "Enviada";
                        const score =
                          propuesta.scoreCalculado || propuesta.scoreTotal || 0;
                        const esAdjudicada =
                          (selectedLicitacion.estadoNombre ||
                            selectedLicitacion.EstadoNombre) === "Adjudicada" ||
                          (selectedLicitacion.estadoNombre ||
                            selectedLicitacion.EstadoNombre) === "Cerrada";

                        return (
                          <PropuestaCard
                            key={propuesta.propuestaID || propuesta.PropuestaID}
                            onClick={() => handlePropuestaClick(propuesta)}
                            style={
                              esAdjudicada
                                ? {
                                    background:
                                      "linear-gradient(135deg, #f8fff8 0%, #e8f5e8 100%)",
                                    border: "2px solid #28a745",
                                    boxShadow:
                                      "0 4px 15px rgba(40, 167, 69, 0.2)",
                                  }
                                : {}
                            }
                          >
                            {/* Botón para seleccionar como ganadora - solo en estado "En Evaluación" */}
                            {(selectedLicitacion.estadoNombre ||
                              selectedLicitacion.EstadoNombre) ===
                              "En Evaluación" && (
                              <SeleccionarGanadoraButton
                                className="seleccionar-ganadora-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSeleccionarPropuestaGanadora(propuesta);
                                }}
                              >
                                🏆 Seleccionar ganadora
                              </SeleccionarGanadoraButton>
                            )}

                            <PropuestaHeader>
                              <PropuestaHeaderLeft>
                                {esAdjudicada ? (
                                  <PropuestaRankingBadge
                                    position={1}
                                    style={{
                                      background:
                                        "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
                                      color: "white",
                                      borderColor: "#28a745",
                                    }}
                                  >
                                    👑 GANADORA
                                  </PropuestaRankingBadge>
                                ) : (
                                  <PropuestaRankingBadge position={index + 1}>
                                    #{index + 1}
                                  </PropuestaRankingBadge>
                                )}
                                {score > 0 && (
                                  <PropuestaScore>
                                    ⭐ {score.toFixed(1)}
                                  </PropuestaScore>
                                )}
                                <PropuestaProveedor>
                                  {proveedorNombre}
                                </PropuestaProveedor>
                              </PropuestaHeaderLeft>
                              <PropuestaEstado
                                status={esAdjudicada ? "Adjudicada" : estado}
                              >
                                {esAdjudicada ? "Adjudicada" : estado}
                              </PropuestaEstado>
                            </PropuestaHeader>

                            <PropuestaInfo>
                              <PropuestaInfoItem>
                                <PropuestaInfoLabel>
                                  Presupuesto
                                </PropuestaInfoLabel>
                                <PropuestaInfoValue>
                                  {formatCurrency(presupuesto)}
                                </PropuestaInfoValue>
                              </PropuestaInfoItem>
                              <PropuestaInfoItem>
                                <PropuestaInfoLabel>
                                  Fecha de envío
                                </PropuestaInfoLabel>
                                <PropuestaInfoValue>
                                  {formatDate(fechaEnvio)}
                                </PropuestaInfoValue>
                              </PropuestaInfoItem>
                              {esAdjudicada && propuesta.HistorialGanador && (
                                <PropuestaInfoItem>
                                  <PropuestaInfoLabel>
                                    Fecha de adjudicación
                                  </PropuestaInfoLabel>
                                  <PropuestaInfoValue>
                                    {formatDate(
                                      propuesta.HistorialGanador
                                        .FechaParticipacion
                                    )}
                                  </PropuestaInfoValue>
                                </PropuestaInfoItem>
                              )}
                            </PropuestaInfo>
                          </PropuestaCard>
                        );
                      })}
                    </PropuestasList>
                  )}
                </PropuestasSection>
              </ModalBody>

              {/* Acciones del modal */}
              <ModalActions>
                {!["Cerrada", "Adjudicada"].includes(
                  selectedLicitacion.estadoNombre ||
                    selectedLicitacion.EstadoNombre
                ) && (
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
                )}

                {(selectedLicitacion.estadoNombre ||
                  selectedLicitacion.EstadoNombre) === "Publicada" && (
                  <CloseLicitacionButton
                    onClick={() => handleCloseLicitacion(selectedLicitacion)}
                  >
                    ⏰ Pasar a evaluación
                  </CloseLicitacionButton>
                )}

                {(selectedLicitacion.estadoNombre ||
                  selectedLicitacion.EstadoNombre) === "Adjudicada" && (
                  <CloseLicitacionButton
                    onClick={() =>
                      handleFinalizarLicitacion(selectedLicitacion)
                    }
                  >
                    🏁 Finalizar Licitación
                  </CloseLicitacionButton>
                )}

                {!["Cerrada", "Adjudicada"].includes(
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

        {/* Modales de confirmación */}
        {showConfirmDelete && (
          <ConfirmModal>
            <ConfirmContent>
              <ConfirmTitle>⚠️ Confirmar eliminación</ConfirmTitle>
              <ConfirmText>
                ¿Estás seguro de que deseas eliminar la licitación "
                {deletingLicitacion?.titulo || deletingLicitacion?.Titulo}"?
                Esta acción no se puede deshacer.
              </ConfirmText>
              <ConfirmActions>
                <ConfirmDeleteButton onClick={confirmDeleteLicitacion}>
                  Eliminar
                </ConfirmDeleteButton>
                <CancelButton onClick={cancelDeleteLicitacion}>
                  Cancelar
                </CancelButton>
              </ConfirmActions>
            </ConfirmContent>
          </ConfirmModal>
        )}

        {showConfirmClose && (
          <ConfirmModal>
            <ConfirmContent>
              <ConfirmTitle>⏰ Confirmar paso a evaluación</ConfirmTitle>
              <ConfirmText>
                ¿Deseas cerrar la licitación "
                {closingLicitacion?.titulo || closingLicitacion?.Titulo}" y
                pasarla a evaluación?
              </ConfirmText>
              <ConfirmActions>
                <ConfirmDeleteButton onClick={confirmCloseLicitacion}>
                  Pasar a evaluación
                </ConfirmDeleteButton>
                <CancelButton onClick={cancelCloseLicitacion}>
                  Cancelar
                </CancelButton>
              </ConfirmActions>
            </ConfirmContent>
          </ConfirmModal>
        )}

        {showConfirmAdjudicar && (
          <ConfirmModal>
            <ConfirmContent>
              <ConfirmTitle>✅ Confirmar adjudicación</ConfirmTitle>
              <ConfirmText>
                ¿Deseas marcar la licitación "
                {adjudicandoLicitacion?.titulo || adjudicandoLicitacion?.Titulo}
                " como adjudicada?
              </ConfirmText>
              <ConfirmActions>
                <ConfirmDeleteButton onClick={confirmAdjudicarLicitacion}>
                  Adjudicar
                </ConfirmDeleteButton>
                <CancelButton onClick={cancelAdjudicarLicitacion}>
                  Cancelar
                </CancelButton>
              </ConfirmActions>
            </ConfirmContent>
          </ConfirmModal>
        )}

        {showConfirmFinalizar && (
          <ConfirmModal>
            <ConfirmContent>
              <ConfirmYellowTitle>🏁 Confirmar finalización</ConfirmYellowTitle>
              <ConfirmText>
                ¿Deseas finalizar la licitación "
                {finalizandoLicitacion?.titulo || finalizandoLicitacion?.Titulo}
                " y marcarla como cerrada?
              </ConfirmText>
              <ConfirmActions>
                <ConfirmYellowButton onClick={confirmFinalizarLicitacion}>
                  Finalizar
                </ConfirmYellowButton>
                <CancelButton onClick={cancelFinalizarLicitacion}>
                  Cancelar
                </CancelButton>
              </ConfirmActions>
            </ConfirmContent>
          </ConfirmModal>
        )}

        {/* Modal de confirmación para seleccionar propuesta ganadora */}
        {showConfirmSeleccionarGanadora && (
          <ConfirmModal>
            <ConfirmContent>
              <ConfirmSuccessTitle>
                🏆 Confirmar selección de ganadora
              </ConfirmSuccessTitle>
              <ConfirmText>
                ¿Deseas seleccionar la propuesta de "
                {propuestaGanadora?.proveedorNombre ||
                  propuestaGanadora?.ProveedorNombre}
                " como ganadora? La licitación pasará a estado "Adjudicada".
              </ConfirmText>
              <ConfirmActions>
                <ConfirmSuccessButton
                  onClick={confirmSeleccionarPropuestaGanadora}
                >
                  Seleccionar ganadora
                </ConfirmSuccessButton>
                <CancelButton onClick={cancelSeleccionarPropuestaGanadora}>
                  Cancelar
                </CancelButton>
              </ConfirmActions>
            </ConfirmContent>
          </ConfirmModal>
        )}

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
                  Selecciona la propuesta ganadora de la licitación. Las
                  propuestas están ordenadas por puntuación.
                </GanadorInstruccion>

                <GanadorPropuestasList>
                  {propuestas.map((propuesta, index) => (
                    <GanadorPropuestaItem
                      key={propuesta.propuestaID || propuesta.PropuestaID}
                      selected={
                        selectedGanador &&
                        (selectedGanador.propuestaID ||
                          selectedGanador.PropuestaID) ===
                          (propuesta.propuestaID || propuesta.PropuestaID)
                      }
                      onClick={() => setSelectedGanador(propuesta)}
                    >
                      <GanadorPropuestaHeader>
                        <GanadorProveedorNombre>
                          {propuesta.proveedorNombre ||
                            propuesta.ProveedorNombre}
                        </GanadorProveedorNombre>
                        <GanadorPropuestaRanking position={index + 1}>
                          Puesto #{index + 1}
                        </GanadorPropuestaRanking>
                      </GanadorPropuestaHeader>

                      <GanadorPropuestaInfo>
                        <div>
                          <strong>Presupuesto:</strong>{" "}
                          {formatCurrency(
                            propuesta.presupuestoOfrecido ||
                              propuesta.PresupuestoOfrecido
                          )}
                        </div>
                        <div>
                          <strong>Puntuación:</strong>{" "}
                          {(
                            propuesta.scoreCalculado ||
                            propuesta.scoreTotal ||
                            0
                          ).toFixed(1)}
                        </div>
                      </GanadorPropuestaInfo>
                    </GanadorPropuestaItem>
                  ))}
                </GanadorPropuestasList>
              </GanadorModalBody>

              <GanadorModalActions>
                <GanadorConfirmButton
                  onClick={confirmSeleccionarGanador}
                  disabled={!selectedGanador}
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
                            selectedPropuesta.PresupuestoOfrecido
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
                                  {respuesta.valorProveedor ||
                                    "No especificado"}
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
