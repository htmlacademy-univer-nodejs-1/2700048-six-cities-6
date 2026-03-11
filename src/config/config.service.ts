import convict, { Schema } from 'convict';
import addFormats from 'convict-format-with-validator';
import dotenv from 'dotenv';
import { injectable } from 'inversify';

import type { ConfigInterface } from './config.interface.js';
import type { RestConfig } from './rest.config.js';

convict.addFormats(addFormats);

const configSchema: Schema<RestConfig> = {
  port: {
    doc: 'Application port',
    format: 'port',
    env: 'PORT',
    default: 3000,
  },
  dbHost: {
    doc: 'Database host IP address',
    format: 'ipaddress',
    env: 'DB_HOST',
    default: '127.0.0.1',
  },
  salt: {
    doc: 'Password hash salt',
    format: String,
    env: 'SALT',
    default: 'salt',
    sensitive: true,
  },
};

const REQUIRED_ENVIRONMENT_VARIABLES = ['PORT', 'DB_HOST', 'SALT'] as const;

@injectable()
export class ConfigService implements ConfigInterface<RestConfig> {
  private readonly config = convict<RestConfig>(configSchema);

  constructor() {
    dotenv.config({quiet: true});
    this.ensureRequiredVariables();
    this.config.validate({allowed: 'strict'});
  }

  public get<K extends keyof RestConfig>(key: K): RestConfig[K] {
    return this.config.get(key) as RestConfig[K];
  }

  private ensureRequiredVariables(): void {
    const missedVariables = REQUIRED_ENVIRONMENT_VARIABLES.filter((item) => !process.env[item]);

    if (missedVariables.length > 0) {
      throw new Error(`Missing required environment variables: ${missedVariables.join(', ')}`);
    }
  }
}

