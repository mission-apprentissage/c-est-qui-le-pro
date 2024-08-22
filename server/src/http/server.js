import express from "express";
import bodyParser from "body-parser";
import config from "#src/config.js";
import { logger } from "#src/common/logger.js";
import mongoSanitize from "express-mongo-sanitize";
import { logMiddleware } from "./middlewares/logMiddleware.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import { tryCatch } from "./middlewares/tryCatchMiddleware.js";
import { corsMiddleware } from "./middlewares/corsMiddleware.js";
import { dbCollection } from "#src/common/db/mongodb.js";
import formationsRoutes from "./routes/formationsRoutes.js";
import packageJson from "../../package.json";

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
  app.use(mongoSanitize({ replaceWith: "_" }));
  app.use(corsMiddleware());
  app.use(logMiddleware());
  app.use(formationsRoutes());

  app.use("/static", express.static("public"));

  app.get(
    "/api",
    tryCatch(async (req, res) => {
      let mongodbStatus;

      await dbCollection("logs")
        .stats()
        .then(() => {
          mongodbStatus = true;
        })
        .catch((e) => {
          mongodbStatus = false;
          logger.error("Healthcheck failed", e);
        });

      return res.json({
        version: packageJson.version,
        env: config.env,
        healthcheck: {
          mongodb: mongodbStatus,
        },
      });
    })
  );

  app.use(errorMiddleware());

  return app;
};
