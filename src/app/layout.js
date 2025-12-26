import './globals.css';
import { AuthContextProvider } from '@/components/AuthContextProvider';
import { Providers } from "@/redux/Providers";
import SessionGuard from "@/components/SessionGuard";

export const metadata = {
  title: 'Company Bot - Secure Multi-Tenant RAG',
  description: 'AI-powered document intelligence for your company',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        {/* 1. Providers: Hydrates Redux state from LocalStorage */}
        <Providers>
          {/* 2. SessionGuard: Redirects based on role (Super Admin vs Admin) */}
          <SessionGuard>
            {/* 3. AuthContext: Provides profile data to the entire UI tree */}
            <AuthContextProvider>
              {children}
            </AuthContextProvider>
          </SessionGuard>
        </Providers>
      </body>
    </html>
  );
}