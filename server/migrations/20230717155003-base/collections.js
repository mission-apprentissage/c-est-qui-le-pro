import * as logsDescriptor from "./logs.js";
import * as metricsDescriptor from "./metrics.js";
import * as bcnDescriptor from "./bcn.js";

export function getCollectionDescriptors() {
  return [logsDescriptor, metricsDescriptor, bcnDescriptor];
}
