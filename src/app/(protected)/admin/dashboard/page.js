'use client';

import { useContext, useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';

// MUI Imports
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Pagination, 
  Stack 
} from '@mui/material';

// Components
import CreateUserForm from './components/CreateUserForm';
import UserList from './components/UserList';
import { AuthContext } from '@/components/AuthContextProvider';

/* ===========================
   ADMIN DASHBOARD
=========================== */

export default function AdminDashboard() {
  const { profile, loading: authLoading } = useContext(AuthContext);
  const { token } = useSelector((state) => state.auth);

  /* ===========================
     STATE
  =========================== */

  // Data State
  const [users, setUsers] = useState([]); // Default to empty array
  const [loading, setLoading] = useState(false);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_LIMIT = 5; // Adjust limit as needed

  // Message State
  const [message, setMessage] = useState({
    text: '',
    type: ''
  });

  /* ===========================
     DATA FETCHING
  =========================== */

  const loadUsers = useCallback(async (currentPage = 1) => {
    if (!token) return;

    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:5000/api/admin/users?page=${currentPage}&limit=${PAGE_LIMIT}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // --- DEFENSIVE CODING START ---
      // This prevents the "undefined" crash if backend format mismatches
      let fetchedUsers = [];
      let fetchedTotalPages = 1;

      if (res.data && res.data.users) {
        // New Format (Object with users array)
        fetchedUsers = res.data.users;
        fetchedTotalPages = res.data.pagination?.totalPages || 1;
      } else if (Array.isArray(res.data)) {
        // Fallback for Old Format (Just array)
        fetchedUsers = res.data;
      }
      
      setUsers(fetchedUsers);
      setTotalPages(fetchedTotalPages);
      // --- DEFENSIVE CODING END ---

      // If we deleted the last item on a page, automatically go back
      if (currentPage > 1 && fetchedUsers.length === 0) {
         setPage(prev => Math.max(prev - 1, 1));
      }

    } catch (error) {
      console.error('Failed to load users:', error);
      setUsers([]); // Prevent crash on error
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Initial Load & Page Change Trigger
  useEffect(() => {
    loadUsers(page);
  }, [loadUsers, page]);

  /* ===========================
     HELPERS
  =========================== */

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => {
      setMessage({ text: '', type: '' });
    }, 5000);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    // useEffect handles the fetch
  };

  const handleRefreshAfterAction = () => {
    loadUsers(page); // Stay on current page
  };

  /* ===========================
     ACTIONS
  =========================== */

  const handleCreateUser = async (values, { setSubmitting, resetForm }) => {
    try {
      await axios.post(
        'http://localhost:5000/api/admin/users',
        {
          email: values.email,
          password: values.password,
          full_name: values.fullName
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      showMessage(`User "${values.fullName}" created successfully!`, 'success');
      resetForm();
      
      // Reset to page 1 to show the new user
      setPage(1);
      loadUsers(1);
      
    } catch (error) {
      showMessage(error.response?.data?.message || 'Failed to create user', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  /* ===========================
     LOADING STATE (Auth)
  =========================== */

  if (authLoading || !profile) {
    return (
      <Box display="flex" height="100vh" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

  /* ===========================
     UI RENDER
  =========================== */

  return (
    <div className="max-w-7xl mx-auto p-6 text-gray-800">
      
      {/* HEADER */}
      <Box mb={8} textAlign="center">
        <Typography variant="h3" fontWeight="bold">
          Welcome, {profile.full_name}
        </Typography>
        <Typography variant="h6" color="text.secondary" mt={2}>
          Manage team members for your company
        </Typography>
      </Box>

      {/* STATUS MESSAGE */}
      {message.text && (
        <Box
          mb={6}
          p={4}
          borderRadius={3}
          textAlign="center"
          className={`shadow-lg border-2 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border-green-300'
              : 'bg-red-50 text-red-800 border-red-300'
          }`}
        >
          <Typography variant="h6">{message.text}</Typography>
        </Box>
      )}

      {/* CREATE USER FORM */}
      <CreateUserForm
        onSubmit={handleCreateUser}
        isSubmitting={loading}
      />

      {/* USER LIST */}
      <UserList
        users={users || []} // Safe fallback
        loading={loading}
        onRefresh={handleRefreshAfterAction}
      />

      {/* PAGINATION CONTROLS */}
      {/* Check users?.length to prevent undefined error */}
      {users?.length > 0 && (
        <Stack spacing={2} alignItems="center" mt={4}>
          <Pagination 
            count={totalPages} 
            page={page} 
            onChange={handlePageChange} 
            color="primary" 
            size="large"
            showFirstButton 
            showLastButton
          />
        </Stack>
      )}
    </div>
  );
}