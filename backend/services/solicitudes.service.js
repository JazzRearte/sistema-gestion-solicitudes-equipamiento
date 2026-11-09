const { leerJSON, escribirJSON } = require("./db");

// ─── Helpers ────────────────────────────────────────────────────────────────

function generarId(solicitudes) {
  const nums = solicitudes.map((s) => parseInt(s.id.replace("sol-", "")));
  const max = nums.length ? Math.max(...nums) : 1000;
  return `sol-${max + 1}`;
}

function generarIdHistorial(historial) {
  const nums = historial.map((h) => parseInt(h.id.replace("hist-", "")));
  const max = nums.length ? Math.max(...nums) : 0;
  return `hist-${max + 1}`;
}

function agregarHistorial({ solicitudId, usuarioId, accion, valorAnterior, valorNuevo }) {
  const historial = leerJSON("historial.json");
  const entrada = {
    id: generarIdHistorial(historial),
    solicitudId,
    usuarioId,
    accion,
    fechaHora: new Date().toISOString(),
    valorAnterior: valorAnterior ?? null,
    valorNuevo: valorNuevo ?? null,
  };
  historial.push(entrada);
  escribirJSON("historial.json", historial);
}

function haySupeposicion(retiroA, devolucionA, retiroB, devolucionB) {
  return retiroA < devolucionB && devolucionA > retiroB;
}

// ─── Validación de disponibilidad ───────────────────────────────────────────

function validarDisponibilidad(equipoId, fechaRetiro, fechaDevolucion, excluirSolicitudId = null) {
  const equipos = leerJSON("equipos.json");
  const equipo = equipos.find((e) => e.id === equipoId);

  if (!equipo) {
    const error = new Error("El equipo solicitado no existe");
    error.status = 404;
    throw error;
  }

  if (equipo.estado !== "disponible" && equipo.estado !== "prestado") {
    const error = new Error(`El equipo no está disponible (estado: ${equipo.estado})`);
    error.status = 400;
    throw error;
  }

  const solicitudes = leerJSON("solicitudes.json");
  const superpuesta = solicitudes.find((s) => {
    if (s.equipoId !== equipoId) return false;
    if (s.estado !== "aprobada") return false;
    if (excluirSolicitudId && s.id === excluirSolicitudId) return false;
    return haySupeposicion(fechaRetiro, fechaDevolucion, s.fechaRetiro, s.fechaDevolucion);
  });

  if (superpuesta) {
    const error = new Error(
      `El equipo ya tiene un préstamo aprobado que se superpone con el período solicitado (${superpuesta.fechaRetiro} - ${superpuesta.fechaDevolucion})`
    );
    error.status = 400;
    throw error;
  }

  return equipo;
}

// ─── Listar ─────────────────────────────────────────────────────────────────

function listarSolicitudes({ estado, equipoId, categoria, desde, hasta, page, limit, sortBy, order, usuarioId, rol }) {
  let solicitudes = leerJSON("solicitudes.json");
  const equipos = leerJSON("equipos.json");

  if (rol === "usuario") {
    solicitudes = solicitudes.filter((s) => s.usuarioId === usuarioId);
  }

  if (estado) solicitudes = solicitudes.filter((s) => s.estado === estado);
  if (equipoId) solicitudes = solicitudes.filter((s) => s.equipoId === equipoId);
  if (desde) solicitudes = solicitudes.filter((s) => s.fechaRetiro >= desde);
  if (hasta) solicitudes = solicitudes.filter((s) => s.fechaDevolucion <= hasta);

  if (categoria) {
    const equiposDeLaCategoria = equipos
      .filter((e) => e.categoria === categoria)
      .map((e) => e.id);
    solicitudes = solicitudes.filter((s) => equiposDeLaCategoria.includes(s.equipoId));
  }

  const camposValidos = ["fechaRetiro", "fechaDevolucion", "estado", "id"];
  const campo = camposValidos.includes(sortBy) ? sortBy : "fechaRetiro";
  const direccion = order === "desc" ? -1 : 1;
  solicitudes.sort((a, b) => {
    if (a[campo] < b[campo]) return -1 * direccion;
    if (a[campo] > b[campo]) return 1 * direccion;
    return 0;
  });

  const pagina = Math.max(parseInt(page) || 1, 1);
  const porPagina = Math.min(Math.max(parseInt(limit) || 10, 1), 100);
  const total = solicitudes.length;
  const inicio = (pagina - 1) * porPagina;
  const datos = solicitudes.slice(inicio, inicio + porPagina);

  return {
    datos,
    paginacion: {
      total,
      page: pagina,
      limit: porPagina,
      totalPaginas: Math.ceil(total / porPagina),
    },
  };
}

// ─── Detalle ─────────────────────────────────────────────────────────────────

