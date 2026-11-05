const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { mkdirSync } = require('node:fs');
const { createRequire } = require('node:module');
const net = require('node:net');
const path = require('node:path');
const { setTimeout: delay } = require('node:timers/promises');
const root = path.resolve(__dirname, '..');
const requireDesktop = createRequire(
  path.join(root, 'packages/desktop-electron/package.json'),
);
const { chromium } = requireDesktop('@playwright/test');

async function smoke() {
  const server = net.createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  await new Promise(resolve => server.close(resolve));
  const folder = path.join(
    root,
    'packages/desktop-electron/e2e/test-results',
    `packaged-${Date.now()}`,
  );
  mkdirSync(path.join(folder, 'documents'), { recursive: true });
  mkdirSync(path.join(folder, 'data'), { recursive: true });
  const env = {
    ...process.env,
    EXECUTION_CONTEXT: 'playwright',
    ACTUAL_DOCUMENT_DIR: path.join(folder, 'documents'),
    ACTUAL_DATA_DIR: path.join(folder, 'data'),
  };
  delete env.ELECTRON_RUN_AS_NODE;
  const child = spawn(
    path.join(root, 'packages/desktop-electron/dist/win-unpacked/Actual.exe'),
    [
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${path.join(folder, 'chromium')}`,
    ],
    { env, windowsHide: true, stdio: 'ignore' },
  );
  let browser;
  try {
    let connected = false;
    for (let attempt = 0; attempt < 100; attempt++) {
      try {
        const response = await fetch(`http://127.0.0.1:${port}/json/version`);
        if (response.ok) {
          connected = true;
          break;
        }
      } catch {
        /* Wait for the packaged browser process to start. */
      }
      await delay(200);
    }
    assert.ok(connected, 'Packaged Electron did not start');
    browser = await chromium.connectOverCDP(`http://127.0.0.1:${port}`);
    const page = browser.contexts()[0].pages()[0];
    page.setDefaultTimeout(15000);
    await page
      .getByRole('button', { name: '不使用服务器', exact: true })
      .click();
    await page.getByRole('button', { name: '开始做预算', exact: true }).click();
    await page.getByRole('button', { name: '我的财务', exact: true }).waitFor();
    await page.getByText('餐饮', { exact: true }).waitFor();
    const categories = await page.evaluate(() =>
      window.$send('get-categories'),
    );
    assert.equal(
      categories.list.find(item => item.name === '餐饮')?.id,
      '541836f1-e756-4473-a5d0-6c1d3f06c7fa',
    );
    await page.screenshot({ path: path.join(folder, 'budget.png') });
    await page.getByText('设置', { exact: true }).first().click();
    await page.getByText('显示语言', { exact: true }).waitFor();
    assert.ok((await page.locator('body').innerText()).includes('简体中文'));
    await page.screenshot({ path: path.join(folder, 'settings.png') });
    console.log(
      `PASS: packaged Windows app created and opened a Chinese budget with its bundled SQLite module. Screenshots: ${folder}`,
    );
    await page
      .evaluate(() => window.close())
      .catch(() => {
        /* Closing destroys the execution context. */
      });
  } finally {
    if (browser) {
      await browser.close().catch(() => {
        /* The window may already have closed. */
      });
    }
    child.kill();
  }
}
smoke().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
