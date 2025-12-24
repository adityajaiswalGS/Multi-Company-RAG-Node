// src/app/(protected)/layout.js
'use client';

import { useContext } from 'react';
import { AuthContext } from '@/app/layout';
import AdminSidebar from '@/components/layout/AdminSidebar';  // your sidebar component
import { Box } from '@mui/material';

export default function ProtectedLayout({ children }) {
  const { profile } = useContext(AuthContext);

  const isAdmin = profile?.role === 'admin';

  return (
    <Box display="flex" minHeight="100vh">
      {isAdmin && <AdminSidebar />}
      <Box
        component="main"
        flex={1}
        ml={isAdmin ? '280px' : 0}  // offset if sidebar shown
        bgcolor="grey.50"
      >
        {children}
      </Box>
    </Box>
  );
}