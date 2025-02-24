import { RateLimiterMemory, RateLimiterQueue } from "rate-limiter-flexible";
import { EventEmitter } from "events";

interface RateLimiterOptions {
  maxQueueSize?: number;
  nbRequests?: number;
  durationInSeconds?: number;
}

class RateLimiter extends EventEmitter {
  name: string;
  maxQueueSize: number;
  options: RateLimiterOptions;
  queue: RateLimiterQueue;

  constructor(name, options: RateLimiterOptions = {}) {
    super();
    this.name = name;
    this.maxQueueSize = options.maxQueueSize || 25;
    this.options = options;

    const memoryRateLimiter = new RateLimiterMemory({
      keyPrefix: name,
      points: options.nbRequests || 1,
      duration: options.durationInSeconds || 1,
    });

    this.queue = new RateLimiterQueue(memoryRateLimiter, { maxQueueSize: this.maxQueueSize });
  }

  async execute(callback) {
    await this.queue.removeTokens(1);
    this.emit("status", {
      // @ts-expect-error": _queueLimiters is a private property
      queueSize: this.queue._queueLimiters.limiter._queue.length,
      maxQueueSize: this.maxQueueSize,
    });
    return callback();
  }
}

export { RateLimiter };
