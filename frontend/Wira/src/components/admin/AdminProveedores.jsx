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

const FilterSelect = styled.select`
  min-width: 180px;
  border: 1px solid #dddddd;
  border-radius: 6px;
  padding: 10px 14px;
  font-size: 0.95rem;
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

const Chip = styled.span`
  background: rgba(99, 102, 241, 0.12);
  color: #4c1d95;
  border-radius: 999px;
  padding: 4px 12px;
  font-size: 0.85rem;
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

const AdminProveedores = () => {
  const [proveedores, setProveedores] = useState([]);
  const [rubros, setRubros] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedRubro, setSelectedRubro] = useState("todos");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [proveedoresResponse, rubrosResponse] = await Promise.all([
        apiService.getProveedores(),
        apiService.getProveedoresRubros(),
      ]);

      setProveedores(proveedoresResponse.data || []);
      setRubros(rubrosResponse.data || []);
    } catch (apiError) {
      console.error("Error loading providers", apiError);
      setError("No pudimos cargar los proveedores activos.");
      toast.error("Error al obtener los proveedores activos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredProveedores = useMemo(() => {
    const term = search.trim().toLowerCase();

    return proveedores.filter((proveedor) => {
      const matchTerm = term
        ? [
            proveedor.Nombre || proveedor.nombre || "",
            proveedor.RazonSocial || proveedor.razonSocial || "",
            proveedor.CUIT || proveedor.cuit || "",
            proveedor.RubroNombre || proveedor.rubroNombre || "",
          ].some((value) => value.toLowerCase().includes(term))
        : true;

      const matchRubro =
        selectedRubro === "todos" ||
        proveedor.RubroID === Number(selectedRubro) ||
        proveedor.rubroID === Number(selectedRubro);

      return matchTerm && matchRubro;
    });
  }, [proveedores, search, selectedRubro]);

  const proveedoresConRubro = useMemo(() => {
    return filteredProveedores.filter(
      (proveedor) =>
        proveedor.RubroID ||
        proveedor.rubroID ||
        proveedor.RubroNombre ||
        proveedor.rubroNombre
    ).length;
  }, [filteredProveedores]);

  const proveedoresSinRubro = Math.max(
    0,
    filteredProveedores.length - proveedoresConRubro
  );

  return (
    <PageContainer>
      <Navbar />
      <Content>
        <PageHeader>
          <Title>Proveedores activos</Title>
          <Subtitle>
            Controle y valide los proveedores que pueden participar en
            licitaciones activas.
          </Subtitle>
        </PageHeader>

        <Controls>
          <SearchInput
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nombre, razón social, CUIT o rubro"
          />
          <FilterSelect
            value={selectedRubro}
            onChange={(event) => setSelectedRubro(event.target.value)}
          >
            <option value="todos">Todos los rubros</option>
            {rubros.map((rubro) => (
              <option
                key={rubro.RubroID || rubro.rubroID}
                value={rubro.RubroID || rubro.rubroID}
              >
                {rubro.Nombre || rubro.nombre}
              </option>
            ))}
          </FilterSelect>
          <RefreshButton onClick={loadData} disabled={loading}>
            {loading ? "Actualizando..." : "Actualizar"}
          </RefreshButton>
        </Controls>

        {error && <ErrorBanner>{error}</ErrorBanner>}

        <Card>
          <TableHeader>
            <TableTitle>Proveedores</TableTitle>
            <TableSubtitle>
              {`${filteredProveedores.length} proveedores activos`}
            </TableSubtitle>
          </TableHeader>
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>CUIT</th>
                  <th>Rubro</th>
                  <th>Teléfono</th>
                  <th>Alta</th>
                </tr>
              </thead>
              <tbody>
                {filteredProveedores.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <EmptyState>
                        {loading
                          ? "Cargando proveedores..."
                          : "No encontramos proveedores con esos filtros"}
                      </EmptyState>
                    </td>
                  </tr>
                ) : (
                  filteredProveedores.map((proveedor) => (
                    <tr key={proveedor.ProveedorID || proveedor.proveedorID}>
                      <td>
                        <div style={{ fontWeight: 600 }}>
                          {proveedor.Nombre || proveedor.nombre}
                        </div>
                        <div style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
                          {proveedor.RazonSocial || proveedor.razonSocial}
                        </div>
                      </td>
                      <td>{proveedor.CUIT || proveedor.cuit}</td>
                      <td>
                        <Chip>
                          {proveedor.RubroNombre ||
                            proveedor.rubroNombre ||
                            "Sin rubro"}
                        </Chip>
                      </td>
                      <td>{proveedor.Telefono || proveedor.telefono || "-"}</td>
                      <td>
                        {formatDate(proveedor.FechaAlta || proveedor.fechaAlta)}
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

export default AdminProveedores;
