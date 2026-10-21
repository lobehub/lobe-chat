import { beforeEach, describe, expect, it } from 'vitest';

import { useEntityViewStore } from './store';

describe('useEntityViewStore', () => {
  beforeEach(() => useEntityViewStore.setState({ history: [], selectedId: undefined }));

  it('pins the default page so a status change does not swap it for another', () => {
    useEntityViewStore.getState().ensureSelected('ctx-default');
    expect(useEntityViewStore.getState().selectedId).toBe('ctx-default');
  });

  it('leaves an explicit selection and its trail alone', () => {
    useEntityViewStore.setState({ history: ['ctx-a'], selectedId: 'ctx-b' });
    useEntityViewStore.getState().ensureSelected('ctx-c');
    expect(useEntityViewStore.getState()).toMatchObject({ history: ['ctx-a'], selectedId: 'ctx-b' });
  });
});
