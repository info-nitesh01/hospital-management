"use client";

import { ErrorPage } from '@/components/commonComponents/ErrorPage';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <ErrorPage
      errorType="500"
      customDescription={error.message || 'An unexpected error occurred. Please try again.'}
      reset={reset}
      showBackButton={false}
    />
  );
}
