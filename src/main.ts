import 'reflect-metadata';

import { Application } from './application.js';
import type { ConfigInterface } from './config/config.interface.js';
import type { RestConfig } from './config/rest.config.js';
import { container } from './container.js';
import type { LoggerInterface } from './logger/logger.interface.js';
import { RestServiceToken } from './rest-service.tokens.js';

async function bootstrap(): Promise<void> {
  const logger = container.get<LoggerInterface>(RestServiceToken.Logger);

  try {
    const config = container.get<ConfigInterface<RestConfig>>(RestServiceToken.Config);
    logger.info('Configuration loaded', { port: config.get('port') });

    const application = container.get<Application>(RestServiceToken.Application);
    await application.init();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Cannot bootstrap application', { error: message });
    process.exitCode = 1;
  }
}

await bootstrap();
