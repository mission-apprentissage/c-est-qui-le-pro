import assert from "assert";
import { startServer } from "#tests/utils/testUtils.js";

describe("healthcheckRoutes", () => {
  it("Vérifie que le server fonctionne", async () => {
    const { httpClient } = await startServer();

    const response = await httpClient.get("/api");

    assert.strictEqual(response.status, 200);
    // We don't have a testing postgres for now
    assert.strictEqual(response.data.healthcheck.sql, false);
    assert.ok(response.data.env);
    assert.ok(response.data.version);
  });
});
