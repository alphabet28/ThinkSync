# Build Configuration for Server
# Place this in server directory for Railway/Render deployment

PORT=10000
NODE_ENV=production

# Build commands
npm install --production

# For Railway
railway login
railway link
railway up
