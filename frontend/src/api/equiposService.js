import api from "./axios";

export const getEquipos = (filtros = {}) =>
  api.get("/equipos", { params: filtros });