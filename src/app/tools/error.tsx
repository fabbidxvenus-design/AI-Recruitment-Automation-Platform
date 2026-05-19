'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';

export default function ToolsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Tools route error:', error);
  }, [error]);

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>Tools failed to load</h2>
      <p>An error occurred while loading this tool.</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
