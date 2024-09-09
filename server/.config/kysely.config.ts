import { defineConfig, getKnexTimestampPrefix } from "kysely-ctl";
import { kdb } from "#src/common/db/db.ts";

export default defineConfig({
  kysely: kdb,
  migrations: {
    getMigrationPrefix: getKnexTimestampPrefix,
  },
});
