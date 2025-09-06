# Manual Render Frontend Deployment Instructions

## Deploy Frontend to Render (Manual Setup)

Since the render.yaml approach is having issues, let's deploy manually:

### Step 1: Create New Static Site
1. Go to [render.com](https://render.com)
2. Click "New +" → "Static Site"
3. Connect your GitHub repository: `alphabet28/ThinkSync`

### Step 2: Configure Build Settings
**Important: Use these exact settings:**

- **Root Directory**: `client`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `build`
- **Auto-Deploy**: Yes

### Step 3: Environment Variables (Optional)
Add these if needed:
- `GENERATE_SOURCEMAP=false`
- `CI=false` (to ignore warnings as errors)

### Step 4: Advanced Settings
- **Node Version**: 18 or latest
- **Pull Request Previews**: Enabled (optional)

### Alternative: Use Build Script
If the above doesn't work, try:
- **Build Command**: `npm ci && npm run build`
- **Root Directory**: `client`
- **Publish Directory**: `build`

## After Successful Deployment
1. Get your Render URL (e.g., `https://thinksync.onrender.com`)
2. Update your Railway backend `CLIENT_URL` environment variable
3. Update the client `.env.production` file with your Railway backend URL
4. Test the full application

## Troubleshooting
- Make sure "Root Directory" is set to `client` (not empty)
- Ensure "Publish Directory" is `build` (not `client/build`)
- Check that Node.js version is 18 or higher
