const parser = require('@babel/parser');
const fs = require('fs');

try {
  const code = fs.readFileSync('scratch.js', 'utf-8');
  parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx']
  });
  console.log('Parsed successfully');
} catch (e) {
  console.log('Syntax error:', e.message);
  console.log('Location:', e.loc);
}
