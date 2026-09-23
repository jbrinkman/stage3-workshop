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
