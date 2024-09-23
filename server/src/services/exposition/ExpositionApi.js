import { RateLimitedApi } from "#src/common/api/RateLimitedApi.js";
import config from "#src/config.ts";
import { fetchJsonWithRetry } from "#src/common/utils/httpUtils.js";
import { getLoggerWithContext } from "#src/common/logger.ts";

const logger = getLoggerWithContext("api/exposition");

class ExpositionApi extends RateLimitedApi {
  constructor(options = {}) {
    super("ExpositionApi", { nbRequests: 10, durationInSeconds: 1, ...options });
    this.access_token = null;
    this.access_token_timestamp = null;
    this.access_token_timeout = options.access_token_timeout || 60000 * 2; //minutes

    // Disable retry by default
    this.retry = options.retry || { retries: 0 };
  }

  static get baseApiUrl() {
    return config.exposition.api.baseUrl;
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
    };
  }

  async login() {
    const data = await fetchJsonWithRetry(
      `${ExpositionApi.baseApiUrl}/inserjeunes/auth/login`,
      {
        method: "POST",
        "Content-Type": "application/x-www-form-urlencoded",
        data: {
          username: config.exposition.api.username,
          password: config.exposition.api.password,
        },
      },
      { ...this.retry }
    );

    logger.info(`Le token d'authentification a été renouvelé`);
    this.access_token = data.token;
    this.access_token_timestamp = Date.now();

    return data;
  }

  async fetchFormationsStats(page = 1, itemsPerPage = 1000) {
    return this.execute(async () => {
      if (!this.isAuthenticated() || this.isAccessTokenExpired()) {
        await this.login();
      }

      const response = await fetchJsonWithRetry(
        `${ExpositionApi.baseApiUrl}/inserjeunes/formations?page=${page}&items_par_page=${itemsPerPage}`,
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

  async fetchFormationStats(uai, codeCertification, type = "CFD") {
    return this.execute(async () => {
      // /!\ L'API Inserjeunes retourne un json dans un json, on retourne le json en string ici
      console.error(`${ExpositionApi.baseApiUrl}/inserjeunes/formations/${uai}-${type}:${codeCertification}`);
      const response = await fetchJsonWithRetry(
        `${ExpositionApi.baseApiUrl}/inserjeunes/formations/${uai}-${type}:${codeCertification}`,
        {},
        { ...this.retry }
      );

      return response;
    });
  }
}

export { ExpositionApi };
