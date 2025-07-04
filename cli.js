#!/usr/bin/env node
const { Command } = require('commander');
const { run } = require('./db');
const { execSync } = require('child_process');

const program = new Command();
program.version('1.0.0');

// Reusable function to check if SQL is mutating
function isMutating(sql) {
  const sqlUpper = sql.trim().toUpperCase();
  return (
    sqlUpper.startsWith("INSERT") ||
    sqlUpper.startsWith("UPDATE") ||
    sqlUpper.startsWith("DELETE") ||
    sqlUpper.startsWith("CREATE") ||
    sqlUpper.startsWith("DROP") ||
    sqlUpper.startsWith("ALTER")
  );
}

// INSERT command
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

// DELETE command
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

// HISTORY command
program
  .command('history')
  .description('Show Git commit history')
  .action(() => {
    const log = execSync('git log --oneline').toString();
    console.log(`📜 Git History:\n${log}`);
  });

// EXEC command
program
  .command('exec')
  .description('Run any SQL')
  .requiredOption('-q, --sql <sql>', 'The SQL to execute')
  .action(async (opts) => {
    try {
      await run(opts.sql);
      console.log(`✅ Executed: ${opts.sql}`);

      if (isMutating(opts.sql)) {
        execSync('git add -f data.db');
        execSync(`git commit -m "DDL/DML@${new Date().toISOString()}"`);
      }
    } catch (e) {
      console.error('❌ Error:', e.message);
    }
  });

// Parse the CLI args
program.parse(process.argv);
