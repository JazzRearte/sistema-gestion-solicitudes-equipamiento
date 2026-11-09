import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getResumen } from "../api/solicitudesService";

export default function Resumen() {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    setCargando(true);
    setError("");
    try {
      const res = await getResumen();
      setDatos(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Error al cargar el resumen");
    } finally {
      setCargando(false);
    }
  }

  if (cargando) return <p style={{ padding: 24 }}>Cargando...</p>;
  if (error) return <p style={{ padding: 24, color: "red" }}>{error}</p>;
  if (!datos) return null;

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
      <Link to="/solicitudes">← Volver al listado</Link>
      <h2 style={{ marginTop: 16 }}>Panel de administración</h2>

      {/* Tarjetas de resumen */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 24 }}>
        {[
          { label: "Total equipos", valor: datos.totalEquipos, color: "#3b82f6" },
          { label: "Disponibles", valor: datos.totalDisponibles, color: "#10b981" },
          { label: "Prestados", valor: datos.totalPrestados, color: "#f59e0b" },
          { label: "En mantenimiento", valor: datos.totalMantenimiento, color: "#6b7280" },
          { label: "Solicitudes pendientes", valor: datos.solicitudesPendientes, color: "#f59e0b" },
          { label: "Préstamos vencidos", valor: datos.prestamosVencidos, color: "#ef4444" },
        ].map(({ label, valor, color }) => (
          <div key={label} style={{
            background: color, color: "white", borderRadius: 8,
            padding: "16px 24px", minWidth: 150, textAlign: "center",
          }}>
            <div style={{ fontSize: 32, fontWeight: "bold" }}>{valor}</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Equipos disponibles por categoría */}
      <h3 style={{ marginTop: 32 }}>Equipos disponibles por categoría</h3>
      {Object.keys(datos.equiposDisponiblesPorCategoria).length === 0 ? (
        <p style={{ color: "#666" }}>No hay equipos disponibles.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}>
          <thead>
            <tr style={{ background: "#f0f0f0" }}>
              <th style={{ padding: "8px 12px", textAlign: "left" }}>Categoría</th>
              <th style={{ padding: "8px 12px", textAlign: "left" }}>Cantidad disponible</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(datos.equiposDisponiblesPorCategoria).map(([cat, cant]) => (
              <tr key={cat} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "8px 12px" }}>{cat}</td>
                <td style={{ padding: "8px 12px" }}>{cant}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Solicitudes pendientes */}
      <h3 style={{ marginTop: 32 }}>Solicitudes pendientes de aprobación</h3>
      {datos.detallePendientes.length === 0 ? (
        <p style={{ color: "#666" }}>No hay solicitudes pendientes.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}>
          <thead>
            <tr style={{ background: "#f0f0f0" }}>
              <th style={{ padding: "8px 12px", textAlign: "left" }}>ID</th>
              <th style={{ padding: "8px 12px", textAlign: "left" }}>Equipo</th>
              <th style={{ padding: "8px 12px", textAlign: "left" }}>Solicitante</th>
              <th style={{ padding: "8px 12px", textAlign: "left" }}>Retiro</th>
              <th style={{ padding: "8px 12px", textAlign: "left" }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {datos.detallePendientes.map((s) => (
              <tr key={s.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "8px 12px" }}>{s.id}</td>
                <td style={{ padding: "8px 12px" }}>{s.equipoId}</td>
                <td style={{ padding: "8px 12px" }}>{s.usuarioId}</td>
                <td style={{ padding: "8px 12px" }}>{s.fechaRetiro}</td>
                <td style={{ padding: "8px 12px" }}>
                  <Link to={`/solicitudes/${s.id}`}>
                    <button>Ver</button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Préstamos vencidos */}
      <h3 style={{ marginTop: 32 }}>Préstamos vencidos</h3>
      {datos.detallePrestamosVencidos.length === 0 ? (
        <p style={{ color: "#666" }}>No hay préstamos vencidos.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}>
          <thead>
            <tr style={{ background: "#f0f0f0" }}>
              <th style={{ padding: "8px 12px", textAlign: "left" }}>ID</th>
              <th style={{ padding: "8px 12px", textAlign: "left" }}>Equipo</th>
              <th style={{ padding: "8px 12px", textAlign: "left" }}>Vencimiento</th>
              <th style={{ padding: "8px 12px", textAlign: "left" }}>Días vencido</th>
              <th style={{ padding: "8px 12px", textAlign: "left" }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {datos.detallePrestamosVencidos.map((s) => (
              <tr key={s.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "8px 12px" }}>{s.id}</td>
                <td style={{ padding: "8px 12px" }}>{s.equipoNombre}</td>
                <td style={{ padding: "8px 12px" }}>{s.fechaDevolucion}</td>
                <td style={{ padding: "8px 12px", color: "#ef4444", fontWeight: "bold" }}>
                  {s.diasVencido} días
                </td>
                <td style={{ padding: "8px 12px" }}>
                  <Link to={`/solicitudes/${s.id}`}>
                    <button>Ver</button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}