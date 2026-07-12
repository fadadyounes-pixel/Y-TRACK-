import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { AuthProvider } from '../contexts/AuthContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'TalentMap',
  description: 'TalentMap — connecting talent with opportunity.',
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 50'><path d='M20 2C11.16 2 4 9.16 4 18C4 27.78 12.89 36.08 20 48C27.11 36.08 36 27.78 36 18C36 9.16 28.84 2 20 2Z' fill='%232563eb'/><circle cx='20' cy='18' r='11' fill='white'/><polyline points='11,24 15,19 19.5,22 27,13' stroke='%232563eb' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round' fill='none'/><polyline points='23.5,13 27,13 27,16.5' stroke='%232563eb' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round' fill='none'/></svg>",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
