import request from "supertest";
import app from "../../src/server"; // Import the app without running the server

let servers: any[] = [];

beforeAll((done) => {
  // Start multiple servers on different ports to simulate nodes
  servers.push(
    app.listen(3000, () => console.log("Node running on port 3000"))
  );
  servers.push(
    app.listen(3001, () => console.log("Node running on port 3001"))
  );
  servers.push(
    app.listen(3002, () => console.log("Node running on port 3002"))
  );
  done();
});

afterAll((done) => {
  // Close all servers after tests
  servers.forEach((server) => {
    if (server) {
      server.close();
    }
  });
  done();
});

describe("E2E Tests for Express API", () => {
  it("should set a value successfully", async () => {
    const res = await request(app)
      .post("/set")
      .send({ key: "testKey", value: "testValue" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("should retrieve the value by key", async () => {
    // First, set the value
    await request(app)
      .post("/set")
      .send({ key: "testKey", value: "testValue" });

    // Then, get the value
    const res = await request(app).get("/get/testKey");
    expect(res.status).toBe(200);
    expect(res.body.value).toBe("testValue");
  });

  it("should return 404 if the key is not found", async () => {
    const res = await request(app).get("/get/nonExistentKey");
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Key not found");
  });

  it("should return alive status for heartbeat", async () => {
    const res = await request(app).get("/heartbeat");
    expect(res.status).toBe(200);
    expect(res.body.alive).toBe(true);
  });
});
