const { spawnSync } = require('node:child_process');
const { cpSync, mkdirSync } = require('node:fs');
const path = require('node:path');

// These locked versions ship Node-API binaries. Validate them in the exact
// Electron runtime instead of unnecessarily requiring a local C++ compiler.
// Failure is fatal: never package a desktop app with unusable native modules.
module.exports = async function beforePack(context) {
  const root = path.resolve(context.packager.projectDir, '../..');
  const electron = require(path.join(root, 'node_modules/electron'));
  const result = spawnSync(
    electron,
    [path.join(root, 'scripts/verify-native.cjs')],
    {
      cwd: root,
      env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' },
      encoding: 'utf8',
      windowsHide: true,
    },
  );
  if (
    result.status !== 0 ||
    !result.stdout.includes('Native modules verified')
  ) {
    throw new Error(
      `Native module validation failed: ${result.stderr || result.stdout || result.error}`,
    );
  }
  console.log(result.stdout.trim());
  // Upstream excludes prebuilds from its installer and expects the node-gyp
  // fallback path. Stage the validated Node-API binary at that same path.
  const sqlite = path.join(root, 'node_modules/better-sqlite3');
  mkdirSync(path.join(sqlite, 'build/Release'), { recursive: true });
  cpSync(
    path.join(sqlite, `prebuilds/${process.platform}-${process.arch}.node`),
    path.join(sqlite, 'build/Release/better_sqlite3.node'),
  );
};
