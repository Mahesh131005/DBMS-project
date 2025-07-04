#!/usr/bin/env node
const { Command } = require('commander');
const { run } = require('./db');
const { execSync } = require('child_process');

const program = new Command();
program.version('1.0.0');

program
  .command('insert')
  .description('Insert into a table')
  .requiredOption('--table <table>', 'Table name')
  .requiredOption('--name <name>', 'Name to insert')
  .action(async (opts) => {
    await run(`INSERT INTO ${opts.table}(name) VALUES(?)`, [opts.name]);
    execSync('git add data.db');
    execSync(`git commit -m "INSERT@${new Date().toISOString()}"`);
    console.log(`✅ Inserted "${opts.name}" into "${opts.table}"`);
  });

program
  .command('delete')
  .description('Delete a row by ID')
  .requiredOption('--table <table>', 'Table name')
  .requiredOption('--id <id>', 'Row ID')
  .action(async (opts) => {
    await run(`DELETE FROM ${opts.table} WHERE id = ?`, [opts.id]);
    execSync('git add data.db');
    execSync(`git commit -m "DELETE@${new Date().toISOString()}"`);
    console.log(`🗑️ Deleted ID ${opts.id} from "${opts.table}"`);
  });

program
  .command('history')
  .description('Show Git commit history')
  .action(() => {
    const log = execSync('git log --oneline').toString();
    console.log(`📜 Git History:\n${log}`);
  });

program.parse(process.argv);
