import { send } from '@actual-app/core/platform/client/connection';
import { q } from '@actual-app/core/shared/query';
import type { DashboardWidgetEntity } from '@actual-app/core/types/models';
import { t } from 'i18next';

import { aqlQuery } from '#queries/aqlQuery';

// Only use immediately after creating/resetting defaults. User-created report
// names and metadata in existing budgets must never be rewritten on load.
export async function localizeDefaultDashboard(dashboardPageId: string) {
  const names: Record<string, string> = {
    'Total Income (YTD)': t('Total Income (YTD)'),
    'Total Expenses (YTD)': t('Total Expenses (YTD)'),
    'Avg Per Month': t('Avg Per Month'),
    'Avg Per Transaction': t('Avg Per Transaction'),
    'This Month': t('This Month'),
    'Budget Overview': t('Budget Overview'),
    '3-Month Average': t('3-Month Average'),
    'Transaction Calendar': t('Transaction Calendar'),
    'Recent Net Worth Change': t('Recent Net Worth Change'),
  };
  const { data }: { data: DashboardWidgetEntity[] } = await aqlQuery(
    q('dashboard').filter({ dashboard_page_id: dashboardPageId }).select('*'),
  );
  for (const widget of data) {
    if (
      widget.meta &&
      'name' in widget.meta &&
      typeof widget.meta.name === 'string'
    ) {
      const name = names[widget.meta.name];
      if (name) {
        await send('dashboard-update-widget', {
          ...widget,
          meta: { ...widget.meta, name },
        });
      }
    }
  }
}
