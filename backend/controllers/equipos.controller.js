const equiposService = require("../services/equipos.service");

function listar(req, res, next) {
  try {
    const { categoria, estado, requiereAutorizacion } = req.query;
    const equipos = equiposService.listarEquipos({ categoria, estado, requiereAutorizacion });
    return res.status(200).json(equipos);
  } catch (err) {
    next(err);
  }
}

function detalle(req, res, next) {
  try {
    const equipo = equiposService.obtenerEquipoPorId(req.params.id);
    return res.status(200).json(equipo);
  } catch (err) {
    next(err);
  }
}

module.exports = { listar, detalle };