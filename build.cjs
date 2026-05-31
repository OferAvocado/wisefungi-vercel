const fs = require('fs');
const path = require('path');

console.log('Starting custom build.cjs...');

if (fs.existsSync('dist')) {
  console.log('Cleaning old dist...');
  fs.rmSync('dist', { recursive: true, force: true });
}
fs.mkdirSync('dist');

// Copy index.html
console.log('Copying index.html to dist...');
fs.copyFileSync('index.html', 'dist/index.html');

// Copy public directory to dist
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

if (fs.existsSync('public')) {
  console.log('Copying public folder to dist...');
  copyDir('public', 'dist');
}

console.log('Build completed successfully!');
