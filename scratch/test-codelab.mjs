// Test CodeLab Execution Endpoints
const pythonCode = `def fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)

print("Fibonacci sequence:")
for i in range(10):
    print(f"fib({i}) = {fib(i)}")

import math
print(f"Square root of 144: {math.sqrt(144)}")
`;

async function testPython() {
  console.log('--- Testing Python Execution ---');
  const res = await fetch('http://localhost:3030/api/codelab/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ language: 'python', code: pythonCode }),
  });
  const data = await res.json();
  console.log('Result:', JSON.stringify(data, null, 2));
}

async function testTimeout() {
  console.log('\n--- Testing Infinite Loop Watchdog (Timeout Guard) ---');
  const infiniteCode = `print("Starting infinite loop...")\nwhile True:\n    pass`;
  const res = await fetch('http://localhost:3030/api/codelab/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ language: 'python', code: infiniteCode, timeoutMs: 2000 }),
  });
  const data = await res.json();
  console.log('Timeout result:', JSON.stringify(data, null, 2));
}

async function testNode() {
  console.log('\n--- Testing Node.js Execution ---');
  const jsCode = `const nums = [1, 2, 3, 4, 5];
const squares = nums.map(x => x * x);
console.log('Original:', nums);
console.log('Squares:', squares);
console.log('Sum:', squares.reduce((a, b) => a + b, 0));
`;
  const res = await fetch('http://localhost:3030/api/codelab/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ language: 'javascript', code: jsCode }),
  });
  const data = await res.json();
  console.log('Node result:', JSON.stringify(data, null, 2));
}

async function run() {
  await testPython();
  await testTimeout();
  await testNode();
}

run().catch(console.error);
