'use client';
import { useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import CreateUserForm from './components/CreateUserForm';
import UserList from './components/UserList';
import { Box, Typography, CircularProgress } from '@mui/material';
import { AuthContext } from '@/components/AuthContextProvider';

export default function AdminDashboard() {
  const { profile, loading: authLoading } = useContext(AuthContext);
  const { token } = useSelector((state) => state.auth); // Get JWT from Redux

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Fetch users from Node.js Backend 
  const loadUsers = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (error) {
      console.error('Load users error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [token]);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const handleCreateUser = async (values, { setSubmitting, resetForm }) => {
    try {
      const res = await axios.post('http://localhost:5000/api/admin/users', {
        email: values.email,
        password: values.password,
        full_name: values.fullName,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      showMessage(`User "${values.fullName}" created successfully!`, 'success');
      resetForm();
      loadUsers(); // Refresh list after creation
    } catch (err) {
      showMessage(err.response?.data?.message || 'Failed to create user', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || !profile) {
    return (
      <Box display="flex" height="100vh" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 text-gray-800">
      <Box mb={8} textAlign="center">
        <Typography variant="h3" fontWeight="bold">Welcome, {profile.full_name}</Typography>
        <Typography variant="h6" color="text.secondary" mt={2}>
          Manage team members for your company
        </Typography>
      </Box>

      {message.text && (
        <Box mb={6} p={4} borderRadius={3} textAlign="center" className={`shadow-lg border-2 ${
            message.type === 'success' ? 'bg-green-50 text-green-800 border-green-300' : 'bg-red-50 text-red-800 border-red-300'
          }`}>
          <Typography variant="h6">{message.text}</Typography>
        </Box>
      )}

      <CreateUserForm onSubmit={handleCreateUser} isSubmitting={loading} />
      <UserList users={users} loading={loading} onRefresh={loadUsers} />
    </div>
  );
}