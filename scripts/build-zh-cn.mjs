// Windows-compatible equivalent of bin/package-electron. The Chinese catalog
// is bundled from src/locales and never depends on a mutable remote checkout.
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const yarn = path.join(root, '.yarn/releases/yarn-4.17.1.cjs');
function run(...args) {
  const result = spawnSync(process.execPath, [yarn, ...args], {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=8192' },
  });
  if (result.status !== 0) throw new Error(`Build failed: ${args.join(' ')}`);
}
const workspace = (name, ...args) => run('workspace', name, ...args);
workspace('@actual-app/crdt', 'build');
workspace('plugins-service', 'build');
workspace('@actual-app/core', 'build:node');
workspace('@actual-app/web', 'build', '--mode=desktop');
workspace('@actual-app/web', 'build:browser');
workspace('@actual-app/sync-server', 'build');
workspace('@actual-app/core', 'exec', 'tsgo', '-p', 'tsconfig.json');

const desktop = path.join(root, 'packages/desktop-electron');
const output = path.join(desktop, 'build');
// Only replace generated build output beneath this repository's Electron package.
if (path.dirname(output) !== desktop || path.basename(output) !== 'build') {
  throw new Error('Unexpected build output path');
}
if (existsSync(output)) rmSync(output, { recursive: true });
mkdirSync(output, { recursive: true });
cpSync(
  path.join(root, 'packages/desktop-client/build-electron'),
  path.join(output, 'client-build'),
  { recursive: true },
);
for (const entry of readdirSync(path.join(output, 'client-build'))) {
  if (entry === 'data' || /kcab\.|\.(wasm|map)$/.test(entry)) {
    rmSync(path.join(output, 'client-build', entry), {
      recursive: true,
      force: true,
    });
  }
}
const core = path.join(root, 'packages/loot-core');
mkdirSync(path.join(output, 'loot-core/lib-dist/electron'), {
  recursive: true,
});
cpSync(
  path.join(core, 'lib-dist/electron/bundle.desktop.js'),
  path.join(output, 'loot-core/lib-dist/electron/bundle.desktop.js'),
);
cpSync(
  path.join(core, 'default-db.sqlite'),
  path.join(output, 'loot-core/default-db.sqlite'),
);
cpSync(
  path.join(core, 'migrations'),
  path.join(output, 'loot-core/migrations'),
  { recursive: true },
);
workspace('desktop-electron', 'build:dist');
if (!process.argv.includes('--no-package')) {
  workspace(
    'desktop-electron',
    'exec',
    'electron-builder',
    '--win',
    'nsis',
    '--x64',
    '--publish',
    'never',
    '--config.nsis.installerLanguages=zh_CN',
    '--config.nsis.language=2052',
    '--config.beforePack=../../scripts/zh-cn-before-pack.cjs',
    // electron-builder expands these placeholders when naming the installer.
    // oxlint-disable-next-line eslint/no-template-curly-in-string
    '--config.win.artifactName=Actual-zh-CN-${version}-windows-${arch}.${ext}',
    ...(process.argv.includes('--dir') ? ['--dir'] : []),
  );
}
