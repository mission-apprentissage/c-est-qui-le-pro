import { isEmpty } from "lodash-es";
import { metrics } from "#src/common/db/collections/collections.js";
import { logger } from "#src/common/logger.js";
import { formatArrayParameters } from "#src/http/utils/formatters.js";

export function buildMetrics(req) {
  const referer = req.headers["referer"] && req.headers["referer"].split("/")[2];
  const origin = req.headers["origin"] && req.headers["origin"].split("/")[2];
  const xForwardedFor = req.headers["x-forwarded-for"] && req.headers["x-forwarded-for"]?.split(",").shift();
  const remoteAddress = req.socket?.remoteAddress;

  const consumer = referer ?? origin ?? xForwardedFor ?? remoteAddress;
  const url = req.url;
  const time = new Date();
  const uai = req.params?.uai;
  const uais = [
    ...(req.params?.uais ? formatArrayParameters(req.params?.uais) : []),
    ...(req.query?.uais ? formatArrayParameters(req.query?.uais) : []),
    ...(uai ? [uai] : []),
  ];
  const cfd = req.params?.cfd;
  const cfds = [
    ...(req.params?.cfds ? formatArrayParameters(req.params?.cfds) : []),
    ...(req.query?.cfds ? formatArrayParameters(req.query?.cfds) : []),
    ...(cfd ? [cfd] : []),
  ];

  return { time, consumer, url, uai, uais, cfd, cfds };
}

export const metricsMiddleware = async (req) => {
  try {
    const { time, consumer, url, uai, uais, cfd, cfds } = buildMetrics(req);
    await metrics().insertOne({
      time,
      consumer,
      url,
      ...(uai ? { uai } : {}),
      ...(!isEmpty(uais) ? { uais } : {}),
      ...(cfd ? { cfd } : {}),
      ...(!isEmpty(cfds) ? { cfds } : {}),
    });
  } catch (e) {
    logger.error(e);
  }
};
