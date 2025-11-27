'use client';

import { useContext } from 'react';
import { AuthContext } from '../layout';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AdminLayout({ children }) {
  const { profile } = useContext(AuthContext);
  const router = useRouter();
  const pathname = usePathname();

  if (!profile || profile.role !== 'admin') {
    return (
      <div className="flex h-screen items-center justify-center text-3xl font-semibold text-gray-700">
        Access Denied
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* --- SIDEBAR --- */}
      <div className="w-64 bg-indigo-900 text-white flex flex-col shadow-xl">
        <div className="p-6 text-2xl font-extrabold tracking-wide border-b border-indigo-800">
          Admin Panel
        </div>

        <nav className="mt-4 flex-1 text-lg font-medium">
          {/* USERS */}
          <a
            href="/admin"
            className={`block py-4 px-6 transition-all rounded-r-xl ${
              pathname === '/admin'
                ? 'bg-indigo-700 shadow-inner'
                : 'hover:bg-indigo-800'
            }`}
          >
            Users
          </a>

          {/* DOCUMENTS */}
          <a
            href="/admin/documents"
            className={`block py-4 px-6 transition-all rounded-r-xl ${
              pathname.startsWith('/admin/documents')
                ? 'bg-indigo-700 shadow-inner'
                : 'hover:bg-indigo-800'
            }`}
          >
            Documents
          </a>
        </nav>

        {/* LOGOUT BUTTON */}
        <div className="p-4 border-t border-indigo-700">
          <button
            onClick={() =>
              supabase.auth.signOut().then(() => router.push('/login'))
            }
            className="w-full py-3 px-4 rounded-lg bg-red-600 hover:bg-red-700 transition font-semibold shadow-md"
          >
            Logout
          </button>
        </div>
      </div>

      {/* --- MAIN AREA --- */}
      <div className="flex-1 flex flex-col">

        {/* TOP BAR */}
        <div className="bg-white shadow-sm border-b px-8 py-4 flex items-center gap-6">
          <button
            onClick={() => router.push('/admin')}
            className="text-indigo-600 hover:text-indigo-700 font-semibold transition"
          >
            ← Back to Dashboard
          </button>

          {pathname !== '/admin' && <span className="text-gray-400">|</span>}

          {pathname !== '/admin' && (
            <button
              onClick={() => router.push('/chat')}
              className="text-green-600 hover:text-green-700 font-semibold transition"
            >
              → Go to Chat
            </button>
          )}
        </div>

        {/* PAGE CONTENT */}
        <div className="flex-1 p-10 text-black">
          {children}
        </div>
      </div>
    </div>
  );
}
