#!/bin/bash

# Vercel Deployment Script for ThinkSync
echo "🚀 Preparing ThinkSync for Vercel deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

echo "📋 Choose deployment option:"
echo "1) Frontend on Vercel + Backend on Railway (Recommended)"
echo "2) Full-stack on Vercel (No real-time features)"
read -p "Enter option (1 or 2): " option

if [ "$option" = "1" ]; then
    echo "🎯 Option 1: Separate Frontend and Backend deployment"
    
    # Install dependencies
    echo "📦 Installing dependencies..."
    cd client && npm install
    cd ../server && npm install
    cd ..
    
    # Build client for testing
    echo "🏗️  Building client..."
    cd client && npm run build
    cd ..
    
    echo "✅ Ready for deployment!"
    echo ""
    echo "Next steps:"
    echo "1. Deploy backend to Railway:"
    echo "   - Go to railway.app"
    echo "   - Deploy from GitHub, set root directory to 'server'"
    echo "   - Add environment variables (MongoDB URI, JWT secret)"
    echo ""
    echo "2. Deploy frontend to Vercel:"
    echo "   - Go to vercel.com"
    echo "   - Import GitHub repo, set root directory to 'client'"
    echo "   - Add REACT_APP_API_URL environment variable"
    
elif [ "$option" = "2" ]; then
    echo "🎯 Option 2: Full-stack Vercel deployment"
    echo "⚠️  Warning: Real-time Socket.IO features will not work"
    
    # Copy vercel config
    if [ -f "vercel-fullstack.json" ]; then
        cp vercel-fullstack.json vercel.json
        echo "✅ Vercel configuration copied"
    fi
    
    # Install all dependencies
    echo "📦 Installing dependencies..."
    cd client && npm install && npm run build
    cd ../server && npm install
    cd ..
    
    echo "✅ Ready for full-stack Vercel deployment!"
    echo ""
    echo "Next steps:"
    echo "1. Run: vercel"
    echo "2. Follow prompts to deploy"
    echo "3. Set environment variables in Vercel dashboard"
    
else
    echo "❌ Invalid option selected"
    exit 1
fi

echo ""
echo "📚 See VERCEL-DEPLOYMENT.md for detailed instructions"
