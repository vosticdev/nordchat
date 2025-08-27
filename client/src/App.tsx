import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import Login from './components/Login';
import Register from './components/Register';
import Chat from './components/Chat';
import { generateKeyPair } from './utils/encryption';

interface User {
  username: string;
  userId: string;
}

const API_URL = 'http://localhost:5000';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [showRegister, setShowRegister] = useState(false);
  const [keyPair, setKeyPair] = useState<{ publicKey: string; privateKey: string } | null>(null);

  useEffect(() => {
    // Check for stored token
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (token && user) {
      // Generate encryption keys
      const keys = generateKeyPair();
      setKeyPair(keys);
      
      // Connect to socket
      const newSocket = io(API_URL);
      setSocket(newSocket);

      // Send public key to server
      fetch(`${API_URL}/api/public-key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ publicKey: keys.publicKey })
      });

      return () => {
        newSocket.close();
      };
    }
  }, [token, user]);

  const handleLogin = async (username: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert('Login failed. Please try again.');
    }
  };

  const handleRegister = async (username: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert('Registration failed. Please try again.');
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setSocket(null);
    setKeyPair(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  if (!user || !token || !socket || !keyPair) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">NordChat</h1>
            <p className="text-gray-600">Secure end-to-end encrypted messaging</p>
          </div>
          
          {showRegister ? (
            <Register onRegister={handleRegister} onSwitchToLogin={() => setShowRegister(false)} />
          ) : (
            <Login onLogin={handleLogin} onSwitchToRegister={() => setShowRegister(true)} />
          )}
        </div>
      </div>
    );
  }

  return (
    <Chat 
      user={user}
      socket={socket}
      token={token}
      keyPair={keyPair}
      onLogout={handleLogout}
    />
  );
}

export default App;
