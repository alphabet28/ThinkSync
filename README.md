# ThinkSync - Real-Time Collaborative Whiteboard & Mind Mapping Platform

## 🚀 Features

- **Real-time Collaboration**: Multiple users can work on the same whiteboard or mind map simultaneously
- **Whiteboard Drawing**: Free-form drawing with multiple brush sizes and colors
- **Mind Mapping**: Create structured mind maps with draggable nodes and connections
- **AI Suggestions**: Get AI-powered suggestions for mind map expansion
- **User Authentication**: Secure JWT-based authentication
- **Collaboration Management**: Add collaborators with different permission levels
- **Responsive Design**: Works on desktop and tablet devices

## 🛠️ Technology Stack

### Frontend
- **React 19** - Modern UI framework
- **Material-UI (MUI)** - Component library for beautiful UI
- **Socket.io Client** - Real-time communication
- **React Konva** - Canvas-based graphics for mind maps
- **React Signature Canvas** - Drawing functionality
- **Axios** - HTTP client

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Socket.io** - Real-time WebSocket communication
- **MongoDB** - NoSQL database
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

## 🏗️ Project Structure

```
project/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/       # Authentication components
│   │   │   ├── dashboard/  # Dashboard view
│   │   │   ├── whiteboard/ # Whiteboard editor
│   │   │   └── mindmap/    # Mind map editor
│   │   └── contexts/       # React contexts for state management
│   └── public/
├── server/                 # Node.js backend
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API routes
│   ├── middleware/        # Authentication middleware
│   └── index.js           # Server entry point
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Clone the repository** (if using Git):
   ```bash
   git clone <your-repo-url>
   cd project
   ```

2. **Install server dependencies**:
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**:
   ```bash
   cd ../client
   npm install
   ```

4. **Set up environment variables**:
   
   Create `server/.env`:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/thinksync
   JWT_SECRET=your_jwt_secret_here_make_it_very_long_and_secure
   CLIENT_URL=http://localhost:3000
   ```

   Create `client/.env`:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_SOCKET_URL=http://localhost:5000
   ```

### Running the Application

1. **Start MongoDB** (if running locally):
   ```bash
   mongod
   ```

2. **Start the server**:
   ```bash
   cd server
   npm run dev
   ```

3. **Start the client** (in a new terminal):
   ```bash
   cd client
   npm start
   ```

4. **Open your browser** and navigate to `http://localhost:3000`

## 🌐 Deployment

### Deploy to Render (Recommended)

#### Backend Deployment:
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set the build command: `npm install`
4. Set the start command: `npm start`
5. Add environment variables:
   - `NODE_ENV=production`
   - `MONGODB_URI=<your-mongodb-atlas-connection-string>`
   - `JWT_SECRET=<your-secure-jwt-secret>`
   - `CLIENT_URL=<your-frontend-url>`

#### Frontend Deployment:
1. Create a new Static Site on Render
2. Connect your GitHub repository
3. Set the build command: `npm run build`
4. Set the publish directory: `build`
5. Add environment variables:
   - `REACT_APP_API_URL=<your-backend-url>/api`
   - `REACT_APP_SOCKET_URL=<your-backend-url>`

### Alternative Deployment Options

#### Vercel (Frontend) + Railway (Backend):
- Deploy frontend to Vercel
- Deploy backend to Railway
- Update environment variables accordingly

#### Heroku:
- Deploy both frontend and backend to Heroku
- Use MongoDB Atlas for the database

## 🎯 Usage

1. **Sign Up/Login**: Create an account or sign in
2. **Dashboard**: View your whiteboards and mind maps
3. **Create Whiteboard**: Click "Create Whiteboard" to start drawing
4. **Create Mind Map**: Click "Create Mind Map" to start mind mapping
5. **Collaborate**: Share your creations with others via email
6. **Real-time Editing**: Multiple users can edit simultaneously

## 🎨 Features in Detail

### Whiteboard
- Free-form drawing with pen tool
- Multiple brush sizes (1-20px)
- Color palette with 7 colors
- Undo/Redo functionality
- Real-time collaboration
- Save functionality

### Mind Map
- Drag-and-drop nodes
- Connect nodes with lines
- Edit node text by double-clicking
- Add child nodes via context menu
- AI suggestions for content expansion
- Real-time collaboration

### Collaboration
- Real-time user presence indicators
- Simultaneous editing by multiple users
- Permission-based sharing (read/write/admin)
- User avatars showing who's online

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Boards (Whiteboards)
- `GET /api/boards` - Get user's boards
- `POST /api/boards` - Create new board
- `GET /api/boards/:id` - Get specific board
- `PUT /api/boards/:id` - Update board
- `DELETE /api/boards/:id` - Delete board

### Mind Maps
- `GET /api/mindmaps` - Get user's mind maps
- `POST /api/mindmaps` - Create new mind map
- `GET /api/mindmaps/:id` - Get specific mind map
- `PUT /api/mindmaps/:id` - Update mind map
- `DELETE /api/mindmaps/:id` - Delete mind map
- `POST /api/mindmaps/:id/ai-suggestions` - Generate AI suggestions

## 🎭 Socket.io Events

### Real-time Collaboration Events:
- `joinRoom` - Join a collaboration room
- `drawing` - Real-time drawing data
- `nodeUpdate` - Mind map node updates
- `nodeAdd` - Add new mind map node
- `nodeDelete` - Delete mind map node
- `cursorMove` - Share cursor positions

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Helmet.js for security headers
- Input validation and sanitization

## 🐛 Troubleshooting

### Common Issues:
1. **MongoDB Connection Error**: Ensure MongoDB is running and connection string is correct
2. **Socket.io Connection Error**: Check that backend URL is correct in frontend .env
3. **CORS Error**: Verify CLIENT_URL is set correctly in server .env
4. **Build Errors**: Delete node_modules and package-lock.json, then reinstall

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 🎉 Acknowledgments

- React community for excellent documentation
- Material-UI team for beautiful components
- Socket.io team for real-time capabilities
- MongoDB team for flexible database solutions
