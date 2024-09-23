import { compose } from "oleoduc";
import { createReadStream } from "fs";
import AutoDetectDecoderStream from "autodetect-decoder-stream";
import { parseCsv } from "#src/common/utils/csvUtils.js";
import config from "#src/config";

export function romeFromCsv(filePath: string | null = null) {
  return compose(
    createReadStream(filePath || config.rome.files.rome),
    new AutoDetectDecoderStream(),
    parseCsv({ delimiter: ",", quote: '"' })
  );
}

export function romeMetierFromCsv(filePath: string | null = null) {
  return compose(
    createReadStream(filePath || config.rome.files.romeMetier),
    new AutoDetectDecoderStream(),
    parseCsv({ delimiter: ";", quote: '"' })
  );
}

export function isRomeValid(rome: string) {
  return rome.match(/^[A-Z][0-9]{4}/);
}
