import request from "supertest";
import app from "../app.js";
import { pool } from "../db.js";

describe("POST /users Integration Test", () => {
  let createdUserId;

  afterAll(async () => {
    // cleanup test data
    if (createdUserId) {
      await pool.query("DELETE FROM users WHERE id = $1", [createdUserId]);
    }

    await pool.end();
  });

  test("should create user and store in PostgreSQL", async () => {
    const res = await request(app)
      .post("/users")
      .send({
        name: "Test User",
        email: "testuser@example.com",
        password: "123456",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.email).toBe("testuser@example.com");

    createdUserId = res.body.id;

    // verify in DB
    const dbResult = await pool.query(
      "SELECT * FROM users WHERE id = $1",
      [createdUserId]
    );

    expect(dbResult.rows.length).toBe(1);
    expect(dbResult.rows[0].email).toBe("testuser@example.com");
  });
});