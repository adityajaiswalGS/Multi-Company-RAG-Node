'use client';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Box, Button, Typography } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

const UserSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(6, 'Password must be 6+ chars').required('Password is required'),
  fullName: Yup.string().min(2, 'Too short').required('Full name is required'),
});

export default function CreateUserForm({ onSubmit, isSubmitting }) {
  return (
    <Box bgcolor="white" borderRadius={4} boxShadow={6} p={6} mb={10}>
      <Box display="flex" alignItems="center" gap={2} mb={6}>
        <PersonAddIcon sx={{ fontSize: 32, color: '#6366f1' }} />
        <Typography variant="h5" fontWeight="bold">Add New User</Typography>
      </Box>

      <Formik
        initialValues={{ email: '', password: '', fullName: '' }}
        validationSchema={UserSchema}
        onSubmit={onSubmit}
      >
        {() => (
          <Form>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div>
                <Field name="email" type="email" placeholder="Email" className="w-full rounded-xl border-2 text-gray-800 border-gray-300 px-6 py-4 outline-none" />
                <ErrorMessage name="email">{(msg) => <p className="mt-2 text-sm text-red-600">{msg}</p>}</ErrorMessage>
              </div>
              <div>
                <Field name="password" type="password" placeholder="Password" className="w-full rounded-xl border-2 text-gray-800 border-gray-300 px-6 py-4 outline-none" />
                <ErrorMessage name="password">{(msg) => <p className="mt-2 text-sm text-red-600">{msg}</p>}</ErrorMessage>
              </div>
              <div>
                <Field name="fullName" type="text" placeholder="Full Name" className="w-full rounded-xl border-2 text-gray-800 border-gray-300 px-6 py-4 outline-none" />
                <ErrorMessage name="fullName">{(msg) => <p className="mt-2 text-sm text-red-600">{msg}</p>}</ErrorMessage>
              </div>
            </div>
            <Button type="submit" disabled={isSubmitting} variant="contained" sx={{ px: 8, py: 2, borderRadius: 3, bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' } }}>
              {isSubmitting ? 'Creating...' : 'Create User'}
            </Button>
          </Form>
        )}
      </Formik>
    </Box>
  );
}