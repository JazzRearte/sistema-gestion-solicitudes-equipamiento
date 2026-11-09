import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getSolicitud, getHistorial,
  cancelarSolicitud, aprobarSolicitud,
  rechazarSolicitud, devolverSolicitud,
} from "../api/solicitudesService";

export default function DetalleSolicitud() {
  const { id } = useParams();
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const [solicitud, setSolicitud] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [accionError, setAccionError] = useState("");
  const [accionExito, setAccionExito] = useState("");

  useEffect(() => {
    cargar();
  }, [id]);

  async function cargar() {
    setCargando(true);
    setError("");
    try {
      const [resSol, resHist] = await Promise.all([
        getSolicitud(id),
        getHistorial(id),
      ]);
      setSolicitud(resSol.data);
      setHistorial(resHist.data);
    } catch (err) {
      setError(err.response?.data?.error || "Error al cargar la solicitud");
    } finally {
      setCargando(false);
    }
  }

  async function ejecutarAccion(accionFn, mensaje) {
    setAccionError("");
    setAccionExito("");
    try {
      await accionFn(id);
      setAccionExito(mensaje);
      cargar();
    } catch (err) {
      setAccionError(err.response?.data?.error || "Error al ejecutar la acción");
    }
  }

  if (cargando) return <p style={{ padding: 24 }}>Cargando...</p>;
  if (error) return <p style={{ padding: 24, color: "red" }}>{error}</p>;
  if (!solicitud) return null;

  const esAdmin = usuario?.rol === "admin" || usuario?.rol === "encargado";
  const esPropietario = solicitud.usuarioId === usuario?.id;

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: 24 }}>
      <Link to="/solicitudes">← Volver al listado</Link>

      <h2 style={{ marginTop: 16 }}>Detalle de solicitud</h2>

      {/* Datos */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 16 }}>
        <tbody>
          {[
            ["ID", solicitud.id],
            ["Equipo", solicitud.equipoId],
            ["Solicitante", solicitud.usuarioId],
            ["Fecha de retiro", solicitud.fechaRetiro],
            ["Fecha de devolución", solicitud.fechaDevolucion],
            ["Motivo", solicitud.motivo],
            ["Estado", solicitud.estado],
            ["Autorizado por", solicitud.autorizadoPor || "—"],
          ].map(([label, valor]) => (
            <tr key={label} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: "8px 12px", fontWeight: "bold", width: 180 }}>{label}</td>
              <td style={{ padding: "8px 12px" }}>{valor}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mensajes de acción */}
      {accionError && <p style={{ color: "red", marginTop: 12 }}>{accionError}</p>}
      {accionExito && <p style={{ color: "green", marginTop: 12 }}>{accionExito}</p>}

      {/* Acciones según rol y estado */}
      <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
        {(esPropietario || esAdmin) && solicitud.estado === "pendiente" && (
          <Link to={`/solicitudes/${id}/editar`}>
            <button>Editar</button>
          </Link>
        )}

        {(esPropietario || esAdmin) &&
          !["devuelta", "cancelada"].includes(solicitud.estado) && (
            <button
              onClick={() => ejecutarAccion(cancelarSolicitud, "Solicitud cancelada")}
              style={{ background: "#6b7280", color: "white" }}
            >
              Cancelar
            </button>
          )}

        {esAdmin && solicitud.estado === "pendiente" && (
          <>
            <button
              onClick={() => ejecutarAccion(aprobarSolicitud, "Solicitud aprobada")}
              style={{ background: "#10b981", color: "white" }}
            >
              Aprobar
            </button>
            <button
              onClick={() => ejecutarAccion(rechazarSolicitud, "Solicitud rechazada")}
              style={{ background: "#ef4444", color: "white" }}
            >
              Rechazar
            </button>
          </>
        )}

        {esAdmin && solicitud.estado === "aprobada" && (
          <button
            onClick={() => ejecutarAccion(devolverSolicitud, "Devolución registrada")}
            style={{ background: "#3b82f6", color: "white" }}
          >
            Marcar como devuelta
          </button>
        )}
      </div>

      {/* Historial */}
      <h3 style={{ marginTop: 32 }}>Historial de cambios</h3>
      {historial.length === 0 ? (
        <p style={{ color: "#666" }}>Sin historial registrado.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}>
          <thead>
            <tr style={{ background: "#f0f0f0" }}>
              <th style={{ padding: "8px 12px", textAlign: "left" }}>Fecha</th>
              <th style={{ padding: "8px 12px", textAlign: "left" }}>Usuario</th>
              <th style={{ padding: "8px 12px", textAlign: "left" }}>Acción</th>
              <th style={{ padding: "8px 12px", textAlign: "left" }}>Antes</th>
              <th style={{ padding: "8px 12px", textAlign: "left" }}>Después</th>
            </tr>
          </thead>
          <tbody>
            {historial.map((h) => (
              <tr key={h.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "8px 12px" }}>{new Date(h.fechaHora).toLocaleString()}</td>
                <td style={{ padding: "8px 12px" }}>{h.usuarioId}</td>
                <td style={{ padding: "8px 12px" }}>{h.accion}</td>
                <td style={{ padding: "8px 12px", fontSize: 12, color: "#666" }}>
                  {h.valorAnterior ? JSON.stringify(h.valorAnterior) : "—"}
                </td>
                <td style={{ padding: "8px 12px", fontSize: 12, color: "#666" }}>
                  {h.valorNuevo ? JSON.stringify(h.valorNuevo) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}