const request = require("supertest");
const app = require("../index");
const { resetearDatos } = require("./testHelpers");

async function login(email = "admin@test.com") {
  const res = await request(app)
    .post("/api/auth/login")
    .send({ email, password: "password123" });
  return res.body.token;
}

beforeEach(() => resetearDatos());

// ─── Acceso sin JWT ───────────────────────────────────────────────────────────

describe("Acceso sin JWT", () => {
  test("7. GET /api/solicitudes sin token devuelve 401", async () => {
    const res = await request(app).get("/api/solicitudes");
    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });

  test("7b. POST /api/solicitudes sin token devuelve 401", async () => {
    const res = await request(app).post("/api/solicitudes").send({});
    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });
});

// ─── Acceso con rol insuficiente ─────────────────────────────────────────────

describe("Acceso con rol insuficiente", () => {
  test("8. Usuario intenta aprobar solicitud y recibe 403", async () => {
    const token = await login("usuario@test.com");
    const res = await request(app)
      .patch("/api/solicitudes/sol-001/aprobar")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.error).toBeDefined();
  });

  test("8b. Usuario intenta rechazar solicitud y recibe 403", async () => {
    const token = await login("usuario@test.com");
    const res = await request(app)
      .patch("/api/solicitudes/sol-001/rechazar")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.error).toBeDefined();
  });

  test("8c. Usuario intenta ver resumen y recibe 403", async () => {
    const token = await login("usuario@test.com");
    const res = await request(app)
      .get("/api/solicitudes/resumen")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.error).toBeDefined();
  });
});

// ─── Listado ─────────────────────────────────────────────────────────────────

describe("GET /api/solicitudes", () => {
  test("2. Listado sin filtros devuelve todas las solicitudes (admin)", async () => {
    const token = await login("admin@test.com");
    const res = await request(app)
      .get("/api/solicitudes")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.datos).toBeInstanceOf(Array);
    expect(res.body.paginacion).toBeDefined();
    expect(res.body.paginacion.total).toBe(4);
  });

  test("2b. Listado filtrado por estado pendiente", async () => {
    const token = await login("admin@test.com");
    const res = await request(app)
      .get("/api/solicitudes?estado=pendiente")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.datos.every((s) => s.estado === "pendiente")).toBe(true);
  });

  test("2c. Paginación: page=1&limit=2 devuelve 2 resultados", async () => {
    const token = await login("admin@test.com");
    const res = await request(app)
      .get("/api/solicitudes?page=1&limit=2")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.datos.length).toBe(2);
    expect(res.body.paginacion.totalPaginas).toBe(2);
  });

  test("2d. Usuario solo ve sus propias solicitudes", async () => {
    const token = await login("usuario@test.com");
    const res = await request(app)
      .get("/api/solicitudes")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.datos.every((s) => s.usuarioId === "usr-003")).toBe(true);
  });
});

// ─── Detalle ─────────────────────────────────────────────────────────────────

describe("GET /api/solicitudes/:id", () => {
  test("3. Detalle de solicitud existente devuelve 200", async () => {
    const token = await login("admin@test.com");
    const res = await request(app)
      .get("/api/solicitudes/sol-001")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe("sol-001");
  });

  test("3b. Detalle de solicitud inexistente devuelve 404", async () => {
    const token = await login("admin@test.com");
    const res = await request(app)
      .get("/api/solicitudes/sol-999")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
  });
});

// ─── Crear ────────────────────────────────────────────────────────────────────

describe("POST /api/solicitudes", () => {
  test("4. Creación válida de solicitud devuelve 201", async () => {
    const token = await login("usuario@test.com");
    const res = await request(app)
      .post("/api/solicitudes")
      .set("Authorization", `Bearer ${token}`)
      .send({
        equipoId: "eq-001",
        fechaRetiro: "2026-09-01",
        fechaDevolucion: "2026-09-05",
        motivo: "Práctica de laboratorio",
      });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.estado).toBe("pendiente");
  });

  test("5. Creación inválida por fechas inconsistentes devuelve 400", async () => {
    const token = await login("usuario@test.com");
    const res = await request(app)
      .post("/api/solicitudes")
      .set("Authorization", `Bearer ${token}`)
      .send({
        equipoId: "eq-001",
        fechaRetiro: "2026-09-05",
        fechaDevolucion: "2026-09-01",
        motivo: "Test",
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/fecha/i);
  });

  test("5b. Creación inválida por fechas iguales devuelve 400", async () => {
    const token = await login("usuario@test.com");
    const res = await request(app)
      .post("/api/solicitudes")
      .set("Authorization", `Bearer ${token}`)
      .send({
        equipoId: "eq-001",
        fechaRetiro: "2026-09-01",
        fechaDevolucion: "2026-09-01",
        motivo: "Test",
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/fecha/i);
  });

  test("6. Creación inválida por equipo en mantenimiento devuelve 400", async () => {
    const token = await login("usuario@test.com");
    const res = await request(app)
      .post("/api/solicitudes")
      .set("Authorization", `Bearer ${token}`)
      .send({
        equipoId: "eq-004",
        fechaRetiro: "2026-09-01",
        fechaDevolucion: "2026-09-05",
        motivo: "Test",
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/disponible/i);
  });

  test("6b. Creación inválida por superposición con solicitud aprobada devuelve 400", async () => {
    const token = await login("usuario@test.com");
    const res = await request(app)
      .post("/api/solicitudes")
      .set("Authorization", `Bearer ${token}`)
      .send({
        equipoId: "eq-002",
        fechaRetiro: "2026-07-12",
        fechaDevolucion: "2026-07-14",
        motivo: "Test superposición",
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/superpone/i);
  });

  test("6c. Creación inválida por equipo inexistente devuelve 404", async () => {
    const token = await login("usuario@test.com");
    const res = await request(app)
      .post("/api/solicitudes")
      .set("Authorization", `Bearer ${token}`)
      .send({
        equipoId: "eq-999",
        fechaRetiro: "2026-09-01",
        fechaDevolucion: "2026-09-05",
        motivo: "Test",
      });

    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/equipo/i);
  });
});

// ─── Devolución inválida ──────────────────────────────────────────────────────

describe("PATCH /api/solicitudes/:id/devolver", () => {
  test("9. Devolver solicitud rechazada devuelve 400", async () => {
    const token = await login("admin@test.com");
    const res = await request(app)
      .patch("/api/solicitudes/sol-003/devolver")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/aprobada/i);
  });

  test("9b. Devolver solicitud pendiente devuelve 400", async () => {
    const token = await login("admin@test.com");
    const res = await request(app)
      .patch("/api/solicitudes/sol-001/devolver")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/aprobada/i);
  });
});

// ─── Transiciones de estado no permitidas ────────────────────────────────────

describe("Transiciones de estado inválidas", () => {
  test("10. Aprobar solicitud ya rechazada devuelve 400", async () => {
    const token = await login("admin@test.com");
    const res = await request(app)
      .patch("/api/solicitudes/sol-003/aprobar")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/rechazada/i);
  });

  test("10b. Aprobar solicitud ya aprobada devuelve 400", async () => {
    const token = await login("admin@test.com");
    const res = await request(app)
      .patch("/api/solicitudes/sol-002/aprobar")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/aprobada/i);
  });

  test("10c. Cancelar solicitud ya devuelta devuelve 400", async () => {
    const token = await login("admin@test.com");
    await request(app)
      .patch("/api/solicitudes/sol-002/devolver")
      .set("Authorization", `Bearer ${token}`);

    const res = await request(app)
      .patch("/api/solicitudes/sol-002/cancelar")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/devuelta/i);
  });
});