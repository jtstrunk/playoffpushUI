import React from 'react';
import { createRootRoute, Outlet, Link } from '@tanstack/react-router';

export const route = createRootRoute({
  component: function Root() {
    return (
      <div>
        <nav style={{ marginBottom: 20 }}>
          <Link to="/">Welcome</Link> | <Link to="/login">Login</Link> | <Link to="/draft">Draft</Link>
        </nav>
        <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
          <Outlet />
        </div>
      </div>
    );
  },
});
