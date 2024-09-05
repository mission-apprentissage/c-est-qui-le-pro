import express from "express";
import { tryCatch } from "#src/http/middlewares/tryCatchMiddleware.js";
import Joi from "joi";
import Boom from "boom";
import * as validators from "#src/http/utils/validators.js";
import { validate } from "#src/http/utils/validators.js";
import { addJsonHeaders } from "#src/http/utils/responseUtils.js";
import { getRouteDate, getFormationsSQL } from "#src/queries/getFormations.js";
import { FORMATION_TAG } from "#src/common/constants/formationEtablissement.js";
import FormationEtablissement from "#src/common/repositories/formationEtablissement";
import { GraphHopperApi } from "#src/services/graphHopper/graphHopper.js";
import { stripNull } from "../utils/formatters";

export default () => {
  const router = express.Router();

  router.get(
    "/api/formation/:cfd-:codeDispositif?-:uai-:voie",
    tryCatch(async (req, res) => {
      const { cfd, codeDispositif, uai, voie } = await validate(
        { ...req.params, ...req.query },
        {
          cfd: Joi.string().required(),
          codeDispositif: Joi.string().allow(null, "").default(null),
          ...validators.uai(),
          voie: Joi.string().valid("scolaire", "apprentissage").required(),
        }
      );

      const formation = await FormationEtablissement.getFromCfd(
        {
          uai,
          cfd,
          codeDispositif,
          voie,
        },
        true
      );

      if (!formation) {
        throw Boom.notFound();
      }

      addJsonHeaders(res);
      res.send(formation);
    })
  );

  router.get(
    "/api/formations",
    tryCatch(async (req, res) => {
      const { longitude, latitude, distance, timeLimit, tag, uais, cfds, domaine, page, items_par_page } =
        await validate(
          { ...req.query, ...req.params },
          {
            longitude: Joi.number().min(-180).max(180).default(null),
            latitude: Joi.number().min(-90).max(90).default(null),
            distance: Joi.number().min(0).max(100000).default(null),
            timeLimit: Joi.number().valid().default(null),
            tag: Joi.string()
              .empty("")
              .valid(...Object.values(FORMATION_TAG))
              .default(null),
            ...validators.uais(),
            ...validators.cfds(),
            domaine: Joi.string().empty("").default(null),
            ...validators.pagination({ items_par_page: 100 }),
          }
        );

      const year = new Date().getFullYear();
      const millesime = [(year - 1).toString(), year.toString()];

      const results = await getFormationsSQL(
        {
          filtersEtablissement: { timeLimit, distance, latitude, longitude, uais },
          filtersFormation: { cfds, domaine },
          tag,
          millesime,
        },
        {
          limit: items_par_page,
          page,
        }
      );
      addJsonHeaders(res);
      res.send(stripNull(results.results));
    })
  );

  router.get(
    "/api/formation/route",
    tryCatch(async (req, res) => {
      const { longitudeA, latitudeA, longitudeB, latitudeB } = await validate(
        { ...req.query, ...req.params },
        {
          longitudeA: Joi.number().min(-180).max(180).required(),
          latitudeA: Joi.number().min(-90).max(90).required(),
          longitudeB: Joi.number().min(-180).max(180).required(),
          latitudeB: Joi.number().min(-90).max(90).required(),
        }
      );

      const graphHopperApi = new GraphHopperApi();

      const graphHopperParameter = {
        pointA: `${latitudeA},${longitudeA}`,
        pointB: `${latitudeB},${longitudeB}`,
        departureTime: getRouteDate(),
      };
      const route = await graphHopperApi.fetchRoute(graphHopperParameter);

      addJsonHeaders(res);
      res.send(route);
    })
  );
  return router;
};
