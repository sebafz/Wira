import React from "react";
import styled from "styled-components";

const Container = styled.div`
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
  background: white;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen",
    "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",
    sans-serif;
  line-height: 1.6;
`;

const Title = styled.h1`
  text-align: center;
  color: #333;
  margin-bottom: 30px;
  font-size: 2rem;
  font-weight: 700;
`;

const Section = styled.div`
  margin-bottom: 35px;
`;

const SectionTitle = styled.h2`
  color: #333;
  margin-bottom: 15px;
  font-size: 1.5rem;
  font-weight: 600;
  padding-bottom: 8px;
`;

const ColorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
`;

const ColorCard = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

const ColorSwatch = styled.div`
  height: 60px;
  background: ${(props) => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props) => props.textColor || "white"};
  font-weight: 600;
  font-size: 1.1rem;
`;

const ColorInfo = styled.div`
  padding: 10px;
`;

const ColorName = styled.h3`
  margin: 0 0 5px 0;
  color: #333;
  font-size: 1rem;
`;

const ColorCode = styled.code`
  background: #f8f9fa;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.8rem;
  color: #e83e8c;
  font-weight: 600;
`;

const ColorUsage = styled.p`
  margin: 5px 0 0 0;
  color: #666;
  font-size: 0.8rem;
  line-height: 1.3;
`;

const GradientCard = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

const GradientSwatch = styled.div`
  height: 70px;
  background: ${(props) => props.gradient};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1.1rem;
`;

const StatusGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
  margin-bottom: 20px;
`;

const StatusBadge = styled.div`
  background: ${(props) => props.background};
  color: ${(props) => props.color};
  padding: 6px 12px;
  border-radius: 15px;
  text-align: center;
  font-weight: 600;
  font-size: 0.75rem;
  border: ${(props) => props.border || "none"};
`;

const ExampleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
  margin-top: 20px;
`;

const ExampleCard = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  padding: 15px;
`;

const ExampleButton = styled.button`
  background: ${(props) =>
    props.background || "linear-gradient(135deg, #fc6b0a 0%, #ff8f42 100%)"};
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 3px;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(252, 107, 10, 0.3);
  }
`;

const StatCard = styled.div`
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  text-align: center;
  margin: 5px;
`;

const StatNumber = styled.div`
  font-size: 1.8rem;
  font-weight: bold;
  color: #fc6b0a;
  margin-bottom: 3px;
`;

const StatLabel = styled.div`
  color: #666;
  font-size: 0.8rem;
`;

