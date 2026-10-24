import type { LinearConnectionView, LinearIssueStateType } from '@lobechat/types';
import { LINEAR_OPEN_ISSUE_STATE_TYPES } from '@lobechat/types';

/** What the import picker is filtered to, and where new tasks land. */
export interface LinearImportFilter {
  linearProjectId: string | null;
  linearProjectName: string | null;
  stateTypes: LinearIssueStateType[];
  /** LobeHub project; null leaves new tasks outside any project. */
  targetProjectId: string | null;
  teamId: string | null;
  teamName: string | null;
}

export const initialImportFilter = (): LinearImportFilter => ({
  linearProjectId: null,
  linearProjectName: null,
  stateTypes: [...LINEAR_OPEN_ISSUE_STATE_TYPES],
  targetProjectId: null,
  teamId: null,
  teamName: null,
});

export interface LinearIssueImportModalOptions {
  connection: LinearConnectionView;
  /** Called after issues were imported or a sync rule was saved. */
  onSynced?: () => void;
}
