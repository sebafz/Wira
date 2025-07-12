import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
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

const FormSelect = styled.select`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #fc6b0a;
    box-shadow: 0 0 0 3px rgba(252, 107, 10, 0.1);
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
  justify-content: between;
  align-items: center;
  margin-bottom: 15px;
`;

const CriterioName = styled.input`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  font-size: 1rem;
  margin-right: 10px;
`;

const CriterioWeight = styled.input`
  width: 80px;
  padding: 8px 12px;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  font-size: 1rem;
  text-align: center;
  margin-right: 10px;
`;

const CriterioSelect = styled.select`
  width: 150px;
  padding: 8px 12px;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  font-size: 1rem;
  margin-right: 10px;
`;

const RemoveButton = styled.button`
  background: #dc3545;
  color: white;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;

  &:hover {
    background: #c82333;
  }
`;

const AddCriterioButton = styled.button`
  background: #28a745;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  margin-top: 15px;

  &:hover {
    background: #218838;
  }
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

const InfoTooltip = styled.div`
  position: relative;
  display: inline-block;
  margin-left: 8px;
  cursor: help;
`;

const InfoIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: transparent;
  color: #6c757d;
  border: 2px solid #6c757d;
  border-radius: 50%;
  font-size: 12px;
  font-weight: bold;

  &:hover + div {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }
`;

const TooltipContent = styled.div`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(-10px);
  background: #333;
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.85rem;
  line-height: 1.4;
  white-space: nowrap;
  max-width: 350px;
  white-space: normal;
  width: max-content;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;

  &::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 5px solid transparent;
    border-top-color: #333;
  }

  @media (max-width: 768px) {
    max-width: 280px;
    left: 0;
    transform: translateX(0) translateY(-10px);

    &::after {
      left: 20px;
      transform: translateX(0);
    }
  }
`;

const FileUploadContainer = styled.div`
  margin-top: 20px;
`;

const FileDropZone = styled.div`
  border: 2px dashed ${(props) => (props.isDragOver ? "#fc6b0a" : "#e1e5e9")};
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  background: ${(props) =>
    props.isDragOver ? "rgba(252, 107, 10, 0.05)" : "#f8f9fa"};
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;

  &:hover {
    border-color: #fc6b0a;
    background: rgba(252, 107, 10, 0.05);
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
  font-size: 2.5rem;
  color: #fc6b0a;
  margin-bottom: 15px;
`;

const FileUploadText = styled.p`
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 5px;
  font-weight: 500;
`;

const FileUploadSubtext = styled.p`
  color: #999;
  font-size: 0.9rem;
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
  justify-content: between;
`;

const FileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
`;

const FileIcon = styled.div`
  color: #fc6b0a;
  font-size: 1.5rem;
`;

const FileDetails = styled.div`
  flex: 1;
`;

const FileName = styled.p`
  margin: 0;
  font-weight: 500;
  color: #333;
`;

const FileSize = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: #666;
`;

const RemoveFileButton = styled.button`
  background: #dc3545;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background: #c82333;
  }
`;

const ErrorMessage = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 12px 16px;
  border-radius: 8px;
  margin-top: 15px;
  border: 1px solid #f5c6cb;
  font-size: 0.9rem;
`;

const SuccessMessage = styled.div`
  background: #d4edda;
  color: #155724;
  padding: 12px 16px;
  border-radius: 8px;
  margin-top: 15px;
  border: 1px solid #c3e6cb;
  font-size: 0.9rem;
