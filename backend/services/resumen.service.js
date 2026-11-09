const { leerJSON } = require("./db");

function obtenerResumen() {
  const equipos = leerJSON("equipos.json");
  const solicitudes = leerJSON("solicitudes.json");
  const hoy = new Date().toISOString().split("T")[0];

  const disponiblesPorCategoria = {};
  equipos.forEach((e) => {
    if (e.estado === "disponible") {
      if (!disponiblesPorCategoria[e.categoria]) {
        disponiblesPorCategoria[e.categoria] = 0;
      }
      disponiblesPorCategoria[e.categoria]++;
    }
  });

  const pendientes = solicitudes.filter((s) => s.estado === "pendiente");
  const prestados = solicitudes.filter((s) => s.estado === "aprobada");
  const vencidos = solicitudes.filter(
    (s) => s.estado === "aprobada" && s.fechaDevolucion < hoy
  );

  const vencidosDetalle = vencidos.map((s) => {
    const equipo = equipos.find((e) => e.id === s.equipoId);
    return {
      ...s,
      equipoNombre: equipo ? equipo.nombre : "Equipo desconocido",
      diasVencido: Math.floor(
        (new Date(hoy) - new Date(s.fechaDevolucion)) / (1000 * 60 * 60 * 24)
      ),
    };
  });

  return {
    equiposDisponiblesPorCategoria: disponiblesPorCategoria,
    totalEquipos: equipos.length,
    totalDisponibles: equipos.filter((e) => e.estado === "disponible").length,
    totalPrestados: equipos.filter((e) => e.estado === "prestado").length,
    totalMantenimiento: equipos.filter((e) => e.estado === "mantenimiento").length,
    solicitudesPendientes: pendientes.length,
    solicitudesAprobadas: prestados.length,
    prestamosVencidos: vencidosDetalle.length,
    detallePrestamosVencidos: vencidosDetalle,
    detallePendientes: pendientes,
  };
}

module.exports = { obtenerResumen };