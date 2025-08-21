import React, { useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useAuth } from '../auth/AuthContext';

export const route = {
  component: function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const { setLoggedInUser } = useAuth();
    const navigate = useNavigate();

    // Pass strict false to avoid type error if query params not typed
    const search = useSearch({ strict: false });

    const handleLogin = () => {
      fetch(`http://localhost:3000/login?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`)
        .then((res) => {
          if (!res.ok) throw new Error('Invalid username or password');
          return res.json();
        })
        .then((data) => {
          if (data.success) {
            setLoggedInUser(data.user.username);
            setMessage('Login successful! Welcome, ' + data.user.username);
            console.log(search)


            // Redirect to original location or home
            const redirectTo = search.from || '/';
            console.log('redirect', redirectTo)
            navigate({ to: redirectTo, replace: true });
          } else {
            setMessage('Login failed. Please check your credentials.');
          }
        })
        .catch((err) => setMessage(err.message));
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h1>Login</h1>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            placeholder="Username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <label htmlFor="password">Password</label>
          <input
            id="password"
            placeholder="Password"
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleLogin}>Login</button>
          <p>{message}</p>
        </div>
      </div>
    );
  },
};
