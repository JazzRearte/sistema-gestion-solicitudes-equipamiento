const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { leerJSON, escribirJSON } = require("./db");

function generarId(usuarios) {
  return `usr-${String(usuarios.length + 1).padStart(3, "0")}`;
}

async function registrar({ nombre, email, password, rol }) {
  const usuarios = leerJSON("usuarios.json");

  const existe = usuarios.find((u) => u.email === email);
  if (existe) {
    const error = new Error("El email ya está registrado");
    error.status = 400;
    throw error;
  }

  const rolesPermitidos = ["usuario", "encargado"];
  const rolFinal = rolesPermitidos.includes(rol) ? rol : "usuario";

  const passwordHash = await bcrypt.hash(password, 10);

  const nuevoUsuario = {
    id: generarId(usuarios),
    nombre,
    email,
    passwordHash,
    rol: rolFinal,
    activo: true,
  };

  usuarios.push(nuevoUsuario);
  escribirJSON("usuarios.json", usuarios);

  const { passwordHash: _, ...usuarioSinHash } = nuevoUsuario;
  return usuarioSinHash;
}

async function login({ email, password }) {
  const usuarios = leerJSON("usuarios.json");

  const usuario = usuarios.find((u) => u.email === email);
  if (!usuario) {
    const error = new Error("Email o contraseña incorrectos");
    error.status = 401;
    throw error;
  }

  if (!usuario.activo) {
    const error = new Error("Usuario inactivo");
    error.status = 401;
    throw error;
  }

  const passwordValida = await bcrypt.compare(password, usuario.passwordHash);
  if (!passwordValida) {
    const error = new Error("Email o contraseña incorrectos");
    error.status = 401;
    throw error;
  }

  const payload = {
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
    rol: usuario.rol,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  return { token, usuario: payload };
}

module.exports = { registrar, login };