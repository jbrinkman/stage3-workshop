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
