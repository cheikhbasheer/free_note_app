import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BulletinPro – Plateforme de bulletins scolaires',
  description: 'Créez, calculez et exportez des bulletins scolaires professionnels en PDF.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="h-full">
      <body className="h-full bg-slate-50 antialiased">{children}</body>
    </html>
  );
}
