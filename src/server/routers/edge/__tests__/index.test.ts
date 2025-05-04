import { describe, expect, it } from 'vitest';

import { edgeRouter } from '../index';

describe('edgeRouter', () => {
  it('should define all expected routes', () => {
    const routes = Object.keys(edgeRouter._def.procedures);
    expect(routes.sort()).toEqual([
      'config.getDefaultAgentConfig',
      'config.getGlobalConfig',
      'healthcheck',
      'market.getAgent',
      'market.getAgentIndex',
      'market.getPluginIndex',
      'upload.createS3PreSignedUrl',
    ]);
  });

  it('should return health check message', async () => {
    const result = await edgeRouter.createCaller({} as any).healthcheck();
    expect(result).toBe("i'm live!");
  });

  it('should have all router namespaces defined', () => {
    const routerKeys = Object.keys(edgeRouter._def.record);
    expect(routerKeys.sort()).toEqual(['appStatus', 'config', 'healthcheck', 'market', 'upload']);
  });
});