`;

// Estilos personalizados para react-toastify
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

const CrearLicitacion = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    rubroID: "",
    fechaInicio: "",
    fechaCierre: "",
    presupuestoEstimado: "",
    condiciones: "",
  });

  const [criterios, setCriterios] = useState([
    {
      id: 1,
      nombre: "Precio",
      descripcion: "Costo total de la propuesta (en pesos argentinos)",
      peso: 25,
      modoEvaluacion: "MENOR_MEJOR",
    },
    {
      id: 2,
      nombre: "Experiencia",
      descripcion: "Años de experiencia en el rubro",
      peso: 25,
      modoEvaluacion: "MAYOR_MEJOR",
    },
    {
      id: 3,
      nombre: "Proyectos realizados",
      descripcion:
        "Cantidad de proyectos realizados con características comparables",
      peso: 25,
      modoEvaluacion: "MAYOR_MEJOR",
    },
    {
      id: 4,
      nombre: "Tiempo de entrega",
      descripcion: "Plazo de entrega propuesto (en días)",
      peso: 25,
      modoEvaluacion: "MENOR_MEJOR",
    },
  ]);

  const [rubros, setRubros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingRubros, setLoadingRubros] = useState(true);
  const [errors, setErrors] = useState({});

  // Estado para archivos adjuntos
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [rubrosError, setRubrosError] = useState("");

  // Cargar rubros al montar el componente
  useEffect(() => {
    const fetchRubros = async () => {
      try {
        setLoadingRubros(true);
        setRubrosError("");
        const response = await fetch("http://localhost:5242/api/rubros");
        if (response.ok) {
          const data = await response.json();
          setRubros(data);
        } else {
          const errorMsg = `Error del servidor: ${response.status} ${response.statusText}`;
          console.error("Error al cargar rubros:", errorMsg);
          setRubrosError("Error al cargar rubros desde el servidor.");
          setRubros([]);
        }
      } catch (error) {
        console.error("Error al conectar con la API de rubros:", error);
        setRubrosError("No se pudo conectar con el servidor.");
        setRubros([]);
      } finally {
        setLoadingRubros(false);
      }
    };

    fetchRubros();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpiar error al cambiar el valor
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const redistributePesosMultiplosDe5 = (criteriosList) => {
    const totalCriterios = criteriosList.length;
    if (totalCriterios === 0) return criteriosList;

    // Calcular peso base como múltiplo de 5
    const pesoBase = Math.floor(100 / totalCriterios / 5) * 5;
    const pesoAsignado = pesoBase * totalCriterios;
    const resto = 100 - pesoAsignado;

    return criteriosList.map((criterio, index) => ({
      ...criterio,
      peso: index < resto / 5 ? pesoBase + 5 : pesoBase,
    }));
  };

  const handleCriterioChange = (id, field, value) => {
    setCriterios((prev) =>
      prev.map((criterio) =>
        criterio.id === id ? { ...criterio, [field]: value } : criterio
      )
    );
  };

  const addCriterio = () => {
    const newId = Math.max(...criterios.map((c) => c.id)) + 1;
    const newCriteriosList = [
      ...criterios,
      {
        id: newId,
        nombre: "",
        descripcion: "",
        peso: 0,
        modoEvaluacion: "MAYOR_MEJOR",
      },
    ];

    // Redistribuir pesos automáticamente
    const redistributedCriterios =
      redistributePesosMultiplosDe5(newCriteriosList);
    setCriterios(redistributedCriterios);
  };

  const removeCriterio = (id) => {
    const newCriteriosList = criterios.filter((criterio) => criterio.id !== id);

    // Solo redistribuir si quedan criterios
    if (newCriteriosList.length > 0) {
      const redistributedCriterios =
        redistributePesosMultiplosDe5(newCriteriosList);
      setCriterios(redistributedCriterios);
    } else {
      setCriterios(newCriteriosList);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.titulo.trim()) newErrors.titulo = "El título es requerido";
    if (!formData.descripcion.trim())
      newErrors.descripcion = "La descripción es requerida";
    if (!formData.rubroID) newErrors.rubroID = "Debe seleccionar un rubro";
    if (!formData.fechaInicio)
      newErrors.fechaInicio = "La fecha de inicio es requerida";
    if (!formData.fechaCierre)
      newErrors.fechaCierre = "La fecha de cierre es requerida";

    if (formData.fechaInicio && formData.fechaCierre) {
      if (new Date(formData.fechaInicio) >= new Date(formData.fechaCierre)) {
        newErrors.fechaCierre =
          "La fecha de cierre debe ser posterior a la fecha de inicio";
      }
    }

    // Validar criterios
    const totalPeso = criterios.reduce(
      (sum, criterio) => sum + parseFloat(criterio.peso || 0),
      0
    );
    if (Math.abs(totalPeso - 100) > 0.01) {
      newErrors.criterios =
        "El peso total de los criterios debe sumar exactamente 100%";
    }

    criterios.forEach((criterio, index) => {
      if (!criterio.nombre.trim()) {
        newErrors[`criterio_${criterio.id}_nombre`] =
          "El nombre del criterio es requerido";
      }
      if (!criterio.peso || criterio.peso <= 0) {
        newErrors[`criterio_${criterio.id}_peso`] =
          "El peso debe ser mayor a 0";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Crear licitación primero
      const licitacionData = {
        MineraID: user?.MineraID || 1, // Obtener el ID de la minera del usuario autenticado
        RubroID: parseInt(formData.rubroID),
        Titulo: formData.titulo,
        Descripcion: formData.descripcion,
        FechaInicio: formData.fechaInicio,
        FechaCierre: formData.fechaCierre,
        PresupuestoEstimado: formData.presupuestoEstimado
          ? parseFloat(formData.presupuestoEstimado)
          : null,
        Condiciones: formData.condiciones,
        ArchivoID: null, // Inicialmente null, se actualizará si hay archivo
        Criterios: criterios.map((c) => ({
          Nombre: c.nombre,
          Descripcion: c.descripcion,
          Peso: parseFloat(c.peso),
          ModoEvaluacion: c.modoEvaluacion,
        })),
      };

      console.log("Datos a enviar:", licitacionData);

      const response = await fetch("http://localhost:5242/api/licitaciones", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(licitacionData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Error response:", errorData);
        throw new Error(
          `Error al crear la licitación: ${response.status} - ${errorData}`
        );
      }

      const result = await response.json();
      const licitacionId = result.licitacionID || result.LicitacionID;

      // Subir archivo si hay uno seleccionado
      if (selectedFile && licitacionId) {
        toast.info("📎 Subiendo archivo adjunto...", {
          position: "top-right",
          autoClose: false,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: false,
          draggable: false,
          toastId: "uploading", // ID único para poder cerrarlo después
        });

        const formDataFile = new FormData();
        formDataFile.append("File", selectedFile); // Cambio: usar "File" en lugar de "archivo"
        formDataFile.append("EntidadTipo", "LICITACION"); // Cambio: usar "EntidadTipo"
        formDataFile.append("EntidadID", licitacionId.toString()); // Añadir el ID de la licitación

        const fileResponse = await fetch(
          "http://localhost:5242/api/archivos/upload",
          {
            method: "POST",
            body: formDataFile,
          }
        );

        // Cerrar la notificación de subida
        toast.dismiss("uploading");

        if (!fileResponse.ok) {
          const errorText = await fileResponse.text();
          console.error("Error al subir archivo:", errorText);
          throw new Error(`Error al subir el archivo: ${errorText}`);
        }

        const fileResult = await fileResponse.json();
        console.log("Archivo subido:", fileResult);

        toast.success("✅ Archivo subido correctamente", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }

      toast.success(
        "🎉 ¡Licitación creada exitosamente! Serás redirigido al inicio en unos segundos...",
        {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );

      // Esperar un poco antes de navegar para que el usuario vea la notificación
      setTimeout(() => {
        navigate("/dashboard-minera");
      }, 3000);
    } catch (error) {
      console.error("Error al crear licitación:", error);
      toast.error(`❌ Error al crear la licitación: ${error.message}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/dashboard-minera");
  };

  const getCompanyName = () => {
    return user?.Minera?.Nombre || user?.minera?.nombre || "Empresa Minera";
  };

  const getTotalPeso = () => {
    return criterios.reduce(
      (sum, criterio) => sum + parseFloat(criterio.peso || 0),
      0
    );
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
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "image/jpeg",
      "image/png",
      "image/gif",
      "text/plain",
    ];

    if (file.size > maxSize) {
      return "El archivo no puede ser mayor a 50MB";
    }

    if (!allowedTypes.includes(file.type)) {
      return "Tipo de archivo no permitido. Solo se permiten PDF, Word, Excel, imágenes y archivos de texto";
    }

    return null;
  };

  const handleFileSelect = (file) => {
    setUploadError("");
    setUploadSuccess("");

    const error = validateFile(file);
    if (error) {
      setUploadError(error);
      return;
    }

    setSelectedFile(file);
    setUploadSuccess(`Archivo "${file.name}" seleccionado correctamente`);
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

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setUploadError("");
    setUploadSuccess("");
  };

  return (
    <FormContainer>
      <Navbar />

      <MainContent>
        <FormCard>
          <FormTitle>Nueva licitación</FormTitle>
          <FormSubtitle>
            Crea una nueva licitación para {getCompanyName()}
          </FormSubtitle>

          <form onSubmit={handleSubmit}>
            <FormGroup>
              <FormLabel htmlFor="titulo">Título de la licitación *</FormLabel>
              <FormInput
                type="text"
                id="titulo"
                name="titulo"
                value={formData.titulo}
                onChange={handleInputChange}
                placeholder="Ej: Suministro de equipos de seguridad industrial"
                required
                maxLength={255}
              />
              <CharacterCount>
                {formData.titulo.length}/255 caracteres
              </CharacterCount>
              {errors.titulo && <ErrorText>{errors.titulo}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <FormLabel htmlFor="descripcion">Descripción *</FormLabel>
              <FormTextarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                placeholder="Describe los detalles de la licitación, requisitos específicos, condiciones, etc."
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

            <FormGroup>
              <FormLabel htmlFor="rubroID">Rubro *</FormLabel>
              <FormSelect
                id="rubroID"
                name="rubroID"
                value={formData.rubroID}
                onChange={handleInputChange}
                required
                disabled={loadingRubros || rubros.length === 0}
              >
                <option value="">
                  {loadingRubros
                    ? "Cargando rubros..."
                    : rubros.length === 0
                    ? "No hay rubros disponibles"
                    : "Seleccionar rubro"}
                </option>
                {rubros.map((rubro) => (
                  <option key={rubro.rubroID} value={rubro.rubroID}>
                    {rubro.nombre}
                  </option>
                ))}
              </FormSelect>
              {errors.rubroID && <ErrorText>{errors.rubroID}</ErrorText>}
              {rubrosError && (
                <InfoText style={{ color: "#fc6b0a", marginTop: "5px" }}>
                  ⚠️ {rubrosError}
                </InfoText>
              )}
            </FormGroup>

            <FormRow>
              <FormGroup>
                <FormLabel htmlFor="fechaInicio">Fecha de inicio *</FormLabel>
                <FormInput
                  type="datetime-local"
                  id="fechaInicio"
                  name="fechaInicio"
                  value={formData.fechaInicio}
                  onChange={handleInputChange}
                  required
                />
                {errors.fechaInicio && (
                  <ErrorText>{errors.fechaInicio}</ErrorText>
                )}
              </FormGroup>

              <FormGroup>
                <FormLabel htmlFor="fechaCierre">Fecha de cierre *</FormLabel>
                <FormInput
                  type="datetime-local"
                  id="fechaCierre"
                  name="fechaCierre"
                  value={formData.fechaCierre}
                  onChange={handleInputChange}
                  required
                />
                {errors.fechaCierre && (
                  <ErrorText>{errors.fechaCierre}</ErrorText>
                )}
              </FormGroup>
            </FormRow>

            <FormGroup>
              <FormLabel htmlFor="presupuestoEstimado">
                Presupuesto estimado
              </FormLabel>
              <FormInput
                type="number"
                id="presupuestoEstimado"
                name="presupuestoEstimado"
                value={formData.presupuestoEstimado}
                onChange={handleInputChange}
                placeholder="Ej: 50000"
                step="0.01"
                min="0"
              />
              <InfoText>Opcional: Monto estimado in pesos argentinos</InfoText>
            </FormGroup>

            <FormGroup>
              <FormLabel htmlFor="condiciones">Condiciones</FormLabel>
              <FormTextarea
                id="condiciones"
                name="condiciones"
                value={formData.condiciones}
                onChange={handleInputChange}
                placeholder="Términos y condiciones específicas, requisitos legales, documentación requerida, etc."
                maxLength={2000}
              />
              <CharacterCount>
                {formData.condiciones.length}/2000 caracteres
              </CharacterCount>
              <InfoText>
                Opcional: Condiciones específicas para la licitación
              </InfoText>
            </FormGroup>

            <CriteriosSection>
              <SectionTitle>
                📊 Criterios de evaluación
                <InfoTooltip>
                  <InfoIcon>i</InfoIcon>
                  <TooltipContent>
                    <strong>¿Qué son los criterios de evaluación?</strong>
                    <br />
                    Los criterios determinan cómo se evaluarán las propuestas de
                    los proveedores.
                    <br />
                    <br />
                    <strong>Pesos:</strong> Cada criterio tiene un peso (%) que
                    indica su importancia. La suma debe ser 100%.
                    <br />
                    <br />
                    <strong>Redistribución automática:</strong> Al agregar o
                    eliminar criterios, los pesos se redistribuyen
                    automáticamente usando múltiplos de 5.
                    <br />
                    <br />
                    <strong>Evaluación:</strong>
                    <br />
                    • "Mayor es mejor": Valores más altos obtienen mejor
                    puntuación
                    <br />
                    • "Menor es mejor": Valores más bajos obtienen mejor
                    puntuación
                    <br />
                    <br />
                    Puedes modificar los pesos manualmente después de la
                    redistribución automática.
                  </TooltipContent>
                </InfoTooltip>
                {getTotalPeso() !== 100 && (
                  <span
                    style={{
                      color: "#dc3545",
                      fontSize: "0.9rem",
                      marginLeft: "10px",
                    }}
                  >
                    (Total: {getTotalPeso().toFixed(1)}% - debe sumar 100%)
                  </span>
                )}
              </SectionTitle>

              {criterios.map((criterio, index) => (
                <CriterioItem key={criterio.id}>
                  <CriterioHeader>
                    <CriterioName
                      placeholder="Nombre del criterio"
                      value={criterio.nombre}
                      onChange={(e) =>
                        handleCriterioChange(
                          criterio.id,
                          "nombre",
                          e.target.value
                        )
                      }
                    />
                    <CriterioWeight
                      type="number"
                      placeholder="Peso %"
                      min="0"
                      max="100"
                      step="0.1"
                      value={criterio.peso}
                      onChange={(e) =>
                        handleCriterioChange(
                          criterio.id,
                          "peso",
                          parseFloat(e.target.value) || 0
                        )
                      }
                    />
                    <CriterioSelect
                      value={criterio.modoEvaluacion}
                      onChange={(e) =>
                        handleCriterioChange(
                          criterio.id,
                          "modoEvaluacion",
                          e.target.value
                        )
                      }
                    >
                      <option value="MAYOR_MEJOR">Mayor es mejor</option>
                      <option value="MENOR_MEJOR">Menor es mejor</option>
                    </CriterioSelect>
                    {criterios.length > 1 && (
                      <RemoveButton
                        type="button"
                        onClick={() => removeCriterio(criterio.id)}
                        title="Eliminar criterio"
                      >
                        ×
                      </RemoveButton>
                    )}
                  </CriterioHeader>

                  <FormTextarea
                    placeholder="Descripción del criterio (opcional)"
                    value={criterio.descripcion}
                    onChange={(e) =>
                      handleCriterioChange(
                        criterio.id,
                        "descripcion",
                        e.target.value
                      )
                    }
                    style={{ minHeight: "80px" }}
                  />

                  {errors[`criterio_${criterio.id}_nombre`] && (
                    <ErrorText>
                      {errors[`criterio_${criterio.id}_nombre`]}
                    </ErrorText>
                  )}
                  {errors[`criterio_${criterio.id}_peso`] && (
                    <ErrorText>
                      {errors[`criterio_${criterio.id}_peso`]}
                    </ErrorText>
                  )}
                </CriterioItem>
              ))}

              <AddCriterioButton type="button" onClick={addCriterio}>
                + Agregar criterio
              </AddCriterioButton>

              {errors.criterios && (
                <ErrorText style={{ marginTop: "10px" }}>
                  {errors.criterios}
                </ErrorText>
              )}
            </CriteriosSection>

            <FileUploadContainer>
              <FormGroup>
                <FormLabel htmlFor="files">Archivos adjuntos</FormLabel>
                <FileDropZone
                  isDragOver={isDragOver}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <FileUploadIcon>📎</FileUploadIcon>
                  <FileUploadText>
                    Arrastra y suelta tu archivo aquí
                  </FileUploadText>
                  <FileUploadSubtext>
                    O haz clic para seleccionar archivo (máx. 50MB)
                  </FileUploadSubtext>
                  <FileInput
                    type="file"
                    id="files"
                    name="files"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt"
                  />
                </FileDropZone>
              </FormGroup>

              {/* Mostrar archivos seleccionados */}
              {selectedFile && (
                <SelectedFileContainer>
                  <FileInfo>
                    <FileIcon>📄</FileIcon>
                    <FileDetails>
                      <FileName>{selectedFile.name}</FileName>
                      <FileSize>{formatFileSize(selectedFile.size)}</FileSize>
                    </FileDetails>
                  </FileInfo>
                  <RemoveFileButton type="button" onClick={removeFile}>
                    Eliminar
                  </RemoveFileButton>
                </SelectedFileContainer>
              )}

              {/* Mensajes de éxito o error al subir archivos */}
              {uploadSuccess && (
                <SuccessMessage>{uploadSuccess}</SuccessMessage>
              )}
              {uploadError && <ErrorMessage>{uploadError}</ErrorMessage>}
            </FileUploadContainer>

            <ButtonGroup>
              <PrimaryButton
                type="submit"
                disabled={
                  loading ||
                  loadingRubros ||
                  rubros.length === 0 ||
                  !formData.titulo.trim() ||
                  !formData.descripcion.trim() ||
                  !formData.rubroID ||
                  !formData.fechaInicio ||
                  !formData.fechaCierre ||
                  getTotalPeso() !== 100
                }
              >
                {loading ? "Creando..." : "Crear licitación"}
              </PrimaryButton>
              <SecondaryButton
                type="button"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancelar
              </SecondaryButton>
            </ButtonGroup>
          </form>
        </FormCard>
      </MainContent>

      {/* Toast Container para las notificaciones */}
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

export default CrearLicitacion;
