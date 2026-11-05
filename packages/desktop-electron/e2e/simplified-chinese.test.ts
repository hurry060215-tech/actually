import { stat } from 'node:fs/promises';
import path from 'node:path';

import { expect } from '@playwright/test';

import { test } from './fixtures';

test('Chinese desktop onboarding, accounts, settings and export', async ({
  electronApp,
  electronPage: page,
}, testInfo) => {
  const menu = await electronApp.evaluate(({ Menu }) =>
    Menu.getApplicationMenu()?.items.map(item => item.label),
  );
  expect(menu).toEqual(['文件', '视图', '编辑', '窗口']);
  await page.getByRole('button', { name: '不使用服务器', exact: true }).click();
  await expect(
    page.getByText('欢迎使用 Actual', { exact: true }),
  ).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('welcome.png') });
  await page.getByRole('button', { name: '开始做预算', exact: true }).click();
  await expect(
    page.getByRole('button', { name: '我的财务', exact: true }),
  ).toBeVisible();
  await expect(page.getByText('日常支出', { exact: true })).toBeVisible();
  await expect(page.getByText('餐饮', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '添加账户', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog
    .getByPlaceholder('例如：银行卡、储蓄、信用卡、现金')
    .fill('中文验收账户');
  await dialog.getByRole('textbox').first().press('Tab');
  await dialog.getByRole('textbox').last().fill('1000');
  await dialog.getByRole('textbox').last().press('Tab');
  await dialog.getByRole('button', { name: '新建', exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(
    page.getByText('中文验收账户', { exact: true }).first(),
  ).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('account.png') });

  await page.getByText('报表', { exact: true }).first().click();
  await expect(page).toHaveURL(/reports/);
  await page.getByText('净资产', { exact: true }).first().waitFor();
  await page.screenshot({ path: testInfo.outputPath('reports.png') });
  await expect(page.getByText('年初至今总收入', { exact: true })).toBeVisible();
  await expect(page.getByText('交易日历', { exact: true })).toBeVisible();
  expect(await page.locator('body').innerText()).not.toMatch(
    /Total Income|October|November|December|January/,
  );
  await page.getByText('计划交易', { exact: true }).first().click();
  await expect(page).toHaveURL(/schedules/);
  await page.screenshot({ path: testInfo.outputPath('schedules.png') });

  await page.getByText('设置', { exact: true }).first().click();
  await expect(page).toHaveURL(/settings\/general/);
  await expect(page.getByText('显示语言', { exact: true })).toBeVisible();
  await expect(page.getByText('简体中文', { exact: true })).toBeVisible();
  await expect(page.getByText('系统默认', { exact: true })).toBeVisible();
  await expect(page.getByText('深色', { exact: true })).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath('settings.png'),
    fullPage: true,
  });

  const exportPath = path.resolve(testInfo.outputPath('中文预算.zip'));
  await electronApp.evaluate(({ dialog }, filePath) => {
    dialog.showSaveDialog = async options => {
      if (options.title !== '导出预算') {
        throw new Error(`Unexpected dialog: ${options.title}`);
      }
      return { canceled: false, filePath };
    };
  }, exportPath);
  await page.getByRole('button', { name: '导出数据', exact: true }).click();
  await expect
    .poll(async () => (await stat(exportPath).catch(() => null))?.size ?? 0)
    .toBeGreaterThan(0);
});

test.describe('Chinese startup diagnostics', () => {
  test.use({ blockDocumentDir: true });
  test('keeps error and recovery controls in Chinese', async ({
    electronPage: page,
  }) => {
    await expect(
      page.getByText('数据文件夹不可用', { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: '选择其他文件夹', exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: '重启应用', exact: true }),
    ).toBeVisible();
  });
});
