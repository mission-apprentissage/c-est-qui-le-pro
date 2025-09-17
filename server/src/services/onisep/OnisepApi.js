import { RateLimitedApi } from "#src/common/api/RateLimitedApi";
import config from "#src/config.ts";
import { fetchJsonWithRetry } from "#src/common/utils/httpUtils.js";
import { getLoggerWithContext } from "#src/common/logger.ts";

const logger = getLoggerWithContext("api/onisep");

class OnisepApi extends RateLimitedApi {
  constructor(options = {}) {
    super("OnisepApi", { nbRequests: 5, durationInSeconds: 1, ...options });

    this.access_token = null;
    this.access_token_timestamp = null;
    this.access_token_timeout = options.access_token_timeout || 60000 * 60 * 12; // 12 hours

    // Disable retry by default
    this.retry = options.retry || { retries: 0 };
  }

  static get baseApiUrl() {
    return config.onisep.api.baseUrl;
  }

  isAuthenticated() {
    return !!this.access_token;
  }

  isAccessTokenExpired() {
    return !this.access_token_timestamp || this.access_token_timeout < Date.now() - this.access_token_timestamp;
  }

  getAuthHeaders() {
    return {
      Authorization: `Bearer ${this.access_token}`,
      "Application-ID": `${config.onisep.api.applicationId}`,
    };
  }

  async login() {
    const data = await fetchJsonWithRetry(
      `${OnisepApi.baseApiUrl}/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        data: {
          email: config.onisep.api.username,
          password: config.onisep.api.password,
        },
      },
      { ...this.retry }
    );

    logger.info(`Le token d'authentification a été renouvelé`);
    this.access_token = data.token;
    this.access_token_timestamp = Date.now();

    return data;
  }

  async search(dataset, query, pagination = { from: 0, size: 1000 }) {
    return this.execute(async () => {
      if (!this.isAuthenticated() || this.isAccessTokenExpired()) {
        await this.login();
      }

      const params = new URLSearchParams();
      params.set("from", pagination.from);
      params.set("size", pagination.size);
      params.set("q", query);

      const response = await fetchJsonWithRetry(
        `${OnisepApi.baseApiUrl}/dataset/${dataset}/search?${params.toString()}`,
        {
          headers: {
            ...this.getAuthHeaders(),
          },
        },
        { ...this.retry }
      );

      return response;
    });
  }
}

export { OnisepApi };
