import chai, { assert, expect } from "chai";
import chaiDiff from "chai-diff";
import chaiDom from "chai-dom";
import fs from "fs";
import MockDate from "mockdate";
import { JSDOM } from "jsdom";
import config from "#src/config.js";
import { startServer } from "#tests/utils/testUtils.js";
import { insertAcceEtablissement, insertCFD } from "#tests/utils/fakeData.js";

chai.use(chaiDiff);
chai.use(chaiDom);

describe("formationsRoutes", () => {});
