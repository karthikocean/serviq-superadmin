const fs = require('fs');
const babel = require('@babel/parser');
try {
  babel.parse(fs.readFileSync('src/components/SuperAdminDashboard.jsx', 'utf8'), {
    sourceType: 'module',
    plugins: ['jsx']
  });
  fs.writeFileSync('syntax_result.txt', 'Parsed successfully');
} catch (e) {
  fs.writeFileSync('syntax_result.txt', 'Error: ' + e.message + '\n' + e.loc.line + ':' + e.loc.column);
}
