import test from 'node:test';
import assert from 'node:assert/strict';
import { formatAadhar } from './formatUtils.js';

test('formatAadhar handles empty or falsy inputs', () => {
  assert.equal(formatAadhar(''), '');
  assert.equal(formatAadhar(null), '');
  assert.equal(formatAadhar(undefined), '');
});

test('formatAadhar formats numbers into 4-digit spaced chunks', () => {
  assert.equal(formatAadhar('1234'), '1234');
  assert.equal(formatAadhar('12345'), '1234 5');
  assert.equal(formatAadhar('12345678'), '1234 5678');
  assert.equal(formatAadhar('123456789'), '1234 5678 9');
  assert.equal(formatAadhar('123456789012'), '1234 5678 9012');
});

test('formatAadhar limits max digits to 12 (14 characters with spaces)', () => {
  assert.equal(formatAadhar('123456789012345'), '1234 5678 9012');
});

test('formatAadhar removes non-digit characters and normalizes', () => {
  assert.equal(formatAadhar('1234-5678-9012'), '1234 5678 9012');
  assert.equal(formatAadhar('1234 5678 9012'), '1234 5678 9012');
  assert.equal(formatAadhar('abc1234def5678ghi9012'), '1234 5678 9012');
  assert.equal(formatAadhar('abcdef'), '');
});

test('formatAadhar preserves single trailing space when user explicitly spaces at 4 or 8 digits', () => {
  assert.equal(formatAadhar('1234 '), '1234 ');
  assert.equal(formatAadhar('1234 5678 '), '1234 5678 ');
});

test('formatAadhar preserves N/A or dash placeholders for display', () => {
  assert.equal(formatAadhar('N/A (Verified)'), 'N/A (Verified)');
  assert.equal(formatAadhar('—'), '—');
});
