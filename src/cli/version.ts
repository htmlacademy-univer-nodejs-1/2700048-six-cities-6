import { readFile } from 'node:fs/promises';
import chalk from 'chalk';

export async function printVersion(): Promise<void> {
  const packageJsonUrl = new URL('../../package.json', import.meta.url);
  const raw = await readFile(packageJsonUrl, { encoding: 'utf-8' });
  const packageInfo = JSON.parse(raw) as { version?: string };

  // eslint-disable-next-line no-console
  console.log(chalk.green(packageInfo.version ?? 'unknown'));
}

