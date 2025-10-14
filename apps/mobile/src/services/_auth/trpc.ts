import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createTRPCContext } from '@trpc/tanstack-react-query';
import superjson from 'superjson';

import { DEFAULT_SERVER_URL, formatServerUrl, getServerUrl } from '@/config/server';
import { authExpired } from '@/features/Error/AuthExpired';

// Local type reference to server router
import type { MobileRouter } from '../../../../../@/server/routers/mobile';
import { createHeaderWithAuth } from './header';

const normalizedDefaultBase = formatServerUrl(DEFAULT_SERVER_URL);
const TRPC_PATH = '/trpc/mobile';

const replaceBaseUrl = (targetUrl: string): string => {
  const currentBase = getServerUrl();

  if (targetUrl.startsWith(normalizedDefaultBase)) {
    return `${currentBase}${targetUrl.slice(normalizedDefaultBase.length)}`;
  }

  return targetUrl;
};

type FetchRequestInput = string | URL | Request;

const resolveRequestInput = (input: FetchRequestInput): FetchRequestInput => {
  if (typeof input === 'string') {
    return replaceBaseUrl(input);
  }

  if (input instanceof URL) {
    const updated = replaceBaseUrl(input.toString());
    return new URL(updated);
  }

  if (typeof Request !== 'undefined' && input instanceof Request) {
    const updatedUrl = replaceBaseUrl(input.url);

    if (updatedUrl === input.url) return input;

    return new Request(updatedUrl, input);
  }

  return input;
};

const links = [
  httpBatchLink({
    fetch: async (input, init) => {
      const resolvedInput = resolveRequestInput(input);
      const response = await fetch(resolvedInput as any, init as any);
      if (response.ok) return response;

      if (response.status === 401) {
        try {
          authExpired.redirect();
        } catch {
          console.error('Failed to redirect to login');
        }
      }
      return response;
    },
    headers: async () => await createHeaderWithAuth(),
    transformer: superjson,
    url: `${normalizedDefaultBase}${TRPC_PATH}`,
  }),
];

export const trpcClient = createTRPCClient<MobileRouter>({
  links,
});

export const { TRPCProvider, useTRPC, useTRPCClient } = createTRPCContext<MobileRouter>();
