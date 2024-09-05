import express from "express";
import bodyParser from "body-parser";
import config from "#src/config.js";
import { logger } from "#src/common/logger.js";
import { logMiddleware } from "./middlewares/logMiddleware.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import { tryCatch } from "./middlewares/tryCatchMiddleware.js";
import { corsMiddleware } from "./middlewares/corsMiddleware.js";
import formationsRoutes from "./routes/formationsRoutes.js";
import packageJson from "../../package.json";
import { kdb } from "#src/common/db/db";
import { sql } from "kysely";

export default async () => {
  const app = express();

  if (config.env === "dev") {
    app.set("etag", false);
    app.use((req, res, next) => {
      res.setHeader("Surrogate-Control", "no-store");
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      next();
    });
  }

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(corsMiddleware());
  app.use(logMiddleware());
  app.use(formationsRoutes());

  app.use("/static", express.static("public"));

  app.get(
    "/api",
    tryCatch(async (req, res) => {
      let sqlStatus;

      await kdb
        .executeQuery(sql`SELECT NOW()`.compile(kdb))
        .then(() => {
          sqlStatus = true;
        })
        .catch((e) => {
          sqlStatus = false;
          logger.error("Healthcheck failed", e);
        });

      return res.json({
        version: packageJson.version,
        env: config.env,
        healthcheck: {
          sql: sqlStatus,
        },
      });
    })
  );

  app.use(errorMiddleware());

  return app;
};
