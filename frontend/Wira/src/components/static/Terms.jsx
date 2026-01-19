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

const Terms = () => {
  return (
    <Page>
      <Main>
        <Card>
          <Title>Términos y Condiciones</Title>

          <P>
            Estos términos y condiciones describen las reglas y regulaciones
            para el uso de la plataforma Wira. Al crear una cuenta y utilizar
            los servicios, usted acepta cumplir con estos términos.
          </P>

          <SectionTitle>1. Uso de la plataforma</SectionTitle>
          <P>
            La plataforma está destinada a facilitar la gestión de licitaciones
            y la interacción entre empresas mineras y proveedores. Usted se
            compromete a utilizar el servicio de forma legal y conforme a las
            políticas aplicables.
          </P>

          <SectionTitle>2. Cuentas y responsabilidades</SectionTitle>
          <P>
            Usted es responsable de mantener la confidencialidad de su cuenta y
            de todas las actividades que ocurran bajo ella. Debe proporcionar
            información veraz y actualizada al momento del registro.
          </P>

          <SectionTitle>3. Propiedad intelectual</SectionTitle>
          <P>
            Todo el contenido, marcas y materiales en la plataforma son
            propiedad de sus respectivos dueños. No está permitido copiar o
            redistribuir contenido sin el consentimiento adecuado.
          </P>

          <SectionTitle>4. Contenidos de usuarios</SectionTitle>
          <P>
            Usted es responsable por los documentos, propuestas y otra
            información que cargue. No debe subir contenidos que infrinjan
            derechos de terceros o que sean ilegales, difamatorios u ofensivos.
          </P>

          <SectionTitle>5. Limitación de responsabilidad</SectionTitle>
          <P>
            En la medida permitida por la ley, la plataforma no será responsable
            por daños indirectos, pérdida de datos o beneficios derivados del
            uso del servicio.
          </P>

          <SectionTitle>6. Modificaciones</SectionTitle>
          <P>
            Nos reservamos el derecho de modificar estos términos y condiciones
            en cualquier momento. Las modificaciones serán publicadas en esta
            página y se considerará que las acepta al continuar usando el
            servicio.
          </P>

          <SectionTitle>Contacto</SectionTitle>
          <P>
            Si tiene preguntas sobre estos términos, por favor contacte con su
            organización o al equipo de soporte.
          </P>
        </Card>
      </Main>
    </Page>
  );
};

export default Terms;
