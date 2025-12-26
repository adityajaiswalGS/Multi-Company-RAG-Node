'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { setLogin } from '@/redux/authSlice';

// -----------------------------
// ZOD SCHEMA
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

  // Get auth status from Redux
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  // -----------------------------------------------------------
  // FINAL ROLE-BASED REDIRECT LOGIC (Production Level)
  // -----------------------------------------------------------
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'superadmin') {
        // Super Admin lands on Company/Admin management
        router.replace('/super');
      } else if (user.role === 'admin') {
        // Company Admin lands on their operational dashboard
        router.replace('/admin/dashboard');
      } else {
        // Regular users land on the Chat interface
        router.replace('/chat');
      }
    }
  }, [isAuthenticated, user, router]);

  const onSubmit = async (formValues) => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email: formValues.email,
        password: formValues.password,
      });

      // Data contains { token, user: { id, full_name, role, company_id } }
      dispatch(setLogin({
        token: response.data.token,
        user: response.data.user
      }));

      // The useEffect above will catch the change and redirect
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 p-4">
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">Company Bot AI</h1>
        <p className="text-center text-gray-500 mb-8 text-sm">Enterprise Multi-Tenant Intelligence</p>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border-l-4 border-red-500 text-red-800 rounded text-sm animate-pulse">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Email Address</label>
            <input
              type="email"
              placeholder="name@company.com"
              {...register('email')}
              className="w-full text-gray-800 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
            {errors.email && (
              <p className="text-red-600 mt-1 text-xs">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              {...register('password')}
              className="w-full text-gray-800 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
            {errors.password && (
              <p className="text-red-600 mt-1 text-xs">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-indigo-200 transition-all flex items-center justify-center disabled:bg-indigo-300"
          >
            {loading ? (
               <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}