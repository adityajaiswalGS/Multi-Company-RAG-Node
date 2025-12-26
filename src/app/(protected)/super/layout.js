'use client';
import { useContext, useEffect } from 'react';
import { AuthContext } from '@/components/AuthContextProvider';
import { useRouter } from 'next/navigation';

export default function SuperLayout({ children }) {
  const { profile, loading } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!loading && profile?.role !== 'superadmin') {
      router.replace('/admin/dashboard'); // Redirect if not superadmin
    }
  }, [profile, loading, router]);

  if (loading || profile?.role !== 'superadmin') return null;

  return <>{children}</>;
}