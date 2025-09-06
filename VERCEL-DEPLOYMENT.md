# 🚀 Vercel Deployment Guide for ThinkSync

## 🎯 Deployment Strategy Options

### **Option 1: Frontend on Vercel + Backend on Railway (Recommended)**

This is the optimal setup for MERN applications with real-time features.

#### **Step 1: Deploy Backend on Railway**

1. **Create Railway Account**: Go to [railway.app](https://railway.app)
2. **Deploy from GitHub**:
   - Connect your GitHub repository
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Set root directory to `/server`

3. **Environment Variables on Railway**:
   ```env
   PORT=10000
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/thinksync
   JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
   CLIENT_URL=https://your-frontend-url.vercel.app
   ```

4. **Custom Start Command**: `npm start` (Railway auto-detects this)

#### **Step 2: Deploy Frontend on Vercel**

1. **Install Vercel CLI** (optional):
   ```bash
   npm i -g vercel
   ```

2. **Deploy via Vercel Dashboard**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Set these configurations:
     - **Framework**: Create React App
     - **Root Directory**: `client`
     - **Build Command**: `npm run build`
     - **Output Directory**: `build`
     - **Install Command**: `npm install`

3. **Environment Variables on Vercel**:
   ```env
   REACT_APP_API_URL=https://your-backend-url.railway.app/api
   GENERATE_SOURCEMAP=false
   ```

4. **Domain Settings**:
   - Set custom domain if needed
   - Vercel provides automatic HTTPS

---

### **Option 2: Full-Stack on Vercel (Serverless)**

⚠️ **Note**: Socket.IO real-time features won't work with serverless functions. Use this only if you don't need real-time collaboration.

#### **Step 1: Prepare Your Project**

1. **Copy server files to api directory**:
   ```bash
   # Create api directory in root
   mkdir api
   
   # Copy server files (excluding socket.io parts)
   cp -r server/* api/
   ```

2. **Update package.json in root**:
   ```json
   {
     "scripts": {
       "build": "cd client && npm run build",
       "dev": "vercel dev",
       "deploy": "vercel"
     }
   }
   ```

#### **Step 2: Configure Vercel**

1. **Use the vercel-fullstack.json** (rename to vercel.json)
2. **Environment Variables**:
   ```env
   MONGODB_URI=your-mongodb-connection-string
   JWT_SECRET=your-secret-key
   NODE_ENV=production
   ```

---

## 🔧 Required File Changes

### **1. Update Client API Configuration**

The files have already been created with the correct configuration:
- ✅ `client/.env.production` - Production environment variables
- ✅ `client/vercel.json` - Vercel configuration for frontend-only deployment

### **2. Update Server CORS for Vercel**

Your server already has the updated CORS configuration to handle Vercel domains.

### **3. MongoDB Atlas Setup** (Same as before)

1. Create free cluster at [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create database user with password
3. Whitelist all IPs (0.0.0.0/0)
4. Get connection string

---

## 📋 Step-by-Step Deployment (Option 1 - Recommended)

### **Backend Deployment (Railway)**

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Deploy on Railway**:
   - Visit [railway.app](https://railway.app)
   - "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Set root directory: `server`
   - Add environment variables (MongoDB URI, JWT secret, etc.)

3. **Get your Railway URL**: `https://your-app-name.railway.app`

### **Frontend Deployment (Vercel)**

1. **Deploy on Vercel**:
   - Visit [vercel.com](https://vercel.com)
   - "New Project" → Import your GitHub repo
   - **IMPORTANT**: Set root directory to `client`
   - Add environment variable: `REACT_APP_API_URL=https://your-backend-url.railway.app/api`

2. **Get your Vercel URL**: `https://your-app-name.vercel.app`

3. **Update Railway CLIENT_URL**: Set to your Vercel URL

---

## 🚨 Important Considerations

### **Real-time Features**
- ✅ **Railway/Render**: Full Socket.IO support
- ❌ **Vercel Serverless**: No persistent connections (Socket.IO won't work)
- 🔄 **Alternative**: Use Vercel + Pusher/Ably for real-time features

### **Database**
- ✅ **MongoDB Atlas**: Works with both options
- ✅ **Free Tier**: 512MB storage, good for development

### **Cost Comparison**
- **Railway Free**: 500 execution hours/month
- **Vercel Free**: Unlimited for personal projects
- **MongoDB Atlas Free**: 512MB storage

---

## 🎉 After Deployment

Your ThinkSync app will be available at:
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-app.railway.app`
- **Health Check**: `https://your-app.railway.app/api/health`

### **Testing Checklist**
- [ ] User registration/login works
- [ ] Dashboard loads and shows boards/mindmaps
- [ ] Can create new boards/mindmaps
- [ ] Save functionality works
- [ ] Real-time collaboration works (if using Railway)
- [ ] Mobile responsive design

---

## 🛠️ Troubleshooting

**Common Issues:**
1. **CORS errors**: Update CLIENT_URL on backend
2. **API not found**: Check REACT_APP_API_URL matches backend URL
3. **Database connection**: Verify MongoDB Atlas IP whitelist
4. **Build failures**: Check Node.js version compatibility

**Debug Commands:**
```bash
# Check logs on Railway
railway logs

# Check Vercel logs
vercel logs

# Test API endpoint
curl https://your-backend-url.railway.app/api/health
```

---

## 🚀 Pro Tips

1. **Custom Domains**: Both Vercel and Railway support custom domains
2. **Environment Management**: Use different environments for staging/production
3. **Monitoring**: Add error tracking (Sentry, LogRocket)
4. **Performance**: Enable gzip compression, optimize images
5. **Security**: Use environment variables for all secrets

The deployment configuration files are now ready! Choose Option 1 for full functionality including real-time features.
