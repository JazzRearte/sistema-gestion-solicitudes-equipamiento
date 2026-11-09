const solicitudesService = require("../services/solicitudes.service");
const { leerJSON } = require("../services/db");
const resumenService = require("../services/resumen.service");

function listar(req, res, next) {
  try {
    const { estado, equipoId, categoria, desde, hasta, page, limit, sortBy, order } = req.query;
    const resultado = solicitudesService.listarSolicitudes({
      estado, equipoId, categoria, desde, hasta,
      page, limit, sortBy, order,
      usuarioId: req.usuario.id,
      rol: req.usuario.rol,
    });
    return res.status(200).json(resultado);
  } catch (err) {
    next(err);
  }
}

function detalle(req, res, next) {
  try {
    const solicitud = solicitudesService.obtenerSolicitud(req.params.id, {
      usuarioId: req.usuario.id,
      rol: req.usuario.rol,
    });
    return res.status(200).json(solicitud);
  } catch (err) {
    next(err);
  }
}

function historial(req, res, next) {
  try {
    solicitudesService.obtenerSolicitud(req.params.id, {
      usuarioId: req.usuario.id,
      rol: req.usuario.rol,
    });
    const historialCompleto = leerJSON("historial.json");
    const historialSolicitud = historialCompleto.filter(
      (h) => h.solicitudId === req.params.id
    );
    return res.status(200).json(historialSolicitud);
  } catch (err) {
    next(err);
  }
}

function crear(req, res, next) {
  try {
    const { equipoId, fechaRetiro, fechaDevolucion, motivo } = req.body;
    const nueva = solicitudesService.crearSolicitud({
      equipoId, fechaRetiro, fechaDevolucion, motivo,
      usuarioId: req.usuario.id,
    });
    return res.status(201).json(nueva);
  } catch (err) {
    next(err);
  }
}

function editar(req, res, next) {
  try {
    const { fechaRetiro, fechaDevolucion, motivo } = req.body;
    const actualizada = solicitudesService.editarSolicitud(
      req.params.id,
      { fechaRetiro, fechaDevolucion, motivo },
      { usuarioId: req.usuario.id, rol: req.usuario.rol }
    );
    return res.status(200).json(actualizada);
  } catch (err) {
    next(err);
  }
}

function cancelar(req, res, next) {
  try {
    const resultado = solicitudesService.cancelarSolicitud(req.params.id, {
      usuarioId: req.usuario.id,
      rol: req.usuario.rol,
    });
    return res.status(200).json(resultado);
  } catch (err) {
    next(err);
  }
}

function aprobar(req, res, next) {
  try {
    const resultado = solicitudesService.aprobarSolicitud(req.params.id, {
      usuarioId: req.usuario.id,
      rol: req.usuario.rol,
    });
    return res.status(200).json(resultado);
  } catch (err) {
    next(err);
  }
}

function rechazar(req, res, next) {
  try {
    const resultado = solicitudesService.rechazarSolicitud(req.params.id, {
      usuarioId: req.usuario.id,
    });
    return res.status(200).json(resultado);
  } catch (err) {
    next(err);
  }
}

function devolver(req, res, next) {
  try {
    const resultado = solicitudesService.devolverSolicitud(req.params.id, {
      usuarioId: req.usuario.id,
    });
    return res.status(200).json(resultado);
  } catch (err) {
    next(err);
  }
}

function resumen(req, res, next) {
  try {
    const datos = resumenService.obtenerResumen();
    return res.status(200).json(datos);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listar, detalle, historial, crear, editar,
  cancelar, aprobar, rechazar, devolver, resumen,
};