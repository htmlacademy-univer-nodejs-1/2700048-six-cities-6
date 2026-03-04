import chalk from 'chalk';

import { printHelp } from './help.js';
import { printVersion } from './version.js';
import { importFromTSV } from './import.js';

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

  // eslint-disable-next-line no-console
  console.error(chalk.red(`Неизвестная команда: ${args.join(' ')}`));
  printHelp();
  process.exitCode = 1;
}

