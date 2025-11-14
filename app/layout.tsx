import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import { Sidebar } from '@/components/Sidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Resume Tailor - AI-Powered Resume Optimization',
  description: 'Tailor your resume to any job description with AI assistance',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Sidebar />
          <div className="lg:pl-64">
            {children}
          </div>
          <Toaster position="top-center" />
        </AuthProvider>
      </body>
    </html>
  );
}
