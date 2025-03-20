import { getLoggerWithContext } from "#src/common/logger.js";
import { kdb } from "#src/common/db/db.js";
import { sql } from "kysely";

const logger = getLoggerWithContext("refresh");

export async function refreshView() {
  logger.info(`Refresh des vues matérialisées`);
  await kdb.executeQuery(sql`REFRESH MATERIALIZED VIEW CONCURRENTLY "formationFamilleMetierMView"`.compile(kdb));
  await kdb.executeQuery(sql`REFRESH MATERIALIZED VIEW CONCURRENTLY "formationDomainesMView"`.compile(kdb));
  await kdb.executeQuery(sql`REFRESH MATERIALIZED VIEW CONCURRENTLY "etablissementJPODatesMView"`.compile(kdb));
  return true;
}
