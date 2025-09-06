@echo off
REM Production build script for ThinkSync (Windows)
echo 🚀 Building ThinkSync for production...

REM Install dependencies
echo 📦 Installing server dependencies...
cd server && npm install --production

echo 📦 Installing client dependencies...
cd ../client && npm install

REM Build client
echo 🏗️  Building React client...
npm run build

REM Return to root
cd ..

echo ✅ Build complete! Ready for deployment.
echo.
echo Next steps:
echo 1. Set up MongoDB Atlas database
echo 2. Configure environment variables on Render
echo 3. Deploy using the Render dashboard
echo.
echo See DEPLOYMENT.md for detailed instructions.
pause
