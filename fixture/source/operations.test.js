// operations.test.js
// Basic tests for the arithmetic operations.

const assert = require('assert');
const { add, subtract, multiply, divide } = require('./operations');

assert.strictEqual(add(2, 3), 5);
assert.strictEqual(subtract(5, 2), 3);
assert.strictEqual(multiply(4, 3), 12);
assert.strictEqual(divide(10, 2), 5);

console.log('All tests passed.');
