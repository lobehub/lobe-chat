export const desktopOnly = <T extends object>(name: string): T =>
  new Proxy({} as T, {
    get: (_target, property) => () => {
      throw new Error(`${name}.${String(property)} is only available in the desktop app`);
    },
  });
