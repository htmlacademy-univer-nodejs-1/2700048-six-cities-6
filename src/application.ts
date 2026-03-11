import { inject, injectable } from 'inversify';

import { RestServiceToken } from './rest-service.tokens.js';
import type { LoggerInterface } from './logger/logger.interface.js';

@injectable()
export class Application {
  constructor(
    @inject(RestServiceToken.Logger) private readonly logger: LoggerInterface
  ) {}

  public async init(): Promise<void> {
    this.logger.info('Application is initialized');
  }
}

