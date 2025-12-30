'use client';

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { setLogout } from '@/redux/authSlice';

import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Paper,
  Alert,
  CircularProgress,
  Grid,
  Snackbar,
  Container,
  Stack
} from '@mui/material';

import {
  Logout as LogoutIcon,
  Business as BusinessIcon,
  AdminPanelSettings as AdminIcon,
  AddCircleOutline as AddIcon
} from '@mui/icons-material';

/* =======================
   VALIDATION SCHEMAS
======================= */

const companySchema = z.object({
  name: z
    .string()
    .min(2, 'Company name must be at least 2 characters')
    .max(100)
});

const adminSchema = z.object({
  company_id: z.string().min(1, 'You must select a company'),
  full_name: z.string().min(3, 'Name must be at least 3 characters long'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

/* =======================
   COMPONENT
======================= */

export default function SuperAdminDashboard() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);

  const [companies, setCompanies] = useState([]);
  const [status, setStatus] = useState({
    open: false,
    message: '',
    type: 'success'
  });

  /* =======================
     FORMS
  ======================= */

  const {
    control: companyControl,
    handleSubmit: handleCompanySubmit,
    reset: resetCompanyForm,
    setError: setCompanyError,
    formState: { errors: companyErrors, isSubmitting: isCompanySubmitting }
  } = useForm({
    resolver: zodResolver(companySchema),
    defaultValues: { name: '' }
  });

  const {
    control: adminControl,
    handleSubmit: handleAdminSubmit,
    reset: resetAdminForm,
    formState: { errors: adminErrors, isSubmitting: isAdminSubmitting }
  } = useForm({
    resolver: zodResolver(adminSchema),
    defaultValues: {
      company_id: '',
      full_name: '',
      email: '',
      password: ''
    }
  });

  /* =======================
     HELPERS
  ======================= */

  const showStatus = (message, type) => {
    setStatus({ open: true, message, type });
  };

  const handleLogout = () => {
    dispatch(setLogout());
    router.replace('/login');
  };

  /* =======================
     API
  ======================= */

  const loadCompanies = async () => {
    try {
      const res = await axios.get(
        'http://localhost:5000/api/super/companies',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCompanies(res.data);
    } catch {
      showStatus('Failed to load companies list', 'error');
    }
  };

  useEffect(() => {
    if (token) loadCompanies();
  }, [token]);

  /* =======================
     SUBMITS
  ======================= */

  const onCompanySubmit = async (data) => {
    const isDuplicate = companies.some(
      (c) => c.name.toLowerCase().trim() === data.name.toLowerCase().trim()
    );

    if (isDuplicate) {
      setCompanyError('name', {
        type: 'manual',
        message: 'This company name is already registered.'
      });
      return;
    }

    try {
      await axios.post(
        'http://localhost:5000/api/super/companies',
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showStatus('Organization registered successfully!', 'success');
      resetCompanyForm();
      loadCompanies();
    } catch (error) {
      if (error.response?.status === 409) {
        setCompanyError('name', {
          type: 'manual',
          message: 'Conflict: This company already exists.'
        });
      } else {
        showStatus(
          error.response?.data?.message || 'Failed to create company',
          'error'
        );
      }
    }
  };

  const onAdminSubmit = async (data) => {
    try {
      await axios.post(
        'http://localhost:5000/api/super/admins',
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showStatus('Admin access granted successfully!', 'success');
      resetAdminForm();
    } catch (error) {
      showStatus(
        error.response?.data?.message || 'Failed to create admin',
        'error'
      );
    }
  };

  /* =======================
     UI
  ======================= */

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', py: 6 }}>
      <Container maxWidth="lg">

        {/* HEADER */}
        <Box display="flex" justifyContent="space-between" mb={5}>
          <Box>
            <Typography variant="h4" color='black' fontWeight={800}>
              Super Dashboard
            </Typography>
            <Typography color="text.secondary">
              System Overview & Access Control
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>

        <Grid container spacing={4}>

          {/* LEFT PANEL */}
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 4, borderRadius: 4 }}>
              <Stack direction="row" spacing={2} mb={3}>
                <BusinessIcon color="primary" />
                <Typography fontWeight="bold">
                  Register Organization
                </Typography>
              </Stack>

              <form onSubmit={handleCompanySubmit(onCompanySubmit)}>
                <Stack spacing={3}>
                  <Controller
                    name="name"
                    control={companyControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Organization Name"
                        fullWidth
                        error={!!companyErrors.name}
                        helperText={companyErrors.name?.message}
                      />
                    )}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isCompanySubmitting}
                    startIcon={<AddIcon />}
                  >
                    {isCompanySubmitting
                      ? <CircularProgress size={20} color="inherit" />
                      : 'Create Company'}
                  </Button>
                </Stack>
              </form>
            </Paper>
          </Grid>

          {/* RIGHT PANEL */}
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 4, borderRadius: 4 }}>
              <Stack direction="row" spacing={2} mb={3}>
                <AdminIcon color="secondary" />
                <Typography fontWeight="bold">
                  Assign Company Admin
                </Typography>
              </Stack>

              <form onSubmit={handleAdminSubmit(onAdminSubmit)}>
                <Grid container spacing={3}>

                  <Grid item xs={12}>
                    <Controller
                      name="company_id"
                      control={adminControl}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          select
                          fullWidth
                          label="Organization"
                          error={!!adminErrors.company_id}
                          helperText={adminErrors.company_id?.message}
                          InputProps={{
                            sx: { height: 65, alignItems: 'center' }
                          }}
                          InputLabelProps={{ shrink: true }}
                          SelectProps={{
                            displayEmpty: true,
                            renderValue: (selected) => {
                              if (!selected) {
                                return (
                                  <Typography color="text.secondary">
                                    Select an organization...
                                  </Typography>
                                );
                              }
                              const company = companies.find(
                                (c) => c.id === selected
                              );
                              return company ? company.name : selected;
                            }
                          }}
                        >
                          {companies.length === 0 ? (
                            <MenuItem disabled>No companies found</MenuItem>
                          ) : (
                            companies.map((c) => (
                              <MenuItem key={c.id} value={c.id}>
                                {c.name}
                              </MenuItem>
                            ))
                          )}
                        </TextField>
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="full_name"
                      control={adminControl}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Full Name"
                          fullWidth
                          error={!!adminErrors.full_name}
                          helperText={adminErrors.full_name?.message}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="email"
                      control={adminControl}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Email Address"
                          fullWidth
                          error={!!adminErrors.email}
                          helperText={adminErrors.email?.message}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Controller
                      name="password"
                      control={adminControl}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Temporary Password"
                          type="password"
                          fullWidth
                          error={!!adminErrors.password}
                          helperText={adminErrors.password?.message}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="secondary"
                      fullWidth
                      disabled={isAdminSubmitting}
                    >
                      {isAdminSubmitting
                        ? <CircularProgress size={20} color="inherit" />
                        : 'Grant Admin Access'}
                    </Button>
                  </Grid>

                </Grid>
              </form>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      <Snackbar
        open={status.open}
        autoHideDuration={6000}
        onClose={() => setStatus({ ...status, open: false })}
      >
        <Alert severity={status.type} variant="filled">
          {status.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
