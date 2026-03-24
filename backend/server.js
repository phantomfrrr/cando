const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());

// This line links your Frontend to your Backend for Koyeb
app.use(express.static(path.join(__dirname, '../frontend/build')));

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" } 
});

const rooms = {};

io.on('connection', (socket) => {
    // Teacher creates room
    socket.on('create_room', () => {
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        rooms[code] = { teacher: socket.id, students: [] };
        socket.join(code);
        socket.emit('room_created', code);
    });

    // Student joins room
    socket.on('join_room', ({ roomCode, name }) => {
        const code = roomCode.toUpperCase();
        if (rooms[code]) {
            socket.join(code);
            rooms[code].students.push({ id: socket.id, name: name });
            io.to(code).emit('update_students', rooms[code].students);
        } else {
            socket.emit('error_msg', 'Room not found!');
        }
    });
});

// Important: Serve the React app on any unknown route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Cando Education live on port ${PORT}`));
