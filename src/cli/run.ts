import chalk from 'chalk';

import { printHelp } from './help.js';
import { printVersion } from './version.js';
import { importFromTSV } from './import.js';
import { generateOffers } from './generate.js';

export async function runCli(argv: string[] = process.argv): Promise<void> {
  const args = argv.slice(2);

  if (args.length === 0 || args.includes('--help')) {
    printHelp();
    return;
  }

  if (args.includes('--version')) {
    await printVersion();
    return;
  }

  const importIndex = args.indexOf('--import');
  if (importIndex !== -1) {
    const filePath = args[importIndex + 1];
    if (!filePath) {
      // eslint-disable-next-line no-console
      console.error(chalk.red('Не указан путь к TSV-файлу для --import.'));
      printHelp();
      process.exitCode = 1;
      return;
    }

    await importFromTSV(filePath);
    return;
  }

  const generateIndex = args.indexOf('--generate');
  if (generateIndex !== -1) {
    const countRaw = args[generateIndex + 1];
    const filePath = args[generateIndex + 2];
    const url = args[generateIndex + 3];

    if (!countRaw || !filePath || !url) {
      // eslint-disable-next-line no-console
      console.error(chalk.red('Некорректные аргументы для --generate. Ожидается: --generate <n> <filepath> <url>.'));
      printHelp();
      process.exitCode = 1;
      return;
    }

    const count = Number.parseInt(countRaw, 10);
    if (!Number.isFinite(count) || count <= 0) {
      // eslint-disable-next-line no-console
      console.error(chalk.red('Параметр <n> для --generate должен быть положительным числом.'));
      process.exitCode = 1;
      return;
    }

    try {
      await generateOffers(count, filePath, url);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      // eslint-disable-next-line no-console
      console.error(chalk.bold.red('Ошибка генерации:'), chalk.red(message));
      process.exitCode = 1;
    }

    return;
  }

  // eslint-disable-next-line no-console
  console.error(chalk.red(`Неизвестная команда: ${args.join(' ')}`));
  printHelp();
  process.exitCode = 1;
}

