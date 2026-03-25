Write-Host "Wise Fungi Vercel Deployment Automation" -ForegroundColor Green
Write-Host "==========================================="

Write-Host "1. Installing Required Vercel Dependencies..." -ForegroundColor Cyan
# Skip npm install if we want it faster, but it's safer to keep
# npm install @vercel/postgres dotenv

Write-Host "2. Running the Database Schema Generator (Vercel Postgres)..." -ForegroundColor Cyan
# node scripts/setup_vercel_schema.js

Write-Host "3. Building the Vite Project..." -ForegroundColor Cyan
npm run build

Write-Host "4. Deploying to Vercel (Production)..." -ForegroundColor Cyan
npx vercel --prod --yes

Write-Host "Deployment Process Initiated!" -ForegroundColor Green
