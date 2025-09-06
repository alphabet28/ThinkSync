# 🚨 DEPLOYMENT FIX GUIDE

## Issue: `npm run install-all` script error during deployment

### ✅ **Solution for Render:**

**For Backend Service:**
1. Go to Render Dashboard → New Web Service
2. Connect your GitHub repo: `https://github.com/alphabet28/ThinkSync`
3. **CRITICAL**: Set Root Directory to `server`
4. Configure:
   - Build Command: `npm install --production`
   - Start Command: `npm start`

**For Frontend Service:**
1. Go to Render Dashboard → New Static Site  
2. Connect the same GitHub repo
3. **CRITICAL**: Set Root Directory to `client`
4. Configure:
   - Build Command: `npm install && npm run build`
   - Publish Directory: `build`

### ✅ **Solution for Railway (Backend):**
1. Go to [railway.app](https://railway.app)
2. Deploy from GitHub repo
3. **CRITICAL**: Set Root Directory to `server`
4. Railway will auto-detect `package.json` and run `npm start`

### ✅ **Solution for Vercel (Frontend):**
1. Go to [vercel.com](https://vercel.com) 
2. Import GitHub repo
3. **CRITICAL**: Set Root Directory to `client`
4. Vercel will auto-detect Create React App and build properly

## 🔑 **Key Fix:**
**Always set the correct Root Directory when deploying:**
- `server/` for backend services
- `client/` for frontend services

This avoids the monorepo script issues and deploys each part independently.

## 📋 **Environment Variables:**

**Backend:**
```env
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/thinksync
JWT_SECRET=your-32-character-secret-key
CLIENT_URL=https://your-frontend-url.vercel.app
```

**Frontend:**
```env
REACT_APP_API_URL=https://your-backend-url.railway.app/api
```

## ✅ **Test URLs After Deployment:**
- Backend Health: `https://your-backend-url/api/health`
- Frontend: `https://your-frontend-url.vercel.app`
