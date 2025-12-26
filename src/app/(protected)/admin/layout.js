'use client';

import { Box, CircularProgress } from '@mui/material';
import AdminSidebar from '@/components/AdminSidebar';
import { useContext, useEffect } from 'react';
import { AuthContext } from '@/components/AuthContextProvider';
import { useRouter } from 'next/navigation';

export default function AdminLayout({ children }) {
  const { profile, loading } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    // Protection: If user is not an admin or superadmin, kick them out
    if (!loading && (!profile || (profile.role !== 'admin' && profile.role !== 'superadmin'))) {
      router.replace('/chat');
    }
  }, [profile, loading, router]);

  if (loading || !profile) {
    return (
      <Box display="flex" height="100vh" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

  // Admin — show sidebar + content
  return (
    <Box display="flex" minHeight="100vh">
      {/* This sidebar needs to be updated next! */}
      <AdminSidebar />

      <Box
        component="main"
        flex={1}
        sx={{
          marginLeft: { xs: 0, md: '280px' }, // Matches standard sidebar width
          bgcolor: 'grey.50',
          width: { xs: '100%', md: 'calc(100% - 280px)' },
          transition: 'margin 0.3s ease',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}