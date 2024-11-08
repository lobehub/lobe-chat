'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { PropsWithChildren, useState } from 'react';

import { lambdaQuery, lambdaQueryClient } from '@/libs/trpc/client';

const QueryProvider = ({ children }: PropsWithChildren) => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <lambdaQuery.Provider client={lambdaQueryClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </lambdaQuery.Provider>
  );
};

export default QueryProvider;
