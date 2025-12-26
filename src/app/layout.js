import './globals.css';
import { AuthContextProvider } from '@/components/AuthContextProvider';
import { Providers } from "@/redux/Providers";
import SessionGuard from "@/components/SessionGuard"; // New component below

export const metadata = {
  title: 'Company Bot - Secure Multi-Tenant RAG',
  description: 'AI-powered document intelligence for your company',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <Providers>
          {/* The SessionGuard ensures that if token is null, user is moved to /login */}
          <SessionGuard>
            <AuthContextProvider>
              {children}
            </AuthContextProvider>
          </SessionGuard>
        </Providers>
      </body>
    </html>
  );
}