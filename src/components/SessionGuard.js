"use client"; // Required for hooks and Redux
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter, usePathname } from "next/navigation";

export default function SessionGuard({ children }) {
  const { token } = useSelector((state) => state.auth);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const isPublicPath = pathname === "/login" || pathname === "/";
    
    // If there is no token and the user is on a protected page, kick them to login
    if (!token && !isPublicPath) {
      router.replace("/login");
    }

    // If there IS a token and they are trying to go to login, send them to dashboard
    if (token && pathname === "/login") {
      router.replace("/admin/dashboard");
    }
  }, [token, pathname, router]);

  return <>{children}</>;
}