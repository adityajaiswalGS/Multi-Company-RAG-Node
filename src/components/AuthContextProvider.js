"use client";
import { createContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

export const AuthContext = createContext({});

export const AuthContextProvider = ({ children }) => {
  const { user, token } = useSelector((state) => state.auth);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If Redux recovered a token and user from localStorage, set the profile
    if (token && user) {
      setProfile(user);
    } else {
      setProfile(null);
    }
    setLoading(false);
  }, [token, user]);

  return (
    <AuthContext.Provider value={{ profile, loading, token }}>
      {children}
    </AuthContext.Provider>
  );
};