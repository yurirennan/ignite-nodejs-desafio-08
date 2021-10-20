import { Connection, createConnection } from "typeorm";
import request from 'supertest'
import { app } from "../../../../app";

let connection: Connection;

describe("Get Balance Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });



  it("Should be able to show all operations by user", async () => {
    await request(app).post("/api/v1/users").send({
      name: "User Test",
      email: "user@email.com",
      password: "12345"
    });

    const responseWithToken = await request(app).post("/api/v1/sessions").send({
      email: "user@email.com",
      password: "12345",
    });

    const { token, user } = responseWithToken.body;

    const response = await request(app).get("/api/v1/statements/balance").set({
      Authorization: `Bearer ${token}`
    });

    const { statement, balance} = response.body;

    expect(response.status).toBe(200)
    expect(statement).toHaveLength(0);
    expect(balance).toBe(0);
  });

  it("Should be able to show all operations by user with 1 operation of each", async () => {
    await request(app).post("/api/v1/users").send({
      name: "User Test",
      email: "user@email.com",
      password: "12345"
    });

    const responseWithToken = await request(app).post("/api/v1/sessions").send({
      email: "user@email.com",
      password: "12345",
    });

    const { token, user } = responseWithToken.body;

    await request(app).post("/api/v1/statements/deposit").send({
      amount: 500.00,
      description: "Deposito de aluguel"
    }).set({
      Authorization: `Bearer ${token}`,
    });

    await request(app).post("/api/v1/statements/withdraw").send({
      amount: 500.00,
      description: "Pagamento de contas"
    }).set({
      Authorization: `Bearer ${token}`,
    });

    const response = await request(app).get("/api/v1/statements/balance").send().set({
      Authorization: `Bearer ${token}`
    });

    const { statement, balance} = response.body;

    expect(response.status).toBe(200)
    expect(statement).toHaveLength(2);
    expect(balance).toBe(0);
  });
})
