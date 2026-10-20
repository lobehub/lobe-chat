import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import RebuildNotice from './RebuildNotice';

const state = vi.hoisted(() => ({ instances: [] as any[] }));

vi.mock('./useEnvironmentData', () => ({
  useEnvironmentActions: () => ({ rebuildOnOwnDrive: vi.fn() }),
  useInstances: () => ({ data: { instances: state.instances } }),
}));

const environment = (visibility: 'private' | 'public') =>
  ({ id: 'env-1', visibility, workspaceId: 'ws-1' }) as any;

const instance = (overrides: Record<string, unknown>) => ({
  drive: 'personal',
  environmentId: 'env-1',
  id: 'inst-1',
  rebuildRequired: false,
  workingDirectory: 'app',
  ...overrides,
});

describe('RebuildNotice', () => {
  beforeEach(() => {
    state.instances = [];
  });

  it('should offer a public-drive copy for a published environment whose folders are all personal', () => {
    // Made while private, so on the owner's drive: colleagues see the
    // environment but have nothing to run in.
    state.instances = [instance({})];
    render(<RebuildNotice editable environment={environment('public')} />);

    expect(screen.getByText('environments.instances.publishPublicDesc')).toBeInTheDocument();
    expect(screen.getByText('environments.instances.publishPublic')).toBeInTheDocument();
  });

  it('should say nothing once the published environment has a public-drive folder', () => {
    state.instances = [instance({}), instance({ drive: 'public', id: 'inst-2' })];
    const { container } = render(<RebuildNotice editable environment={environment('public')} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('should say nothing for a private environment on its owner drive', () => {
    state.instances = [instance({})];
    const { container } = render(<RebuildNotice editable environment={environment('private')} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('should keep asking for a personal rebuild of a private environment left on the public drive', () => {
    state.instances = [instance({ drive: 'public', rebuildRequired: true })];
    render(<RebuildNotice editable environment={environment('private')} />);

    expect(screen.getByText('environments.instances.rebuildPersonalDesc')).toBeInTheDocument();
  });
});
