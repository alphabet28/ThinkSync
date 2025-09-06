# Render Deployment Guide

## Deploy Frontend on Render

### Step 1: Create Static Site
1. Go to [render.com](https://render.com) and sign in
2. Click "New +" → "Static Site"
3. Connect your GitHub repository: `alphabet28/ThinkSync`

### Step 2: Configure Build Settings
- **Build Command**: `cd client && npm install && npm run build`
- **Publish Directory**: `client/build`
- **Auto-Deploy**: Yes (deploys on every push to main)

### Step 3: Advanced Settings
- **Node Version**: 18 (or latest LTS)
- **Root Directory**: Leave empty (uses project root)

### Step 4: Deploy
- Click "Create Static Site"
- Wait for build to complete
- Get your deployment URL (e.g., `https://thinksync-abc123.onrender.com`)

## Update Backend Configuration

After frontend deployment, update your Railway backend with:

### Environment Variables to Update:
```
CLIENT_URL=https://your-frontend-url.onrender.com
```

### In Railway Dashboard:
1. Go to your backend service
2. Navigate to "Variables" tab
3. Update `CLIENT_URL` with your new Render frontend URL
4. Redeploy your backend service

## Test Your Application
1. Visit your frontend URL
2. Test authentication (login/register)
3. Test real-time collaboration features
4. Verify Socket.io connections are working

## Troubleshooting
- If build fails, check the build logs on Render
- Ensure all environment variables are set correctly
- Verify CORS settings allow your frontend domain
- Check that Socket.io client connects to the correct backend URL
