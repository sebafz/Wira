import React from "react";
import styled from "styled-components";

const Page = styled.div`
  min-height: 100vh;
  background: #f8f9fa;
`;

const Main = styled.main`
  max-width: 900px;
  margin: 40px auto;
  padding: 24px;
`;

const Card = styled.div`
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(15, 23, 42, 0.06);
`;

const Title = styled.h1`
  margin: 0 0 12px 0;
`;

const SectionTitle = styled.h3`
  margin-top: 20px;
`;

const P = styled.p`
  color: #333;
  line-height: 1.6;
`;

const List = styled.ul`
  color: #333;
  line-height: 1.6;
  padding-left: 20px;
`;

const Terms = () => {
  return (
    <Page>
      <Main>
        <Card>
          <Title>Términos y Condiciones</Title>

          <SectionTitle>1. Identificación del servicio</SectionTitle>
          <P>
            Wira es una plataforma web destinada a facilitar procesos de
            licitación y vinculación entre empresas mineras ("Mineras") y
            proveedores ("Proveedores"), incluyendo funciones de administración,
            publicación de licitaciones, invitaciones, presentación de ofertas,
            evaluación y trazabilidad.
          </P>
          <P>
            El operador del sitio (en adelante, el "Operador") se identifica como
            Sebastián Fernandez Zavalía. Residente en Salta, Argentina.
          </P>

          <SectionTitle>2. Aceptación</SectionTitle>
          <P>
            Al acceder, navegar o registrarse en Wira, aceptás estos Términos y
            Condiciones ("Términos"). Si no estás de acuerdo, no utilices la
            plataforma.
          </P>

          <SectionTitle>3. Definiciones básicas</SectionTitle>
          <List>
            <li>
              <strong>Cuenta:</strong> usuario y credenciales de acceso.
            </li>
            <li>
              <strong>Contenido:</strong> información cargada en Wira (textos,
              documentos, datos de licitaciones, criterios, ofertas, mensajes).
            </li>
            <li>
              <strong>Licitación:</strong> proceso publicado por una Minera para
              recibir y evaluar ofertas.
            </li>
            <li>
              <strong>Oferta:</strong> propuesta enviada por un Proveedor en
              respuesta a una licitación.
            </li>
            <li>
              <strong>Usuario:</strong> cualquier persona que accede o utiliza
              Wira, con o sin cuenta.
            </li>
          </List>

          <SectionTitle>4. Elegibilidad y representación</SectionTitle>
          <P>Declarás que:</P>
          <List>
            <li>tenés capacidad legal para contratar, y</li>
            <li>
              si actuás en nombre de una organización, contás con autorización
              suficiente para obligarla.
            </li>
          </List>

          <SectionTitle>
            5. Registro, seguridad y responsabilidad de la cuenta
          </SectionTitle>
          <P>
            Sos responsable por la confidencialidad de tus credenciales y por
            toda actividad realizada desde tu Cuenta.
          </P>
          <P>
            Debés notificar de inmediato cualquier acceso no autorizado a:
            sebastian.ferzav@wira.com.
          </P>
          <P>
            El Operador puede solicitar verificaciones razonables (por ejemplo,
            validación de correo, rol u organización) para proteger la
            integridad del sistema.
          </P>

          <SectionTitle>6. Uso permitido del servicio</SectionTitle>
          <P>
            Podés usar Wira exclusivamente para fines legítimos relacionados
            con:
          </P>
          <List>
            <li>publicar y gestionar licitaciones (Mineras),</li>
            <li>participar en licitaciones y enviar ofertas (Proveedores),</li>
            <li>
              administrar roles, permisos y configuración (Administradores
              habilitados).
            </li>
          </List>

          <SectionTitle>7. Reglas de conducta y cumplimiento</SectionTitle>
          <P>Te comprometés a:</P>
          <List>
            <li>actuar de buena fe,</li>
            <li>cargar información veraz y actualizada,</li>
            <li>
              respetar la confidencialidad de los procesos y documentación a la
              que accedas,
            </li>
            <li>
              cumplir la normativa aplicable (incluida, de corresponder,
              normativa de competencia/defensa de la competencia,
              anticorrupción, protección de datos, etc.).
            </li>
          </List>

          <SectionTitle>
            8. Prohibición expresa de acuerdos anticompetitivos (cláusula
            central)
          </SectionTitle>
          <P>
            Wira prohíbe expresamente usar la plataforma (o cualquier
            información obtenida a través de ella) para coordinar, facilitar,
            promover o intentar cualquier práctica anticompetitiva, incluyendo,
            sin limitarse a:
          </P>
          <List>
            <li>
              Colusión / “bid rigging” (acuerdos para manipular resultados de
              licitaciones).
            </li>
            <li>
              Fijación de precios o condiciones comerciales (directa o
              indirecta).
            </li>
            <li>
              Reparto de mercado, clientes, zonas geográficas o categorías de
              productos/servicios.
            </li>
            <li>
              Intercambio de información comercial sensible entre competidores
              (precios, márgenes, capacidades, estrategias, listas de clientes,
              planes de oferta, etc.) cuando pueda reducir la competencia.
            </li>
            <li>
              Rotación de ganadores, “ofertas de cobertura”, abstenciones
              coordinadas o retiro concertado.
            </li>
            <li>
              Uso de terceros (consultores, cámaras, intermediarios) para
              coordinar conductas prohibidas.
            </li>
            <li>
              Cualquier conducta que tenga por objeto o efecto restringir,
              distorsionar o impedir la competencia.
            </li>
          </List>
          <P>
            El Operador puede aplicar medidas preventivas (p. ej., bloqueo de
            cuentas, revisión de actividad, suspensión de licitaciones) ante
            indicios razonables, sin perjuicio de acciones adicionales.
          </P>

          <SectionTitle>
            9. Canales formales para denunciar prácticas sospechosas
          </SectionTitle>
          <P>
            Wira pone a disposición canales formales para reportar conductas que
            puedan indicar colusión, corrupción, fraude u otras irregularidades.
          </P>
          <P>Canales de denuncia (ejemplo):</P>
          <List>
            <li>Correo confidencial: denuncias@wira.com</li>
            <li>Formulario web: /denuncias (o enlace en el pie del sitio)</li>
            <li>
              Línea telefónica / WhatsApp: +54 9 387 123 4567 (solo
              mensajes)
            </li>
            <li>Correo postal: Belgrano 1234, Salta, Argentina</li>
          </List>
          <P>Qué incluir en una denuncia (recomendado):</P>
          <List>
            <li>licitación afectada (ID o nombre),</li>
            <li>usuarios/empresas involucradas (si se conocen),</li>
            <li>descripción de hechos y fechas,</li>
            <li>
              evidencia disponible (capturas, documentos, mensajes, patrones de
              precios),
            </li>
            <li>datos de contacto (opcional, si querés anonimato).</li>
          </List>
          <P>Tratamiento de denuncias:</P>
          <List>
            <li>Se registra un número de caso.</li>
            <li>Se evalúa por un equipo designado (compliance/seguridad).</li>
            <li>Se pueden requerir datos adicionales.</li>
            <li>
              Se resguarda la confidencialidad en la medida posible y conforme a
              la ley.
            </li>
          </List>
          <P>
            No represalias: Wira (como política del Operador) prohíbe
            represalias contra denunciantes de buena fe. Las denuncias
            maliciosas o falsas pueden derivar en sanciones.
          </P>

          <SectionTitle>10. Monitoreo, integridad y auditoría</SectionTitle>
          <P>Para proteger la plataforma y la competencia:</P>
          <List>
            <li>
              Wira puede mantener registros de auditoría (logs) de acciones
              relevantes (accesos, carga/edición de ofertas, cambios de
              criterios, etc.).
            </li>
            <li>
              El Operador puede aplicar controles antifraude y detección de
              patrones anómalos (por ejemplo, comportamiento coordinado, accesos
              sospechosos, automatizaciones indebidas).
            </li>
          </List>

          <SectionTitle>11. Contenido de usuarios y licencias</SectionTitle>
          <P>Cada Usuario conserva los derechos sobre su Contenido.</P>
          <P>
            Al cargar Contenido, otorgás al Operador una licencia no exclusiva
            para alojarlo, reproducirlo y procesarlo solo para operar Wira y
            prestar el servicio.
          </P>
          <P>
            Garantizás que tenés derecho a cargar ese Contenido y que no
            infringe derechos de terceros.
          </P>

          <SectionTitle>
            12. Confidencialidad y acceso a información
          </SectionTitle>
          <P>
            La documentación de licitaciones y ofertas puede ser confidencial
            según la configuración del proceso y las reglas de la Minera.
          </P>
          <P>
            Está prohibido copiar, distribuir o usar información obtenida en
            Wira para fines ajenos a la licitación correspondiente, o para
            perjudicar a competidores.
          </P>

          <SectionTitle>13. Propiedad intelectual</SectionTitle>
          <P>
            Wira, su software, diseño, marca y documentación pertenecen al
            Operador o a sus licenciantes. No se otorgan derechos salvo los
            expresamente indicados en estos Términos.
          </P>

          <SectionTitle>14. Suspensión y terminación</SectionTitle>
          <P>
            El Operador puede suspender o cerrar cuentas (y/o restringir acceso
            a licitaciones) si:
          </P>
          <List>
            <li>se detectan incumplimientos a estos Términos,</li>
            <li>hay indicios de prácticas anticompetitivas o fraude,</li>
            <li>existe un riesgo de seguridad,</li>
            <li>lo requiere una autoridad competente.</li>
          </List>
          <P>
            La terminación no limita la posibilidad de conservar registros por
            razones legales o de auditoría.
          </P>

          <SectionTitle>15. Exclusión de garantías</SectionTitle>
          <P>
            Wira se ofrece “tal cual” y “según disponibilidad”. El Operador no
            garantiza:
          </P>
          <List>
            <li>ausencia total de errores,</li>
            <li>disponibilidad ininterrumpida,</li>
            <li>
              que el uso del servicio asegure adjudicaciones o resultados
              económicos.
            </li>
          </List>

          <SectionTitle>16. Limitación de responsabilidad</SectionTitle>
          <P>
            En la medida permitida por la ley, el Operador no será responsable
            por:
          </P>
          <List>
            <li>
              decisiones de Mineras o Proveedores en procesos de contratación,
            </li>
            <li>pérdidas indirectas, lucro cesante, daños reputacionales,</li>
            <li>contenido cargado por usuarios,</li>
            <li>fallas derivadas de terceros (hosting, conectividad, etc.).</li>
          </List>

          <SectionTitle>17. Indemnidad</SectionTitle>
          <P>
            Acceptás mantener indemne al Operador frente a reclamos de terceros
            derivados de:
          </P>
          <List>
            <li>tu Contenido,</li>
            <li>tu uso de Wira,</li>
            <li>
              tu incumplimiento de estos Términos o de la normativa aplicable.
            </li>
          </List>

          <SectionTitle>18. Privacidad y protección de datos</SectionTitle>
          <P>
            El tratamiento de datos personales se rige por la Política de
            Privacidad de Wira: https://wira.com/politica-privacidad. Si hay conflicto entre estos Términos
            y la Política de Privacidad, prevalece la Política de Privacidad en
            materia de datos personales.
          </P>

          <SectionTitle>19. Modificaciones</SectionTitle>
          <P>
            El Operador puede actualizar estos Términos. Si los cambios son
            relevantes, se notificará por medios razonables (por ejemplo, aviso
            en la web). El uso continuado implica aceptación.
          </P>

          <SectionTitle>20. Ley aplicable y jurisdicción</SectionTitle>
          <P>
            Estos Términos se rigen por las leyes de Argentina. Cualquier
            controversia se someterá a los tribunales competentes de
            Salta, salvo normas imperativas en contrario.
          </P>

          <SectionTitle>21. Contacto</SectionTitle>
          <List>
            <li>Soporte: soporte@wira.com</li>
            <li>Seguridad: seguridad@wira.com</li>
            <li>Denuncias: denuncias@wira.com</li>
          </List>
        </Card>
      </Main>
    </Page>
  );
};

export default Terms;
