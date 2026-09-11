import type { LocalHeterogeneousAgentType } from './agent/heterogeneousAgent';

export const HeterogeneousAgentSessionErrorCode = {
  AuthRequired: 'auth_required',
  /**
   * The shell probe that resolves PATH ran out of time. Distinct from
   * `CliNotFound` because it says nothing about whether the CLI is installed —
   * conflating them told users to reinstall a working binary.
   */
  CliDetectionTimeout: 'cli_detection_timeout',
  CliNotFound: 'cli_not_found',
  Overloaded: 'overloaded',
  RateLimit: 'rate_limit',
  ResumeCwdMismatch: 'resume_cwd_mismatch',
  ResumeThreadNotFound: 'resume_thread_not_found',
  WorkingDirectoryNotFound: 'working_directory_not_found',
} as const;

export type HeterogeneousAgentSessionErrorCode =
  (typeof HeterogeneousAgentSessionErrorCode)[keyof typeof HeterogeneousAgentSessionErrorCode];

export interface HeterogeneousAgentRateLimitInfo {
  isUsingOverage?: boolean;
  overageDisabledReason?: string;
  overageStatus?: string;
  rateLimitType?: string;
  resetsAt?: number;
  status?: string;
}

export interface HeterogeneousAgentSessionError {
  agentType?: LocalHeterogeneousAgentType;
  code?: HeterogeneousAgentSessionErrorCode | string;
  command?: string;
  /** Diagnostic context from the CLI's terminal event (subtype, HTTP status, turn count, …). */
  details?: Record<string, unknown>;
  docsUrl?: string;
  installCommands?: readonly string[];
  message: string;
  rateLimitInfo?: HeterogeneousAgentRateLimitInfo;
  resumeSessionId?: string;
  stderr?: string;
  workingDirectory?: string;
}