function obtenerSolicitud(id, { usuarioId, rol }) {
  const solicitudes = leerJSON("solicitudes.json");
  const solicitud = solicitudes.find((s) => s.id === id);

  if (!solicitud) {
    const error = new Error("Solicitud no encontrada");
    error.status = 404;
    throw error;
  }

  if (rol === "usuario" && solicitud.usuarioId !== usuarioId) {
    const error = new Error("No tenés permisos para ver esta solicitud");
    error.status = 403;
    throw error;
  }

  return solicitud;
}

// ─── Crear ───────────────────────────────────────────────────────────────────

function crearSolicitud({ equipoId, usuarioId, fechaRetiro, fechaDevolucion, motivo }) {
  if (!fechaRetiro || !fechaDevolucion || !motivo || !equipoId) {
    const error = new Error("equipoId, fechaRetiro, fechaDevolucion y motivo son obligatorios");
    error.status = 400;
    throw error;
  }

  if (fechaRetiro >= fechaDevolucion) {
    const error = new Error("La fecha de retiro debe ser anterior a la fecha de devolución");
    error.status = 400;
    throw error;
  }

  validarDisponibilidad(equipoId, fechaRetiro, fechaDevolucion);

  const solicitudes = leerJSON("solicitudes.json");
  const nueva = {
    id: generarId(solicitudes),
    equipoId,
    usuarioId,
    fechaRetiro,
    fechaDevolucion,
    motivo,
    estado: "pendiente",
    autorizadoPor: null,
  };

  solicitudes.push(nueva);
  escribirJSON("solicitudes.json", solicitudes);

  agregarHistorial({
    solicitudId: nueva.id,
    usuarioId,
    accion: "creacion",
    valorAnterior: null,
    valorNuevo: { estado: "pendiente" },
  });

  return nueva;
}

// ─── Editar ──────────────────────────────────────────────────────────────────

function editarSolicitud(id, { fechaRetiro, fechaDevolucion, motivo }, { usuarioId, rol }) {
  const solicitudes = leerJSON("solicitudes.json");
  const idx = solicitudes.findIndex((s) => s.id === id);

  if (idx === -1) {
    const error = new Error("Solicitud no encontrada");
    error.status = 404;
    throw error;
  }

  const solicitud = solicitudes[idx];

  if (solicitud.estado !== "pendiente") {
    const error = new Error("Solo se pueden editar solicitudes en estado pendiente");
    error.status = 400;
    throw error;
  }

  if (rol === "usuario" && solicitud.usuarioId !== usuarioId) {
    const error = new Error("No tenés permisos para editar esta solicitud");
    error.status = 403;
    throw error;
  }

  const nuevaFechaRetiro = fechaRetiro || solicitud.fechaRetiro;
  const nuevaFechaDevolucion = fechaDevolucion || solicitud.fechaDevolucion;

  if (nuevaFechaRetiro >= nuevaFechaDevolucion) {
    const error = new Error("La fecha de retiro debe ser anterior a la fecha de devolución");
    error.status = 400;
    throw error;
  }

  const anterior = {
    fechaRetiro: solicitud.fechaRetiro,
    fechaDevolucion: solicitud.fechaDevolucion,
    motivo: solicitud.motivo,
  };

  solicitud.fechaRetiro = nuevaFechaRetiro;
  solicitud.fechaDevolucion = nuevaFechaDevolucion;
  if (motivo) solicitud.motivo = motivo;

  solicitudes[idx] = solicitud;
  escribirJSON("solicitudes.json", solicitudes);

  agregarHistorial({
    solicitudId: id,
    usuarioId,
    accion: "edicion",
    valorAnterior: anterior,
    valorNuevo: {
      fechaRetiro: solicitud.fechaRetiro,
      fechaDevolucion: solicitud.fechaDevolucion,
      motivo: solicitud.motivo,
    },
  });

  return solicitud;
}

// ─── Cancelar ────────────────────────────────────────────────────────────────

function cancelarSolicitud(id, { usuarioId, rol }) {
  const solicitudes = leerJSON("solicitudes.json");
  const idx = solicitudes.findIndex((s) => s.id === id);

  if (idx === -1) {
    const error = new Error("Solicitud no encontrada");
    error.status = 404;
    throw error;
  }

  const solicitud = solicitudes[idx];

  if (rol === "usuario" && solicitud.usuarioId !== usuarioId) {
    const error = new Error("Solo podés cancelar tus propias solicitudes");
    error.status = 403;
    throw error;
  }

  if (solicitud.estado === "devuelta" || solicitud.estado === "cancelada") {
    const error = new Error(`No se puede cancelar una solicitud en estado ${solicitud.estado}`);
    error.status = 400;
    throw error;
  }

  const estadoAnterior = solicitud.estado;
  solicitud.estado = "cancelada";
  solicitudes[idx] = solicitud;
  escribirJSON("solicitudes.json", solicitudes);

  if (estadoAnterior === "aprobada") {
    _cambiarEstadoEquipo(solicitud.equipoId, "disponible");
  }

  agregarHistorial({
    solicitudId: id,
    usuarioId,
    accion: "cancelacion",
    valorAnterior: { estado: estadoAnterior },
    valorNuevo: { estado: "cancelada" },
  });

  return solicitud;
}

