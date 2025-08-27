const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (in production, use a database)
const users = new Map();
const rooms = new Map();
const messages = new Map();

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Routes
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (users.has(username)) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();
    
    users.set(username, {
      id: userId,
      username,
      password: hashedPassword,
      publicKey: null,
      createdAt: new Date()
    });

    const token = jwt.sign({ username, userId }, JWT_SECRET, { expiresIn: '24h' });
    
    res.json({ token, user: { username, userId } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = users.get(username);
    
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ username, userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
    
    res.json({ token, user: { username, userId: user.id } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/rooms', authenticateToken, (req, res) => {
  try {
    const { name, participants } = req.body;
    
    // Check if all participants exist
    const validParticipants = [];
    for (const participant of participants) {
      if (users.has(participant)) {
        validParticipants.push(participant);
      } else {
        return res.status(400).json({ error: `User '${participant}' does not exist` });
      }
    }
    
    const roomId = uuidv4();
    
    const room = {
      id: roomId,
      name,
      participants: [...validParticipants, req.user.username],
      createdBy: req.user.username,
      createdAt: new Date(),
      messages: []
    };
    
    rooms.set(roomId, room);
    messages.set(roomId, []);
    
    res.json({ room });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/rooms', authenticateToken, (req, res) => {
  try {
    const userRooms = Array.from(rooms.values()).filter(room => 
      room.participants.includes(req.user.username)
    );
    res.json({ rooms: userRooms });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/rooms/:roomId/messages', authenticateToken, (req, res) => {
  try {
    const { roomId } = req.params;
    const room = rooms.get(roomId);
    
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    
    if (!room.participants.includes(req.user.username)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const roomMessages = messages.get(roomId) || [];
    res.json({ messages: roomMessages });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/public-key', authenticateToken, (req, res) => {
  try {
    const { publicKey } = req.body;
    const user = users.get(req.user.username);
    
    if (user) {
      user.publicKey = publicKey;
      users.set(req.user.username, user);
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on('leave-room', (roomId) => {
    socket.leave(roomId);
    console.log(`User ${socket.id} left room ${roomId}`);
  });

  socket.on('send-message', (data) => {
    const { roomId, message, encryptedContent } = data;
    
    // Store encrypted message
    const roomMessages = messages.get(roomId) || [];
    const newMessage = {
      id: uuidv4(),
      roomId,
      sender: message.sender,
      encryptedContent,
      timestamp: new Date(),
      type: message.type || 'text'
    };
    
    roomMessages.push(newMessage);
    messages.set(roomId, roomMessages);
    
    // Broadcast to all users in room (including sender)
    io.to(roomId).emit('new-message', newMessage);
  });

  socket.on('typing', (data) => {
    socket.to(data.roomId).emit('user-typing', {
      user: data.user,
      roomId: data.roomId
    });
  });

  socket.on('stop-typing', (data) => {
    socket.to(data.roomId).emit('user-stop-typing', {
      user: data.user,
      roomId: data.roomId
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
