"use client";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter, usePathname } from "next/navigation";

export default function SessionGuard({ children }) {
  // We MUST pull 'user' from state to check the role
  const { token, user } = useSelector((state) => state.auth);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 1. Identify public paths
    const isPublicPath = pathname === "/login" || pathname === "/";
    
    // 2. If no token and trying to access protected content, redirect to login
    if (!token && !isPublicPath) {
      router.replace("/login");
      return; // Stop execution here
    }

    // 3. ROLE-BASED REDIRECT: Prevent logged-in users from staying on public pages
    if (token && user && isPublicPath) {
      // Check role and send to the correct starting page
      if (user.role === 'superadmin') {
        router.replace("/super");
      } else if (user.role === 'admin') {
        router.replace("/admin/dashboard");
      } else {
        router.replace("/chat");
      }
    }

    // 4. CROSS-ROLE PROTECTION: Prevent Super Admins from accessing Company Admin routes
    if (token && user?.role === 'superadmin' && pathname.startsWith('/admin')) {
        router.replace("/super");
    }

    // 5. Prevent Company Admins from accessing Super Admin routes
    if (token && user?.role === 'admin' && pathname.startsWith('/super')) {
        router.replace("/admin/dashboard");
    }

  }, [token, user, pathname, router]);

  return <>{children}</>;
}