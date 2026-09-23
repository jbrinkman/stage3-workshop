# Pull Request #1 — Source Under Review

> Generated from `fixtures/math-app/source/*.js` for eval loading (text, not
> executable). Keep in sync when editing the source files.

## operations.js

```js
// operations.js
// Core arithmetic operations for the math application.

/**
 * Add two numbers.
 */
function add(a, b) {
  return a + b;
}

/**
 * Subtract b from a.
 */
function subtract(a, b) {
  return a - b;
}

/**
 * Multiply two numbers.
 */
function multiply(a, b) {
  return a * b;
}

/**
 * Divide a by b.
 */
function divide(a, b) {
  return a / b;
}

/**
 * Raise base to the given exponent.
 */
function power(base, exponent) {
  let result = 1;
  for (let i = 0; i < exponent; i++) {
    result = result * base;
  }
  return result;
}

module.exports = { add, subtract, multiply, divide, power };
```

## calculator.js

```js
// calculator.js
// Simple CLI calculator: node calculator.js <operation> <a> <b>

const { add, subtract, multiply, divide, power } = require('./operations');

function calculate(operation, a, b) {
  switch (operation) {
    case 'add':
      return add(a, b);
    case 'subtract':
      return subtract(a, b);
    case 'multiply':
      return multiply(a, b);
    case 'divide':
      return divide(a, b);
    case 'power':
      return power(a, b);
    default:
      throw new Error('Unknown operation: ' + operation);
  }
}

function main() {
  const [, , operation, aRaw, bRaw] = process.argv;
  const a = parseFloat(aRaw);
  const b = parseFloat(bRaw);
  const result = calculate(operation, a, b);
  console.log(result);
}

if (require.main === module) {
  main();
}

module.exports = { calculate };
```

## operations.test.js

```js
// operations.test.js
// Basic tests for the arithmetic operations.

const assert = require('assert');
const { add, subtract, multiply, divide } = require('./operations');

assert.strictEqual(add(2, 3), 5);
assert.strictEqual(subtract(5, 2), 3);
assert.strictEqual(multiply(4, 3), 12);
assert.strictEqual(divide(10, 2), 5);

console.log('All tests passed.');
```
