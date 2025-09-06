# Netlify Deployment Guide for ThinkSync

## Deploy Frontend to Netlify

### Step 1: Go to Netlify
1. Visit [netlify.com](https://netlify.com)
2. Sign up/Sign in with your GitHub account

### Step 2: Deploy from Git
1. Click **"New site from Git"**
2. Choose **"GitHub"** as your Git provider
3. Select repository: **`alphabet28/ThinkSync`**
4. Choose branch: **`main`**

### Step 3: Build Settings (Auto-detected from netlify.toml)
Netlify should automatically detect these settings from our `netlify.toml` file:

```
Build command: cd client && npm install && npm run build
Publish directory: client/build
Base directory: (leave empty)
```

### Step 4: Deploy
1. Click **"Deploy site"**
2. Wait for build to complete (usually 2-3 minutes)
3. Get your site URL (e.g., `https://amazing-site-name.netlify.app`)

### Step 5: Custom Domain (Optional)
1. Go to **Site settings → Domain management**
2. Add custom domain if you have one
3. Netlify will handle SSL certificates automatically

## Environment Variables (Production)

After deployment, you'll need to:

### 1. Update Backend (Railway)
Set this environment variable in your Railway backend:
```
CLIENT_URL=https://your-site-name.netlify.app
```

### 2. Update Frontend Environment
If you need to set production environment variables in Netlify:
1. Go to **Site settings → Environment variables**
2. Add these variables:
```
REACT_APP_API_URL=https://your-railway-backend-url.railway.app/api
REACT_APP_SOCKET_URL=https://your-railway-backend-url.railway.app
GENERATE_SOURCEMAP=false
```

## Benefits of Netlify

✅ **Automatic HTTPS** - SSL certificates included
✅ **Global CDN** - Fast loading worldwide  
✅ **Instant rollbacks** - Easy to revert deployments
✅ **Branch deploys** - Preview deployments for PRs
✅ **Form handling** - Built-in form processing (if needed)
✅ **Edge functions** - Serverless functions at the edge

## Testing Your Deployment

1. Visit your Netlify URL
2. Test user registration/login
3. Test whiteboard and mind map features
4. Verify real-time collaboration works
5. Check browser console for any errors

## Troubleshooting

- **Build fails**: Check build logs in Netlify dashboard
- **Blank page**: Usually a routing issue - our netlify.toml handles this
- **API errors**: Verify backend URL in environment variables
- **Socket.io issues**: Check CORS settings on backend

## Automatic Deployments

Netlify will automatically redeploy your site whenever you push to the `main` branch on GitHub. You can also trigger manual deploys from the Netlify dashboard.
