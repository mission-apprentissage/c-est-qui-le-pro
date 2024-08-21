import { assert } from "chai";
import { startServer } from "#tests/utils/testUtils.js";
import { metrics } from "#src/common/db/collections/collections.js";

describe("metricsMiddleware", () => {
  it("vérifie que l'on remonte les codes de certifications dans les queries", async () => {
    const { httpClient } = await startServer();

    await httpClient.get(`/api/formations?cfds=12345678,12345679&uais=0123456A,0123456B`, {});

    const results = await metrics().find({}).toArray();
    assert.strictEqual(results.length, 1);
    assert.deepInclude(results[0], {
      consumer: "127.0.0.1",
      url: `/api/formations?cfds=12345678,12345679&uais=0123456A,0123456B`,
      cfds: ["12345678", "12345679"],
      uais: ["0123456A", "0123456B"],
    });
  });

  describe("vérifie que l'on remonte les codes de certifications dans les parameters", async () => {
    it("Pour une formation", async () => {
      const { httpClient } = await startServer();

      await httpClient.get(`/api/formation/12345678--0123456A-apprentissage`, {});

      const results = await metrics().find({}).toArray();
      assert.strictEqual(results.length, 1);
      assert.deepInclude(results[0], {
        consumer: "127.0.0.1",
        url: `/api/formation/12345678--0123456A-apprentissage`,
        cfd: "12345678",
        cfds: ["12345678"],
        uai: "0123456A",
        uais: ["0123456A"],
      });
    });
  });
});
