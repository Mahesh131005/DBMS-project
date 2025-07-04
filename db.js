const sqlite3 = require('sqlite3').verbose();
const { execSync } = require('child_process');

const DB_FILE = 'data.db';
const db = new sqlite3.Database(DB_FILE);

function commitDB(op) {
  try {
    execSync(`git add ${DB_FILE}`);
    execSync(`git commit -m "${op}@${new Date().toISOString()}"`);
  } catch (e) {
    console.log("Git commit skipped (maybe no changes)");
  }
}

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      const op = sql.trim().split(' ')[0].toUpperCase();
      if (['INSERT', 'UPDATE', 'DELETE'].includes(op)) {
        commitDB(op);
      }
      resolve(this);
    });
  });
}

module.exports = { run };
