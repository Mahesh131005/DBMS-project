#!/usr/bin/env node
const { Command } = require('commander');
const { run, db } = require('./db');
const { execSync } = require('child_process');

const program = new Command();
program.version('1.0.0');

// Helper to check if SQL modifies the DB
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

// Helper to safely commit if there are changes
function safeGitCommit(message) {
  const timestamp = new Date().toISOString();
  try {
    execSync('git add -f data.db');
    // Commit only if there are actual staged changes
    execSync(`git diff --cached --quiet || git commit -m "${message}@${timestamp}"`);
  } catch (e) {
    console.error("❌ Git commit skipped or failed:", e.message);
  }
}

// INSERT
program
  .command('insert')
  .description('Insert into a table')
  .requiredOption('--table <table>', 'Table name')
  .requiredOption('--name <name>', 'Name to insert')
  .action(async (opts) => {
    await run(`INSERT INTO ${opts.table}(name) VALUES(?)`, [opts.name]);
    safeGitCommit("INSERT");
    console.log(`✅ Inserted "${opts.name}" into "${opts.table}"`);
  });

// DELETE
program
  .command('delete')
  .description('Delete a row by ID')
  .requiredOption('--table <table>', 'Table name')
  .requiredOption('--id <id>', 'Row ID')
  .action(async (opts) => {
    await run(`DELETE FROM ${opts.table} WHERE id = ?`, [opts.id]);
    safeGitCommit("DELETE");
    console.log(`🗑️ Deleted ID ${opts.id} from "${opts.table}"`);
  });

// SELECT ALL
program
  .command('select')
  .description('Select all rows from a table')
  .requiredOption('--table <table>', 'Table name')
  .action(async (opts) => {
    try {
      db.all(`SELECT * FROM ${opts.table}`, [], (err, rows) => {
        if (err) {
          console.error('❌ Select failed:', err.message);
        } else {
          console.log(`📄 Rows from "${opts.table}":\n`, rows);
        }
      });
    } catch (e) {
      console.error('❌ Error:', e.message);
    }
  });

// RAW SQL EXEC
program
  .command('exec')
  .description('Run any SQL')
  .requiredOption('-q, --sql <sql>', 'The SQL to execute')
  .action(async (opts) => {
    try {
      await run(opts.sql);
      console.log(`✅ Executed: ${opts.sql}`);
      if (isMutating(opts.sql)) {
        safeGitCommit("DDL/DML");
      }
    } catch (e) {
      console.error('❌ Error:', e.message);
    }
  });

// GIT HISTORY
program
  .command('history')
  .description('Show Git commit history')
  .action(() => {
    try {
      const log = execSync('git log --oneline').toString();
      console.log(`📜 Git History:\n${log}`);
    } catch (e) {
      console.error("❌ Couldn't read Git history:", e.message);
    }
  });

// Finalize CLI setup
program.parse(process.argv);
