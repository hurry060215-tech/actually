const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const path = require('node:path');
const requireServer = createRequire(
  path.join(__dirname, '../packages/sync-server/package.json'),
);
const Database = requireServer('better-sqlite3');
const bcrypt = requireServer('bcrypt');
const argon2 = requireServer('argon2');

async function verify() {
  assert.ok(process.versions.electron, 'Validation must run inside Electron');
  const database = new Database(':memory:');
  database.exec(
    'CREATE TABLE smoke (amount INTEGER); INSERT INTO smoke VALUES (12345)',
  );
  assert.equal(
    database.prepare('SELECT amount FROM smoke').get().amount,
    12345,
  );
  database.close();
  const password = 'local-native-module-smoke-test';
  assert.ok(bcrypt.compareSync(password, bcrypt.hashSync(password, 4)));
  assert.ok(await argon2.verify(await argon2.hash(password), password));
  console.log(
    `Native modules verified in Electron ${process.versions.electron} (${process.arch})`,
  );
}
verify().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
