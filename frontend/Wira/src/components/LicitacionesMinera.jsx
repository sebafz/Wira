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

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
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
  text-align: center;
`;

const PropuestaStatusIcon = styled.div`
  font-size: 1.5rem;
  margin-bottom: 8px;
`;

const PropuestaStatusLabel = styled.div`
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 5px;
`;

const PropuestaStatusValue = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: #28a745;
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

  // Estado para el modal de confirmación de cierre
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [closingLicitacion, setClosingLicitacion] = useState(null);

  // Estado para el modal de confirmación de adjudicación
  const [showConfirmAdjudicar, setShowConfirmAdjudicar] = useState(false);
  const [adjudicandoLicitacion, setAdjudicandoLicitacion] = useState(null);

  // Estado para el modal de selección de ganador
  const [showGanadorModal, setShowGanadorModal] = useState(false);
  const [seleccionandoGanador, setSeleccionandoGanador] = useState(null);
  const [selectedGanador, setSelectedGanador] = useState(null);

  // Estados para propuestas
  const [propuestas, setPropuestas] = useState([]);
  const [loadingPropuestas, setLoadingPropuestas] = useState(false);
  const [selectedPropuesta, setSelectedPropuesta] = useState(null);
  const [showPropuestaModal, setShowPropuestaModal] = useState(false);

  // Estado para contar propuestas por licitación
  const [propuestasCount, setPropuestasCount] = useState({});

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

  // Función para descargar archivos
  const handleDownloadArchivo = async (ArchivoID, nombreArchivo) => {
    try {
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
      link.download = nombreArchivo;
      document.body.appendChild(link);

      // Ejecutar descarga
      link.click();

      // Limpiar
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al descargar archivo:", error);
      toast.error("Error al descargar el archivo");
    }
  };

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

      // Obtener conteo de propuestas para cada licitación
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

  const fetchPropuestasCount = async (licitacionesList) => {
    try {
      const countPromises = licitacionesList.map(async (licitacion) => {
        const licitacionId = licitacion.licitacionID || licitacion.LicitacionID;
        try {
          const response = await fetch(
            `http://localhost:5242/api/propuestas/licitacion/${licitacionId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
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
      // Error silencioso para conteo de propuestas
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
      // Error silencioso para rubros
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
      // Cargar propuestas para esta licitación
      fetchPropuestas(licitacionId);
      // Cargar archivos adjuntos para esta licitación
      fetchArchivosLicitacion(licitacionId);
    }
  };

  // Función para obtener archivos adjuntos de una licitación
  const fetchArchivosLicitacion = async (licitacionId) => {
    try {
      const response = await fetch(
        `http://localhost:5242/api/archivos/entidad/LICITACION/${licitacionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const archivos = await response.json();
        console.log("Archivos de licitación encontrados:", archivos);

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
      } else {
        console.log(
          "No se encontraron archivos para la licitación:",
          licitacionId
        );
      }
    } catch (error) {
      console.error("Error al cargar archivos de licitación:", error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedLicitacion(null);
    setPropuestas([]);
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

  const handleCloseLicitacion = (licitacion) => {
    setClosingLicitacion(licitacion);
    setShowConfirmClose(true);
  };

  const handleAdjudicarLicitacion = (licitacion) => {
    setAdjudicandoLicitacion(licitacion);
    setShowConfirmAdjudicar(true);
  };

  const handleSeleccionarGanador = async (licitacion) => {
    setSeleccionandoGanador(licitacion);

    // Cargar las propuestas para mostrar la selección
    const licitacionId = licitacion.licitacionID || licitacion.LicitacionID;

    try {
      const response = await fetch(
        `http://localhost:5242/api/propuestas/licitacion/${licitacionId}`
      );

      if (response.ok) {
        const propuestasData = await response.json();

        // Rankear las propuestas si hay criterios
        const criteriosResponse = await fetch(
          `http://localhost:5242/api/licitaciones/${licitacionId}/criterios`
        );

        if (criteriosResponse.ok) {
          const criterios = await criteriosResponse.json();

          const propuestasRankeadas = await rankearPropuestas(
            propuestasData,
            criterios
          );

          // Seleccionar el primero del ranking por defecto
          if (propuestasRankeadas.length > 0) {
            setSelectedGanador(propuestasRankeadas[0]);
          }

          setPropuestas(propuestasRankeadas);
        } else {
          // Ordenar por presupuesto (menor a mayor) y asignar scoreTotal como presupuesto
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
              scoreTotal: 0, // Sin criterios, no hay score real
              scoreCalculado: 0, // Sin criterios, no hay score real
            }));

          setPropuestas(propuestasOrdenadas);
          if (propuestasOrdenadas.length > 0) {
            setSelectedGanador(propuestasOrdenadas[0]);
          }
        }
      } else {
        const errorText = await response.text();
        throw new Error(
          `Error al cargar propuestas: ${response.status} - ${errorText}`
        );
      }
    } catch (error) {
      toast.error(`Error al cargar las propuestas: ${error.message}`);
      return;
    }

    setShowGanadorModal(true);
  };

  const confirmAdjudicarLicitacion = async () => {
    if (!adjudicandoLicitacion) return;

    try {
      const licitacionId =
        adjudicandoLicitacion.licitacionID ||
        adjudicandoLicitacion.LicitacionID;

      const response = await fetch(
        `http://localhost:5242/api/licitaciones/${licitacionId}/adjudicar`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      toast.success("Licitación marcada como adjudicada exitosamente");

      // Cerrar modales
      setShowConfirmAdjudicar(false);
      setShowModal(false);
      setAdjudicandoLicitacion(null);
      setSelectedLicitacion(null);

      // Recargar las licitaciones
      await fetchLicitaciones();
    } catch (error) {
      toast.error(
        "Error al adjudicar la licitación. Por favor, intente nuevamente."
      );
    }
  };

  const cancelAdjudicarLicitacion = () => {
    setShowConfirmAdjudicar(false);
    setAdjudicandoLicitacion(null);
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

      // Crear registro en el historial
      const historialData = {
        ProveedorID: proveedorId,
        LicitacionID: licitacionId,
        Resultado: "GANADOR",
        Ganador: true,
        Observaciones: "Seleccionado como ganador de la licitación",
      };

      const historialResponse = await fetch(
        "http://localhost:5242/api/historial-proveedor-licitacion",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(historialData),
        }
      );

      if (!historialResponse.ok) {
        const errorText = await historialResponse.text();
        throw new Error(
          `Error al registrar el historial: ${historialResponse.status} - ${errorText}`
        );
      }

      let historialResult;
      try {
        historialResult = await historialResponse.json();
      } catch (jsonError) {
        historialResult = { success: true };
      }

      // Cambiar el estado de la licitación a "Cerrada"
      const licitacionResponse = await fetch(
        `http://localhost:5242/api/licitaciones/${licitacionId}/cerrar`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!licitacionResponse.ok) {
        const errorText = await licitacionResponse.text();
        throw new Error(
          `Error al actualizar el estado de la licitación: ${licitacionResponse.status} - ${errorText}`
        );
      }

      let estadoResult;
      try {
        estadoResult = await licitacionResponse.json();
      } catch (jsonError) {
        estadoResult = { success: true };
      }

      toast.success("Ganador seleccionado y licitación cerrada exitosamente");

      // Cerrar modales
      setShowGanadorModal(false);
      setShowModal(false);
      setSeleccionandoGanador(null);
      setSelectedGanador(null);
      setSelectedLicitacion(null);

      // Recargar las licitaciones
      await fetchLicitaciones();
    } catch (error) {
      toast.error(`Error al seleccionar el ganador: ${error.message}`);
    }
  };

  const cancelSeleccionarGanador = () => {
    setShowGanadorModal(false);
    setSeleccionandoGanador(null);
    setSelectedGanador(null);
    setPropuestas([]);
  };

  const confirmCloseLicitacion = async () => {
    if (!closingLicitacion) return;

    try {
      const licitacionId =
        closingLicitacion.licitacionID || closingLicitacion.LicitacionID;

      const response = await fetch(
        `http://localhost:5242/api/licitaciones/${licitacionId}/cerrar`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      toast.success("Licitación cerrada y pasada a evaluación exitosamente");

      // Cerrar modales
      setShowConfirmClose(false);
      setShowModal(false);
      setClosingLicitacion(null);
      setSelectedLicitacion(null);

      // Recargar las licitaciones
      await fetchLicitaciones();
    } catch (error) {
      console.error("Error al cerrar licitación:", error);
      toast.error(
        "Error al cerrar la licitación. Por favor, intente nuevamente."
      );
    }
  };

  const cancelCloseLicitacion = () => {
    setShowConfirmClose(false);
    setClosingLicitacion(null);
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

  const fetchPropuestas = async (licitacionId) => {
    try {
      setLoadingPropuestas(true);
      const response = await fetch(
        `http://localhost:5242/api/propuestas/licitacion/${licitacionId}`
      );

      if (response.ok) {
        const data = await response.json();

        // Obtener el estado de la licitación para decidir si rankear
        const licitacionActual = licitaciones.find(
          (l) => (l.licitacionID || l.LicitacionID) === licitacionId
        );

        const estadoLicitacion =
          licitacionActual?.estadoNombre || licitacionActual?.EstadoNombre;

        // Si la licitación está cerrada, obtener solo la propuesta ganadora
        if (estadoLicitacion === "Cerrada") {
          const propuestaGanadora = await fetchPropuestaGanadora(licitacionId);
          setPropuestas(propuestaGanadora);
          return;
        }

        // Estados que requieren ranking (excluyendo "Cerrada" ya que se maneja arriba)
        const estadosConRanking = ["En Evaluación", "Adjudicada"];

        if (estadosConRanking.includes(estadoLicitacion)) {
          // Cargar criterios de la licitación para el ranking
          const criteriosResponse = await fetch(
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
            // Si no hay criterios, ordenar por presupuesto y asignar scores
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
          // Para otros estados, mantener orden de creación
          setPropuestas(data);
        }
      } else {
        console.error("Error al cargar propuestas:", response.statusText);
        setPropuestas([]);
      }
    } catch (error) {
      console.error("Error al cargar propuestas:", error);
      setPropuestas([]);
    } finally {
      setLoadingPropuestas(false);
    }
  };

  const rankearPropuestas = async (propuestas, criterios) => {
    try {
      // Cargar detalles completos de cada propuesta con criterios
      const propuestasDetalladas = await Promise.all(
        propuestas.map(async (propuesta) => {
          try {
            const response = await fetch(
              `http://localhost:5242/api/propuestas/${propuesta.propuestaID}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (response.ok) {
              const detalles = await response.json();
              return detalles;
            }
            return propuesta;
          } catch (error) {
            console.error(
              `Error al cargar detalles de propuesta ${propuesta.propuestaID}:`,
              error
            );
            return propuesta;
          }
        })
      );

      // Calcular score para cada propuesta
      const propuestasConScore = propuestasDetalladas.map((propuesta) => {
        const score = calcularScorePropuesta(propuesta, criterios);
        return {
          ...propuesta,
          scoreCalculado: score,
          scoreTotal: score, // Para compatibilidad con el modal
        };
      });

      // Ordenar por score descendente (mayor score primero)
      return propuestasConScore.sort(
        (a, b) => b.scoreCalculado - a.scoreCalculado
      );
    } catch (error) {
      console.error("Error al rankear propuestas:", error);
      return propuestas;
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
    let criteriosEvaluados = 0;

    // Primero, obtener todos los valores para normalización
    const valoresPorCriterio = {};

    criterios.forEach((criterio) => {
      const criterioID = criterio.criterioID || criterio.CriterioID;
      valoresPorCriterio[criterioID] = [];
    });

    // Recopilar todos los valores de todas las propuestas para cada criterio
    // (esto se haría idealmente en el backend, pero por ahora usaremos una aproximación)

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
            // Para criterios donde menor es mejor (ej: precio, tiempo)
            // Usar una función inversa suave
            valorNormalizado = 100 / (1 + valorNumerico);
          } else {
            // Para criterios donde mayor es mejor (ej: calidad, experiencia)
            // Usar el valor directamente, escalado
            valorNormalizado = valorNumerico;
          }

          scoreTotal += valorNormalizado * peso;
          pesoTotal += peso;
          criteriosEvaluados++;
        }
      }
    });

    // Retornar score promedio ponderado
    if (pesoTotal > 0) {
      const scoreFinal = scoreTotal / pesoTotal;

      // Debug logging (remover en producción)
      console.log(
        `Score calculado para propuesta ${
          propuesta.propuestaID
        }: ${scoreFinal.toFixed(2)} (${criteriosEvaluados} criterios evaluados)`
      );

      return scoreFinal;
    }

    return 0;
  };

  const handlePropuestaClick = async (propuesta) => {
    try {
      // Primero mostrar la propuesta básica
      setSelectedPropuesta(propuesta);
      setShowPropuestaModal(true);

      // Luego cargar los detalles completos incluyendo criterios
      const response = await fetch(
        `http://localhost:5242/api/propuestas/${propuesta.propuestaID}`,
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
    } catch (error) {
      console.error("Error al cargar detalles de la propuesta:", error);
    }
  };

  const handleClosePropuestaModal = () => {
    setShowPropuestaModal(false);
    setSelectedPropuesta(null);
  };

  const handleModalOverlayClickPropuesta = (e) => {
    if (e.target === e.currentTarget) {
      handleClosePropuestaModal();
    }
  };

  // Función simplificada para depurar
  const confirmSeleccionarGanadorSimple = async () => {
    console.log("=== INICIANDO SELECCIÓN DE GANADOR SIMPLE ===");

    if (!seleccionandoGanador || !selectedGanador) {
      console.error("Error: No hay licitación o ganador seleccionado");
      toast.error("Error: No hay licitación o ganador seleccionado");
      return;
    }

    const licitacionId =
      seleccionandoGanador.licitacionID || seleccionandoGanador.LicitacionID;
    const proveedorId =
      selectedGanador.proveedorID || selectedGanador.ProveedorID;

    console.log("IDs a utilizar:", { licitacionId, proveedorId });

    try {
      // Solo cambiar el estado de la licitación
      console.log("=== PASO 1: Cambiar estado de licitación ===");
      const licitacionResponse = await fetch(
        `http://localhost:5242/api/licitaciones/${licitacionId}/cerrar`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Respuesta cambio estado:", {
        status: licitacionResponse.status,
        ok: licitacionResponse.ok,
        statusText: licitacionResponse.statusText,
      });

      if (!licitacionResponse.ok) {
        const errorText = await licitacionResponse.text();
        console.error("Error en cambio de estado:", errorText);
        throw new Error(
          `Error al cambiar estado: ${licitacionResponse.status} - ${errorText}`
        );
      }

      console.log("=== PASO 2: Crear historial ===");
      // Crear registro en el historial
      const historialData = {
        ProveedorID: proveedorId,
        LicitacionID: licitacionId,
        Resultado: "GANADOR",
        Ganador: true,
        Observaciones: "Seleccionado como ganador de la licitación",
      };

      console.log("Datos historial:", historialData);

      const historialResponse = await fetch(
        "http://localhost:5242/api/historial-proveedor-licitacion",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(historialData),
        }
      );

      console.log("Respuesta historial:", {
        status: historialResponse.status,
        ok: historialResponse.ok,
        statusText: historialResponse.statusText,
      });

      if (!historialResponse.ok) {
        const errorText = await historialResponse.text();
        console.error("Error en historial:", errorText);
        throw new Error(
          `Error al crear historial: ${historialResponse.status} - ${errorText}`
        );
      }

      console.log("=== ÉXITO: Ambas operaciones completadas ===");
      toast.success("Ganador seleccionado exitosamente");

      // Cerrar modales
      setShowGanadorModal(false);
      setShowModal(false);
      setSeleccionandoGanador(null);
      setSelectedGanador(null);
      setSelectedLicitacion(null);

      // Recargar las licitaciones
      await fetchLicitaciones();
    } catch (error) {
      console.error("=== ERROR EN SELECCIÓN DE GANADOR ===");
      console.error("Error:", error);
      console.error("Stack:", error.stack);
      toast.error(`Error: ${error.message}`);
    }
  };

  // Función para obtener la propuesta ganadora desde el historial
  const fetchPropuestaGanadora = async (licitacionId) => {
    try {
      const response = await fetch(
        `http://localhost:5242/api/historial-proveedor-licitacion/licitacion/${licitacionId}/propuesta-ganadora`
      );

      if (response.ok) {
        const propuestaGanadora = await response.json();
        // Retornamos un array con la propuesta ganadora para mantener consistencia
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
                    <LicitacionStatusContainer>
                      <LicitacionStatus
                        status={
                          licitacion.estadoNombre || licitacion.EstadoNombre
                        }
                      >
                        {licitacion.estadoNombre || licitacion.EstadoNombre}
                      </LicitacionStatus>
                      <PropuestasCountBadge>
                        <PropuestasCountIcon>📄</PropuestasCountIcon>
                        {propuestasCount[
                          licitacion.licitacionID || licitacion.LicitacionID
                        ] || 0}{" "}
                        propuestas
                      </PropuestasCountBadge>
                    </LicitacionStatusContainer>
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
                    {(licitacion.proyectoMineroNombre ||
                      licitacion.ProyectoMineroNombre) && (
                      <MetaItem>
                        <MetaLabel>Proyecto Minero</MetaLabel>
                        <MetaValue>
                          {licitacion.proyectoMineroNombre ||
                            licitacion.ProyectoMineroNombre}
                        </MetaValue>
                      </MetaItem>
                    )}
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
                <SectionTitle>Información general</SectionTitle>

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

                {/* Tercera fila - Presupuesto y Proyecto Minero */}
                <InfoGrid
                  style={{
                    gridTemplateColumns:
                      selectedLicitacion.proyectoMineroNombre ||
                      selectedLicitacion.ProyectoMineroNombre
                        ? "1fr 1fr"
                        : "1fr",
                    marginTop: "15px",
                  }}
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

                  {(selectedLicitacion.proyectoMineroNombre ||
                    selectedLicitacion.ProyectoMineroNombre) && (
                    <ProjectCard>
                      <ProjectLabel>Proyecto Minero</ProjectLabel>
                      <ProjectValue>
                        {selectedLicitacion.proyectoMineroNombre ||
                          selectedLicitacion.ProyectoMineroNombre}
                      </ProjectValue>
                    </ProjectCard>
                  )}
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

              <DetailSection>
                <SectionTitle>Propuestas</SectionTitle>
                <PropuestasSection>
                  {loadingPropuestas ? (
                    <LoadingPropuestas>
                      <LoadingPropuestasSpinner />
                      <span>
                        Cargando propuestas
                        {(() => {
                          const licitacionEstado =
                            selectedLicitacion?.estadoNombre ||
                            selectedLicitacion?.EstadoNombre;
                          if (licitacionEstado === "Cerrada") {
                            return " y obteniendo ganador...";
                          }
                          const estadosConRanking = [
                            "En Evaluación",
                            "Adjudicada",
                          ];
                          return estadosConRanking.includes(licitacionEstado)
                            ? " y calculando rankings..."
                            : "...";
                        })()}
                      </span>
                    </LoadingPropuestas>
                  ) : propuestas.length === 0 ? (
                    <EmptyPropuestas>
                      <EmptyPropuestasIcon>📋</EmptyPropuestasIcon>
                      <EmptyPropuestasText>
                        No hay propuestas enviadas para esta licitación.
                      </EmptyPropuestasText>
                    </EmptyPropuestas>
                  ) : (
                    <>
                      {(() => {
                        const licitacionEstado =
                          selectedLicitacion?.estadoNombre ||
                          selectedLicitacion?.EstadoNombre;

                        // Si está cerrada, mostrar solo el ganador
                        if (licitacionEstado === "Cerrada") {
                          const propuestaGanadora = propuestas[0]; // Por ahora tomamos la primera como ganadora

                          return (
                            <>
                              <PropuestasTitle>
                                Ganador de la licitación
                              </PropuestasTitle>
                              {propuestaGanadora && (
                                <PropuestasList>
                                  <PropuestaCard
                                    key={propuestaGanadora.propuestaID}
                                    onClick={() =>
                                      handlePropuestaClick(propuestaGanadora)
                                    }
                                    style={{
                                      border: "2px solid #28a745",
                                      backgroundColor: "#f8fff9",
                                    }}
                                  >
                                    <PropuestaHeader>
                                      <PropuestaHeaderLeft>
                                        <PropuestaRankingBadge
                                          position={1}
                                          style={{
                                            backgroundColor: "#28a745",
                                            color: "white",
                                          }}
                                        >
                                          🏆 GANADOR
                                        </PropuestaRankingBadge>
                                        <PropuestaProveedor>
                                          {propuestaGanadora.proveedorNombre}
                                        </PropuestaProveedor>
                                      </PropuestaHeaderLeft>
                                    </PropuestaHeader>
                                    <PropuestaInfo>
                                      <PropuestaInfoItem>
                                        <PropuestaInfoLabel>
                                          Fecha de envío
                                        </PropuestaInfoLabel>
                                        <PropuestaInfoValue>
                                          {formatDate(
                                            propuestaGanadora.fechaEnvio
                                          )}
                                        </PropuestaInfoValue>
                                      </PropuestaInfoItem>
                                      <PropuestaInfoItem>
                                        <PropuestaInfoLabel>
                                          Monto ofrecido
                                        </PropuestaInfoLabel>
                                        <PropuestaInfoValue>
                                          {formatCurrency(
                                            propuestaGanadora.presupuestoOfrecido
                                          )}
                                        </PropuestaInfoValue>
                                      </PropuestaInfoItem>
                                      <PropuestaInfoItem>
                                        <PropuestaInfoLabel>
                                          Fecha de entrega
                                        </PropuestaInfoLabel>
                                        <PropuestaInfoValue>
                                          {formatDate(
                                            propuestaGanadora.fechaEntrega
                                          )}
                                        </PropuestaInfoValue>
                                      </PropuestaInfoItem>
                                      {propuestaGanadora.calificacionFinal && (
                                        <PropuestaInfoItem>
                                          <PropuestaInfoLabel>
                                            Calificación
                                          </PropuestaInfoLabel>
                                          <PropuestaInfoValue>
                                            {
                                              propuestaGanadora.calificacionFinal
                                            }
                                            /10
                                          </PropuestaInfoValue>
                                        </PropuestaInfoItem>
                                      )}
                                    </PropuestaInfo>
                                  </PropuestaCard>
                                </PropuestasList>
                              )}
                            </>
                          );
                        }

                        // Para otros estados, mostrar todas las propuestas con ranking
                        const estadosConRanking = [
                          "En Evaluación",
                          "Adjudicada",
                        ];
                        const mostrarRanking =
                          estadosConRanking.includes(licitacionEstado);

                        return (
                          <>
                            <PropuestasTitle>
                              <span>📋</span>
                              {propuestas.length} propuesta
                              {propuestas.length !== 1 ? "s" : ""} recibida
                              {propuestas.length !== 1 ? "s" : ""}
                              {mostrarRanking
                                ? " (rankeadas por criterios)"
                                : ""}
                            </PropuestasTitle>
                            <PropuestasList>
                              {propuestas.map((propuesta, index) => (
                                <PropuestaCard
                                  key={propuesta.propuestaID}
                                  onClick={() =>
                                    handlePropuestaClick(propuesta)
                                  }
                                >
                                  <PropuestaHeader>
                                    <PropuestaHeaderLeft>
                                      {mostrarRanking && (
                                        <PropuestaRankingBadge
                                          position={index + 1}
                                        >
                                          {index + 1 === 1
                                            ? "🥇"
                                            : index + 1 === 2
                                            ? "🥈"
                                            : index + 1 === 3
                                            ? "🥉"
                                            : ""}
                                          #{index + 1}
                                        </PropuestaRankingBadge>
                                      )}
                                      <PropuestaProveedor>
                                        {propuesta.proveedorNombre}
                                      </PropuestaProveedor>
                                      {mostrarRanking && (
                                        <PropuestaScore>
                                          📊{" "}
                                          {propuesta.scoreCalculado !==
                                          undefined
                                            ? propuesta.scoreCalculado.toFixed(
                                                2
                                              )
                                            : propuesta.scoreTotal !== undefined
                                            ? propuesta.scoreTotal.toFixed(2)
                                            : "0.00"}
                                        </PropuestaScore>
                                      )}
                                    </PropuestaHeaderLeft>
                                  </PropuestaHeader>
                                  <PropuestaInfo>
                                    <PropuestaInfoItem>
                                      <PropuestaInfoLabel>
                                        Fecha de envío
                                      </PropuestaInfoLabel>
                                      <PropuestaInfoValue>
                                        {formatDate(propuesta.fechaEnvio)}
                                      </PropuestaInfoValue>
                                    </PropuestaInfoItem>
                                    <PropuestaInfoItem>
                                      <PropuestaInfoLabel>
                                        Monto ofrecido
                                      </PropuestaInfoLabel>
                                      <PropuestaInfoValue>
                                        {formatCurrency(
                                          propuesta.presupuestoOfrecido
                                        )}
                                      </PropuestaInfoValue>
                                    </PropuestaInfoItem>
                                    <PropuestaInfoItem>
                                      <PropuestaInfoLabel>
                                        Fecha de entrega
                                      </PropuestaInfoLabel>
                                      <PropuestaInfoValue>
                                        {formatDate(propuesta.fechaEntrega)}
                                      </PropuestaInfoValue>
                                    </PropuestaInfoItem>
                                    {propuesta.calificacionFinal && (
                                      <PropuestaInfoItem>
                                        <PropuestaInfoLabel>
                                          Calificación
                                        </PropuestaInfoLabel>
                                        <PropuestaInfoValue>
                                          {propuesta.calificacionFinal}/10
                                        </PropuestaInfoValue>
                                      </PropuestaInfoItem>
                                    )}
                                  </PropuestaInfo>
                                </PropuestaCard>
                              ))}
                            </PropuestasList>
                          </>
                        );
                      })()}
                    </>
                  )}
                </PropuestasSection>
              </DetailSection>
            </ModalBody>

            <ModalActions>
              {/* Botón Editar - Solo para estados Publicada y Borrador */}
              {(selectedLicitacion.estadoNombre === "Publicada" ||
                selectedLicitacion.EstadoNombre === "Publicada" ||
                selectedLicitacion.estadoNombre === "Borrador" ||
                selectedLicitacion.EstadoNombre === "Borrador") && (
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

              {/* Botón Cerrar - Solo para estado Publicada */}
              {(selectedLicitacion.estadoNombre === "Publicada" ||
                selectedLicitacion.EstadoNombre === "Publicada") && (
                <CloseLicitacionButton
                  onClick={() => handleCloseLicitacion(selectedLicitacion)}
                >
                  ⏸️ Cerrar
                </CloseLicitacionButton>
              )}

              {/* Botón Adjudicar - Solo para estado En Evaluación */}
              {(selectedLicitacion.estadoNombre === "En Evaluación" ||
                selectedLicitacion.EstadoNombre === "En Evaluación") && (
                <AdjudicarButton
                  onClick={() => handleAdjudicarLicitacion(selectedLicitacion)}
                >
                  🏆 Marcar como adjudicada
                </AdjudicarButton>
              )}

              {/* Botón Seleccionar Ganador - Solo para estado Adjudicada */}
              {(selectedLicitacion.estadoNombre === "Adjudicada" ||
                selectedLicitacion.EstadoNombre === "Adjudicada") && (
                <AdjudicarButton
                  onClick={() => handleSeleccionarGanador(selectedLicitacion)}
                >
                  🎯 Seleccionar ganador
                </AdjudicarButton>
              )}

              {/* Botón Eliminar - Solo para estados Publicada y Borrador */}
              {(selectedLicitacion.estadoNombre === "Publicada" ||
                selectedLicitacion.EstadoNombre === "Publicada" ||
                selectedLicitacion.estadoNombre === "Borrador" ||
                selectedLicitacion.EstadoNombre === "Borrador") && (
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

      {/* Modal de confirmación de cierre */}
      {showConfirmClose && closingLicitacion && (
        <ConfirmModal
          onClick={(e) =>
            e.target === e.currentTarget && cancelCloseLicitacion()
          }
        >
          <ConfirmContent>
            <ConfirmTitle style={{ color: "#ffc107" }}>
              ⏸️ Confirmar cierre de licitación
            </ConfirmTitle>
            <ConfirmText>
              ¿Está seguro que desea cerrar antes de tiempo la licitación
              <strong>
                {" "}
                "{closingLicitacion.titulo || closingLicitacion.Titulo}"
              </strong>
              ?
              <br />
              <br />
              La licitación pasará al estado "En evaluación" y no se podrán
              recibir más propuestas.
            </ConfirmText>
            <ConfirmActions>
              <CancelButton onClick={cancelCloseLicitacion}>
                Cancelar
              </CancelButton>
              <ConfirmDeleteButton
                onClick={confirmCloseLicitacion}
                style={{ background: "#ffc107", color: "#212529" }}
              >
                Cerrar licitación
              </ConfirmDeleteButton>
            </ConfirmActions>
          </ConfirmContent>
        </ConfirmModal>
      )}

      {/* Modal de confirmación de adjudicación */}
      {showConfirmAdjudicar && adjudicandoLicitacion && (
        <ConfirmModal
          onClick={(e) =>
            e.target === e.currentTarget && cancelAdjudicarLicitacion()
          }
        >
          <ConfirmContent>
            <ConfirmTitle style={{ color: "#28a745" }}>
              🏆 Confirmar adjudicación de licitación
            </ConfirmTitle>
            <ConfirmText>
              ¿Está seguro que desea marcar como adjudicada la licitación
              <strong>
                {" "}
                "{adjudicandoLicitacion.titulo || adjudicandoLicitacion.Titulo}"
              </strong>
              ?
              <br />
              <br />
              La licitación pasará al estado "Adjudicada" y se finalizará el
              proceso de evaluación.
            </ConfirmText>
            <ConfirmActions>
              <CancelButton onClick={cancelAdjudicarLicitacion}>
                Cancelar
              </CancelButton>
              <ConfirmDeleteButton
                onClick={confirmAdjudicarLicitacion}
                style={{ background: "#28a745", color: "white" }}
              >
                Marcar como adjudicada
              </ConfirmDeleteButton>
            </ConfirmActions>
          </ConfirmContent>
        </ConfirmModal>
      )}

      {/* Modal de selección de ganador */}
      {showGanadorModal && seleccionandoGanador && (
        <GanadorModal
          onClick={(e) =>
            e.target === e.currentTarget && cancelSeleccionarGanador()
          }
        >
          <GanadorModalContent>
            <GanadorModalHeader>
              <GanadorModalTitle>
                🎯 Seleccionar ganador de la licitación
              </GanadorModalTitle>
              <CloseButton onClick={cancelSeleccionarGanador}>×</CloseButton>
            </GanadorModalHeader>

            <GanadorModalBody>
              <GanadorInstruccion>
                Seleccione el proveedor ganador de la licitación{" "}
                <strong>
                  "{seleccionandoGanador.titulo || seleccionandoGanador.Titulo}"
                </strong>
                . Por defecto se selecciona el primero del ranking.
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
                        {propuesta.proveedorNombre || propuesta.ProveedorNombre}
                      </GanadorProveedorNombre>
                      <GanadorPropuestaRanking position={index + 1}>
                        #{index + 1}
                        {index === 0 && " (Recomendado)"}
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
                        <strong>Puntaje:</strong>{" "}
                        {propuesta.scoreCalculado
                          ? propuesta.scoreCalculado.toFixed(2)
                          : propuesta.scoreTotal
                          ? propuesta.scoreTotal.toFixed(2)
                          : "N/A"}
                      </div>
                      <div>
                        <strong>Fecha envío:</strong>{" "}
                        {formatDate(
                          propuesta.fechaEnvio || propuesta.FechaEnvio
                        )}
                      </div>
                      <div>
                        <strong>Estado:</strong>{" "}
                        {propuesta.estadoNombre || propuesta.EstadoNombre}
                      </div>
                    </GanadorPropuestaInfo>
                  </GanadorPropuestaItem>
                ))}
              </GanadorPropuestasList>
            </GanadorModalBody>

            <GanadorModalActions>
              <GanadorCancelButton onClick={cancelSeleccionarGanador}>
                Cancelar
              </GanadorCancelButton>
              <GanadorConfirmButton
                onClick={confirmSeleccionarGanadorSimple}
                disabled={!selectedGanador}
              >
                Confirmar ganador y cerrar licitación
              </GanadorConfirmButton>
            </GanadorModalActions>
          </GanadorModalContent>
        </GanadorModal>
      )}

      {/* Modal de detalle de propuesta */}
      {showPropuestaModal && selectedPropuesta && (
        <PropuestaModalOverlay onClick={handleModalOverlayClickPropuesta}>
          <PropuestaModalContent>
            <PropuestaModalHeader>
              <PropuestaModalTitle>
                Propuesta de {selectedPropuesta.proveedorNombre}
              </PropuestaModalTitle>
              <PropuestaModalSubtitle>
                Estado: {selectedPropuesta.estadoNombre} • Enviada el{" "}
                {formatDate(selectedPropuesta.fechaEnvio)}
              </PropuestaModalSubtitle>
              <CloseButton onClick={handleClosePropuestaModal}>×</CloseButton>
            </PropuestaModalHeader>

            <PropuestaModalBody>
              <PropuestaDetailSection>
                <SectionTitle>Información general</SectionTitle>
                <PropuestaDetailGrid style={{ gridTemplateColumns: "1fr 1fr" }}>
                  {/* Primera columna */}
                  <div>
                    <PropuestaInfoCard style={{ marginBottom: "15px" }}>
                      <PropuestaDetailInfoLabel>
                        Fecha de envío
                      </PropuestaDetailInfoLabel>
                      <PropuestaDetailInfoValue>
                        {formatDate(selectedPropuesta.fechaEnvio)}
                      </PropuestaDetailInfoValue>
                    </PropuestaInfoCard>
                    <PropuestaInfoCard>
                      <PropuestaDetailInfoLabel>
                        Monto ofrecido
                      </PropuestaDetailInfoLabel>
                      <PropuestaDetailInfoValue>
                        {formatCurrency(selectedPropuesta.presupuestoOfrecido)}
                      </PropuestaDetailInfoValue>
                    </PropuestaInfoCard>
                  </div>

                  {/* Segunda columna */}
                  <div>
                    <PropuestaInfoCard
                      style={{
                        borderLeftColor: "#28a745",
                        marginBottom: "15px",
                      }}
                    >
                      <PropuestaDetailInfoLabel>
                        Estado actual
                      </PropuestaDetailInfoLabel>
                      <PropuestaDetailInfoValue style={{ color: "#28a745" }}>
                        {selectedPropuesta.estadoNombre}
                      </PropuestaDetailInfoValue>
                    </PropuestaInfoCard>
                    <PropuestaInfoCard>
                      <PropuestaDetailInfoLabel>
                        Fecha de entrega
                      </PropuestaDetailInfoLabel>
                      <PropuestaDetailInfoValue>
                        {formatDate(selectedPropuesta.fechaEntrega)}
                      </PropuestaDetailInfoValue>
                    </PropuestaInfoCard>
                  </div>
                </PropuestaDetailGrid>
              </PropuestaDetailSection>

              <PropuestaDetailSection>
                <SectionTitle>Proveedor</SectionTitle>
                <PropuestaDetailGrid>
                  <PropuestaInfoCard>
                    <PropuestaDetailInfoLabel>Empresa</PropuestaDetailInfoLabel>
                    <PropuestaDetailInfoValue>
                      {selectedPropuesta.proveedorNombre}
                    </PropuestaDetailInfoValue>
                  </PropuestaInfoCard>
                  <PropuestaInfoCard>
                    <PropuestaDetailInfoLabel>
                      Cumple requisitos
                    </PropuestaDetailInfoLabel>
                    <PropuestaDetailInfoValue>
                      {selectedPropuesta.cumpleRequisitos ? "Sí" : "No"}
                    </PropuestaDetailInfoValue>
                  </PropuestaInfoCard>
                  {selectedPropuesta.calificacionFinal && (
                    <PropuestaInfoCard>
                      <PropuestaDetailInfoLabel>
                        Calificación final
                      </PropuestaDetailInfoLabel>
                      <PropuestaDetailInfoValue>
                        {selectedPropuesta.calificacionFinal}/10
                      </PropuestaDetailInfoValue>
                    </PropuestaInfoCard>
                  )}
                </PropuestaDetailGrid>
              </PropuestaDetailSection>

              {selectedPropuesta.descripcion && (
                <PropuestaDetailSection>
                  <SectionTitle>Descripción de la propuesta</SectionTitle>
                  <PropuestaDescription>
                    {selectedPropuesta.descripcion}
                  </PropuestaDescription>
                </PropuestaDetailSection>
              )}

              {/* Criterios de evaluación */}
              {(() => {
                const respuestasCriterios =
                  selectedPropuesta.respuestasCriterios ||
                  selectedPropuesta.RespuestasCriterios;
                return respuestasCriterios && respuestasCriterios.length > 0 ? (
                  <PropuestaDetailSection>
                    <SectionTitle>Criterios de evaluación</SectionTitle>
                    <PropuestaCriteriosSection>
                      {respuestasCriterios.map((respuesta, index) => (
                        <PropuestaCriterioItem key={index}>
                          <PropuestaCriterioName>
                            {respuesta.criterioNombre ||
                              respuesta.CriterioNombre ||
                              "Criterio"}
                          </PropuestaCriterioName>

                          {(respuesta.criterioDescripcion ||
                            respuesta.CriterioDescripcion) && (
                            <PropuestaCriterioDescription>
                              {respuesta.criterioDescripcion ||
                                respuesta.CriterioDescripcion}
                            </PropuestaCriterioDescription>
                          )}

                          <PropuestaDetailInfoLabel>
                            Valor ofrecido
                          </PropuestaDetailInfoLabel>
                          <PropuestaCriterioValue>
                            {respuesta.valorProveedor ||
                              respuesta.ValorProveedor ||
                              "No especificado"}
                          </PropuestaCriterioValue>
                        </PropuestaCriterioItem>
                      ))}
                    </PropuestaCriteriosSection>
                  </PropuestaDetailSection>
                ) : null;
              })()}

              {selectedPropuesta.archivosAdjuntos &&
                selectedPropuesta.archivosAdjuntos.length > 0 && (
                  <PropuestaDetailSection>
                    <SectionTitle>Archivos adjuntos</SectionTitle>
                    <PropuestaArchivos>
                      {selectedPropuesta.archivosAdjuntos.map(
                        (archivo, index) => (
                          <ArchivoItem key={index}>
                            <ArchivoIcon>📎</ArchivoIcon>
                            <ArchivoName
                              onClick={() =>
                                handleDownloadArchivo(
                                  archivo.archivoID || archivo.ArchivoID,
                                  archivo.nombreArchivo || archivo.NombreArchivo
                                )
                              }
                            >
                              {archivo.nombreArchivo || archivo.NombreArchivo}
                            </ArchivoName>
                          </ArchivoItem>
                        )
                      )}
                    </PropuestaArchivos>
                  </PropuestaDetailSection>
                )}
            </PropuestaModalBody>

            <PropuestaActions>
              <PropuestaCloseButton onClick={handleClosePropuestaModal}>
                Cerrar
              </PropuestaCloseButton>
            </PropuestaActions>
          </PropuestaModalContent>
        </PropuestaModalOverlay>
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