// ─── Aprobar ─────────────────────────────────────────────────────────────────

function aprobarSolicitud(id, { usuarioId, rol }) {
  const solicitudes = leerJSON("solicitudes.json");
  const idx = solicitudes.findIndex((s) => s.id === id);

  if (idx === -1) {
    const error = new Error("Solicitud no encontrada");
    error.status = 404;
    throw error;
  }

  const solicitud = solicitudes[idx];

  if (solicitud.estado !== "pendiente") {
    const error = new Error(`No se puede aprobar una solicitud en estado ${solicitud.estado}`);
    error.status = 400;
    throw error;
  }

  const equipos = leerJSON("equipos.json");
  const equipo = equipos.find((e) => e.id === solicitud.equipoId);

  if (equipo && equipo.requiereAutorizacion && rol === "usuario") {
    const error = new Error("Este equipo requiere autorización de un encargado o administrador");
    error.status = 403;
    throw error;
  }

  validarDisponibilidad(solicitud.equipoId, solicitud.fechaRetiro, solicitud.fechaDevolucion, id);

  solicitud.estado = "aprobada";
  solicitud.autorizadoPor = usuarioId;
  solicitudes[idx] = solicitud;
  escribirJSON("solicitudes.json", solicitudes);

  _cambiarEstadoEquipo(solicitud.equipoId, "prestado");

  agregarHistorial({
    solicitudId: id,
    usuarioId,
    accion: "aprobacion",
    valorAnterior: { estado: "pendiente" },
    valorNuevo: { estado: "aprobada" },
  });

  return solicitud;
}

// ─── Rechazar ────────────────────────────────────────────────────────────────

function rechazarSolicitud(id, { usuarioId }) {
  const solicitudes = leerJSON("solicitudes.json");
  const idx = solicitudes.findIndex((s) => s.id === id);

  if (idx === -1) {
    const error = new Error("Solicitud no encontrada");
    error.status = 404;
    throw error;
  }

  const solicitud = solicitudes[idx];

  if (solicitud.estado !== "pendiente") {
    const error = new Error(`No se puede rechazar una solicitud en estado ${solicitud.estado}`);
    error.status = 400;
    throw error;
  }

  solicitud.estado = "rechazada";
  solicitudes[idx] = solicitud;
  escribirJSON("solicitudes.json", solicitudes);

  agregarHistorial({
    solicitudId: id,
    usuarioId,
    accion: "rechazo",
    valorAnterior: { estado: "pendiente" },
    valorNuevo: { estado: "rechazada" },
  });

  return solicitud;
}

// ─── Devolver ────────────────────────────────────────────────────────────────

function devolverSolicitud(id, { usuarioId }) {
  const solicitudes = leerJSON("solicitudes.json");
  const idx = solicitudes.findIndex((s) => s.id === id);

  if (idx === -1) {
    const error = new Error("Solicitud no encontrada");
    error.status = 404;
    throw error;
  }

  const solicitud = solicitudes[idx];

  if (solicitud.estado !== "aprobada") {
    const error = new Error("Solo se pueden devolver solicitudes en estado aprobada");
    error.status = 400;
    throw error;
  }

  solicitud.estado = "devuelta";
  solicitudes[idx] = solicitud;
  escribirJSON("solicitudes.json", solicitudes);

  _cambiarEstadoEquipo(solicitud.equipoId, "disponible");

  agregarHistorial({
    solicitudId: id,
    usuarioId,
    accion: "devolucion",
    valorAnterior: { estado: "aprobada" },
    valorNuevo: { estado: "devuelta" },
  });

  return solicitud;
}

// ─── Helper interno ──────────────────────────────────────────────────────────

function _cambiarEstadoEquipo(equipoId, nuevoEstado) {
  const equipos = leerJSON("equipos.json");
  const idx = equipos.findIndex((e) => e.id === equipoId);
  if (idx !== -1) {
    equipos[idx].estado = nuevoEstado;
    escribirJSON("equipos.json", equipos);
  }
}

module.exports = {
  listarSolicitudes,
  obtenerSolicitud,
  crearSolicitud,
  editarSolicitud,
  cancelarSolicitud,
  aprobarSolicitud,
  rechazarSolicitud,
  devolverSolicitud,
};