import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import Navbar from '../components/Navbar';
import './globals.css';

export const metadata: Metadata = {
  title: 'TalentBridge — AI Recruitment Platform',
  description: 'Smart CV analysis and job matching powered by AI. Automate recruitment, find the best candidates, and save time.',
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 52 52'><circle cx='26' cy='26' r='26' fill='%231a3a8f'/><path d='M8 34 Q26 12 44 34' stroke='%2338bdf8' stroke-width='3.5' fill='none' stroke-linecap='round'/><line x1='6' y1='34' x2='46' y2='34' stroke='%23facc15' stroke-width='3' stroke-linecap='round'/></svg>",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
