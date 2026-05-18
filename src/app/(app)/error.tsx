'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button, Notice } from '@/components';

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[appErrorBoundary] workspace render failure', {
      name: error.name,
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <main id="main-content" style={{ minHeight: '60vh', padding: '2rem', display: 'grid', placeItems: 'center' }}>
      <section style={{ maxWidth: '42rem', width: '100%' }} aria-labelledby="app-error-title">
        <Notice variant="danger" title="Workspace unavailable">
          <h1 id="app-error-title">The workspace hit an unexpected error. Please retry or return to the dashboard.</h1>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Button variant="primary" onClick={reset}>Try again</Button>
            <Link href="/dashboard">Return to dashboard</Link>
          </div>
        </Notice>
      </section>
    </main>
  );
}
