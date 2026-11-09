require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const manejarErrores = require("./middlewares/manejarErrores");
const equiposRoutes = require("./routes/equipos.routes");
const solicitudesRoutes = require("./routes/solicitudes.routes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/equipos", equiposRoutes);
app.use("/api/solicitudes", solicitudesRoutes);

app.use("/api/auth", authRoutes);

app.get("/api/health", (req, res) => {
  res.json({ estado: "ok" });
});

app.use(manejarErrores);

const PORT = process.env.PORT || 3001;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
}

module.exports = app;