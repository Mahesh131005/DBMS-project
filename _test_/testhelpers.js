const { run } = require('../db');
const sqlite3 = require('sqlite3').verbose();
const { exec } = require("child_process");
/**
 * Insert test
 */
async function testInsert(table, columns, values, lookupCol, expectedValue) {
  const colList = columns.join(", ");
  const placeholders = columns.map(() => "?").join(", ");
  await run(`INSERT INTO ${table}(${colList}) VALUES(${placeholders})`, values);

  const db = new sqlite3.Database('data.db');
  await new Promise((resolve, reject) => {
    db.get(`SELECT * FROM ${table} WHERE ${lookupCol} = ?`, [expectedValue], (err, row) => {
      if (err) return reject(err);
      expect(row[lookupCol]).toBe(expectedValue);
      resolve();
    });
  });
}

/**
 * Update test
 */
async function testUpdate(table, setCol, setValue, whereCol, whereValue) {
  await run(`UPDATE ${table} SET ${setCol} = ? WHERE ${whereCol} = ?`, [setValue, whereValue]);

  const db = new sqlite3.Database('data.db');
  await new Promise((resolve, reject) => {
    db.get(`SELECT * FROM ${table} WHERE ${setCol} = ?`, [setValue], (err, row) => {
      if (err) return reject(err);
      expect(row).toBeDefined();
      expect(row[setCol]).toBe(setValue);
      resolve();
    });
  });
}


/**
 * Delete test
 */
async function testDelete(table, whereCol, whereValue) {
  await run(`DELETE FROM ${table} WHERE ${whereCol} = ?`, [whereValue]);

  const db = new sqlite3.Database('data.db');
  await new Promise((resolve, reject) => {
    db.get(`SELECT * FROM ${table} WHERE ${whereCol} = ?`, [whereValue], (err, row) => {
      if (err) return reject(err);
      expect(row).toBeUndefined(); // Should be deleted
      resolve();
    });
  });
}
//select
async function testSelect(table, lookupCol, expectedValue) {
  const db = new sqlite3.Database('data.db');

  await new Promise((resolve, reject) => {
    db.get(`SELECT * FROM ${table} WHERE ${lookupCol} = ?`, [expectedValue], (err, row) => {
      if (err) return reject(err);
      expect(row).toBeDefined();
      expect(row[lookupCol]).toBe(expectedValue);
      resolve();
    });
  });
}
//constraints
async function testFails(query, values) {
  await expect(run(query, values)).rejects.toThrow();
}

test('Fails on duplicate email', async () => {
  await testFails(
    "INSERT INTO users(name) VALUES(?)", 
    [null] // name is NOT NULL
  );
});
//multiple rows
async function testMultipleRows(table, expectedRowsCount) {
  const db = new sqlite3.Database('data.db');

  await new Promise((resolve, reject) => {
    db.all(`SELECT * FROM ${table}`, [], (err, rows) => {
      if (err) return reject(err);
      expect(rows.length).toBe(expectedRowsCount);
      resolve();
    });
  });
}
async function testRollback(table, goodData, badData) {
  const db = new sqlite3.Database('data.db');

  await new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run("BEGIN TRANSACTION");
      db.run(`INSERT INTO ${table} VALUES(${goodData.map(() => "?").join(", ")})`, goodData);
      db.run(
        `INSERT INTO ${table} VALUES(${badData.map(() => "?").join(", ")})`,
        badData,
        function (err) {
          if (!err) return reject(new Error("Expected error but got success"));
          db.run("ROLLBACK", [], (rollbackErr) => {
            if (rollbackErr) return reject(rollbackErr);

            // Now verify that no rows exist
            db.all(`SELECT * FROM ${table}`, [], (err2, rows) => {
              if (err2) return reject(err2);
              expect(rows.length).toBe(0);
              resolve();
            });
          });
        }
      );
    });
  });
}

async function testGitHistory(expectedMessagePart) {
  await new Promise((resolve, reject) => {
    exec('git log -1 --pretty=%B', (err, stdout) => {
      if (err) return reject(err);
      expect(stdout).toContain(expectedMessagePart);
      resolve();
    });
  });
}


async function testCommitMessage(expectedMessage) {
  await new Promise((resolve, reject) => {
    exec('git log -1 --pretty=%B', (err, stdout) => {
      if (err) return reject(err);
      const message = stdout.trim();
      expect(message).toEqual(expectedMessage);
      resolve();
    });
  });
}
async function testGitFileChanged(filename = "data.db") {
  await new Promise((resolve, reject) => {
    exec(`git show --pretty="" --name-only HEAD`, (err, stdout) => {
      if (err) return reject(err);
      const files = stdout.trim().split("\n");
      expect(files).toContain(filename);
      resolve();
    });
  });
}




module.exports = {
  testInsert,
  testUpdate,
  testDelete,
  testSelect,
  testFails,
  testMultipleRows,
  testRollback,
  testGitHistory,
  testCommitMessage,
  testGitFileChanged
};


