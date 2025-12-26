'use client';

import { useContext } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Box, Typography, Button } from '@mui/material';
import { Dashboard, UploadFile, Chat, Logout, Settings } from '@mui/icons-material';
import { AuthContext } from '@/components/AuthContextProvider';
import { useDispatch } from 'react-redux';
import { setLogout } from '@/redux/authSlice';
import Link from 'next/link';

export default function AdminSidebar() {
  const { profile } = useContext(AuthContext);
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();

  // Production logic: Strictly separate Super Admin from Operational views
  let navItems = [];

  if (profile?.role === 'superadmin') {
    // Super Admin: System level only
    navItems = [
      { label: 'Super Control', href: '/super', icon: <Settings /> },
    ];
  } else if (profile?.role === 'admin') {
    // Company Admin: Management + Operational
    navItems = [
      { label: 'Dashboard', href: '/admin/dashboard', icon: <Dashboard /> },
      { label: 'Documents', href: '/admin/documents', icon: <UploadFile /> },
      { label: 'Chat', href: '/admin/chat', icon: <Chat /> },  
    ];
  } else {
    // Regular User: Chat only
    navItems = [
      { label: 'Chat', href: '/admin/chat', icon: <Chat /> },
    ];
  }

  const handleLogout = () => {
    dispatch(setLogout());
    router.replace('/login');
  };

  const isActive = (href) => {
    if (href === '/admin/dashboard') return pathname === '/admin/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <Box
      sx={{
        width: 280,
        bgcolor: 'background.paper',
        borderRight: 1,
        borderColor: 'divider',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 3,
        zIndex: 1200,
      }}
    >
      <Box p={4} borderBottom={1} borderColor="divider">
        <Typography variant="h6" fontWeight="bold" color="primary">
          Company Bot
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={1}>
          Hello, {profile?.full_name || 'Admin'}
        </Typography>
        <Typography variant="caption" sx={{ display: 'block', color: 'primary.main', fontWeight: 'bold' }}>
          {profile?.role?.toUpperCase()}
        </Typography>
      </Box>

      <Box flex={1} p={2}>
        {navItems.map((item) => (
          <Button
            key={item.href}
            component={Link}
            href={item.href}
            fullWidth
            variant={isActive(item.href) ? 'contained' : 'text'}
            color="primary"
            startIcon={item.icon}
            sx={{
              justifyContent: 'flex-start',
              py: 1.5,
              mb: 1,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: isActive(item.href) ? 'bold' : 'medium',
              bgcolor: isActive(item.href) ? 'primary.main' : 'transparent',
              color: isActive(item.href) ? 'white' : 'text.primary',
              '&:hover': {
                bgcolor: isActive(item.href) ? 'primary.dark' : 'action.hover',
              },
            }}
          >
            {item.label}
          </Button>
        ))}
      </Box>

      <Box p={3} borderTop={1} borderColor="divider">
        <Button
          fullWidth
          variant="outlined"
          color="error"
          startIcon={<Logout />}
          onClick={handleLogout}
          sx={{ py: 1.5, borderRadius: 2 }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );
}