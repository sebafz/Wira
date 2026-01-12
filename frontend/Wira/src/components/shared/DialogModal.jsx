import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

const VARIANTS = {
  red: {
    base: "#dc2626",
    hover: "#b91c1c",
  },
  yellow: {
    base: "#fa6b0a",
    hover: "#e55a09",
  },
  green: {
    base: "#15803d",
    hover: "#166534",
  },
  blue: {
    base: "#1d4ed8",
    hover: "#1e40af",
  },
};

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.65);
  display: ${({ $isOpen }) => ($isOpen ? "flex" : "none")};
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 1200;
`;

const DialogContent = styled.div`
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 25px 70px rgba(15, 23, 42, 0.35);
  width: min(520px, calc(100% - 32px));
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: calc(100vh - 64px);
  overflow: hidden;

  @media (max-width: 768px) {
    width: calc(100% - 32px);
    padding: 20px;
    border-radius: 12px;
    max-height: 80vh;
  }
`;

const DialogTitle = styled.h3`
  margin: 0;
  font-size: 1.3rem;
  font-weight: 700;
  color: ${({ $variant }) => VARIANTS[$variant]?.base || VARIANTS.blue.base};
  text-align: left;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DialogBody = styled.div`
  color: #475467;
  font-size: 0.95rem;
  line-height: 1.6;
  text-align: left;
  margin-top: 4px;
  margin-bottom: 8px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: auto;
  /* Allow body to scroll when dialog reaches max-height */
  @media (max-width: 768px) {
    max-height: calc(80vh - 140px);
  }
`;

const DialogActions = styled.div`
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const SecondaryButton = styled.button`
  border: none;
  border-radius: 10px;
  padding: 10px 20px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  color: white;
  background: #6c757d;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #5a6268;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const PrimaryButton = styled(SecondaryButton)`
  background: ${({ $variant }) =>
    VARIANTS[$variant]?.base || VARIANTS.blue.base};
  color: #ffffff;

  &:hover:not(:disabled) {
    background: ${({ $variant }) =>
      VARIANTS[$variant]?.hover || VARIANTS.blue.hover};
  }
`;

const DialogModal = ({
  isOpen,
  title,
  description,
  children,
  variant = "blue",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
  confirmDisabled = false,
  showCancel = true,
  closeOnBackdrop = true,
}) => {
  if (!isOpen) {
    return null;
  }

  const [confirmLoading, setConfirmLoading] = React.useState(false);

  React.useEffect(() => {
    if (!isOpen) setConfirmLoading(false);
  }, [isOpen]);

  const handleOverlayClick = (event) => {
    if (!closeOnBackdrop) {
      return;
    }

    if (event.target === event.currentTarget) {
      onCancel?.();
    }
  };

  const handleConfirm = () => {
    if (confirmDisabled || confirmLoading) return;
    try {
      const result = onConfirm?.();
      // If onConfirm throws synchronously, reset loading. Otherwise keep loading until modal closes.
      setConfirmLoading(true);
      if (result && typeof result.then === "function") {
        // swallow errors here; parent should handle and close modal
        result.catch(() => {});
      }
    } catch (err) {
      setConfirmLoading(false);
      throw err;
    }
  };

  return (
    <Overlay $isOpen={isOpen} onClick={handleOverlayClick}>
      <DialogContent onClick={(event) => event.stopPropagation()}>
        {title && <DialogTitle $variant={variant}>{title}</DialogTitle>}
        {(description || children) && (
          <DialogBody>
            {description}
            {children}
          </DialogBody>
        )}
        <DialogActions>
          {showCancel && (
            <SecondaryButton type="button" onClick={onCancel}>
              {cancelText}
            </SecondaryButton>
          )}
          <PrimaryButton
            type="button"
            onClick={handleConfirm}
            disabled={confirmDisabled || confirmLoading}
            $variant={variant}
          >
            {confirmLoading ? "Cargando..." : confirmText}
          </PrimaryButton>
        </DialogActions>
      </DialogContent>
    </Overlay>
  );
};

DialogModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  title: PropTypes.node,
  description: PropTypes.node,
  children: PropTypes.node,
  variant: PropTypes.oneOf(["red", "yellow", "green", "blue"]),
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  onConfirm: PropTypes.func,
  onCancel: PropTypes.func,
  confirmDisabled: PropTypes.bool,
  showCancel: PropTypes.bool,
  closeOnBackdrop: PropTypes.bool,
};

export default DialogModal;
