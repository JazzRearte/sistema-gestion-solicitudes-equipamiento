import api from "./axios";

export const getSolicitudes = (params = {}) =>
  api.get("/solicitudes", { params });

export const getSolicitud = (id) =>
  api.get(`/solicitudes/${id}`);

export const getHistorial = (id) =>
  api.get(`/solicitudes/${id}/historial`);

export const getResumen = () =>
  api.get("/solicitudes/resumen");

export const crearSolicitud = (datos) =>
  api.post("/solicitudes", datos);

export const editarSolicitud = (id, datos) =>
  api.put(`/solicitudes/${id}`, datos);

export const cancelarSolicitud = (id) =>
  api.patch(`/solicitudes/${id}/cancelar`);

export const aprobarSolicitud = (id) =>
  api.patch(`/solicitudes/${id}/aprobar`);

export const rechazarSolicitud = (id) =>
  api.patch(`/solicitudes/${id}/rechazar`);

export const devolverSolicitud = (id) =>
  api.patch(`/solicitudes/${id}/devolver`);