import { oleoduc, compose, writeData } from "oleoduc";
import AutoDetectDecoderStream from "autodetect-decoder-stream";
import * as XLSX from "xlsx/xlsx.mjs";
import { parseCsv } from "#src/common/utils/csvUtils.js";
import config from "#src/config";
import { DataGouvApi, DataGouvOptions } from "./DataGouvApi";
import { pick } from "lodash-es";

export async function streamCertifInfo(options: { api?: DataGouvApi; apiOptions?: DataGouvOptions } = {}) {
  const api = options.api || new DataGouvApi(options.apiOptions || {});
  const stream = await api.datasets(config.datagouv.datasets.certifinfo);

  return compose(stream, new AutoDetectDecoderStream(), parseCsv({ delimiter: ";", quote: null }));
}

export async function formacodeTransitionEcologique(options = { api: null, apiOptions: null }) {
  const api = options.api || new DataGouvApi(options.apiOptions || {});
  const stream = await api.datasets(config.datagouv.datasets.formacodeTransitionEcologique);
  const buffers = [];
  await oleoduc(
    stream,
    writeData((data) => {
      buffers.push(data);
    })
  );

  const workbook = XLSX.read(Buffer.concat(buffers), { type: "buffer" });
  const json = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[1]]);
  return json.map((data) => {
    return pick(data, [
      "Code Formacode® V13",
      "libelle-formacode V13",
      "Code Formacode® V14",
      "libelle-formacode V14",
      "Modification (oui/non)",
    ]);
  });
}
