export type CanvasIssueRule =
  | 'broken-reference'
  | 'duplicate-path'
  | 'entry-missing'
  | 'file-too-large'
  | 'hard-coded-color'
  | 'invalid-attribute'
  | 'invalid-path'
  | 'misplaced-component'
  | 'missing-attribute'
  | 'network-api'
  | 'project-too-large'
  | 'quota-exceeded'
  | 'remote-resource'
  | 'self-closing-component'
  | 'too-many-files'
  | 'unknown-attribute'
  | 'unknown-component';

export interface CanvasIssue {
  file?: string;
  line?: number;
  message: string;
  rule: CanvasIssueRule;
}

export interface CanvasValidationResult {
  issues: CanvasIssue[];
  ok: boolean;
}

export interface CanvasProjectFile {
  content: string | Uint8Array;
  path: string;
  size?: number;
}
