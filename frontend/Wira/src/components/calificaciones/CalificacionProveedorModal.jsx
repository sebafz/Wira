import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import DialogModal from "../shared/DialogModal";

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  color: #0f172a;
`;

const DetailCard = styled.div`
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 14px 16px;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const DetailLabel = styled.span`
  font-size: 0.8rem;
  font-weight: 600;
  color: #475569;
  letter-spacing: 0.05em;
`;

const DetailValue = styled.span`
  font-size: 1rem;
  color: #0f172a;
`;

const HelperText = styled.p`
  font-size: 0.85rem;
  color: #64748b;
  margin: 0;
`;

const ErrorMessage = styled.span`
  font-size: 0.8rem;
  color: #dc2626;
  display: inline-block;
  margin-top: 4px;
`;

const RatingsSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const RatingsList = styled.div`
  display: flex;
  flex-direction: column;
`;

const RatingItem = styled.div`
  padding: 12px 0;
  border-bottom: 1px solid #e2e8f0;

  &:last-child {
    border-bottom: none;
  }
`;

const RatingHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
`;

const RatingValue = styled.span`
  font-size: 0.85rem;
  color: #94a3b8;
`;

const RatingLabel = styled.span`
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;
  letter-spacing: 0.04em;
`;

const StarsRow = styled.div`
  display: flex;
  gap: 4px;
`;

const StarButton = styled.button`
  border: none;
  background: transparent;
  font-size: 2rem;
  cursor: pointer;
  color: ${(props) => (props.$active ? "#f97316" : "#cbd5f5")};
  transition: color 0.15s ease-in-out;

  &:focus-visible {
    outline: 2px solid #94a3b8;
    outline-offset: 2px;
  }
`;

const CommentsField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const CommentsInput = styled.textarea`
  border: 1px solid #cbd5f5;
  border-radius: 10px;
  padding: 10px 14px;
  min-height: 96px;
  font-size: 0.95rem;
  resize: vertical;
`;

const CalificacionProveedorModal = ({
  isOpen,
  licitacionTitulo,
  proveedorNombre,
  fechaAdjudicacion,
  onCancel,
  onSubmit,
  isSubmitting = false,
}) => {
  const [puntualidad, setPuntualidad] = useState(0);
  const [calidad, setCalidad] = useState(0);
  const [comunicacion, setComunicacion] = useState(0);
  const [comentarios, setComentarios] = useState("");
  const [ratingErrors, setRatingErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setPuntualidad(0);
      setCalidad(0);
      setComunicacion(0);
      setComentarios("");
      setRatingErrors({});
    }
  }, [isOpen]);

  const ratingFields = useMemo(
    () => [
      {
        key: "puntualidad",
        label: "Puntualidad",
        value: puntualidad,
        setter: setPuntualidad,
        helper: "Evalúa qué tan oportuno fue el cumplimiento",
      },
      {
        key: "calidad",
        label: "Calidad",
        value: calidad,
        setter: setCalidad,
        helper: "Mide la calidad percibida del servicio o producto",
      },
      {
        key: "comunicacion",
        label: "Comunicación",
        value: comunicacion,
        setter: setComunicacion,
        helper: "Considera la claridad y tiempos de respuesta",
      },
    ],
    [puntualidad, calidad, comunicacion]
  );

  const clearRatingError = (fieldKey) => {
    setRatingErrors((prev) => {
      if (!prev[fieldKey]) {
        return prev;
      }
      const next = { ...prev };
      delete next[fieldKey];
      return next;
    });
  };

  const handleRatingChange = (fieldKey, setter, nextValue) => {
    setter(nextValue);
    clearRatingError(fieldKey);
  };

  const renderStars = (value, setter, ariaLabel, fieldKey) => {
    return [1, 2, 3, 4, 5].map((starValue) => (
      <StarButton
        type="button"
        key={`${ariaLabel}-${starValue}`}
        onClick={() => handleRatingChange(fieldKey, setter, starValue)}
        $active={starValue <= value}
        aria-label={`${ariaLabel}: ${starValue} estrellas`}
      >
        {starValue <= value ? "★" : "☆"}
      </StarButton>
    ));
  };

  const adjudicacionText = useMemo(() => {
    if (!fechaAdjudicacion) return "Sin fecha registrada";
    try {
      const date = new Date(fechaAdjudicacion);
      if (Number.isNaN(date.getTime())) {
        return "Fecha invalida";
      }
      return date.toLocaleString("es-AR", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return "Fecha invalida";
    }
  }, [fechaAdjudicacion]);

  const validateRatings = () => {
    const missing = ratingFields.reduce((acc, field) => {
      if (!field.value || field.value < 1) {
        acc[
          field.key
        ] = `Selecciona una calificacion para ${field.label.toLowerCase()}`;
      }
      return acc;
    }, {});
    setRatingErrors(missing);
    return Object.keys(missing).length === 0;
  };

  const handleConfirm = () => {
    if (!validateRatings()) {
      return;
    }
    onSubmit?.({ puntualidad, calidad, comunicacion, comentarios });
  };

  return (
    <DialogModal
      isOpen={isOpen}
      title="Calificar proveedor"
      variant="green"
      confirmText={isSubmitting ? "Guardando..." : "Registrar calificacion"}
      confirmDisabled={isSubmitting}
      onConfirm={handleConfirm}
      onCancel={onCancel}
      closeOnBackdrop={false}
    >
      <ModalContent>
        <p>
          Deja una calificacion final para el proveedor ganador. Esta accion
          marcara la licitacion como cerrada.
        </p>
        <DetailCard>
          <DetailLabel>Licitacion</DetailLabel>
          <DetailValue>{licitacionTitulo || "Sin titulo"}</DetailValue>
          <DetailLabel style={{ marginTop: "10px" }}>Proveedor</DetailLabel>
          <DetailValue>{proveedorNombre || "Sin proveedor"}</DetailValue>
          <DetailLabel style={{ marginTop: "10px" }}>
            Fecha de adjudicacion
          </DetailLabel>
          <DetailValue>{adjudicacionText}</DetailValue>
        </DetailCard>
        <RatingsSection>
          <RatingsList>
            {ratingFields.map(({ key, label, value, setter, helper }) => (
              <RatingItem key={key}>
                <RatingHeader>
                  <RatingLabel>{label}</RatingLabel>
                  <RatingValue>
                    {value ? `${value} / 5` : "Sin seleccion"}
                  </RatingValue>
                </RatingHeader>
                <StarsRow>{renderStars(value, setter, label, key)}</StarsRow>
                <HelperText>{helper}</HelperText>
                {ratingErrors[key] && (
                  <ErrorMessage role="alert">{ratingErrors[key]}</ErrorMessage>
                )}
              </RatingItem>
            ))}
          </RatingsList>
        </RatingsSection>
        <CommentsField>
          <DetailLabel>Comentarios adicionales</DetailLabel>
          <CommentsInput
            value={comentarios}
            onChange={(event) => setComentarios(event.target.value)}
            placeholder="Describe hallazgos, aprendizajes o recomendaciones."
          />
        </CommentsField>
      </ModalContent>
    </DialogModal>
  );
};

CalificacionProveedorModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  licitacionTitulo: PropTypes.string,
  proveedorNombre: PropTypes.string,
  fechaAdjudicacion: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(Date),
  ]),
  onCancel: PropTypes.func,
  onSubmit: PropTypes.func,
  isSubmitting: PropTypes.bool,
};

export default CalificacionProveedorModal;
