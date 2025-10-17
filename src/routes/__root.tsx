import React from 'react';
import { useAuth } from '../auth/AuthContext';
import { createRootRoute, Outlet, Link } from '@tanstack/react-router';

export const route = createRootRoute({
  component: function Root() {
    const { loggedInUser } = useAuth();

    return (
      <div>
        <nav style={{ marginBottom: 20, display: 'flex', justifyContent: 'center' }}>
          <Link style={{ margin: '0 5px'}} to="/">Your Leagues</Link> |
          <Link style={{ margin: '0 5px'}} to="/profile">Your Profile</Link> |
          {/* <Link to={`/profile/${loggedInUser}`}>Your Profile</Link> |  */}
          <Link style={{ margin: '0 5px'}} to="/login">Login</Link> 
        </nav>
        <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
          <Outlet />
        </div>
      </div>
    );
  },
});
