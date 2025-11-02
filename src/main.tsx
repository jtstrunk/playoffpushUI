import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { router } from './router';
import { AuthProvider, useAuth } from './auth/AuthContext';

function App() {
  const { loggedInUser } = useAuth();

  return <RouterProvider router={router} context={{ loggedInUser }} />;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <AuthProvider>
      <App />
    </AuthProvider>
  // <React.StrictMode>
  //   <AuthProvider>
  //     <App />
  //   </AuthProvider>
  // </React.StrictMode>,
);
