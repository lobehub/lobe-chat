import { defineConfig } from '@/libs/proxy/define-config';

const { config, middleware } = defineConfig({
  config: {
    matcher: [],
  },
});

export { config };
export default middleware;
