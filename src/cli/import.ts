import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';
import { resolve } from 'node:path';
import chalk from 'chalk';

import { parseOfferFromTSVLine } from './tsv.js';

export async function importFromTSV(filePath: string): Promise<void> {
  const absolutePath = resolve(process.cwd(), filePath);
  const stream = createReadStream(absolutePath, { encoding: 'utf-8' });
  const rl = createInterface({ input: stream, crlfDelay: Infinity });

  let importedCount = 0;
  let lineNumber = 0;

  // eslint-disable-next-line no-console
  console.log(chalk.bold(`Импорт из файла: ${chalk.underline(absolutePath)}`));

  try {
    for await (const line of rl) {
      lineNumber += 1;
      const trimmed = line.trim();
      if (!trimmed) {
        continue;
      }

      const offer = parseOfferFromTSVLine(trimmed, lineNumber);
      importedCount += 1;

      // eslint-disable-next-line no-console
      console.log(
        chalk.green('OK'),
        chalk.bold(offer.title),
        chalk.dim(`(${offer.city})`),
        chalk.yellow(`${offer.price}€`),
        chalk.dim(`host: ${offer.host.email}`)
      );
    }

    // eslint-disable-next-line no-console
    console.log(chalk.bold.green(`Готово. Импортировано предложений: ${importedCount}.`));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    // eslint-disable-next-line no-console
    console.error(chalk.bold.red('Ошибка импорта:'), chalk.red(message));
    process.exitCode = 1;
  }
}

