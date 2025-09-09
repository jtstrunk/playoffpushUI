import React, { useState, useEffect } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useAuth } from '../auth/AuthContext';

export const route = {
  component: function LoginPage() {
    const [keepLoggedIn, setKeepLoggedIn] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const { setLoggedInUser } = useAuth();
    const navigate = useNavigate();
    const viewMode = 'login';

    // Pass strict false to avoid type error if query params not typed
    const search = useSearch({ strict: false });

    useEffect(() => {
      const storedKeepLoggedIn = localStorage.getItem('keepLoggedIn');
      setKeepLoggedIn(storedKeepLoggedIn === 'true');
    }, []);

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setKeepLoggedIn(e.target.checked);
      localStorage.setItem('keepLoggedIn', e.target.checked.toString());
    };

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

            if (keepLoggedIn) {
              localStorage.setItem('loggedInUser', data.user.username);
            } else {
              localStorage.removeItem('loggedInUser');
            }

            const redirectTo = search.from || '/';
            navigate({ to: redirectTo, replace: true });
          } else {
            setMessage('Login failed. Please check your credentials.');
          }
        })
        .catch((err) => setMessage(err.message));
    };

    const handleRegister = () => {
      fetch(`http://localhost:3000/register?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`)
        .then(res => {
          if (!res.ok) throw new Error('Username is Already Taken');
          return res.json();
        })
        .then(data => {
          if (data.success) {
            handleLogin(); 
            setMessage('Login successful! Welcome, ' + data.user.username);
            // redirect logic here
          } else {
            setMessage('Login failed. Please check your credentials.');
          }
        })
        .catch(err => setMessage(err.message));
    };

    const handleLogout = () => {
      setLoggedInUser(null);
      localStorage.removeItem('loggedInUser');
      navigate({ to: '/login', replace: true });
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {viewMode === 'login' ? <h1 style={{ textAlign: 'center', fontSize: '22px' }}>Login</h1>
            : <h1 style={{ textAlign: 'center', fontSize: '22px' }}>Register</h1>}
          <label htmlFor="username">Username</label>
          <input className='textinput' id="username"
            placeholder="Username" type="text" value={username}
            onChange={(e) => setUsername(e.target.value)} 
          />
          <label htmlFor="password">Password</label>
          <input className='textinput' id="password"
            placeholder="Password" type="text" value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <label>
            <input type="checkbox" checked={keepLoggedIn} onChange={handleCheckboxChange} /> Keep me logged in
          </label>

          <p>{message}</p>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
            {viewMode === 'login' ? <button id="loginbutton" onClick={handleLogin}>Login</button>
            : <button id="loginbutton" onClick={handleRegister}>Register</button>}
            {/* <button id="loginbutton" onClick={handleLogin}>Login</button> */}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
            <p>Don't have an Account?</p>
            <button className="clearbutton" onClick={handleLogin}>Sign Up</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
            <p>Just Visiting?</p>
            <button className="clearbutton" onClick={handleLogin}>Visit Mode</button>
          </div>

        </div>
        <button onClick={handleLogout}>Logout</button>
      </div>
    );
  },
};
