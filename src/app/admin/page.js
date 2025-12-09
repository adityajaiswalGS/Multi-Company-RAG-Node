'use client';

import { supabase } from '@/lib/supabase';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../layout';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// -----------------------------
// ZOD SCHEMA
// -----------------------------
const userSchema = z.object({
  email: z.string().email("Enter valid email"),
  password: z.string().min(6, "Password must be 6+ characters"),
  fullName: z.string().min(2, "Full name must be at least 2 chars"),
});

export default function AdminDashboard() {
  const { profile } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // -----------------------------
  // React Hook Form
  // -----------------------------
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(userSchema),
  });

  // -----------------------------
  // Load users
  // -----------------------------
  useEffect(() => {
    if (profile?.company_id) loadUsers();
  }, [profile]);

  const loadUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, role, created_at')
      .eq('company_id', profile.company_id)
      .order('created_at', { ascending: false });

    setUsers(data || []); 
  };

  // -----------------------------
  // CREATE USER
  // -----------------------------
  const createUser = async (formValues) => {
    const { email, password, fullName } = formValues;

    setLoading(true);
    showMessage('', '');

    try {
      const res = await fetch('/api/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          fullName,
          companyId: profile.company_id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409 || data.error?.includes('already')) {
          showMessage("User with this email already exists", "error");
        } else {
          showMessage(data.error || "Failed to create user", "error");
        }
        return;
      }

      showMessage(`User "${fullName}" created successfully!`, "success");
      reset();
      loadUsers();

    } catch (err) {
      console.error("Create user error:", err);
      showMessage("Network error — check console", "error");
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    if (text) setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  if (!profile) return <div className="p-8 text-center text-2xl">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="mb-10 text-5xl font-extrabold text-gray-800">
        Welcome, Admin
      </h1>

      {message.text && (
        <div
          className={`mb-8 p-5 rounded-xl text-center text-lg font-medium shadow-lg border-2 ${
            message.type === 'success'
              ? 'bg-green-100 text-green-800 border-green-300'
              : 'bg-red-100 text-red-800 border-red-300'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* =====================
          ADD USER FORM
      ====================== */}
      <div className="mb-12 rounded-2xl bg-white p-10 shadow-2xl border border-gray-200">
        <h2 className="mb-8 text-3xl font-bold text-gray-800">Add New User</h2>

        <form onSubmit={handleSubmit(createUser)}>
          <div className="grid text-gray-800 grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Email */}
            <div>
              <input
                type="email"
                placeholder="Email"
                {...register('email')}
                className="w-full rounded-xl border-2 border-gray-300 px-6 py-4 text-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition"
              />
              {errors.email && (
                <p className="text-red-600 mt-2 text-sm">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <input
                type="password"
                placeholder="Password (min 6 chars)"
                {...register('password')}
                className="w-full rounded-xl border-2 border-gray-300 px-6 py-4 text-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition"
              />
              {errors.password && (
                <p className="text-red-600 mt-2 text-sm">{errors.password.message}</p>
              )}
            </div>

            {/* Full Name */}
            <div>
              <input
                type="text"
                placeholder="Full Name"
                {...register('fullName')}
                className="w-full rounded-xl border-2 border-gray-300 px-6 py-4 text-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition"
              />
              {errors.fullName && (
                <p className="text-red-600 mt-2 text-sm">{errors.fullName.message}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full md:w-auto px-12 py-5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold text-xl rounded-xl shadow-lg disabled:opacity-60 transition transform hover:scale-105"
          >
            {loading ? 'Creating User...' : 'Create User'}
          </button>
        </form>
      </div>

      {/* =====================
          USERS LIST
      ====================== */}
      <div className="rounded-2xl bg-white p-10 shadow-2xl border border-gray-200">
        <h2 className="mb-8 text-3xl font-bold text-gray-800">
          All Users in Your Company ({users.length})
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {users.map((u) => (
            <div
              key={u.id}
              className="rounded-xl border-2 border-gray-200 p-6 bg-gradient-to-br from-gray-50 to-white shadow-md hover:shadow-xl transition"
            >
              <h3 className="text-xl font-bold text-gray-800">{u.full_name || 'No Name'}</h3>
              <p className="text-sm text-gray-500 mt-1 truncate">{u.id}</p>

              <div className="mt-4">
                <span
                  className={`inline-block px-4 py-2 rounded-full text-sm font-bold text-white ${
                    u.role === 'admin' ? 'bg-purple-600' : 'bg-blue-600'
                  }`}
                >
                  {u.role.toUpperCase()}
                </span>
              </div>

              <p className="text-xs text-gray-400 mt-3">
                Joined: {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
              </p>
            </div>
          ))}
        </div>

        {users.length === 0 && (
          <p className="text-center text-gray-800 text-lg mt-10">
            No users yet. Create the first one above!
          </p>
        )}
      </div>
    </div>
  );
}
