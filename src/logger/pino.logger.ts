import { injectable } from 'inversify';

import { pino } from 'pino';
import type { Logger } from 'pino';
import type { LoggerInterface } from './logger.interface.js';

@injectable()
export class PinoLogger implements LoggerInterface {
  private readonly logger: Logger;

  constructor() {
    this.logger = pino({
      level: 'info',
      timestamp: pino.stdTimeFunctions.isoTime,
    });
  }

  public info(message: string, payload?: Record<string, unknown>): void {
    this.log(this.logger.info.bind(this.logger), message, payload);
  }

  public error(message: string, payload?: Record<string, unknown>): void {
    this.log(this.logger.error.bind(this.logger), message, payload);
  }

  private log(
    method: (object: Record<string, unknown>, msg?: string) => void,
    message: string,
    payload?: Record<string, unknown>
  ): void {
    if (payload) {
      method(payload, message);
      return;
    }

    method({}, message);
  }
}

