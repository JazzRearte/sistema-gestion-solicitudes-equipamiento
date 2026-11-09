const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "../data");

function leerJSON(archivo) {
  const ruta = path.join(DATA_DIR, archivo);
  const contenido = fs.readFileSync(ruta, "utf-8");
  return JSON.parse(contenido);
}

function escribirJSON(archivo, datos) {
  const ruta = path.join(DATA_DIR, archivo);
  fs.writeFileSync(ruta, JSON.stringify(datos, null, 2), "utf-8");
}

module.exports = { leerJSON, escribirJSON };