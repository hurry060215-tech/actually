import { send } from '@actual-app/core/platform/client/connection';
import { q } from '@actual-app/core/shared/query';
import type { DashboardPageEntity } from '@actual-app/core/types/models';
import { t } from 'i18next';

import { aqlQuery } from '#queries/aqlQuery';
import { localizeDefaultDashboard } from '#reports/localizeDefaultDashboard';

// Only called immediately after creating an empty budget from default-db.sqlite.
// Never rename categories in imported, reopened, demo, or existing budgets.
// Starting Balances is an engine lookup key and already translated by the UI.
export async function localizeNewBudget() {
  const initial = await send('get-categories');
  const categories = [
    ['541836f1-e756-4473-a5d0-6c1d3f06c7fa', t('Food')],
    [
      'af375fd4-d759-46b3-bffe-74a856151d57',
      t('General', { context: 'category' }),
    ],
    ['d4b0f075-3343-4408-91ed-fae94f74e5bf', t('Bills')],
    ['29ec2c58-8cd3-42fe-9187-7b5dfe0f70a6', t('Bills (Flexible)')],
    ['3c1699a5-522a-435e-86dc-93d900a14f0e', t('Income')],
    ['6bbd8472-25d4-4cee-8a11-5bd9f7e83d61', t('Savings')],
  ];
  const groups = [
    ['fc3825fd-b982-4b72-b768-5b30844cf832', t('Usual Expenses')],
    ['2E1F5BDB-209B-43F9-AF2C-3CE28E380C00', t('Income')],
    ['a137772f-cf2f-4089-9432-822d2ddc1466', t('Investments and Savings')],
  ];
  for (const [id, name] of categories) {
    const category = initial.list.find(item => item.id === id);
    if (category) {
      await send('category-update', { ...category, name });
    }
  }
  for (const [id, name] of groups) {
    await send('category-group-update', { id, name });
  }
  const { data }: { data: DashboardPageEntity[] } = await aqlQuery(
    q('dashboard_pages').select('*'),
  );
  for (const dashboard of data) {
    if (dashboard.name === 'Main') {
      await send('dashboard-rename', {
        id: dashboard.id,
        name: t('Main dashboard'),
      });
    }
    await localizeDefaultDashboard(dashboard.id);
  }
}
