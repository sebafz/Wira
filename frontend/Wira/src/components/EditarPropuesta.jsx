import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./Navbar";

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
  background: linear-gradient(135deg, #fc6b0a 0%, #ff8f42 100%);
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
  font-size: 1rem;
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
  font-size: 1rem;
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

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
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

  &:active {
    transform: translateY(0);
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
  max-width: 450px;
  width: 100%;
  padding: 30px;
  text-align: center;
`;

const ConfirmTitle = styled.h3`
  color: #fc6b0a;
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

const ConfirmUpdateButton = styled(ConfirmButton)`
  background: linear-gradient(135deg, #fc6b0a 0%, #ff8f42 100%);
  color: white;

  &:hover {
    box-shadow: 0 4px 15px rgba(252, 107, 10, 0.3);
  }
`;

const CancelConfirmButton = styled(ConfirmButton)`
  background: #6c757d;
  color: white;

  &:hover {
    background: #5a6268;
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

const CriterioName = styled.div`
  font-weight: 600;
  color: #333;
  font-size: 1.1rem;
`;

const CriterioDescription = styled.div`
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 10px;
  line-height: 1.4;
`;

const CriterioValue = styled.input`
  width: 100%;
  padding: 10px 14px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #fc6b0a;
    box-shadow: 0 0 0 3px rgba(252, 107, 10, 0.1);
  }
`;

const FileUploadSection = styled.div`
  margin-top: 25px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 2px dashed #e1e5e9;
`;

const FileUploadContainer = styled.div`
  position: relative;
`;

const FileDropZone = styled.div`
  border: 2px dashed ${(props) => (props.isDragOver ? "#fc6b0a" : "#e1e5e9")};
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${(props) => (props.isDragOver ? "#fff5f0" : "white")};

  &:hover {
    border-color: #fc6b0a;
    background: #fff5f0;
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
  font-size: 3rem;
  margin-bottom: 15px;
  color: #fc6b0a;
`;

const FileUploadText = styled.div`
  color: #333;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 8px;
`;

const FileUploadSubtext = styled.div`
  color: #666;
  font-size: 0.9rem;
`;

const SelectedFileContainer = styled.div`
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  padding: 15px;
  margin-top: 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const FileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const FileIcon = styled.div`
  font-size: 1.5rem;
  color: #fc6b0a;
`;

const FileDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const FileName = styled.div`
  color: #333;
  font-weight: 600;
  font-size: 0.9rem;
`;

const FileSize = styled.div`
  color: #666;
  font-size: 0.8rem;
`;

const RemoveFileButton = styled.button`
  background: #dc3545;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #c82333;
  }
`;

const DownloadFileButton = styled.button`
  background: #28a745;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-right: 8px;

  &:hover {
    background: #218838;
  }
`;

const FileActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FileErrorMessage = styled.div`
  color: #dc3545;
  font-size: 0.9rem;
  margin-top: 10px;
  text-align: center;
`;

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

  .Toastify__progress-bar--success {
    background: rgba(255, 255, 255, 0.7);
  }

  .Toastify__progress-bar--error {
    background: rgba(255, 255, 255, 0.7);
  }

  .Toastify__progress-bar--info {
    background: rgba(255, 255, 255, 0.7);
  }
`;

const EditarPropuesta = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  // Estados principales
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Estado para el modal de confirmación
  const [showConfirmUpdate, setShowConfirmUpdate] = useState(false);
  const [pendingFormData, setPendingFormData] = useState(null);

  // Estados del formulario
  const [formData, setFormData] = useState({
    descripcion: "",
    presupuestoOfrecido: "",
    fechaEntrega: "",
  });

  // Estado para criterios de evaluación
  const [criteriosRespuestas, setCriteriosRespuestas] = useState([]);
  const [errors, setErrors] = useState({});

  // Estados para archivos
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `http://localhost:5242/api/propuestas/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Propuesta no encontrada");
          }
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // Configurar los datos del formulario
        setFormData({
          descripcion: data.descripcion || "",
          presupuestoOfrecido: data.presupuestoOfrecido?.toString() || "",
          fechaEntrega: data.fechaEntrega
            ? new Date(data.fechaEntrega).toISOString().split("T")[0]
            : "",
        });

        // Configurar criterios de evaluación
        if (data.respuestasCriterios && data.respuestasCriterios.length > 0) {
          setCriteriosRespuestas(data.respuestasCriterios);
        }

        // Si hay archivos adjuntos, mostrar el primero
        if (data.archivosAdjuntos && data.archivosAdjuntos.length > 0) {
          const archivo = data.archivosAdjuntos[0];
          setSelectedFile({
            name: archivo.nombreArchivo || archivo.NombreArchivo,
            archivoID: archivo.archivoID || archivo.ArchivoID,
            rutaArchivo: archivo.rutaArchivo || archivo.RutaArchivo,
            isExisting: true,
          });
        }
      } catch (error) {
        setError(error.message || "Error al cargar la propuesta");
      } finally {
        setLoading(false);
      }
    };

    if (id && token) {
      fetchData();
    } else {
      setError("No se pudo cargar la propuesta - falta ID o token");
      setLoading(false);
    }
  }, [id, token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpiar error al cambiar el valor
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleCriterioChange = (criterioId, value) => {
    setCriteriosRespuestas((prev) =>
      prev.map((respuesta) =>
        respuesta.criterioID === criterioId
          ? { ...respuesta, valorProveedor: value }
          : respuesta
      )
    );

    // Limpiar error del criterio
    if (errors[`criterio_${criterioId}`]) {
      setErrors((prev) => ({
        ...prev,
        [`criterio_${criterioId}`]: "",
      }));
    }
  };

  // Funciones para manejo de archivos
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
      return "El archivo es demasiado grande. Máximo 10MB.";
    }

    if (!allowedTypes.includes(file.type)) {
      return "Tipo de archivo no permitido. Use PDF, DOC, DOCX, XLS, XLSX, TXT, JPG, PNG o GIF.";
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

  const downloadFile = async (archivoID, nombreArchivo) => {
    try {
      const response = await fetch(
        `http://localhost:5242/api/archivos/descargar/${archivoID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al descargar el archivo");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = nombreArchivo;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Error al descargar el archivo");
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.descripcion.trim()) {
      newErrors.descripcion = "La descripción es requerida";
    }

    if (!formData.presupuestoOfrecido || formData.presupuestoOfrecido <= 0) {
      newErrors.presupuestoOfrecido =
        "El presupuesto ofrecido es requerido y debe ser mayor a 0";
    }

    // Validar criterios de evaluación
    criteriosRespuestas.forEach((respuesta) => {
      if (!respuesta.valorProveedor?.trim()) {
        newErrors[`criterio_${respuesta.criterioID}`] =
          "Este criterio es requerido";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Por favor, complete todos los campos requeridos");
      return;
    }

    setPendingFormData(formData);
    setShowConfirmUpdate(true);
  };

  const confirmUpdate = async () => {
    try {
      setSubmitting(true);
      setShowConfirmUpdate(false);

      const dataToSend = {
        descripcion: formData.descripcion,
        presupuestoOfrecido: parseFloat(formData.presupuestoOfrecido),
        fechaEntrega: formData.fechaEntrega
          ? new Date(formData.fechaEntrega).toISOString()
          : null,
        respuestasCriterios: criteriosRespuestas.map((respuesta) => ({
          criterioID: respuesta.criterioID,
          valorProveedor: respuesta.valorProveedor,
        })),
      };

      const response = await fetch(
        `http://localhost:5242/api/propuestas/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataToSend),
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      toast.success("Propuesta actualizada exitosamente");
      navigate("/propuestas-proveedor");
    } catch (error) {
      toast.error(error.message || "Error al actualizar la propuesta");
    } finally {
      setSubmitting(false);
    }
  };

  const cancelUpdate = () => {
    setShowConfirmUpdate(false);
    setPendingFormData(null);
  };

  const handleCancel = () => {
    navigate("/propuestas-proveedor");
  };

  // Mostrar spinner de carga inicial
  if (loading) {
    return (
      <FormContainer>
        <Navbar />
        <MainContent>
          <LoadingContainer>
            <LoadingSpinner />
            <LoadingText>Cargando propuesta...</LoadingText>
          </LoadingContainer>
        </MainContent>
      </FormContainer>
    );
  }

  // Mostrar error si no se pudo cargar
  if (error) {
    return (
      <FormContainer>
        <Navbar />
        <MainContent>
          <ErrorContainer>
            <ErrorIcon>⚠️</ErrorIcon>
            <ErrorTitle>Error al cargar propuesta</ErrorTitle>
            <ErrorDescription>{error}</ErrorDescription>
            <RetryButton onClick={() => window.location.reload()}>
              Reintentar
            </RetryButton>
          </ErrorContainer>
        </MainContent>
      </FormContainer>
    );
  }

  return (
    <FormContainer>
      <Navbar />

      <MainContent>
        <FormCard>
          <FormTitle>Editar propuesta</FormTitle>
          <FormSubtitle>Modifica los datos de tu propuesta</FormSubtitle>

          <form onSubmit={handleSubmit}>
            <FormGroup>
              <FormLabel htmlFor="descripcion">
                Descripción de la propuesta *
              </FormLabel>
              <FormTextarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                placeholder="Describa su propuesta, experiencia y cómo planea abordar este proyecto..."
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

            <FormRow>
              <FormGroup>
                <FormLabel htmlFor="presupuestoOfrecido">
                  Presupuesto ofrecido (ARS) *
                </FormLabel>
                <FormInput
                  type="number"
                  id="presupuestoOfrecido"
                  name="presupuestoOfrecido"
                  value={formData.presupuestoOfrecido}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
                {errors.presupuestoOfrecido && (
                  <ErrorText>{errors.presupuestoOfrecido}</ErrorText>
                )}
              </FormGroup>

              <FormGroup>
                <FormLabel htmlFor="fechaEntrega">
                  Fecha de entrega estimada
                </FormLabel>
                <FormInput
                  type="date"
                  id="fechaEntrega"
                  name="fechaEntrega"
                  value={formData.fechaEntrega}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split("T")[0]}
                />
              </FormGroup>
            </FormRow>

            {/* Criterios de evaluación */}
            {criteriosRespuestas.length > 0 && (
              <CriteriosSection>
                <SectionTitle>Criterios de evaluación</SectionTitle>

                {criteriosRespuestas.map((respuesta) => (
                  <CriterioItem key={respuesta.criterioID}>
                    <CriterioHeader>
                      <CriterioName>
                        {respuesta.criterioNombre || "Criterio"}
                      </CriterioName>
                    </CriterioHeader>

                    {respuesta.criterioDescripcion && (
                      <CriterioDescription>
                        {respuesta.criterioDescripcion}
                      </CriterioDescription>
                    )}

                    <FormGroup>
                      <FormLabel>Valor ofrecido *</FormLabel>
                      <CriterioValue
                        type="text"
                        value={respuesta.valorProveedor || ""}
                        onChange={(e) =>
                          handleCriterioChange(
                            respuesta.criterioID,
                            e.target.value
                          )
                        }
                        placeholder="Ingrese su valor para este criterio"
                        required
                      />
                      {errors[`criterio_${respuesta.criterioID}`] && (
                        <ErrorText>
                          {errors[`criterio_${respuesta.criterioID}`]}
                        </ErrorText>
                      )}
                    </FormGroup>
                  </CriterioItem>
                ))}
              </CriteriosSection>
            )}

            {/* Archivo adjunto */}
            <FileUploadSection>
              <SectionTitle>Archivo adjunto</SectionTitle>
              <InfoText style={{ marginBottom: "15px" }}>
                Puede adjuntar documentos adicionales que respalden su propuesta
              </InfoText>

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
                        {selectedFile.size && (
                          <FileSize>
                            {formatFileSize(selectedFile.size)}
                          </FileSize>
                        )}
                        {selectedFile.isExisting && !selectedFile.size && (
                          <InfoText>Archivo actual</InfoText>
                        )}
                        {selectedFile.isExisting && selectedFile.size && (
                          <InfoText>
                            Archivo nuevo (reemplazará el actual)
                          </InfoText>
                        )}
                      </FileDetails>
                    </FileInfo>
                    <FileActions>
                      {selectedFile.isExisting &&
                        selectedFile.archivoID &&
                        !selectedFile.size && (
                          <DownloadFileButton
                            onClick={() =>
                              downloadFile(
                                selectedFile.archivoID,
                                selectedFile.name
                              )
                            }
                          >
                            Descargar
                          </DownloadFileButton>
                        )}
                      <RemoveFileButton onClick={removeFile}>
                        {selectedFile.isExisting && !selectedFile.size
                          ? "Quitar"
                          : "Quitar"}
                      </RemoveFileButton>
                    </FileActions>
                  </SelectedFileContainer>
                )}

                {uploadError && (
                  <FileErrorMessage>{uploadError}</FileErrorMessage>
                )}
              </FileUploadContainer>
            </FileUploadSection>

            <ButtonGroup>
              <PrimaryButton
                type="submit"
                disabled={
                  submitting ||
                  !formData.descripcion.trim() ||
                  !formData.presupuestoOfrecido ||
                  showConfirmUpdate
                }
              >
                {submitting ? "Actualizando..." : "Actualizar propuesta"}
              </PrimaryButton>
              <SecondaryButton
                type="button"
                onClick={handleCancel}
                disabled={submitting || showConfirmUpdate}
              >
                Cancelar
              </SecondaryButton>
            </ButtonGroup>
          </form>
        </FormCard>
      </MainContent>

      {showConfirmUpdate && (
        <ConfirmModal
          onClick={(e) => e.target === e.currentTarget && cancelUpdate()}
        >
          <ConfirmContent>
            <ConfirmTitle>💾 Confirmar actualización</ConfirmTitle>
            <ConfirmText>
              ¿Está seguro que desea actualizar esta propuesta?
              <br />
              <br />
              Los cambios se guardarán permanentemente.
            </ConfirmText>
            <ConfirmActions>
              <CancelConfirmButton onClick={cancelUpdate}>
                Cancelar
              </CancelConfirmButton>
              <ConfirmUpdateButton onClick={confirmUpdate}>
                Actualizar
              </ConfirmUpdateButton>
            </ConfirmActions>
          </ConfirmContent>
        </ConfirmModal>
      )}

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

export default EditarPropuesta;
