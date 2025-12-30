import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import Navbar from "../shared/Navbar";
import { apiService } from "../../services/apiService";
import { toast } from "react-toastify";

const PageContainer = styled.div`
  min-height: 100vh;
  background: #f8f9fa;
`;

const Content = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px 60px;
`;

const PageHeader = styled.header`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  margin: 0;
  color: #0f172a;
`;

const Subtitle = styled.p`
  margin: 0;
  color: #475569;
`;

const Controls = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
  align-items: center;
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 220px;
  border: 1px solid #dddddd;
  border-radius: 6px;
  padding: 10px 14px;
  font-size: 0.95rem;
`;

const RefreshButton = styled.button`
  border: none;
  background: #0f172a;
  color: white;
  padding: 10px 18px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s ease;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Card = styled.section`
  background: white;
  border-radius: 12px;
  border: none;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
`;

const TableWrapper = styled.div`
  overflow-x: auto;
`;

const TableHeader = styled.div`
  margin-bottom: 18px;
`;

const TableTitle = styled.h2`
  margin: 0 0 6px;
  color: #0f172a;
  font-size: 1.25rem;
`;

const TableSubtitle = styled.p`
  margin: 0;
  color: #475569;
  font-size: 0.9rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: 14px;
    text-align: left;
    border-bottom: 1px solid #edf2f7;
  }

  th {
    font-size: 0.85rem;
    letter-spacing: 0.05em;
    color: #555;
  }

  tr:hover td {
    background: #f8fafc;
  }
`;

const EmptyState = styled.div`
  padding: 40px;
  text-align: center;
  color: #94a3b8;
`;

const ErrorBanner = styled.div`
  background: #fee2e2;
  color: #b91c1c;
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 16px;
`;

const formatDate = (value) => {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleDateString("es-AR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    return value;
  }
};

const AdminMineras = () => {
  const [mineras, setMineras] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMineras = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiService.getMineras();
      setMineras(response.data || []);
    } catch (apiError) {
      console.error("Error loading mineras", apiError);
      setError("No pudimos cargar las mineras activas.");
      toast.error("Error al obtener las mineras activas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMineras();
  }, []);

  const filteredMineras = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return mineras;

    return mineras.filter((minera) => {
      const nombre = minera.Nombre || minera.nombre || "";
      const razon = minera.RazonSocial || minera.razonSocial || "";
      const cuit = minera.CUIT || minera.cuit || "";
      return (
        nombre.toLowerCase().includes(term) ||
        razon.toLowerCase().includes(term) ||
        cuit.toLowerCase().includes(term)
      );
    });
  }, [mineras, search]);

  const minerasConContacto = useMemo(() => {
    return filteredMineras.filter((minera) => {
      const hasEmail = minera.EmailContacto || minera.emailContacto;
      const hasPhone = minera.Telefono || minera.telefono;
      return Boolean(hasEmail || hasPhone);
    }).length;
  }, [filteredMineras]);

  const minerasSinContacto = Math.max(
    0,
    filteredMineras.length - minerasConContacto
  );

  return (
    <PageContainer>
      <Navbar />
      <Content>
        <PageHeader>
          <Title>Mineras activas</Title>
          <Subtitle>
            Visualice el padrón de compañías habilitadas para operar dentro de
            la plataforma.
          </Subtitle>
        </PageHeader>

        <Controls>
          <SearchInput
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nombre, razón social o CUIT"
          />
          <RefreshButton onClick={loadMineras} disabled={loading}>
            {loading ? "Actualizando..." : "Actualizar"}
          </RefreshButton>
        </Controls>

        {error && <ErrorBanner>{error}</ErrorBanner>}

        <Card>
          <TableHeader>
            <TableTitle>Mineras</TableTitle>
            <TableSubtitle>
              {`${filteredMineras.length} mineras activas`}
            </TableSubtitle>
          </TableHeader>
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Razón Social</th>
                  <th>CUIT</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Alta</th>
                </tr>
              </thead>
              <tbody>
                {filteredMineras.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <EmptyState>
                        {loading
                          ? "Cargando mineras..."
                          : "No encontramos mineras con esos filtros"}
                      </EmptyState>
                    </td>
                  </tr>
                ) : (
                  filteredMineras.map((minera) => (
                    <tr key={minera.MineraID || minera.mineraID}>
                      <td>{minera.Nombre || minera.nombre}</td>
                      <td>{minera.RazonSocial || minera.razonSocial}</td>
                      <td>{minera.CUIT || minera.cuit}</td>
                      <td>
                        {minera.EmailContacto || minera.emailContacto || "-"}
                      </td>
                      <td>{minera.Telefono || minera.telefono || "-"}</td>
                      <td>
                        {formatDate(minera.FechaAlta || minera.fechaAlta)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </TableWrapper>
        </Card>
      </Content>
    </PageContainer>
  );
};

export default AdminMineras;
