'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios'; // For API calls
import { useDispatch, useSelector } from 'react-redux'; // For Redux
import { setLogin } from '@/redux/authSlice'; // Our Redux action

// -----------------------------
// ZOD SCHEMA (Keeping your validations)
// -----------------------------
const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function Login() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get auth status from Redux to check if already logged in
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // -----------------------------
  // React Hook Form
  // -----------------------------
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  // -----------------------------
  // Auto-redirect if already logged in (Using Redux State)
  // -----------------------------
  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect based on role from Redux 
      router.replace(user.role === 'admin' || user.role === 'superadmin' 
        ? '/admin/dashboard' 
        : '/chat');
    }
  }, [isAuthenticated, user, router]);

  // -----------------------------
  // Login Handler (Now using Node.js Backend)
  // -----------------------------
  const onSubmit = async (formValues) => {
    setLoading(true);
    setError('');

    try {
      // 1. Call your Node.js Backend 
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email: formValues.email,
        password: formValues.password,
      });

      // 2. Save result to Redux 
      // response.data contains { token, user: { id, full_name, role, company_id } }
      dispatch(setLogin({
        token: response.data.token,
        user: response.data.user
      }));

      // The useEffect above will handle the redirect automatically once state updates
    } catch (err) {
      // Handle Express error messages
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100">
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Company Bot AI</h1>

        {error && (
          <p className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg text-center">{error}</p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email */}
          <div>
            <input
              type="email"
              placeholder="Email"
              {...register('email')}
              className="w-full text-gray-800 px-5 py-4 border border-gray-300 rounded-lg focus:ring-4 focus:ring-indigo-300 outline-none"
            />
            {errors.email && (
              <p className="text-red-600 mt-2 text-sm">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <input
              type="password"
              placeholder="Password"
              {...register('password')}
              className="w-full text-gray-800 px-5 py-4 border border-gray-300 rounded-lg focus:ring-4 focus:ring-indigo-300 outline-none"
            />
            {errors.password && (
              <p className="text-red-600 mt-2 text-sm">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-lg transition disabled:bg-indigo-300"
          >
            {loading ? 'Authenticating...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}