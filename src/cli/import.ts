import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';
import { resolve } from 'node:path';
import mongoose from 'mongoose';
import chalk from 'chalk';
import dotenv from 'dotenv';

import { parseOfferFromTSVLine } from './tsv.js';
import { getMongoURI } from '../db/db-uri.helper.js';
import { UserModel } from '../modules/user/user.model.js';
import { OfferModel } from '../modules/offer/offer.model.js';
import { hashPassword } from '../modules/user/password.helper.js';

const REQUIRED_IMPORT_ENVIRONMENT_VARIABLES = [
  'DB_HOST',
  'DB_PORT',
  'DB_NAME',
  'SALT',
] as const;

function getRequiredEnvironmentVariable(name: typeof REQUIRED_IMPORT_ENVIRONMENT_VARIABLES[number]): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getImportDatabaseUri(): string {
  const databasePort = Number.parseInt(getRequiredEnvironmentVariable('DB_PORT'), 10);
  if (!Number.isFinite(databasePort)) {
    throw new Error('Environment variable DB_PORT must be a valid port number.');
  }

  return getMongoURI(
    getRequiredEnvironmentVariable('DB_HOST'),
    databasePort,
    getRequiredEnvironmentVariable('DB_NAME'),
    process.env.DB_USER,
    process.env.DB_PASSWORD
  );
}

export async function importFromTSV(filePath: string): Promise<void> {
  dotenv.config({ quiet: true });

  const absolutePath = resolve(process.cwd(), filePath);

  let importedCount = 0;
  let lineNumber = 0;

  try {
    const databaseUri = getImportDatabaseUri();
    const databaseHost = getRequiredEnvironmentVariable('DB_HOST');
    const databaseName = getRequiredEnvironmentVariable('DB_NAME');
    const importSalt = getRequiredEnvironmentVariable('SALT');

    // eslint-disable-next-line no-console
    console.log(chalk.bold(`Подключение к базе данных: ${chalk.underline(databaseHost)}/${databaseName}`));
    await mongoose.connect(databaseUri);
    // eslint-disable-next-line no-console
    console.log(chalk.green('Соединение с MongoDB установлено.'));

    const stream = createReadStream(absolutePath, { encoding: 'utf-8' });
    const lineReader = createInterface({ input: stream, crlfDelay: Infinity });

    // eslint-disable-next-line no-console
    console.log(chalk.bold(`Импорт из файла: ${chalk.underline(absolutePath)}`));

    for await (const line of lineReader) {
      lineNumber += 1;
      const trimmed = line.trim();
      if (!trimmed) {
        continue;
      }

      const parsed = parseOfferFromTSVLine(trimmed, lineNumber);

      const user = await UserModel.findOneAndUpdate(
        { email: parsed.host.email },
        {
          $setOnInsert: {
            name: parsed.host.name,
            email: parsed.host.email,
            avatarUrl: parsed.host.avatarUrl,
            password: hashPassword(parsed.authorPassword, importSalt),
            type: parsed.host.type,
          },
        },
        { upsert: true, new: true }
      ).exec();

      await OfferModel.create({
        title: parsed.title,
        description: parsed.description,
        postDate: parsed.postDate,
        city: parsed.city,
        previewImage: parsed.previewImage,
        images: parsed.images,
        isPremium: parsed.isPremium,
        type: parsed.type,
        bedrooms: parsed.bedrooms,
        maxAdults: parsed.maxAdults,
        price: parsed.price,
        goods: parsed.goods,
        host: user._id,
        latitude: parsed.location.latitude,
        longitude: parsed.location.longitude,
      });

      importedCount += 1;

      // eslint-disable-next-line no-console
      console.log(
        chalk.green('OK'),
        chalk.bold(parsed.title),
        chalk.dim(`(${parsed.city})`),
        chalk.yellow(`${parsed.price}€`),
        chalk.dim(`host: ${parsed.host.email}`)
      );
    }

    // eslint-disable-next-line no-console
    console.log(chalk.bold.green(`Готово. Импортировано предложений: ${importedCount}.`));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    // eslint-disable-next-line no-console
    console.error(chalk.bold.red('Ошибка импорта:'), chalk.red(message));
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}
