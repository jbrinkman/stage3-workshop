// stringutils.test.js
// Tests for the string utilities.

const assert = require('assert');
const { truncate, slugify, wordCount, titleCase, repeatJoin } = require('./stringutils');

assert.strictEqual(truncate('hello world', 20), 'hello world');
assert.strictEqual(slugify('Hello, World!'), 'hello-world');
assert.strictEqual(wordCount('one two three'), 3);
assert.strictEqual(wordCount('   '), 0);
assert.strictEqual(titleCase('the quick fox'), 'The Quick Fox');
assert.strictEqual(repeatJoin('ab', 3, '-'), 'ab-ab-ab');

console.log('All tests passed.');
