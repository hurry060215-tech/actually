import simplifiedChinese from './locales/zh-Hans.json';

// Keep this edition's complete catalog in source control. Upstream's optional
// locale checkout and its completion threshold must not replace this catalog.
export const languages: Record<string, () => Promise<unknown>> = {
  ...import.meta.glob(['/locale/*.json', '!/locale/*_old.json']),
  '/locale/zh-Hans.json': () => Promise.resolve(simplifiedChinese),
};
