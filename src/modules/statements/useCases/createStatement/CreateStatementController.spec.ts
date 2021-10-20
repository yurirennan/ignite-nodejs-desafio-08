import { Connection, createConnection } from "typeorm";
import request from 'supertest';
import { app } from "../../../../app";


let connection: Connection;

describe("Create Statement Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to create a new Deposit Operation", async() => {
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

    const response = await request(app).post("/api/v1/statements/deposit").send({
      amount: 500.00,
      description: "Deposito de aluguel"
    }).set({
      Authorization: `Bearer ${token}`,
    });

    const { type, amount, description } = response.body;

    expect(response.status).toBe(201);
    expect(type).toBe("deposit");
    expect(amount).toBe(500.00);
    expect(description).toBe("Deposito de aluguel");
  });

  it("Should not be able to create a new Deposit Operation if the user not authenticated", async() => {
    const response = await request(app).post("/api/v1/statements/deposit").send({
      amount: 500.00,
      description: "Salario"
    }).set({
      Authorization: `Bearer `,
    });

    expect(response.status).toBe(401);
  });

  it("Should be able to create a new Withdraw Operation", async() => {
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
      description: "Salario"
    }).set({
      Authorization: `Bearer ${token}`,
    });

    const response = await request(app).post("/api/v1/statements/withdraw").send({
      amount: 500.00,
      description: "Pagamento de contas"
    }).set({
      Authorization: `Bearer ${token}`,
    });

    const { type, amount, description } = response.body;

    expect(response.status).toBe(201);
    expect(type).toBe("withdraw");
    expect(amount).toBe(500.00);
    expect(description).toBe("Pagamento de contas");
  });

  it("Should not be able to create a new Withdraw Operation if the amount less than balance", async() => {
    await request(app).post("/api/v1/users").send({
      name: "User Test 2",
      email: "user2@email.com",
      password: "123456"
    });

    const responseWithToken = await request(app).post("/api/v1/sessions").send({
      email: "user2@email.com",
      password: "123456",
    });

    const { token, user } = responseWithToken.body;

    const response = await request(app).post("/api/v1/statements/withdraw").send({
      amount: 500.00,
      description: "Pagamento de contas"
    }).set({
      Authorization: `Bearer ${token}`,
    });

    expect(response.status).toBe(400);
  });

  it("Should not be able to create a new Withdraw Operation if the user not authenticated", async() => {
    const response = await request(app).post("/api/v1/statements/withdraw").send({
      amount: 500,
      description: "Pagamento de contas"
    })

    expect(response.status).toBe(401);
  });
});
