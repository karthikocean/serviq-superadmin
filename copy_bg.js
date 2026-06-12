const fs = require('fs');
const src = 'C:\\\\Users\\\\DELL\\\\Downloads\\\\log in .png';
const dest = 'public/login-bg.png';
try {
  fs.copyFileSync(src, dest);
  console.log('SUCCESS: Copied successfully!');
} catch (e) {
  console.error('ERROR:', e.message);
}
