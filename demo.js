const { run } = require('./db');

(async () => {
  await run("CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY, name TEXT)");
  await run("INSERT INTO users(name) VALUES('Alice')");
  await run("INSERT INTO users(name) VALUES('Bob')");
  console.log("✅ Users inserted.");
})();
