import React from 'react';
import { createRootRoute, Outlet, Link } from '@tanstack/react-router';

export const route = createRootRoute({
  component: function Root() {
    return (
      <div>
        <nav style={{ marginBottom: 20, display: 'flex', justifyContent: 'center' }}>
          <Link style={{ margin: '0 5px'}} to="/">Your Leagues</Link> | 
          <Link style={{ margin: '0 5px'}} to="/login">Login</Link> 
        </nav>
        <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
          <Outlet />
        </div>
      </div>
    );
  },
});
