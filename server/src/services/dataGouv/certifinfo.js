import { compose } from "oleoduc";
import AutoDetectDecoderStream from "autodetect-decoder-stream";
import { parseCsv } from "#src/common/utils/csvUtils.js";
import config from "#src/config.ts";
import { DataGouvApi } from "./DataGouvApi.js";

export async function streamCertifInfo(options = {}) {
  const api = options.api || new DataGouvApi(options.apiOptions || {});
  const stream = await api.datasets(config.datagouv.datasets.certifinfo);

  return compose(stream, new AutoDetectDecoderStream(), parseCsv({ delimiter: ";", quote: null }));
}
