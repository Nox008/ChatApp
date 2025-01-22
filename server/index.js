const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

mongoose.connect('mongodb+srv://articadmin:artic123@articglow.1hqbc.mongodb.net');

const userSchema = new mongoose.Schema({
    username: String,
});

const User = mongoose.model('User', userSchema);

app.use(cors());
app.use(express.json());

app.get('/',(req,res)=>{
    res.send("API Working")
})

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Store the username of the connected user
    socket.on('join', async (username) => {
        socket.username = username;

        const user = await User.findOne({ username });

        if (!user) {
            await User.create({ username });
            socket.emit('welcome', `Welcome to the chat, ${username}!`);
            socket.broadcast.emit('notification', `${username} has joined the chat.`);
        } else {
            socket.emit('welcome', `Welcome back, ${username}!`);
            socket.broadcast.emit('notification', `${username} has rejoined the chat.`);
        }
    });

    // Broadcast when a user sends a message
    socket.on('message', (msg) => {
        io.emit('message', msg);
    });

    // Notify when a user disconnects
    socket.on('disconnect', () => {
        if (socket.username) {
            io.emit('notification', `${socket.username} has left the chat.`);
        }
        console.log('A user disconnected:', socket.id);
    });
});

server.listen(3000, () => {
    console.log('Server running on port 3000');
});
