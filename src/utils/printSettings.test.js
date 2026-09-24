import { test } from 'node:test';
import assert from 'node:assert';
import {
  PRINT_STYLE_OPTIONS,
  PRINT_COLOR_OPTIONS,
  PRINT_DOCUMENT_TYPES,
  DEFAULT_PRINT_SETTINGS,
  normalizePrintSettings,
  getPrintTheme,
  buildPrintThemeCss
} from './printSettings.js';

test('PRINT_STYLE_OPTIONS defines classic, minimal, and premium layouts', () => {
  const ids = PRINT_STYLE_OPTIONS.map(s => s.id);
  assert.ok(ids.includes('classic'));
  assert.ok(ids.includes('minimal'));
  assert.ok(ids.includes('premium'));

  PRINT_STYLE_OPTIONS.forEach(opt => {
    assert.ok(opt.label);
    assert.ok(opt.tagline);
    assert.ok(opt.features && opt.features.length > 0);
    assert.ok(opt.badge);
  });
});

test('normalizePrintSettings falls back to defaults for invalid settings', () => {
  const normalized = normalizePrintSettings({});
  assert.strictEqual(normalized.style, 'classic');
  assert.strictEqual(normalized.color, 'green');

  const custom = normalizePrintSettings({ style: 'premium', color: 'blue' });
  assert.strictEqual(custom.style, 'premium');
  assert.strictEqual(custom.color, 'blue');
});

test('getPrintTheme produces proper palettes for all 3 layouts', () => {
  const classic = getPrintTheme({ style: 'classic', color: 'green' });
  assert.strictEqual(classic.style, 'classic');
  assert.strictEqual(classic.primary, '#059669');

  const minimal = getPrintTheme({ style: 'minimal', color: 'blue' });
  assert.strictEqual(minimal.style, 'minimal');
  assert.strictEqual(minimal.primary, '#2563eb');

  const premium = getPrintTheme({ style: 'premium', color: 'black' });
  assert.strictEqual(premium.style, 'premium');
  assert.strictEqual(premium.primary, '#111827');
});

test('buildPrintThemeCss contains rules for all 3 layouts', () => {
  const css = buildPrintThemeCss({ style: 'premium', color: 'green' });
  assert.ok(css.includes('.print-style-classic'));
  assert.ok(css.includes('.print-style-minimal'));
  assert.ok(css.includes('.print-style-premium'));
  assert.ok(css.includes('--print-primary: #059669'));
});
