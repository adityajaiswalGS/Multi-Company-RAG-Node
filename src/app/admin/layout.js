'use client';

// src/app/admin/layout.js
import { Box } from '@mui/material';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { useContext } from 'react';
import { AuthContext } from '@/app/layout';

export default function AdminLayout({ children }) {
  const { profile, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-xl">
        Loading...
      </div>
    );
  }

  // Optional: role check
  if (!profile || profile.role !== 'admin') {
    return (
      <div className="flex h-screen items-center justify-center text-xl text-red-600">
        Access Denied
      </div>
    );
  }

  return (
    <Box display="flex" minHeight="100vh">
      <AdminSidebar />

      <Box
        component="main"
        flex={1}
        ml="280px"     // Sidebar width offset
        bgcolor="grey.50"
        p={4}
      >
        {children}
      </Box>
    </Box>
  );
}
