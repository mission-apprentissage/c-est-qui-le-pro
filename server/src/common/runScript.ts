import prettyMilliseconds from "pretty-ms";
import { isEmpty } from "lodash-es";
import { getLoggerWithContext } from "./logger";

const logger = getLoggerWithContext("script");

process.on("unhandledRejection", (e) => logger.error(e));
process.on("uncaughtException", (e) => logger.error(e));
process.stdout.on("error", function (err) {
  if (err.code === "EPIPE") {
    // eslint-disable-next-line no-process-exit
    process.exit(0);
  }
});

const createTimer = () => {
  let launchTime;
  return {
    start: () => {
      launchTime = new Date().getTime();
    },
    stop: (results) => {
      const duration = prettyMilliseconds(new Date().getTime() - launchTime);
      const data = results && results.toJSON ? results.toJSON() : results;
      if (!isEmpty(data)) {
        logger.info(JSON.stringify(data, null, 2));
      }
      logger.info(`Completed in ${duration}`);
    },
  };
};

const exit = async (scriptError) => {
  if (scriptError) {
    logger.error(scriptError.constructor.name === "EnvVarError" ? scriptError.message : scriptError);
    process.exitCode = 1;
  }
};

const wrapTimer = async (cb) => {
  const timer = createTimer();
  timer.start();
  const results = await cb();
  timer.stop(results);
};

async function runScript(job, options = { withTimer: true }) {
  const withTimer = options.withTimer ?? true;
  try {
    const cb = async () => {
      return await job();
    };

    withTimer ? await wrapTimer(cb) : await cb();
    await exit(null);
  } catch (e) {
    await exit(e);
  }
}

async function runJobs(jobs: { name: string; job: (...args: any) => any }[], filterJob: string = null) {
  const result = {};
  for (const job of jobs) {
    if (filterJob && job.name !== filterJob) {
      continue;
    }
    result[job.name] = await job.job();
  }
  return result;
}

export { runScript, runJobs };
