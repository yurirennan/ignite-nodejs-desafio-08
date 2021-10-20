import { Connection, createConnection } from "typeorm";
import request from 'supertest';
import { app } from "../../../../app";

let connection: Connection

describe("Get Statement Operation Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to show one deposit operation by id", async() => {
    //Cria novo usuario
    await request(app).post("/api/v1/users").send({
      name: "User Test",
      email: "user@email.com",
      password: "12345"
    });

    //Realiza o login
    const responseWithToken = await request(app).post("/api/v1/sessions").send({
      email: "user@email.com",
      password: "12345",
    });

    //captura o token
    const { token, user } = responseWithToken.body;

    //Realiza o deposito
    await request(app).post("/api/v1/statements/deposit").send({
      amount: 500.00,
      description: "Deposito de aluguel"
    }).set({
      Authorization: `Bearer ${token}`,
    });

    //Pega o balanço das operações
    const responseBalance = await request(app).get("/api/v1/statements/balance").send().set({
      Authorization: `Bearer ${token}`
    });

    const { statement, balance } = responseBalance.body;

    //Captura o id
    const operation = statement[0];

    //Captura as informações com base no ID
    const response = await request(app).get(`/api/v1/statements/${operation.id}`)
    .send().set({
      Authorization: `Bearer ${token}`,
    });

    //Retorno da chamada a API
    const { id, type, description, created_at, updated_at, user_id } = response.body;

    expect(response.status).toBe(200);
    expect(user_id).toBe(user.id)
    expect(id).toBe(operation.id)
    expect(type).toBe(operation.type)
    expect(description).toBe(operation.description)
    expect(created_at).toBe(operation.created_at)
    expect(updated_at).toBe(operation.updated_at)
  });

  it("Should be able to show one withdraw operation by id", async() => {
    //Cria novo usuario
    await request(app).post("/api/v1/users").send({
      name: "User Test",
      email: "user@email.com",
      password: "12345"
    });

    //Realiza o login
    const responseWithToken = await request(app).post("/api/v1/sessions").send({
      email: "user@email.com",
      password: "12345",
    });

    //captura o token
    const { token, user } = responseWithToken.body;

    //Realiza o deposito
    await request(app).post("/api/v1/statements/deposit").send({
      amount: 500.00,
      description: "Deposito de aluguel"
    }).set({
      Authorization: `Bearer ${token}`,
    });

    //Realiza o saque
    await request(app).post("/api/v1/statements/withdraw").send({
      amount: 500.00,
      description: "Pagamento de contas"
    }).set({
      Authorization: `Bearer ${token}`,
    });

    //Pega o balanço das operações
    const responseBalance = await request(app).get("/api/v1/statements/balance").send().set({
      Authorization: `Bearer ${token}`
    });

    const { statement, balance } = responseBalance.body;

    //Captura o id
    const operation = statement[1];

    //Captura as informações com base no ID
    const response = await request(app).get(`/api/v1/statements/${operation.id}`)
    .send().set({
      Authorization: `Bearer ${token}`,
    });

    //Retorno da chamada a API
    const { id, type, description, created_at, updated_at, user_id } = response.body;

    expect(response.status).toBe(200);
    expect(user_id).toBe(user.id)
    expect(id).toBe(operation.id)
    expect(type).toBe(operation.type)
    expect(description).toBe(operation.description)
    expect(created_at).toBe(operation.created_at)
    expect(updated_at).toBe(operation.updated_at)
  });


})
