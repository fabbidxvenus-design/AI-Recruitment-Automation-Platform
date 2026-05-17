import type { Metadata } from 'next';
import { AppShell } from '@/components/shell/AppShell';
import { I18nProvider } from '@/i18n/I18nProvider';
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
    <html lang="vi" suppressHydrationWarning>
      <body>
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}