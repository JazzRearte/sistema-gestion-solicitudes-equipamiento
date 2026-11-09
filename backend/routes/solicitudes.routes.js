const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/solicitudes.controller");
const autenticar = require("../middlewares/autenticar");
const autorizar = require("../middlewares/autorizar");

router.use(autenticar);

router.get("/resumen", autorizar("admin", "encargado"), ctrl.resumen);

router.get("/", ctrl.listar);
router.get("/:id/historial", ctrl.historial);
router.get("/:id", ctrl.detalle);

router.post("/", ctrl.crear);
router.put("/:id", ctrl.editar);
router.patch("/:id/cancelar", ctrl.cancelar);

router.patch("/:id/aprobar", autorizar("admin", "encargado"), ctrl.aprobar);
router.patch("/:id/rechazar", autorizar("admin", "encargado"), ctrl.rechazar);
router.patch("/:id/devolver", autorizar("admin", "encargado"), ctrl.devolver);

module.exports = router;