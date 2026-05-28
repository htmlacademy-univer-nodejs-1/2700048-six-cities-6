#!/usr/bin/env node

import { runCli } from './cli/run.js';

try {
  await runCli();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  // eslint-disable-next-line no-console
  console.error(message);
  process.exitCode = 1;
}

