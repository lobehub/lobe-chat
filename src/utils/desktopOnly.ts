export const desktopOnly = <T extends object>(name: string): T =>
  new Proxy((() => {}) as unknown as T, {
    apply() {
      throw new Error(`${name} is only available in the desktop app`);
    },
    get(_target, property) {
      if (property === 'then' || typeof property === 'symbol') return undefined;
      return desktopOnly(`${name}.${String(property)}`);
    },
  });
