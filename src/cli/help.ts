import chalk from 'chalk';

export function printHelp(): void {
  const text = [
    chalk.bold('Программа для подготовки данных для REST API сервера.'),
    '',
    chalk.dim('Пример: cli.js --<command> [--arguments]'),
    '',
    chalk.bold('Команды:'),
    ` ${chalk.cyan('--version')}:                 ${chalk.dim('# выводит номер версии')}`,
    ` ${chalk.cyan('--help')}:                    ${chalk.dim('# печатает этот текст')}`,
    ` ${chalk.cyan('--import <path>')}:           ${chalk.dim('# импортирует данные из TSV')}`,
    ` ${chalk.cyan('--generate <n> <path> <url>')}: ${chalk.dim('# генерирует произвольное количество тестовых данных')}`,
  ].join('\n');

  // eslint-disable-next-line no-console
  console.log(text);
}

