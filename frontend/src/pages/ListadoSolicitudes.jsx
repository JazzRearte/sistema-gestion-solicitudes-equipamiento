import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getSolicitudes } from "../api/solicitudesService";
import { useAuth } from "../context/AuthContext";

export default function ListadoSolicitudes() {
  const { usuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();

  const [solicitudes, setSolicitudes] = useState([]);
  const [paginacion, setPaginacion] = useState({});
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const [filtros, setFiltros] = useState({
    estado: "",
    categoria: "",
    desde: "",
    hasta: "",
    page: 1,
    limit: 10,
    sortBy: "fechaRetiro",
    order: "desc",
  });

  useEffect(() => {
    cargar();
  }, [filtros]);

  async function cargar() {
    setCargando(true);
    setError("");
    try {
      const params = Object.fromEntries(
        Object.entries(filtros).filter(([_, v]) => v !== "")
      );
      const res = await getSolicitudes(params);
      setSolicitudes(res.data.datos);
      setPaginacion(res.data.paginacion);
    } catch (err) {
      setError("Error al cargar solicitudes");
    } finally {
      setCargando(false);
    }
  }

  function handleFiltro(e) {
    setFiltros((f) => ({ ...f, [e.target.name]: e.target.value, page: 1 }));
  }

  function handlePagina(nueva) {
    setFiltros((f) => ({ ...f, page: nueva }));
  }

  const esAdmin = usuario?.rol === "admin" || usuario?.rol === "encargado";

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2>Solicitudes</h2>
        <div style={{ display: "flex", gap: 8 }}>
          {esAdmin && <Link to="/resumen"><button>Panel resumen</button></Link>}
          <Link to="/solicitudes/nueva"><button>Nueva solicitud</button></Link>
          <button onClick={() => { cerrarSesion(); navigate("/login"); }}>
            Cerrar sesión
          </button>
        </div>
      </div>

      <p style={{ color: "#666", marginBottom: 16 }}>
        Usuario: <strong>{usuario?.nombre}</strong> — Rol: <strong>{usuario?.rol}</strong>
      </p>

      {/* Filtros */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        <select name="estado" value={filtros.estado} onChange={handleFiltro}>
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="aprobada">Aprobada</option>
          <option value="rechazada">Rechazada</option>
          <option value="cancelada">Cancelada</option>
          <option value="devuelta">Devuelta</option>
        </select>

        <select name="categoria" value={filtros.categoria} onChange={handleFiltro}>
          <option value="">Todas las categorías</option>
          <option value="notebook">Notebook</option>
          <option value="proyector">Proyector</option>
          <option value="camara">Cámara</option>
          <option value="kit de red">Kit de red</option>
          <option value="tablet">Tablet</option>
        </select>

        <input type="date" name="desde" value={filtros.desde} onChange={handleFiltro} />
        <input type="date" name="hasta" value={filtros.hasta} onChange={handleFiltro} />

        <select name="sortBy" value={filtros.sortBy} onChange={handleFiltro}>
          <option value="fechaRetiro">Ordenar por retiro</option>
          <option value="fechaDevolucion">Ordenar por devolución</option>
          <option value="estado">Ordenar por estado</option>
        </select>

        <select name="order" value={filtros.order} onChange={handleFiltro}>
          <option value="desc">Más reciente primero</option>
          <option value="asc">Más antiguo primero</option>
        </select>

        <button onClick={() => setFiltros({ estado: "", categoria: "", desde: "", hasta: "", page: 1, limit: 10, sortBy: "fechaRetiro", order: "desc" })}>
          Limpiar filtros
        </button>
      </div>

      {/* Tabla */}
      {cargando && <p>Cargando...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!cargando && solicitudes.length === 0 && (
        <p style={{ color: "#666" }}>No hay solicitudes que coincidan con los filtros.</p>
      )}

      {!cargando && solicitudes.length > 0 && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f0f0f0" }}>
              <th style={th}>ID</th>
              <th style={th}>Equipo</th>
              <th style={th}>Retiro</th>
              <th style={th}>Devolución</th>
              <th style={th}>Estado</th>
              <th style={th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {solicitudes.map((s) => (
              <tr key={s.id} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={td}>{s.id}</td>
                <td style={td}>{s.equipoId}</td>
                <td style={td}>{s.fechaRetiro}</td>
                <td style={td}>{s.fechaDevolucion}</td>
                <td style={td}>
                  <span style={{ ...badge, background: coloreEstado[s.estado] }}>
                    {s.estado}
                  </span>
                </td>
                <td style={td}>
                  <Link to={`/solicitudes/${s.id}`}>
                    <button>Ver</button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Paginación */}
      {paginacion.totalPaginas > 1 && (
        <div style={{ marginTop: 16, display: "flex", gap: 8, alignItems: "center" }}>
          <button disabled={filtros.page <= 1} onClick={() => handlePagina(filtros.page - 1)}>
            Anterior
          </button>
          <span>Página {paginacion.page} de {paginacion.totalPaginas}</span>
          <button disabled={filtros.page >= paginacion.totalPaginas} onClick={() => handlePagina(filtros.page + 1)}>
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}

const th = { padding: "8px 12px", textAlign: "left", fontWeight: "bold" };
const td = { padding: "8px 12px" };
const badge = { padding: "2px 8px", borderRadius: 4, color: "white", fontSize: 12 };
const coloreEstado = {
  pendiente: "#f59e0b",
  aprobada: "#10b981",
  rechazada: "#ef4444",
  cancelada: "#6b7280",
  devuelta: "#3b82f6",
};