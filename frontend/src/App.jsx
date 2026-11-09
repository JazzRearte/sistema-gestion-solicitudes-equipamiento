import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import RutaProtegida from "./components/RutaProtegida";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ListadoSolicitudes from "./pages/ListadoSolicitudes";
import DetalleSolicitud from "./pages/DetalleSolicitud";
import FormularioSolicitud from "./pages/FormularioSolicitud";
import Resumen from "./pages/Resumen";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protegidas — cualquier usuario autenticado */}
          <Route path="/solicitudes" element={
            <RutaProtegida><ListadoSolicitudes /></RutaProtegida>
          } />
          <Route path="/solicitudes/nueva" element={
            <RutaProtegida><FormularioSolicitud /></RutaProtegida>
          } />
          <Route path="/solicitudes/:id" element={
            <RutaProtegida><DetalleSolicitud /></RutaProtegida>
          } />
          <Route path="/solicitudes/:id/editar" element={
            <RutaProtegida><FormularioSolicitud /></RutaProtegida>
          } />

          {/* Solo admin o encargado */}
          <Route path="/resumen" element={
            <RutaProtegida roles={["admin", "encargado"]}><Resumen /></RutaProtegida>
          } />

          {/* Redirects y 404 */}
          <Route path="/" element={<Navigate to="/solicitudes" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}