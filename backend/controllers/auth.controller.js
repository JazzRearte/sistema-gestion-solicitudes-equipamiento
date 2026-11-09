const authService = require("../services/auth.service");

async function register(req, res, next) {
  try {
    const { nombre, email, password, rol } = req.body;
    if (!nombre || !email || !password) {
      return res.status(400).json({ error: "nombre, email y password son obligatorios" });
    }
    const usuario = await authService.registrar({ nombre, email, password, rol });
    return res.status(201).json({ mensaje: "Usuario registrado correctamente", usuario });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "email y password son obligatorios" });
    }
    const resultado = await authService.login({ email, password });
    return res.status(200).json(resultado);
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login };