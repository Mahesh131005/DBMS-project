// create_product.js
const { run } = require('./db');

(async () => {
  // 1) Drop if it already exists (idempotent)
  await run("DROP TABLE IF EXISTS product");

  // 2) Create the table exactly as you specified
  await run(`
    CREATE TABLE product(
      prod_id INTEGER PRIMARY KEY,
      prod_name TEXT,
      manufacturer TEXT,
      cust_id INTEGER NOT NULL
    )
  `);

  console.log("✅ Product table created");
  process.exit(0);
})();
