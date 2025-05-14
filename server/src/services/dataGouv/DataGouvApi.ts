import { RateLimitedApi } from "#src/common/api/RateLimitedApi";
import asyncRetry from "async-retry";
import config from "#src/config";
import { fetchStreamWithRetry } from "#src/common/utils/httpUtils.js";

export type DataGouvOptions = { retry?: asyncRetry.Options<asyncRetry.TErr> };

class DataGouvApi extends RateLimitedApi {
  retry: asyncRetry.Options<asyncRetry.TErr> | { retries: number };

  constructor(options: DataGouvOptions = {}) {
    super("DataGouvApi", { nbRequests: 5, durationInSeconds: 1, ...options });

    // Disable retry by default
    this.retry = options.retry || { retries: 0 };
  }

  static get baseApiUrl() {
    return config.datagouv.api.baseUrl;
  }

  async datasets(id) {
    return this.execute(async () => {
      const response = await fetchStreamWithRetry(`${DataGouvApi.baseApiUrl}/datasets/r/${id}`, {}, { ...this.retry });
      return response;
    });
  }
}

export { DataGouvApi };
