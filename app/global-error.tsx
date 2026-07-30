"use client";

import { ErrorPage } from '@/components/commonComponents/ErrorPage';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <ErrorPage
          errorType="500"
          customTitle="Critical Error"
          customDescription="A critical error occurred. Please refresh the page or contact support."
          reset={reset}
          showBackButton={false}
        />
      </body>
    </html>
  );
}
