const { run } = require('../db');
const {
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
} = require('./testhelpers');


beforeAll(async () => {
  await run("DROP TABLE IF EXISTS users");
  await run("CREATE TABLE users(id INTEGER PRIMARY KEY, name TEXT NOT NULL UNIQUE)");

  // Insert an initial user
  await run("INSERT INTO users(name) VALUES(?)", ["Alice"]);
});

test('Update user name', async () => {
  await testUpdate("users", "name", "Alicia", "name", "Alice");
},15000);

test('Delete user', async () => {
  await testDelete("users", "name", "Alicia");
});
test('Select a user after insert', async () => {
  await testInsert("users", ["name"], ["Gowri"], "name", "Gowri");
  await testSelect("users", "name", "Gowri");
});

test('Fails to insert null name', async () => {
  await testFails("INSERT INTO users(name) VALUES(?)", [null]);
});

test('Insert multiple users and check count', async () => {
    await run("DELETE FROM users");

  await testInsert("users", ["name"], ["Alice"], "name", "Alice");
  await testInsert("users", ["name"], ["Bob"], "name", "Bob");
  await testMultipleRows("users", 2);
});
test('Rollback when second insert fails', async () => {
  await run("DROP TABLE IF EXISTS students");
  await run("CREATE TABLE students(id INTEGER PRIMARY KEY, name TEXT NOT NULL)");

  await testRollback("students", [1, "Alice"], [2, null]); // null name violates NOT NULL
});

test('Git commit history includes insert', async () => {
  await testGitHistory("INSERT");
});
test('Git commit has correct message', async () => {
await testCommitMessage(expect.stringMatching(/^INSERT@/));
},15000);

test('data.db was committed in last commit', async () => {
  await testGitFileChanged("data.db");
});


