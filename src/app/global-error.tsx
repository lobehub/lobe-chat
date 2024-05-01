'use client';

import Error from 'next/error';
import { useLayoutEffect } from 'react';

import { type ErrorType, sentryCaptureException } from '@/components/Error/sentryCaptureException';

export default function GlobalError({ error }: { error: ErrorType; reset: () => void }) {
  useLayoutEffect(() => {
    sentryCaptureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <Error statusCode={undefined as any} />
      </body>
    </html>
  );
}
