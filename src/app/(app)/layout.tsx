'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/browser';
import { hasInternalAccess } from '@/services/auth/access';
import { AppShell } from '@/components/shell/AppShell';
import { LoadingState } from '@/components/ui/LoadingState';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkAccess() {
      try {
        const supabase = createBrowserClient();
        const hasAccess = await hasInternalAccess(supabase);

        if (!hasAccess) {
          router.push('/auth/login');
        } else {
          setChecking(false);
        }
      } catch (error) {
        console.error('[Layout] auth check failed:', error instanceof Error ? error.message : String(error));
        router.push('/auth/login');
      }
    }

    checkAccess();
  }, [router]);

  if (checking) {
    return (
      <div aria-live="polite" aria-busy="true">
        <LoadingState />
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}