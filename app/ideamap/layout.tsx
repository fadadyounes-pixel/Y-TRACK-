import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'IdeaMap',
  description: "IdeaMap — de l'idée au projet financé. INDH Phase 3 Maroc.",
  icons: {
    icon: '/logo-icon.png',
    apple: '/logo-icon.png',
  },
};

export default function IdeaMapLayout({ children }: { children: React.ReactNode }) {
  return children;
}
