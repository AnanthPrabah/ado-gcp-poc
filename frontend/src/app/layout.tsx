import type { Metadata } from 'next';
import { ThemeProvider } from '../lib/ThemeContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'Photo-Real Asset Studio',
  description: 'Enterprise generative AI uploader, generator, and batch manager for photorealistic assets.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-bg-primary text-text-primary">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
