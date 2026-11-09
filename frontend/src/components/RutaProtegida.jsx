import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// roles: array de roles permitidos, ej: ["admin", "encargado"]
// Si está vacío, solo requiere estar autenticado
export default function RutaProtegida({ children, roles = [] }) {
  const { usuario } = useAuth();

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (roles.length > 0 && !roles.includes(usuario.rol)) {
    return <Navigate to="/solicitudes" replace />;
  }

  return children;
}