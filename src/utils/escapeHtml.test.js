import { test } from 'node:test';
import assert from 'node:assert/strict';
import { escapeHtml } from './escapeHtml.js';

test('escapeHtml encodes HTML metacharacters and quotes', () => {
  assert.equal(
    escapeHtml(`<script>alert("x") & 'y'</script>`),
    '&lt;script&gt;alert(&quot;x&quot;) &amp; &#39;y&#39;&lt;/script&gt;'
  );
});

test('escapeHtml converts nullish values to empty text', () => {
  assert.equal(escapeHtml(null), '');
  assert.equal(escapeHtml(undefined), '');
});
