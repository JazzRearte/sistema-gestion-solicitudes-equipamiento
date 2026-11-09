import api from "./axios";

export const login = (email, password) =>
  api.post("/auth/login", { email, password });

export const register = (nombre, email, password) =>
  api.post("/auth/register", { nombre, email, password });