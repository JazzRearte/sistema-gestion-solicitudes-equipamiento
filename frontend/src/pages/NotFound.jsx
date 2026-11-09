import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div style={{ textAlign: "center", marginTop: 80 }}>
      <h2>404 — Página no encontrada</h2>
      <p>La ruta que buscás no existe.</p>
      <Link to="/solicitudes">Volver al inicio</Link>
    </div>
  );
}