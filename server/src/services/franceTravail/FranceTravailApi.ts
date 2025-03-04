import { compose, transformData } from "oleoduc";
import asyncRetry from "async-retry";
import streamJson from "stream-json";
import streamers from "stream-json/streamers/StreamArray.js";
import { RateLimitedApi } from "#src/common/api/RateLimitedApi";
import config from "#src/config";
import { fetchJsonWithRetry, fetchStreamWithRetry } from "#src/common/utils/httpUtils.js";
import { getLoggerWithContext } from "#src/common/logger";

const logger = getLoggerWithContext("api/exposition");

class FranceTravailApi extends RateLimitedApi {
  access_token: string;
  access_token_timestamp: number;
  access_token_timeout: number;
  retry: asyncRetry.Options<asyncRetry.TErr> | { retries: number };

  constructor(options: { retry?: asyncRetry.Options<asyncRetry.TErr>; access_token_timeout?: number } = {}) {
    super("FranceTravailApi", { nbRequests: 1, durationInSeconds: 1, ...options });
    this.access_token = null;
    this.access_token_timestamp = null;
    this.access_token_timeout = options.access_token_timeout || 60000 * 2; //minutes

    // Disable retry by default
    this.retry = options.retry || { retries: 0 };
  }

  static get baseApiUrl() {
    return config.franceTravail.api.baseUrl;
  }

  static get baseApiAuthUrl() {
    return config.franceTravail.api.baseAuthUrl;
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
      `${FranceTravailApi.baseApiAuthUrl}/connexion/oauth2/access_token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: {
          grant_type: "client_credentials",
          client_id: config.franceTravail.api.clientId,
          client_secret: config.franceTravail.api.clientSecret,
          scope: config.franceTravail.api.scope,
        },
        params: {
          realm: "/partenaire",
        },
      },
      { ...this.retry }
    );

    logger.info(`Le token d'authentification a été renouvelé`);
    this.access_token = data.access_token;
    this.access_token_timeout = data.expires_in;
    this.access_token_timestamp = Date.now();

    return data;
  }

  async fetchMetiers(
    fields = "code,libelle,transitionecologique,transitiondemographique,transitionecologiquedetaillee,transitionnumerique"
  ) {
    return this.execute(async () => {
      if (!this.isAuthenticated() || this.isAccessTokenExpired()) {
        await this.login();
      }

      const response = await fetchStreamWithRetry(
        `${FranceTravailApi.baseApiUrl}/partenaire/rome-metiers/v1/metiers/metier`,
        {
          headers: {
            ...this.getAuthHeaders(),
          },
          params: { champs: fields },
        },
        { ...this.retry }
      );

      return compose(
        response,
        streamJson.parser(),
        streamers.streamArray(),
        transformData((data) => data.value)
      );
    });
  }
}

export { FranceTravailApi };
