import express from "express";
import { tryCatch } from "#src/http/middlewares/tryCatchMiddleware.js";
import Joi from "joi";
import Boom from "@hapi/boom";
import * as validators from "#src/http/utils/validators.js";
import { validate } from "#src/http/utils/validators.js";
import { addJsonHeaders } from "#src/http/utils/responseUtils.js";
import { getRouteDate, getFormationsSQL } from "#src/queries/getFormations.js";
import FormationEtablissement from "#src/common/repositories/formationEtablissement";
import { GraphHopperApi } from "#src/services/graphHopper/graphHopper.js";
import { stripNull } from "../utils/formatters";
import { getFormationsSimilaire } from "#src/queries/getFormationSimilaire.js";
import EtablissementIsochroneRepository from "#src/common/repositories/etablissementIsochrone.js";
import FormationRepository from "#src/common/repositories/formation";
import { merge } from "lodash-es";
import { parseSearchQuery } from "#src/common/utils/formatUtils.js";

export default () => {
  const router = express.Router();

  router.get(
    "/api/formation/:cfd-:codeDispositif?-:uai-:voie",
    tryCatch(async (req, res) => {
      const { cfd, codeDispositif, uai, voie, longitude, latitude } = await validate(
        { ...req.params, ...req.query },
        {
          cfd: Joi.string().required(),
          codeDispositif: Joi.string().allow(null, "").default(null),
          longitude: Joi.number().min(-180).max(180).default(null),
          latitude: Joi.number().min(-90).max(90).default(null),
          ...validators.uai(),
          voie: Joi.string().valid("scolaire", "apprentissage").required(),
        }
      );

      const formationEtablissement = await FormationEtablissement.getFromCfd(
        {
          uai,
          cfd,
          codeDispositif,
          voie,
        },
        true
      );

      if (!formationEtablissement) {
        throw Boom.notFound();
      }

      const formation = await FormationRepository.get(
        { cfd, codeDispositif, voie },
        { withMetier: false, withPoursuite: false, withIndicateur: true }
      );
      const formationsFamilleMetier = await FormationEtablissement.getFormationsFamilleMetier({
        familleMetierId: formation.familleMetierId,
        isAnneeCommune: formation.isAnneeCommune,
        uai: formationEtablissement.etablissement.uai,
      });

      const accessTime =
        latitude && longitude
          ? await EtablissementIsochroneRepository.bucketFromCoordinate(
              formationEtablissement.etablissement.id,
              latitude,
              longitude
            )
          : null;

      addJsonHeaders(res);
      res.send(
        stripNull(
          merge(formationEtablissement, { etablissement: { accessTime } }, { formation, formationsFamilleMetier })
        )
      );
    })
  );

  router.get(
    "/api/formations",
    tryCatch(async (req, res) => {
      const {
        longitude,
        latitude,
        distance,
        timeLimit,
        tag,
        uais,
        cfds,
        domaines,
        voie,
        diplome,
        academie,
        recherche,
        reverse,
        minWeight,
        page,
        items_par_page,
      } = await validate(
        { ...req.query, ...req.params },
        {
          longitude: Joi.number().min(-180).max(180).default(null),
          latitude: Joi.number().min(-90).max(90).default(null),
          distance: Joi.number().min(0).max(100000).default(null),
          timeLimit: Joi.number().valid().default(null),
          ...validators.uais(),
          ...validators.cfds(),
          ...validators.domaines(),
          ...validators.voie(),
          ...validators.diplome(),
          ...validators.tag(),
          academie: Joi.string().empty("").default(null),
          recherche: Joi.string().empty("").default(null),
          reverse: Joi.boolean().empty("").default(true),
          minWeight: Joi.number().min(0).max(1000).default(101),
          ...validators.pagination({ items_par_page: 100 }),
        }
      );

      const year = new Date().getFullYear();
      const millesime = [(year - 1).toString(), year.toString()];

      const searchQuery = parseSearchQuery(recherche);

      const results = await getFormationsSQL(
        {
          filtersEtablissement: { timeLimit, distance, latitude, longitude, uais, academie },
          filtersFormation: {
            cfds,
            domaines,
            voie,
            diplome: diplome.length > 0 ? diplome : searchQuery ? searchQuery.diplome : [],
          },
          tag,
          millesime,
          formation: { query: searchQuery ? searchQuery.query : null, reverse, minWeight },
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
    "/api/formationsSimilaire",
    tryCatch(async (req, res) => {
      const { longitude, latitude, academie, formationEtablissementId } = await validate(
        { ...req.query, ...req.params },
        {
          longitude: Joi.number().min(-180).max(180).required(),
          latitude: Joi.number().min(-90).max(90).required(),
          formationEtablissementId: Joi.string().required(),
          academie: Joi.string().required(),
        }
      );

      const year = new Date().getFullYear();
      const millesime = [(year - 1).toString(), year.toString()];

      const formationEtablissement = await FormationEtablissement.firstWithData({
        id: formationEtablissementId,
      });
      if (!formationEtablissement) {
        throw Boom.notFound();
      }

      const results = await getFormationsSimilaire({
        formationId: formationEtablissement.formation.id,
        filtersEtablissement: { latitude, longitude, timeLimit: 5400, academie },
        millesime,
      });
      addJsonHeaders(res);
      res.send(stripNull(results.results?.formations || []));
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
