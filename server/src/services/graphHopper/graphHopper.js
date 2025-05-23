import * as turf from "@turf/turf";
import { RateLimitedApi } from "#src/common/api/RateLimitedApi";
import config from "#src/config.ts";
import { fetchJsonWithRetry } from "#src/common/utils/httpUtils.js";
import { require } from "#src/common/utils/esmUtils.js";
import path from "path";
import resolvePackagePath from "resolve-package-path";

// Fix issue with geotoolbox CommonJS module
const { findUpPackagePath } = resolvePackagePath;
const geotoolbox = require(path.join(
  findUpPackagePath(import.meta.url),
  "../../node_modules/geotoolbox/dist/index.min.js"
));

class GraphHopperApi extends RateLimitedApi {
  constructor(options = {}) {
    super("GraphHopperApi", { nbRequests: 5, durationInSeconds: 1, ...options });

    // Disable retry by default
    this.retry = options.retry || { retries: 0 };
  }

  static get baseApiUrl() {
    return config.graphHopper.api.baseUrl;
  }

  async fetchRoute({
    pointA, //"latitude,longitude"
    pointB, //"latitude,longitude"
    profile = "pt",
    departureTime = new Date(),
    pt_profile = false,
    pt_access_profile = "foot",
    pt_beta_access_time = 1,
    pt_egress_profile = "foot",
    pt_beta_egress_time = 1,
    pt_profile_duration = "PT120M",
    pt_limit_street_time = "PT120M",
    pt_ignore_transfers = false,
    pt_arrive_by = true,
  }) {
    //http://141.94.105.71:8989/route?point=44.544606%2C6.077989&point=44.540663044546385%2C6.091216108562817&pt.earliest_departure_time=2024-07-01T05%3A00%3A00Z&pt.arrive_by=true&locale=en-US&profile=pt&pt.profile=false&pt.access_profile=foot&pt.beta_access_time=1&pt.egress_profile=foot&pt.beta_egress_time=1&pt.profile_duration=PT120M&pt.limit_street_time=PT30M&pt.ignore_transfers=false
    return this.execute(async () => {
      const params = new URLSearchParams({
        profile,
        "pt.earliest_departure_time": departureTime.toISOString(),
        "pt.profile": pt_profile,
        "pt.access_profile": pt_access_profile,
        "pt.beta_access_time": pt_beta_access_time,
        "pt.egress_profile": pt_egress_profile,
        "pt.beta_egress_time": pt_beta_egress_time,
        "pt.profile_duration": pt_profile_duration,
        "pt.limit_street_time": pt_limit_street_time,
        "pt.ignore_transfers": pt_ignore_transfers,
        "pt.arrive_by": pt_arrive_by,
      });

      console.error(`${GraphHopperApi.baseApiUrl}/route?${params}&point=${pointA}&point=${pointB}`);
      const response = await fetchJsonWithRetry(
        `${GraphHopperApi.baseApiUrl}/route?${params}&point=${pointA}&point=${pointB}`,
        {},
        { ...this.retry }
      );

      return response;
    });
  }

  async fetchIsochrone({
    point, // "latitude,longitude"
    profile = "pt",
    departureTime = new Date(),
    timeLimit = 1800,
    buckets = 1,
    reverse_flow = false,
    result = "multipolygon",
  }) {
    return this.execute(async () => {
      const params = new URLSearchParams({
        point,
        profile,
        "pt.earliest_departure_time": departureTime.toISOString(),
        time_limit: timeLimit,
        buckets,
        result,
        reverse_flow,
      });
      console.error(`${GraphHopperApi.baseApiUrl}/isochrone?${params}`);
      const response = await fetchJsonWithRetry(
        `${GraphHopperApi.baseApiUrl}/isochrone?${params}`,
        {},
        { ...this.retry }
      );

      return response;
    });
  }

  buffer(geometry, distance = 0.1) {
    const buffered = turf.buffer(geometry, distance, { units: "kilometers" });
    return buffered;
  }

  async fetchIsochronePTBucketsRaw({ point, departureTime = new Date(), reverse_flow = false, buckets = [1800] }) {
    const times = buckets.sort((a, b) => b - a);
    const geometries = await Promise.all(
      times.map(async (time) => {
        const geometry = await this.fetchIsochrone({ point, departureTime, timeLimit: time, reverse_flow });
        return { time, geometry: geometry.polygons[0].geometry };
      })
    );
    return geometries;
  }

  async fetchIsochronePTBuckets({ point, departureTime = new Date(), reverse_flow = false, buckets = [1800] }) {
    // GraphHopper does not support buckets for public transportation
    // We request the isochrone API with different duration
    const times = buckets.sort((a, b) => b - a);
    const geometries = await Promise.all(
      times.map(async (time) => {
        const geometry = await this.fetchIsochrone({ point, departureTime, timeLimit: time, reverse_flow });
        return { time, feature: geometry.polygons[0] };
      })
    );

    const tStart = Date.now();

    let geometriesBuffer = await Promise.all(
      geometries.map(async (value) => {
        // Buffer the result with 100 meters and simplify (remove hole in the polygon)

        return {
          ...value,

          feature: await geotoolbox.buffer(value.feature, { dist: 0.1, quadsegs: 2, merge: true }),
        };
      })
    );

    const geometriesDiff = geometriesBuffer.map((value) => {
      return {
        ...value,
        feature: turf.geometryCollection(
          turf.featureReduce(
            value.feature,
            (acc, feature) => {
              if (feature.geometry.type === "GeometryCollection") {
                acc.push(...feature.geometry.geometries);
                return acc;
              }

              acc.push(feature.geometry);
              return acc;
            },
            []
          )
        ),
      };
    });

    console.error("COMPUTE", Date.now() - tStart);

    return geometriesDiff;
  }
}

export { GraphHopperApi };
