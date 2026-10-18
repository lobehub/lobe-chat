import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const readEntry = () => readFile(path.join(process.cwd(), 'src/spa/entry.desktop.tsx'), 'utf8');

describe('desktop entry boot order', () => {
  // `useCacheScope` gates the desktop cache partition on `isIdentityResolved`,
  // and preload is the only source that knows it without waiting for the
  // `getUserState()` round-trip. Dropping this call silently downgrades desktop
  // to the optimistic persisted scope — no test fails, the app just hydrates the
  // previous partition and quarantines its writes until the request lands.
  it('applies the preload identity synchronously, before the app initializes', async () => {
    const source = await readEntry();
    const identityAt = source.indexOf('applyDesktopBootstrapIdentity()');
    const initAt = source.indexOf('startAppInitialization()');
    const renderAt = source.indexOf('createSPARoot(');

    expect(identityAt).toBeGreaterThan(-1);
    expect(identityAt).toBeLessThan(initAt);
    expect(identityAt).toBeLessThan(renderAt);
  });

  it('keeps the call out of an effect or callback', async () => {
    const source = await readEntry();

    expect(source).not.toContain('useEffect');
    expect(source).toMatch(/^applyDesktopBootstrapIdentity\(\);$/m);
  });

  // Every Desktop renderer shares storage but not memory: a server switch in
  // one window must reload the others, or a popup keeps the previous server's
  // state and keeps writing it.
  it.each(['entry.desktop.tsx', 'entry.popup.tsx'])(
    '%s follows a data-context reset from another window',
    async (entry) => {
      const source = await readFile(path.join(process.cwd(), 'src/spa', entry), 'utf8');

      expect(source).toMatch(/^followDataContextReset\(\);$/m);
    },
  );
});
