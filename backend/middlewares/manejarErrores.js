function manejarErrores(err, req, res, next) {
  const status = err.status || 500;
  const mensaje = err.message || "Error interno del servidor";
  if (process.env.NODE_ENV !== "test") {
    console.error(`[${status}] ${mensaje}`);
  }
  return res.status(status).json({ error: mensaje });
}

module.exports = manejarErrores;