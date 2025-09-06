# ThinkSync - Deployment Guide

## 🚀 Deploying to Render

### Prerequisites
1. **MongoDB Atlas Account**: Set up a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. **GitHub Repository**: Your code should be pushed to GitHub
3. **Render Account**: Sign up at [Render](https://render.com/)

### Step-by-Step Deployment

#### 1. Prepare Your Repository
```bash
# Ensure all changes are committed and pushed
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

#### 2. Set Up MongoDB Atlas
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster (M0 Sandbox)
3. Create a database user:
   - Go to Database Access → Add New Database User
   - Choose Password authentication
   - Create username and strong password
   - Grant "Read and write to any database" role
4. Whitelist IP addresses:
   - Go to Network Access → Add IP Address
   - Choose "Allow access from anywhere" (0.0.0.0/0)
5. Get connection string:
   - Go to Clusters → Connect → Connect your application
   - Copy the connection string (replace <password> with your actual password)

#### 3. Deploy Backend on Render
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `thinksync-api`
   - **Environment**: `Node`
   - **Build Command**: `npm run install-server`
   - **Start Command**: `cd server && npm start`
   - **Instance Type**: `Free` (or paid for better performance)

5. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/thinksync?retryWrites=true&w=majority
   JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-secure
   CLIENT_URL=https://thinksync-client.onrender.com
   ```

6. Click "Create Web Service"

#### 4. Deploy Frontend on Render
1. Go to Render Dashboard
2. Click "New +" → "Static Site"
3. Connect your GitHub repository
4. Configure the site:
   - **Name**: `thinksync-client`
   - **Build Command**: `npm run install-client && cd client && npm run build`
   - **Publish Directory**: `client/build`

5. Add Environment Variables:
   ```
   REACT_APP_API_URL=https://thinksync-api.onrender.com/api
   ```

6. Click "Create Static Site"

#### 5. Update Backend CORS (if needed)
After deployment, update the backend's CLIENT_URL environment variable with your actual frontend URL:
```
CLIENT_URL=https://your-actual-frontend-url.onrender.com
```

### 🔧 Alternative: Single Service Deployment

You can also deploy as a single service that serves both frontend and backend:

1. Use the `render.yaml` file in your repository
2. Go to Render Dashboard → "New +" → "Blueprint"
3. Connect your repository
4. Render will automatically detect the `render.yaml` configuration

### 🔍 Troubleshooting

**Common Issues:**
1. **Build Failures**: Check the build logs for missing dependencies
2. **Database Connection**: Verify MongoDB Atlas IP whitelist and connection string
3. **CORS Issues**: Ensure CLIENT_URL matches your frontend domain
4. **Environment Variables**: Double-check all required variables are set

**Health Checks:**
- Backend: `https://your-api-url.onrender.com/health`
- Frontend: Your frontend URL should load the login page

### 🚀 Going to Production

For production use, consider:
1. **Paid Plans**: Free tier has limitations (sleeping after 15min inactivity)
2. **Custom Domain**: Add your own domain in Render settings
3. **SSL Certificate**: Render provides automatic SSL
4. **Database Backups**: Set up MongoDB Atlas backups
5. **Monitoring**: Add error tracking and monitoring tools

### 📝 Environment Variables Quick Reference

**Backend (.env):**
```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
PORT=10000
NODE_ENV=production
CLIENT_URL=https://your-frontend-url
```

**Frontend (.env):**
```
REACT_APP_API_URL=https://your-backend-url/api
```

### 🎉 Success!
Once deployed, your ThinkSync application will be available at your Render URLs with:
- ✅ Real-time collaboration
- ✅ User authentication  
- ✅ MongoDB cloud database
- ✅ Secure HTTPS connections
- ✅ Automatic deployments on git push
