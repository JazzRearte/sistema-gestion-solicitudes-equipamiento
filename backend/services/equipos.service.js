const { leerJSON } = require("./db");

function listarEquipos({ categoria, estado, requiereAutorizacion } = {}) {
  let equipos = leerJSON("equipos.json");

  if (categoria) {
    equipos = equipos.filter((e) => e.categoria === categoria);
  }

  if (estado) {
    equipos = equipos.filter((e) => e.estado === estado);
  }

  if (requiereAutorizacion !== undefined) {
    const valor = requiereAutorizacion === "true" || requiereAutorizacion === true;
    equipos = equipos.filter((e) => e.requiereAutorizacion === valor);
  }

  return equipos;
}

function obtenerEquipoPorId(id) {
  const equipos = leerJSON("equipos.json");
  const equipo = equipos.find((e) => e.id === id);
  if (!equipo) {
    const error = new Error("Equipo no encontrado");
    error.status = 404;
    throw error;
  }
  return equipo;
}

module.exports = { listarEquipos, obtenerEquipoPorId };