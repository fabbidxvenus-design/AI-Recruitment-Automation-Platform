import type { Metadata } from 'next';
import { AppShell } from '@/components';
import './globals.css';

export const metadata: Metadata = {
  title: 'RecruitAI - Intelligent Recruitment Platform',
  description: 'AI-powered recruitment workflow management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}