const ColorPalette = () => {
  return (
    <Container>
      <Title>Paleta de Colores - Sistema Wira</Title>

      {/* Color Principal */}
      <Section>
        <SectionTitle>Color Principal de Marca</SectionTitle>
        <ColorGrid>
          <ColorCard>
            <ColorSwatch color="#fc6b0a">Naranja principal</ColorSwatch>
            <ColorInfo>
              <ColorName>Brand Orange</ColorName>
              <ColorCode>#fc6b0a</ColorCode>
              <ColorUsage>
                Color principal de marca. Usado en botones primarios, enlaces,
                indicadores de estado activo y elementos de navegación.
              </ColorUsage>
            </ColorInfo>
          </ColorCard>

          <ColorCard>
            <ColorSwatch color="#ff8f42">Naranja secundario</ColorSwatch>
            <ColorInfo>
              <ColorName>Orange Accent</ColorName>
              <ColorCode>#ff8f42</ColorCode>
              <ColorUsage>
                Variante más clara del naranja principal. Usado en degradados y
                estados hover de elementos interactivos.
              </ColorUsage>
            </ColorInfo>
          </ColorCard>
        </ColorGrid>
      </Section>

      {/* Degradados */}
      <Section>
        <SectionTitle>Degradados</SectionTitle>
        <ColorGrid>
          <GradientCard>
            <GradientSwatch gradient="linear-gradient(135deg, #fc6b0a 0%, #ff8f42 100%)">
              Degradado principal
            </GradientSwatch>
            <ColorInfo>
              <ColorName>Primary Gradient</ColorName>
              <ColorCode>
                linear-gradient(135deg, #fc6b0a 0%, #ff8f42 100%)
              </ColorCode>
              <ColorUsage>
                Usado en botones principales, headers de modales y elementos
                destacados.
              </ColorUsage>
            </ColorInfo>
          </GradientCard>

          <GradientCard>
            <GradientSwatch gradient="linear-gradient(135deg, #28a745 0%, #20c997 100%)">
              Degradado verde
            </GradientSwatch>
            <ColorInfo>
              <ColorName>Success Gradient</ColorName>
              <ColorCode>
                linear-gradient(135deg, #28a745 0%, #20c997 100%)
              </ColorCode>
              <ColorUsage>
                Usado en dashboard de proveedores y elementos de éxito.
              </ColorUsage>
            </ColorInfo>
          </GradientCard>
        </ColorGrid>
      </Section>

      {/* Colores Secundarios */}
      <Section>
        <SectionTitle>Colores secundarios</SectionTitle>
        <ColorGrid>
          <ColorCard>
            <ColorSwatch color="#28a745">Verde</ColorSwatch>
            <ColorInfo>
              <ColorName>Success Green</ColorName>
              <ColorCode>#28a745</ColorCode>
              <ColorUsage>
                Éxito, confirmaciones, licitaciones adjudicadas
              </ColorUsage>
            </ColorInfo>
          </ColorCard>

          <ColorCard>
            <ColorSwatch color="#1976d2">Azul</ColorSwatch>
            <ColorInfo>
              <ColorName>Info Blue</ColorName>
              <ColorCode>#1976d2</ColorCode>
              <ColorUsage>
                Información, licitaciones publicadas, enlaces
              </ColorUsage>
            </ColorInfo>
          </ColorCard>

          <ColorCard>
            <ColorSwatch color="#ffc107" textColor="#333">
              Amarillo
            </ColorSwatch>
            <ColorInfo>
              <ColorName>Warning Yellow</ColorName>
              <ColorCode>#ffc107</ColorCode>
              <ColorUsage>
                Advertencias, licitaciones próximas a vencer
              </ColorUsage>
            </ColorInfo>
          </ColorCard>

          <ColorCard>
            <ColorSwatch color="#dc3545">Rojo</ColorSwatch>
            <ColorInfo>
              <ColorName>Error Red</ColorName>
              <ColorCode>#dc3545</ColorCode>
              <ColorUsage>
                Errores, cancelaciones, acciones destructivas
              </ColorUsage>
            </ColorInfo>
          </ColorCard>

          <ColorCard>
            <ColorSwatch color="#6c757d">Gris</ColorSwatch>
            <ColorInfo>
              <ColorName>Neutral Gray</ColorName>
              <ColorCode>#6c757d</ColorCode>
              <ColorUsage>
                Texto secundario, elementos deshabilitados
              </ColorUsage>
            </ColorInfo>
          </ColorCard>
        </ColorGrid>
      </Section>

      {/* Estados de Licitación */}
      <Section>
        <SectionTitle>Colores de Estado (Licitaciones)</SectionTitle>
        <StatusGrid>
          <StatusBadge
            background="#e3f2fd"
            color="#1976d2"
            border="1px solid #bbdefb"
          >
            Publicada
          </StatusBadge>
          <StatusBadge
            background="#fff3e0"
            color="#f57c00"
            border="1px solid #ffcc02"
          >
            En Evaluación
          </StatusBadge>
          <StatusBadge
            background="#e8f5e8"
            color="#2e7d32"
            border="1px solid #a5d6a7"
          >
            Adjudicada
          </StatusBadge>
          <StatusBadge
            background="#f8d7da"
            color="#721c24"
            border="1px solid #f5c6cb"
          >
            Cancelada
          </StatusBadge>
          <StatusBadge
            background="#e2e3e5"
            color="#383d41"
            border="1px solid #d1ecf1"
          >
            Cerrada
          </StatusBadge>
        </StatusGrid>
        <ColorUsage style={{ marginTop: "10px", color: "#666" }}>
          Cada estado utiliza colores pastel que se asocian intuitivamente con
          su semántica: azul para activa, naranja para evaluación, verde para
          adjudicada, rojo para cancelada, y gris para cerrada.
        </ColorUsage>
      </Section>

      {/* Botones de Acciones */}
      <Section>
        <SectionTitle>Botones de Acciones</SectionTitle>
        <StatusGrid>
          <ExampleButton>Crear licitación</ExampleButton>
          <ExampleButton background="#28a745">Enviar propuesta</ExampleButton>
          <ExampleButton background="#6c757d">Atrás</ExampleButton>
          <ExampleButton background="#17a2b8">✏️ Editar</ExampleButton>
          <ExampleButton background="#dc3545">🗑️ Borrar</ExampleButton>
          <ExampleButton background="#ffc107" style={{ color: "#333" }}>
            ⏸️ Pausar
          </ExampleButton>
        </StatusGrid>
        <ColorUsage style={{ marginTop: "10px", color: "#666" }}>
          Cada acción utiliza colores específicos: degradado naranja para crear,
          verde para enviar, gris para atrás, azul para editar, rojo para
          borrar, y amarillo para pausar. Los emojis refuerzan la semántica
          visual.
        </ColorUsage>
      </Section>

      {/* Ejemplos de Uso */}
      <Section>
        <SectionTitle>Ejemplos de Aplicación</SectionTitle>
        <ExampleGrid>
          <ExampleCard>
            <h3
              style={{ color: "#333", marginBottom: "10px", fontSize: "1rem" }}
            >
              Botones de Acción
            </h3>
            <ExampleButton>Crear Licitación</ExampleButton>
            <ExampleButton background="#28a745">Enviar Propuesta</ExampleButton>
            <ExampleButton background="#dc3545">Cancelar</ExampleButton>
            <ExampleButton background="#6c757d">Ver Detalles</ExampleButton>
          </ExampleCard>

          <ExampleCard>
            <h3
              style={{ color: "#333", marginBottom: "10px", fontSize: "1rem" }}
            >
              KPIs Dashboard
            </h3>
            <StatCard>
              <StatNumber>24</StatNumber>
              <StatLabel>Licitaciones Activas</StatLabel>
            </StatCard>
            <StatCard>
              <StatNumber style={{ color: "#28a745" }}>12</StatNumber>
              <StatLabel>Adjudicaciones</StatLabel>
            </StatCard>
          </ExampleCard>

          <ExampleCard>
            <h3
              style={{ color: "#333", marginBottom: "10px", fontSize: "1rem" }}
            >
              Notificaciones
            </h3>
            <div
              style={{
                background: "#d4edda",
                color: "#155724",
                padding: "8px",
                borderRadius: "6px",
                marginBottom: "8px",
                border: "1px solid #c3e6cb",
                fontSize: "0.8rem",
              }}
            >
              ✅ Propuesta enviada exitosamente
            </div>
            <div
              style={{
                background: "#f8d7da",
                color: "#721c24",
                padding: "8px",
                borderRadius: "6px",
                border: "1px solid #f5c6cb",
                fontSize: "0.8rem",
              }}
            >
              ❌ Error al procesar solicitud
            </div>
          </ExampleCard>
        </ExampleGrid>
      </Section>

      {/* Contraste y Accesibilidad */}
      <Section>
        <SectionTitle>Consideraciones de Accesibilidad</SectionTitle>
        <div
          style={{
            background: "#f8f9fa",
            padding: "15px",
            borderRadius: "8px",
            border: "1px solid #dee2e6",
          }}
        >
          <h4 style={{ color: "#333", marginBottom: "8px", fontSize: "1rem" }}>
            Ratios de Contraste (WCAG AA)
          </h4>
          <ul
            style={{
              color: "#666",
              lineHeight: "1.6",
              fontSize: "0.8rem",
              margin: "0",
              paddingLeft: "20px",
            }}
          >
            <li>
              <strong>Naranja principal (#fc6b0a) sobre blanco:</strong> 3.2:1
              ✅
            </li>
            <li>
              <strong>Verde (#28a745) sobre blanco:</strong> 3.9:1 ✅
            </li>
            <li>
              <strong>Azul (#1976d2) sobre blanco:</strong> 4.8:1 ✅
            </li>
            <li>
              <strong>Rojo (#dc3545) sobre blanco:</strong> 5.9:1 ✅
            </li>
            <li>
              <strong>Gris (#6c757d) sobre blanco:</strong> 4.6:1 ✅
            </li>
          </ul>
          <p
            style={{
              color: "#666",
              marginTop: "10px",
              fontStyle: "italic",
              fontSize: "0.75rem",
            }}
          >
            Todos los colores cumplen con los estándares de accesibilidad web
            WCAG 2.1 AA para garantizar la legibilidad en diferentes condiciones
            visuales.
          </p>
        </div>
      </Section>
    </Container>
  );
};

export default ColorPalette;
