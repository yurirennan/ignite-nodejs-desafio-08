import { Connection, createConnection } from "typeorm"
import request from 'supertest'
import { app } from "../../../../app";

let connection: Connection;

describe("Show User Profile Controller", () => {

  beforeAll( async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async() => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to show a profile of one user", async () => {
    await request(app).post("/api/v1/users").send({
      name: "User Test",
      email: "user@email.com",
      password: "12345"
    });

    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "user@email.com",
      password: "12345",
    });

    const { token, user } = responseToken.body;


    const response = await request(app).get("/api/v1/profile")
    .send()
    .set({
      Authorization: `Bearer ${token}`,
    });

    const profile = response.body;

    expect(profile).toHaveProperty("id");
    expect(profile.name).toBe(user.name);
    expect(profile.email).toBe(user.email);
  });

  it("Should not be able to show a profile of one user if the token not exists", async () => {
    const token = ""

    const response = await request(app).get("/api/v1/profile").send();

    expect(response.status).toBe(401);
  });
})
