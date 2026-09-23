// stringutils.js
// String utility helpers for the text-processing service.

/**
 * Truncate a string to maxLen characters, appending an ellipsis if truncated.
 * The ellipsis counts toward the length budget.
 */
function truncate(str, maxLen) {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 1) + '…';
}

/**
 * Convert a string to a URL-friendly slug.
 */
function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Count words in a string (whitespace-separated).
 */
function wordCount(str) {
  if (str.trim() === '') return 0;
  return str.trim().split(/\s+/).length;
}

/**
 * Capitalize the first letter of each word.
 */
function titleCase(str) {
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Repeat a string n times, separated by the given separator.
 */
function repeatJoin(str, n, separator) {
  const sep = separator === undefined ? '' : separator;
  return Array(n).fill(str).join(sep);
}

module.exports = { truncate, slugify, wordCount, titleCase, repeatJoin };
