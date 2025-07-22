import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import { connectDB } from './db/connect.js';
import { Server } from 'socket.io';
import http from 'http';
import { mainRouter } from './routers/mainRouter.js';

const SOCKETPORT = process.env.SOCKETPORT || 3000;
const SERVERPORT = process.env.SERVERPORT || 3000;

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use('/home', mainRouter);

let players = [];

io.on('connection', (socket) => {
  const username = socket.handshake.auth.username || "Guest";
  console.log('User connected:', socket.id, username);

  if (players.length >= 2) {
    socket.emit('room-full');
    socket.disconnect();
    return;
  }

  const role = players.length === 0 ? 'player1' : 'player2';
  const position = role === 'player1'
    ? { x: 150, y: 200 }
    : { x: 800, y: 200 };

  players.push({ id: socket.id, role, position, username });

  socket.emit('init', {
    playerId: socket.id,
    role,
    position
  });

  if (players.length === 2) {
    const otherPlayer = players.find(p => p.id !== socket.id);
    if (otherPlayer) {
      socket.emit('player-joined', {
        id: otherPlayer.id,
        role: otherPlayer.role,
        position: otherPlayer.position,
        username: otherPlayer.username
      });

      io.to(otherPlayer.id).emit('player-joined', {
        id: socket.id,
        role,
        position,
        username
      });
    }
  }

  socket.on('update-player', (data) => {
    const otherPlayer = players.find(p => p.id !== socket.id);
    if (otherPlayer) {
      io.to(otherPlayer.id).emit('update-opponent', {
        id: socket.id,
        data
      });
    }
  });

  socket.on('player-attack', ({ attackBox, userData }) => {
    const otherPlayer = players.find(p => p.id !== socket.id);
    if (otherPlayer) {
      io.to(otherPlayer.id).emit('opponent-attack', {
        attackerId: socket.id,
        attackBox,
        enemyData: userData
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    players = players.filter(p => p.id !== socket.id);
    socket.broadcast.emit('player-left', socket.id);
  });
});

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    server.listen(SOCKETPORT, '0.0.0.0', () => {
      console.log(`Socket is listening on port ${SOCKETPORT}...`);
    });
    app.listen(SOCKETPORT, () =>
      console.log(`Server is listening on port ${SERVERPORT}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
