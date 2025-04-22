import "./testConfig.js";
import nock from "nock"; // eslint-disable-line node/no-unpublished-import

nock.disableNetConnect();
nock.enableNetConnect((host) => {
  return host.startsWith("127.0.0.1");
});

export function mochaGlobalSetup() {}

export const mochaHooks = {
  afterEach: async function () {
    nock.cleanAll();
  },
};

export function mochaGlobalTeardown() {}
