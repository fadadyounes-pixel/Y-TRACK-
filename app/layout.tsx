import { Analytics } from '@vercel/analytics/next';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'X-TRACK · Plateformes Jeunes INDH · Casablanca',
  description: 'Système de suivi M&E pour les plateformes jeunes INDH de Casablanca',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body style={{ margin: 0, padding: 0, background: '#080F1D' }}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
