import unzipper from "unzipper";
import { compose, transformIntoStream } from "oleoduc";
import AutoDetectDecoderStream from "autodetect-decoder-stream";
import XmlParser from "node-xml-stream";
import nodeStream from "stream";
import { XMLParser as FastXMLParser } from "fast-xml-parser";

import config from "#src/config.ts";
import { fetchStreamWithRetry } from "#src/common/utils/httpUtils.js";

function transformXmlFormationToStream() {
  const xmlParser = new XmlParser();
  const fastParser = new FastXMLParser({
    numberParseOptions: {
      skipLike: /.*/,
    },
  });

  let insideFormation = false;
  let buffer = "";

  const transformXml = new nodeStream.Duplex({
    objectMode: true,
    final: () => {
      xmlParser.end();
    },
    write: (chunk, encoding, next) => {
      xmlParser.write(chunk);
      next();
    },
    read() {},
  });

  xmlParser.on("opentag", (name) => {
    if (insideFormation && name[name.length - 1] !== "/") {
      buffer += "<" + name + ">";
    }

    if (name === "formation") {
      insideFormation = true;
    }
  });

  xmlParser.on("closetag", (name) => {
    if (name === "formation") {
      insideFormation = false;
      transformXml.push(fastParser.parse(buffer));
      buffer = "";
    }

    if (insideFormation) {
      buffer += "</" + name + ">";
    }
  });

  xmlParser.on("text", (text) => {
    buffer += text;
  });

  xmlParser.on("cdata", (cdata) => {
    buffer += "<![CDATA[" + cdata + "]]";
  });

  xmlParser.on("error", (err) => {
    throw err;
  });

  xmlParser.on("finish", () => {
    transformXml.push(null);
  });

  return transformXml;
}

export async function streamIdeoFichesFormations(options = {}) {
  const stream = await fetchStreamWithRetry(config.onisep.files.ideoFichesFormations, {}, { ...options });

  return await compose(
    stream,
    unzipper.Parse(),
    transformIntoStream(async (entry) => {
      return entry;
    }),
    new AutoDetectDecoderStream(),
    transformXmlFormationToStream()
  );
}
