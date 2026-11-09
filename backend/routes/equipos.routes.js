const express = require("express");
const router = express.Router();
const equiposController = require("../controllers/equipos.controller");
const autenticar = require("../middlewares/autenticar");

router.get("/", autenticar, equiposController.listar);
router.get("/:id", autenticar, equiposController.detalle);

module.exports = router;