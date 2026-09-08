/** Agent-authored, versioned user-state graph, independent of execution results. */
export interface AcceptanceFlowNodeInput {
  expected: string;
  instruction: string;
  key: string;
  title: string;
}
export interface AcceptanceFlowEdgeInput {
  condition?: string;
  key: string;
  required: boolean;
  source: string;
  target: string;
  trigger: string;
}
export interface AcceptanceFlowDefinition {
  edges: AcceptanceFlowEdgeInput[];
  entryNodeKey: string;
  goal: string;
  nodes: AcceptanceFlowNodeInput[];
  preconditions: string;
  title: string;
}
export type AcceptanceFlowVerdict = 'passed' | 'failed' | 'uncertain' | 'blocked';
export type AcceptanceFlowReview = 'accepted' | 'rejected';
export type AcceptanceFlowRunStatus = 'running' | 'completed';
