import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface AuthContextType {
  loggedInUser: string | null;
  setLoggedInUser: (user: string | null) => void;
}

// Create context with default undefined
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook to use auth state
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};

// Provider component wrapping your app
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);

  return (
    <AuthContext.Provider value={{ loggedInUser, setLoggedInUser }}>
      {children}
    </AuthContext.Provider>
  );
};
