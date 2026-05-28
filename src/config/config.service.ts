import convict, { Schema } from 'convict';
import addFormats from 'convict-format-with-validator';
import dotenv from 'dotenv';
import { injectable } from 'inversify';

import type { ConfigInterface } from './config.interface.js';
import type { RestConfig } from './rest.config.js';

convict.addFormats(addFormats);

const CONFIG_SCHEMA: Schema<RestConfig> = {
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
  dbPort: {
    doc: 'Database port',
    format: 'port',
    env: 'DB_PORT',
    default: 27017,
  },
  dbName: {
    doc: 'Database name',
    format: String,
    env: 'DB_NAME',
    default: 'six-cities',
  },
  dbUser: {
    doc: 'Database user name',
    format: String,
    env: 'DB_USER',
    default: '',
  },
  dbPassword: {
    doc: 'Database user password',
    format: String,
    env: 'DB_PASSWORD',
    default: '',
    sensitive: true,
  },
  salt: {
    doc: 'Password hash salt',
    format: String,
    env: 'SALT',
    default: '',
    sensitive: true,
  },
  uploadDirectory: {
    doc: 'Directory for user-uploaded files (avatars, etc.)',
    format: String,
    env: 'UPLOAD_DIRECTORY',
    default: 'upload',
  },
  jwtSecret: {
    doc: 'Secret key used to sign JWT access tokens',
    format: String,
    env: 'JWT_SECRET',
    default: '',
    sensitive: true,
  },
  jwtExpiresIn: {
    doc: 'JWT access token lifetime (e.g. 2h, 7d)',
    format: String,
    env: 'JWT_EXPIRES_IN',
    default: '2h',
  },
};

const REQUIRED_ENVIRONMENT_VARIABLES = [
  'PORT',
  'DB_HOST',
  'SALT',
  'UPLOAD_DIRECTORY',
  'JWT_SECRET',
] as const;

@injectable()
export class ConfigService implements ConfigInterface<RestConfig> {
  private readonly config = convict<RestConfig>(CONFIG_SCHEMA);

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

