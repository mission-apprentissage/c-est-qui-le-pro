import * as Minio from "minio";
import { compose } from "oleoduc";
import AutoDetectDecoderStream from "autodetect-decoder-stream";
import { parseCsv } from "#src/common/utils/csvUtils.js";
import config from "#src/config";

export async function getFromBucket(fileName: string) {
  const minioClient = new Minio.Client({
    endPoint: config.rco.bucket.endpoint,
    region: config.rco.bucket.region,
    useSSL: true,
    accessKey: config.rco.bucket.accessKey,
    secretKey: config.rco.bucket.secretKey,
  });

  return compose(
    await minioClient.getObject(config.rco.bucket.name, fileName),
    new AutoDetectDecoderStream(),
    parseCsv({ delimiter: ";", quote: '"', from_line: 2 })
  );
}
