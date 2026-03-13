import { Container } from 'inversify';

import { Application } from './application.js';
import { ConfigService } from './config/config.service.js';
import type { ConfigInterface } from './config/config.interface.js';
import type { RestConfig } from './config/rest.config.js';
import { PinoLogger } from './logger/pino.logger.js';
import type { LoggerInterface } from './logger/logger.interface.js';
import { RestServiceToken } from './rest-service.tokens.js';

const container = new Container();

container.bind<LoggerInterface>(RestServiceToken.Logger).to(PinoLogger).inSingletonScope();
container.bind<ConfigInterface<RestConfig>>(RestServiceToken.Config).to(ConfigService).inSingletonScope();
container.bind<Application>(RestServiceToken.Application).to(Application).inSingletonScope();

export { container };

