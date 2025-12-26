'use client';

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'; //
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { setLogout } from '@/redux/authSlice'; //

import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Paper,
  Alert,
  CircularProgress // Added for production-level feedback
} from '@mui/material';

import LogoutIcon from '@mui/icons-material/Logout'; // Changed icon to match "Logout" text

export default function SuperAdminDashboard() {
  const router = useRouter();
  const dispatch = useDispatch(); //
  const { token } = useSelector((state) => state.auth);

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false); //
  const [newCompanyName, setNewCompanyName] = useState('');
  const [adminData, setAdminData] = useState({
    email: '',
    password: '',
    full_name: '',
    company_id: ''
  });
  const [status, setStatus] = useState({ message: '', type: 'success' });

  /* ----------------------------------
     Logout Logic
  ----------------------------------- */
  const handleLogout = () => {
    dispatch(setLogout()); // Clears Redux & Redux-Persist (localStorage)
    router.replace('/login'); // Redirect to login
  };

  /* ----------------------------------
     Load Companies
  ----------------------------------- */
  const loadCompanies = async () => {
    try {
      const res = await axios.get(
        'http://localhost:5000/api/super/companies',
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setCompanies(res.data);
    } catch (error) {
      console.error('Failed to load companies', error);
    }
  };

  useEffect(() => {
    if (token) loadCompanies();
  }, [token]);

  /* ----------------------------------
     Create Company
  ----------------------------------- */
  const handleCreateCompany = async () => {
    if (!newCompanyName.trim()) {
      return setStatus({ message: 'Company name required', type: 'error' });
    }

    setLoading(true); //
    try {
      await axios.post(
        'http://localhost:5000/api/super/companies',
        { name: newCompanyName },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setNewCompanyName('');
      setStatus({ message: 'Company created successfully!', type: 'success' });
      loadCompanies();
    } catch (error) {
      setStatus({ message: 'Error creating company', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  /* ----------------------------------
     Create Admin
  ----------------------------------- */
  const handleCreateAdmin = async () => {
    setLoading(true); //
    try {
      await axios.post(
        'http://localhost:5000/api/super/admins',
        adminData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setStatus({ message: 'Admin assigned to company!', type: 'success' });
      setAdminData({
        email: '',
        password: '',
        full_name: '',
        company_id: ''
      });
    } catch (error) {
      setStatus({
        message:
          error.response?.data?.message || 'Error creating admin',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={6} sx={{ maxWidth: 800, mx: 'auto' }}>
      {/* Header with Logout */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight="bold">
            Super Admin Control
        </Typography>
        <Button
          variant="outlined"
          color="error"
          startIcon={<LogoutIcon />}
          onClick={handleLogout} //
        >
          Logout
        </Button>
      </Box>

      {status.message && (
        <Alert severity={status.type} sx={{ mb: 4 }} onClose={() => setStatus({message: '', type: 'success'})}>
          {status.message}
        </Alert>
      )}

      {/* Create Company Section */}
      <Paper elevation={2} sx={{ p: 4, mb: 4, borderRadius: 3 }}>
        <Typography variant="h6" mb={2} fontWeight="bold" color="primary">
          Register New Company
        </Typography>

        <Box display="flex" gap={2}>
          <TextField
            fullWidth
            label="Company Name"
            value={newCompanyName}
            onChange={(e) => setNewCompanyName(e.target.value)}
            disabled={loading}
          />
          <Button
            variant="contained"
            onClick={handleCreateCompany}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Create'}
          </Button>
        </Box>
      </Paper>

      {/* Create Admin Section */}
      <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h6" mb={2} fontWeight="bold" color="secondary">
          Create Company Admin
        </Typography>

        <Box display="flex" flexDirection="column" gap={3}>
          <TextField
            select
            label="Select Company"
            value={adminData.company_id}
            onChange={(e) => setAdminData({ ...adminData, company_id: e.target.value })}
            disabled={loading}
          >
            {companies.map((company) => (
              <MenuItem key={company.id} value={company.id}>
                {company.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Admin Full Name"
            value={adminData.full_name}
            onChange={(e) => setAdminData({ ...adminData, full_name: e.target.value })}
            disabled={loading}
          />

          <TextField
            label="Email Address"
            value={adminData.email}
            onChange={(e) => setAdminData({ ...adminData, email: e.target.value })}
            disabled={loading}
          />

          <TextField
            label="Initial Password"
            type="password"
            value={adminData.password}
            onChange={(e) => setAdminData({ ...adminData, password: e.target.value })}
            disabled={loading}
          />

          <Button
            variant="contained"
            color="secondary"
            size="large"
            onClick={handleCreateAdmin}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Assign Admin to Company'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}