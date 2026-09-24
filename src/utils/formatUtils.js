/**
 * Utility functions for formatting Indian identity and financial numbers
 */

/**
 * Formats an Aadhaar card number into standard 4-digit grouped format:
 * "XXXX XXXX XXXX" (4 digits space 4 digits space 4 digits).
 *
 * - Strips non-digits and restricts to 12 digits (14 characters with spaces)
 * - Automatically spaces every 4 digits during typing or paste
 * - Smoothly supports backspacing and manual space keying
 * - Retains display placeholders like 'N/A' or '—'
 *
 * @param {string|number} val
 * @returns {string} Formatted Aadhaar string
 */
export const formatAadhar = (val) => {
  if (!val) return '';
  const str = String(val);
  const digits = str.replace(/\D/g, '').slice(0, 12);

  if (!digits) {
    if (str.includes('N/A') || str.includes('—') || str.includes('-')) {
      return str;
    }
    return '';
  }

  const parts = digits.match(/.{1,4}/g);
  if (!parts) return '';
  let formatted = parts.join(' ');

  // Allow a single trailing space if the user explicitly keyed space after 4 or 8 digits
  if (str.endsWith(' ') && (digits.length === 4 || digits.length === 8)) {
    formatted += ' ';
  }

  return formatted;
};
