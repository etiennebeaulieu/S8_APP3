// test/basic.test.js
// Works with Node 18+ built-in test runner (no Jest/Mocha required)

const test = require('node:test');
const assert = require('node:assert/strict');

test('adds numbers correctly', () => {
  assert.strictEqual(1 + 1, 2);
});

test('adds numbers incorrectly', () => {
  assert.strictEqual(1 + 1, 3);
});

test('string includes substring', () => {
  const text = 'Hello insecure CI demo';
  assert.ok(text.includes('demo'));
});
