const ELECTRON_LAYER_SEGMENTS = [
  'src/services/electron/',
  'src/store/electron/',
  'src/utils/electron/',
  'src/features/Electron/',
  'packages/electron-client-ipc/',
  'apps/desktop/',
];

// `includes` rather than an anchored match is deliberate: the overlay build reports this repo's files as `lobehub/src/...`.
export const findElectronBuildInputs = (files: Iterable<string>): string[] =>
  [...files]
    .filter((file) => ELECTRON_LAYER_SEGMENTS.some((segment) => file.includes(segment)))
    .sort();

export const assertNoElectronBuildInputs = (appName: string, files: Iterable<string>) => {
  const offenders = findElectronBuildInputs(files);
  if (offenders.length === 0) return;
  throw new Error(
    `[${appName}] ${offenders.length} Electron-layer module(s) are in the build graph. Cut the import chain with a .desktop.ts twin (see plugins/vite/platformResolve.ts):\n  ${offenders.join('\n  ')}`,
  );
};
