import { startTransition, StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { HydratedRouter } from 'react-router/dom';

import { setReplicaPersistedHydration } from '@/libs/replica';

// The Workbench runtime never mounts the user store, so a replica's cache scope
// would stay the last-known user's partition — hydrating it would paint a
// previous (possibly server-invalidated) session's private rows. Reads here are
// network-only; authorization is whatever the server answers.
setReplicaPersistedHydration(false);

// RR suffixes dynamically-shared route CSS hrefs with `#`, so the vite preload
// helper re-requests them with `crossorigin` — against our cross-origin CDN the
// browser reuses the plain-cached (ACAO-less) response and fails the CORS
// check, which would otherwise crash route loading. The stylesheet is already
// applied via RR's own link, so a failed duplicate preload is safe to ignore.
// Must attach here (first client module) — route chunks load in parallel with
// root.tsx, so a root-level listener can miss the event.
window.addEventListener('vite:preloadError', (event) => {
  const payload = (event as Event & { payload?: Error }).payload;
  if (String(payload).includes('CSS')) {
    console.warn('[workbench] ignored css preload failure:', payload);
    event.preventDefault();
  }
});

// No index.html in this app, so the StyleX unplugin cannot inject its dev CSS;
// load it from the Vite dev server instead. Production CSS is linked by root.tsx.
if (import.meta.env.DEV) void import('virtual:lobe-stylex-dev-css');

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <HydratedRouter />
    </StrictMode>,
  );
});
