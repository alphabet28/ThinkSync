@echo off
REM Vercel Deployment Script for ThinkSync (Windows)
echo 🚀 Preparing ThinkSync for Vercel deployment...

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Please run this script from the project root directory
    pause
    exit /b 1
)

echo 📋 Choose deployment option:
echo 1) Frontend on Vercel + Backend on Railway (Recommended)
echo 2) Full-stack on Vercel (No real-time features)
set /p option="Enter option (1 or 2): "

if "%option%"=="1" (
    echo 🎯 Option 1: Separate Frontend and Backend deployment
    
    REM Install dependencies
    echo 📦 Installing dependencies...
    cd client && npm install
    cd ../server && npm install
    cd ..
    
    REM Build client for testing
    echo 🏗️  Building client...
    cd client && npm run build
    cd ..
    
    echo ✅ Ready for deployment!
    echo.
    echo Next steps:
    echo 1. Deploy backend to Railway:
    echo    - Go to railway.app
    echo    - Deploy from GitHub, set root directory to 'server'
    echo    - Add environment variables (MongoDB URI, JWT secret)
    echo.
    echo 2. Deploy frontend to Vercel:
    echo    - Go to vercel.com
    echo    - Import GitHub repo, set root directory to 'client'
    echo    - Add REACT_APP_API_URL environment variable
    
) else if "%option%"=="2" (
    echo 🎯 Option 2: Full-stack Vercel deployment
    echo ⚠️  Warning: Real-time Socket.IO features will not work
    
    REM Copy vercel config
    if exist "vercel-fullstack.json" (
        copy vercel-fullstack.json vercel.json
        echo ✅ Vercel configuration copied
    )
    
    REM Install all dependencies
    echo 📦 Installing dependencies...
    cd client && npm install && npm run build
    cd ../server && npm install
    cd ..
    
    echo ✅ Ready for full-stack Vercel deployment!
    echo.
    echo Next steps:
    echo 1. Run: vercel
    echo 2. Follow prompts to deploy
    echo 3. Set environment variables in Vercel dashboard
    
) else (
    echo ❌ Invalid option selected
    pause
    exit /b 1
)

echo.
echo 📚 See VERCEL-DEPLOYMENT.md for detailed instructions
pause
