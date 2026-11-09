import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getEquipos } from "../api/equiposService";
import { getSolicitud, crearSolicitud, editarSolicitud } from "../api/solicitudesService";

export default function FormularioSolicitud() {
  const { id } = useParams();
  const esEdicion = Boolean(id);
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const [equipos, setEquipos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  const [form, setForm] = useState({
    equipoId: "",
    fechaRetiro: "",
    fechaDevolucion: "",
    motivo: "",
  });

  const [erroresForm, setErroresForm] = useState({});

  useEffect(() => {
    cargarEquipos();
    if (esEdicion) cargarSolicitud();
  }, [id]);

  async function cargarEquipos() {
    try {
      const res = await getEquipos({ estado: "disponible" });
      setEquipos(res.data);
    } catch {
      setError("Error al cargar equipos");
    }
  }

  async function cargarSolicitud() {
    try {
      const res = await getSolicitud(id);
      const s = res.data;
      if (s.estado !== "pendiente") {
        setError("Solo se pueden editar solicitudes en estado pendiente");
        return;
      }
      setForm({
        equipoId: s.equipoId,
        fechaRetiro: s.fechaRetiro,
        fechaDevolucion: s.fechaDevolucion,
        motivo: s.motivo,
      });
    } catch (err) {
      setError(err.response?.data?.error || "Error al cargar la solicitud");
    }
  }

  function validar() {
    const errores = {};
    if (!form.equipoId) errores.equipoId = "Seleccioná un equipo";
    if (!form.fechaRetiro) errores.fechaRetiro = "Ingresá la fecha de retiro";
    if (!form.fechaDevolucion) errores.fechaDevolucion = "Ingresá la fecha de devolución";
    if (form.fechaRetiro && form.fechaDevolucion && form.fechaRetiro >= form.fechaDevolucion) {
      errores.fechaDevolucion = "La fecha de devolución debe ser posterior al retiro";
    }
    if (!form.motivo.trim()) errores.motivo = "Ingresá un motivo";
    return errores;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setExito("");

    const errores = validar();
    if (Object.keys(errores).length > 0) {
      setErroresForm(errores);
      return;
    }
    setErroresForm({});

    setCargando(true);
    try {
      if (esEdicion) {
        await editarSolicitud(id, {
          fechaRetiro: form.fechaRetiro,
          fechaDevolucion: form.fechaDevolucion,
          motivo: form.motivo,
        });
        setExito("Solicitud actualizada correctamente");
      } else {
        await crearSolicitud(form);
        setExito("Solicitud creada correctamente");
      }
      setTimeout(() => navigate("/solicitudes"), 1200);
    } catch (err) {
      setError(err.response?.data?.error || "Error al guardar la solicitud");
    } finally {
      setCargando(false);
    }
  }

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErroresForm((e2) => ({ ...e2, [e.target.name]: "" }));
  }

  return (
    <div style={{ maxWidth: 500, margin: "0 auto", padding: 24 }}>
      <Link to="/solicitudes">← Volver al listado</Link>
      <h2 style={{ marginTop: 16 }}>
        {esEdicion ? "Editar solicitud" : "Nueva solicitud"}
      </h2>

      <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
        {/* Equipo — solo en alta */}
        {!esEdicion && (
          <div style={{ marginBottom: 16 }}>
            <label>Equipo *</label><br />
            <select
              name="equipoId"
              value={form.equipoId}
              onChange={handleChange}
              style={{ width: "100%", padding: 8 }}
            >
              <option value="">Seleccioná un equipo</option>
              {equipos.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nombre} — {e.categoria} — {e.ubicacion}
                  {e.requiereAutorizacion ? " ⚠️ requiere autorización" : ""}
                </option>
              ))}
            </select>
            {erroresForm.equipoId && (
              <p style={{ color: "red", fontSize: 13, margin: "4px 0 0" }}>
                {erroresForm.equipoId}
              </p>
            )}
          </div>
        )}

        {/* Fecha retiro */}
        <div style={{ marginBottom: 16 }}>
          <label>Fecha de retiro *</label><br />
          <input
            type="date"
            name="fechaRetiro"
            value={form.fechaRetiro}
            onChange={handleChange}
            style={{ width: "100%", padding: 8 }}
          />
          {erroresForm.fechaRetiro && (
            <p style={{ color: "red", fontSize: 13, margin: "4px 0 0" }}>
              {erroresForm.fechaRetiro}
            </p>
          )}
        </div>

        {/* Fecha devolución */}
        <div style={{ marginBottom: 16 }}>
          <label>Fecha de devolución *</label><br />
          <input
            type="date"
            name="fechaDevolucion"
            value={form.fechaDevolucion}
            onChange={handleChange}
            style={{ width: "100%", padding: 8 }}
          />
          {erroresForm.fechaDevolucion && (
            <p style={{ color: "red", fontSize: 13, margin: "4px 0 0" }}>
              {erroresForm.fechaDevolucion}
            </p>
          )}
        </div>

        {/* Motivo */}
        <div style={{ marginBottom: 16 }}>
          <label>Motivo *</label><br />
          <textarea
            name="motivo"
            value={form.motivo}
            onChange={handleChange}
            rows={3}
            style={{ width: "100%", padding: 8 }}
          />
          {erroresForm.motivo && (
            <p style={{ color: "red", fontSize: 13, margin: "4px 0 0" }}>
              {erroresForm.motivo}
            </p>
          )}
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}
        {exito && <p style={{ color: "green" }}>{exito}</p>}

        <button
          type="submit"
          disabled={cargando}
          style={{ width: "100%", padding: 10 }}
        >
          {cargando ? "Guardando..." : esEdicion ? "Guardar cambios" : "Crear solicitud"}
        </button>
      </form>
    </div>
  );
}