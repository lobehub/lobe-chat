import { getFilePathDisplayInfo } from '@lobechat/shared-tool-ui/components';
import { fireEvent, render, screen } from '@testing-library/react';
import { createElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import EditedFilesCard, {
  AGGREGATE_EDITED_FILE_ICON_SIZE,
  getEditedFileIconName,
  getEditedFilesCardMode,
  SINGLE_EDITED_FILE_ICON_SIZE,
} from './index';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { path?: string }) =>
      options?.path ? `${key}:${options.path}` : key,
  }),
}));

const conversation = vi.hoisted(() => ({ context: {} as { agentShareId?: string } }));

// The card always mounts inside a ConversationProvider (via AssistantGroup);
// tests default to the owner chat page and opt into a share surface.
vi.mock('../../store', () => ({
  useConversationStore: (selector: (s: unknown) => unknown) => selector(conversation),
}));

const singleEntry = {
  diffTexts: [
    'diff --git a/Acceptance/index.tsx b/Acceptance/index.tsx\n--- a/Acceptance/index.tsx\n+++ b/Acceptance/index.tsx\n@@ -1 +1 @@\n-old\n+new',
  ],
  kind: 'modified' as const,
  linesAdded: 7,
  linesDeleted: 2,
  path: '/workspace/Acceptance/index.tsx',
  sandboxBacked: false,
  sourceToolCallIds: ['tool-1'],
};

describe('getEditedFilesCardMode', () => {
  it('uses the dedicated direct summary for a single edited file', () => {
    expect(getEditedFilesCardMode(1)).toBe('single');
  });

  it('uses the collapsible aggregate for multiple edited files', () => {
    expect(getEditedFilesCardMode(2)).toBe('aggregate');
  });
});

describe('getEditedFileIconName', () => {
  it('uses the edited file basename to select its file-type icon', () => {
    expect(getEditedFileIconName('/workspace/Acceptance/index.tsx')).toBe('index.tsx');
  });
});

describe('getFilePathDisplayInfo', () => {
  it('keeps the parent directory and basename for long absolute paths', () => {
    expect(getFilePathDisplayInfo('/very/long/workspace/Acceptance/index.tsx')).toEqual({
      displayPath: 'Acceptance/index.tsx',
      isImage: false,
      name: 'index.tsx',
    });
  });

  it('marks image files so they render a lucide image icon instead of a file-type icon', () => {
    expect(getFilePathDisplayInfo('/workspace/tmp/r24-studio-crop.PNG')).toEqual({
      displayPath: 'tmp/r24-studio-crop.PNG',
      isImage: true,
      name: 'r24-studio-crop.PNG',
    });
  });
});

describe('SINGLE_EDITED_FILE_ICON_SIZE', () => {
  it('matches the height of the two-line title block beside it', () => {
    expect(SINGLE_EDITED_FILE_ICON_SIZE).toBe(40);
  });
});

describe('AGGREGATE_EDITED_FILE_ICON_SIZE', () => {
  it('matches the single-file card so stacked cards share one icon scale', () => {
    expect(AGGREGATE_EDITED_FILE_ICON_SIZE).toBe(40);
  });
});

describe('SingleEditedFileCard', () => {
  it('groups line deltas below the title and exposes the diff action as a secondary control', () => {
    render(createElement(EditedFilesCard, { entries: [singleEntry] }));

    const title = screen.getByText('editedFiles.singleTitle:Acceptance/index.tsx');
    const action = screen.getByRole('button', { name: 'editedFiles.viewChanges' });
    const summary = title.parentElement;

    expect(summary).toHaveTextContent('+7');
    expect(summary).toHaveTextContent('-2');
    expect(summary).not.toContainElement(action);
    expect(action.closest('[data-view-changes]')).not.toBeNull();
    expect(action).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(action);
    expect(action).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: 'editedFiles.hideChanges' })).toBeInTheDocument();
  });
});

describe('EditedFilesCard on a share surface', () => {
  afterEach(() => {
    conversation.context = {};
  });

  // Regression (LOBE-14831): a sandbox-written file looked clickable on the
  // agent-share visitor page but opened nothing. It now renders static and says
  // why it can't be previewed.
  it('explains that the file cannot be previewed instead of offering a dead click', () => {
    conversation.context = { agentShareId: 'share_1' };
    const sandboxWrite = {
      ...singleEntry,
      diffTexts: [],
      kind: 'added' as const,
      linesAdded: 0,
      linesDeleted: 0,
      path: '/workspace/index.html',
      sandboxBacked: true,
    };

    render(createElement(EditedFilesCard, { entries: [sandboxWrite] }));

    expect(screen.getByText('editedFiles.previewUnavailableInShare')).toBeInTheDocument();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('shows no hint on the owner chat page', () => {
    render(createElement(EditedFilesCard, { entries: [singleEntry] }));

    expect(screen.queryByText('editedFiles.previewUnavailableInShare')).toBeNull();
  });
});
