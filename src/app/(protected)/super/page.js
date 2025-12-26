'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { 
  Box, Typography, TextField, Button, 
  MenuItem, Paper, Divider, Alert 
} from '@mui/material';

export default function SuperAdminDashboard() {
  const { token } = useSelector((state) => state.auth);
  const [companies, setCompanies] = useState([]);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [adminData, setAdminData] = useState({ 
    email: '', password: '', full_name: '', company_id: '' 
  });
  const [status, setStatus] = useState({ message: '', type: 'success' });

  // 1. Load companies for the dropdown
  const loadCompanies = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/super/companies', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCompanies(res.data);
    } catch (err) {
      console.error("Failed to load companies");
    }
  };

  useEffect(() => { if (token) loadCompanies(); }, [token]);

  // 2. Create a new Company
  const handleCreateCompany = async () => {
    try {
      await axios.post('http://localhost:5000/api/super/companies', 
        { name: newCompanyName }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewCompanyName('');
      loadCompanies();
      setStatus({ message: "Company created successfully!", type: 'success' });
    } catch (err) {
      setStatus({ message: "Error creating company", type: 'error' });
    }
  };

  // 3. Create a Primary Admin for a company
  const handleCreateAdmin = async () => {
    try {
      await axios.post('http://localhost:5000/api/super/admins', adminData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStatus({ message: "Admin assigned to company!", type: 'success' });
      setAdminData({ email: '', password: '', full_name: '', company_id: '' });
    } catch (err) {
      setStatus({ message: err.response?.data?.message || "Error creating admin", type: 'error' });
    }
  };

  return (
    <Box p={6} sx={{ maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom color="black">
        Super Admin Control Panel
      </Typography>

      {status.message && (
        <Alert severity={status.type} sx={{ mb: 4 }}>{status.message}</Alert>
      )}
      
      {/* SECTION: CREATE COMPANY */}
      <Paper sx={{ p: 4, mb: 4, borderRadius: 3 }}>
        <Typography variant="h6" mb={2} color="primary" fontWeight="bold">
          Register New Company
        </Typography>
        <Box display="flex" gap={2}>
          <TextField 
            fullWidth
            label="Company Name" 
            value={newCompanyName} 
            onChange={(e) => setNewCompanyName(e.target.value)} 
          />
          <Button variant="contained" onClick={handleCreateCompany} sx={{ px: 4 }}>
            Create
          </Button>
        </Box>
      </Paper>

      {/* SECTION: CREATE ADMIN */}
      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h6" mb={2} color="secondary" fontWeight="bold">
          Create Company Admin
        </Typography>
        <Box display="flex" flexDirection="column" gap={3}>
          <TextField 
            select 
            label="Select Company" 
            value={adminData.company_id} 
            onChange={(e) => setAdminData({...adminData, company_id: e.target.value})}
          >
            {companies.map((c) => (
              <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
            ))}
          </TextField>
          <TextField 
            label="Admin Full Name" 
            value={adminData.full_name}
            onChange={(e) => setAdminData({...adminData, full_name: e.target.value})} 
          />
          <TextField 
            label="Email Address" 
            value={adminData.email}
            onChange={(e) => setAdminData({...adminData, email: e.target.value})} 
          />
          <TextField 
            label="Initial Password" 
            type="password" 
            value={adminData.password}
            onChange={(e) => setAdminData({...adminData, password: e.target.value})} 
          />
          <Button variant="contained" color="secondary" onClick={handleCreateAdmin} size="large">
            Assign Admin to Company
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}