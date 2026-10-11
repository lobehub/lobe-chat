// The route tables sit in the entry chunk's static graph; resolving the real
// loader on first use keeps the userMemory store in the preferences route's
// lazy chunks.
export const preferenceListLoader = () =>
  import('@/routes/(main)/memory/preferences/preferencesLoader').then((module) =>
    module.preferenceListLoader(),
  );
