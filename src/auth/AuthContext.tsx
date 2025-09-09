import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface AuthContextType {
  loggedInUser: string | null;
  setLoggedInUser: (user: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Initialize state from localStorage - only once on first render
  const [loggedInUser, setLoggedInUser] = useState<string | null>(() => {
    return localStorage.getItem('loggedInUser');
  });

  // Sync localStorage whenever loggedInUser changes
  React.useEffect(() => {
    if (loggedInUser) {
      localStorage.setItem('loggedInUser', loggedInUser);
    } else {
      localStorage.removeItem('loggedInUser');
    }
  }, [loggedInUser]);

  return (
    <AuthContext.Provider value={{ loggedInUser, setLoggedInUser }}>
      {children}
    </AuthContext.Provider>
  );
};
