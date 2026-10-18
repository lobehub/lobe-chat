/**
 * @vitest-environment happy-dom
 */
import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DocumentCommentsProvider, useDocumentComments } from './context';

const mocks = vi.hoisted(() => ({ state: vi.fn() }));

vi.mock('@/business/client/hooks/useActiveWorkspaceId', () => ({
  useActiveWorkspaceId: () => 'ws-1',
}));

vi.mock('@/hooks/usePermission', () => ({ usePermission: () => ({ allowed: false }) }));

vi.mock('../store', () => ({
  usePageEditorStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      commentsPanelOpen: false,
      pendingCommentAnchor: undefined,
      setCommentsPanelOpen: vi.fn(),
      setPendingCommentAnchor: vi.fn(),
    }),
}));

vi.mock('./useDocumentCommentsState', () => ({ useDocumentCommentsState: mocks.state }));

vi.mock('./anchor/HighlightStyle', () => ({ default: () => null }));

const trpcError = (code: string) => Object.assign(new Error(code), { data: { code } });

const commentsState = (overrides: { anchoredError?: unknown; error?: unknown } = {}) => ({
  anchoredError: overrides.anchoredError,
  anchors: { pickTick: 0, selectedRootId: undefined },
  documentId: 'doc-1',
  // Threads loaded before access was revoked stay cached next to the error.
  documentThreads: { error: overrides.error, isInitialError: false, items: [{ id: 't-1' }] },
});

const Probe = () => {
  const state = useDocumentComments();
  return <div data-testid="probe">{state ? 'available' : 'unavailable'}</div>;
};

const renderProvider = () =>
  render(
    <DocumentCommentsProvider panelAvailable documentId="doc-1" paneRef={{ current: null }}>
      <Probe />
    </DocumentCommentsProvider>,
  );

describe('DocumentCommentsProvider', () => {
  beforeEach(() => {
    mocks.state.mockReset();
  });

  it('publishes no comment state once the page went private, despite cached threads', () => {
    mocks.state.mockReturnValue(commentsState({ error: trpcError('FORBIDDEN') }));

    expect(renderProvider().getByTestId('probe').textContent).toBe('unavailable');
  });

  it('publishes no comment state when the anchored threads report the page gone', () => {
    mocks.state.mockReturnValue(commentsState({ anchoredError: trpcError('NOT_FOUND') }));

    expect(renderProvider().getByTestId('probe').textContent).toBe('unavailable');
  });

  it('keeps the comment state on a transient failure', () => {
    mocks.state.mockReturnValue(commentsState({ error: trpcError('INTERNAL_SERVER_ERROR') }));

    expect(renderProvider().getByTestId('probe').textContent).toBe('available');
  });
});
