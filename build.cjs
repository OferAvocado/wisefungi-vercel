const { execSync } = require('child_process');

console.log('Starting custom build.cjs with Vite compilation...');

try {
  console.log('Executing npx vite build...');
  // We run npx vite build to compile src/main.jsx into dist/
  execSync('npx vite build', { stdio: 'inherit' });
  console.log('Vite build completed successfully!');
} catch (error) {
  console.error('Vite build failed:', error.message);
  process.exit(1);
}
