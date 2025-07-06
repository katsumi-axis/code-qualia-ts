#!/usr/bin/env node

import { program } from 'commander';
import { InstallCommand } from './commands/install';
import { GenerateCommand } from './commands/generate';
import { OutputFormat } from './types';

const version = '1.0.0';

program
  .name('code-qualia-ts')
  .description('A tool for communicating developer intuition and code quality perception to AI')
  .version(version);

program
  .command('install')
  .description('Generate a configuration file for your project')
  .action(async () => {
    const command = new InstallCommand();
    await command.execute();
  });

program
  .command('generate')
  .description('Analyze methods and generate priority scores')
  .option('-c, --config <path>', 'Path to configuration file')
  .option('-n, --top-n <number>', 'Number of top methods to display', '3')
  .option('-f, --format <format>', 'Output format (table|json|csv)', 'table')
  .action(async (options) => {
    const format = options.format as OutputFormat;
    if (!['table', 'json', 'csv'].includes(format)) {
      console.error(`Invalid format: ${format}. Use table, json, or csv.`);
      process.exit(1);
    }

    const command = new GenerateCommand();
    await command.execute({
      config: options.config,
      topN: parseInt(options.topN, 10),
      format,
    });
  });

program.parse();