import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';

const socket = io('http://localhost:3000');

const App = () => {
    const [username, setUsername] = useState('');
    const [message, setMessage] = useState('');
    const [chat, setChat] = useState([]);
    const [welcome, setWelcome] = useState('');
    const [notifications, setNotifications] = useState([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        socket.on('welcome', (message) => {
            setWelcome(message);
        });

        socket.on('message', (msg) => {
            setChat((prevChat) => [...prevChat, msg]);
        });

        socket.on('notification', (notification) => {
          console.log('Notification received:', notification); // Debug log
            setNotifications((prevNotifications) => [...prevNotifications, notification]);
        });

        return () => {
            socket.off('welcome');
            socket.off('message');
            socket.off('notification');
        };
    }, []);

    const handleLogin = () => {
        if (username.trim()) {
            socket.emit('join', username.trim());
            setIsLoggedIn(true);
        } else {
            alert('Username cannot be empty!');
        }
    };

    const handleSend = () => {
        if (message.trim()) {
            socket.emit('message', `${username}: ${message}`);
            setMessage('');
        } else {
            alert('Message cannot be empty!');
        }
    };

    if (!isLoggedIn) {
        return (
            <div className="login-container">
                <div className="login-box">
                    <h1>Welcome to Chat</h1>
                    <input
                        type="text"
                        className="login-input"
                        placeholder="Enter username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <button className="login-button" onClick={handleLogin}>
                        Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="chat-container">
            <h1>Chat App</h1>
            <p>{welcome}</p>
            <div className="notifications">
                {notifications.map((note, index) => (
                    <p key={index} className="notification">
                        {note}
                    </p>
                ))}
            </div>
            <div className="chat-box">
                {chat.map((msg, index) => (
                    <div key={index}>{msg}</div>
                ))}
            </div>
            <input
                type="text"
                className="chat-input"
                placeholder="Type a message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
            />
            <button className="chat-button" onClick={handleSend}>
                Send
            </button>
        </div>
    );
};

export default App;
