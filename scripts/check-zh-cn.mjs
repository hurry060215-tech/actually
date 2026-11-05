import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Run yarn generate:i18n first: the baseline must come from the current source,
// not a stale catalog downloaded from the upstream translations repository.
const english = JSON.parse(
  readFileSync(
    new URL('../packages/desktop-client/locale/en.json', import.meta.url),
    'utf8',
  ),
);
const chinese = JSON.parse(
  readFileSync(
    new URL(
      '../packages/desktop-client/src/locales/zh-Hans.json',
      import.meta.url,
    ),
    'utf8',
  ),
);
const variables = text =>
  [...text.matchAll(/\{\{[^}]+\}\}/g)]
    .map(match => match[0].replace(/\s/g, ''))
    .sort((a, b) => a.localeCompare(b));
const tags = text =>
  [...text.matchAll(/<\/?\d+\s*\/?\s*>/g)]
    .map(match => match[0])
    .sort((a, b) => a.localeCompare(b));
const literalValues = new Set([
  ':root {\n  --color-sidebarItemSelected: #007bff;\n}',
  '28+',
  'https://example.com',
  'ISO-8859-2',
  'QUERY("{queryName}")',
  'UTF-16 BE',
  'UTF-16 LE',
  'UTF-8',
  'Windows-1250',
  'Windows-1252',
  'yyyy',
]);
const errors = [];
for (const [key, source] of Object.entries(english)) {
  try {
    const translated = chinese[key];
    assert.equal(typeof translated, 'string', 'Missing translation');
    assert.ok(translated.trim(), 'Empty translation');
    assert.deepEqual(
      variables(translated),
      variables(source),
      'Interpolation mismatch',
    );
    assert.deepEqual(tags(translated), tags(source), 'Rich text tag mismatch');
    assert.ok(
      /[\u3400-\u9fff]/.test(translated) ||
        literalValues.has(source) ||
        !/[a-zA-Z]/.test(translated.replace(/\{\{[^}]+\}\}/g, '')),
      'Untranslated prose',
    );
  } catch (error) {
    errors.push(`${key}: ${error.message}`);
  }
}
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(
    `PASS: ${Object.keys(english).length} source entries covered; interpolation, rich text tags and Chinese prose checked.`,
  );
}
