import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  "./vitest.happy-dom.config.ts",
  "./vitest.edge.config.ts",
  "./vitest.server.config.ts",
]);
