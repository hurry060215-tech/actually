import '@testing-library/jest-dom/vitest';
import type { ReactNode } from 'react';

import i18n from 'i18next';

import { resetTestProviders } from './mocks';

global.IS_TESTING = true;

// Upstream component assertions use English. Keep their locale explicit while
// the shipped application defaults to Chinese; localization tests select zh-Hans.
beforeEach(async () => {
  await i18n.changeLanguage('en');
});
global.Actual = {} as typeof global.Actual;

// jsdom doesn't implement ResizeObserver. Components that only use it to
// react to layout changes (rather than asserting on it) can run against a
// no-op stub.
global.ResizeObserver = class {
  observe() {
    // no-op
  }
  unobserve() {
    // no-op
  }
  disconnect() {
    // no-op
  }
};

type Size = { height: number; width: number };

type AutoSizerProps = {
  renderProp?: (size: Size) => ReactNode;
  children?: (size: Size) => ReactNode;
};

vi.mock('react-virtualized-auto-sizer', () => {
  const AutoSizer = (props: AutoSizerProps) => {
    const render = props.renderProp ?? props.children;
    return render ? render({ height: 1000, width: 600 }) : null;
  };

  return {
    AutoSizer,
    default: AutoSizer,
  };
});

global.Date.now = () => 123456789;

global.__resetWorld = () => {
  resetTestProviders();
};

process.on('unhandledRejection', (reason: unknown) => {
  console.error('REJECTION', reason);
});

afterEach(() => {
  global.__resetWorld();
});
