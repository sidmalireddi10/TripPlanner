import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TripPlanner AI - Intelligent Travel Planning',
  description: 'Plan your perfect trip with AI-powered assistance',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
