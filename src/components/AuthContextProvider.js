'use client';

import { createContext, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

export const AuthContext = createContext({});

export function AuthContextProvider({ children }) {
  // Pull the state from our new Redux store instead of Supabase
  const { user, isAuthenticated, token } = useSelector((state) => state.auth);
  
  // We maintain these state names so your existing components don't break
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false); // Set to false since Redux loads instantly

  useEffect(() => {
    if (isAuthenticated && user) {
      // Map Redux user to the old context 'user' and 'profile' structure
      setCurrentUser(user);
      setProfile({
        id: user.id,
        full_name: user.full_name,
        role: user.role,
        company_id: user.company_id
      });
    } else {
      setCurrentUser(null);
      setProfile(null);
    }
  }, [isAuthenticated, user]);

  return (
    <AuthContext.Provider value={{ user: currentUser, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}