import { Connection, createConnection } from "typeorm";
import request from 'supertest';
import { app } from "../../../../app";

let connection: Connection;

describe("Authenticate User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })

  it("Should be able to authenticate a user", async () => {
    await request(app).post("/api/v1/users").send({
      name: "User Test",
      email: "user@email.com",
      password: "12345"
    });

    const response = await request(app).post("/api/v1/sessions").send({
      email: "user@email.com",
      password: "12345",
    });

    const { token, user } = response.body;

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("user");
    expect(response.body).toHaveProperty("token");
    expect(user.email).toEqual("user@email.com");
    expect(user.name).toEqual("User Test");
  });

  it("Should no be able to authenticate a user if the password is incorrect", async () => {
    await request(app).post("/api/v1/users").send({
      name: "User Test",
      email: "user@email.com",
      password: "12345"
    });

    const response = await request(app).post("/api/v1/sessions").send({
      email: "user@email.com",
      password: "123456",
    });

    expect(response.status).toBe(401);
  });
});
