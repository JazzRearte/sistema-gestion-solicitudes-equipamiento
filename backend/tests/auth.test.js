const request = require("supertest");
const app = require("../index");
const { resetearDatos } = require("./testHelpers");

beforeEach(() => resetearDatos());

describe("POST /api/auth/login", () => {
  test("1. Login correcto devuelve token y datos del usuario", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@test.com", password: "password123" });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.usuario).toBeDefined();
    expect(res.body.usuario.email).toBe("admin@test.com");
    expect(res.body.usuario.passwordHash).toBeUndefined();
  });

  test("2. Login con contraseña incorrecta devuelve 401", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@test.com", password: "incorrecta" });

    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });

  test("3. Login con email inexistente devuelve 401", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "noexiste@test.com", password: "password123" });

    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });

  test("4. Login sin campos obligatorios devuelve 400", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@test.com" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});