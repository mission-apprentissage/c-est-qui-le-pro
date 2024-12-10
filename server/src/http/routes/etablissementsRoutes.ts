import express from "express";
import { tryCatch } from "#src/http/middlewares/tryCatchMiddleware.js";
import { addJsonHeaders } from "#src/http/utils/responseUtils.js";
import { pick } from "lodash-es";
import EtablissementRepository from "#src/common/repositories/etablissement.js";
import { oleoduc, writeData } from "oleoduc";

export default () => {
  const router = express.Router();

  router.get(
    "/api/etablissements",
    tryCatch(async (req, res) => {
      addJsonHeaders(res);

      res.write("[");
      let previous = null;
      await oleoduc(
        await EtablissementRepository.find({ hasFormation: true }),
        writeData((data) => {
          if (previous) {
            res.write(JSON.stringify(pick(previous, ["uai", "latitude", "longitude"])) + ",");
          }
          previous = data;
        })
      );

      res.write(JSON.stringify(pick(previous, ["uai", "latitude", "longitude"])));
      res.write("]");

      res.end();
    })
  );

  return router;
};
