const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors()); // Allows your React frontend to communicate with this server

const server = http.createServer(app);

// Set up Socket.io for real-time connection
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", // Default React port
        methods: ["GET", "POST"]
    }
});

// A temporary place to store active game rooms in memory
const activeRooms = {}; 

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // --- TEACHER: Create a Room ---
    socket.on('create_room', () => {
        // Generate a random 6-character game code
        const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase(); 
        
        activeRooms[roomCode] = { teacherId: socket.id, students: [] };
        socket.join(roomCode);
        
        // Send the code back to the teacher
        socket.emit('room_created', roomCode); 
        console.log(`Teacher created room: ${roomCode}`);
    });

    // --- STUDENT: Join a Room ---
    socket.on('join_room', (data) => {
        const { roomCode, studentName } = data;

        if (activeRooms[roomCode]) {
            socket.join(roomCode);
            const newStudent = { id: socket.id, name: studentName };
            activeRooms[roomCode].students.push(newStudent);
            
            // Tell EVERYONE in the room (including the teacher) that the student list updated
            io.to(roomCode).emit('update_students', activeRooms[roomCode].students);
            console.log(`${studentName} joined room ${roomCode}`);
        } else {
            // If they type the wrong code
            socket.emit('error_message', 'Invalid Game Code. Please try again.');
        }
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        // Note for later: Add logic here to remove students from rooms if they close their browser
    });
});

// The server listens on port 3001
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Cando Education Server running on port ${PORT}`);
});
