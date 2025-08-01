/**
 * System Dependency Check Result
 */
export interface SystemDependencyCheckResult {
  /**
   * Error message
   */
  error?: string;
  installInstructions?: {
    current?: string;
    manual?: string;
  };
  /**
   * Whether installed
   */
  installed: boolean;
  /**
   * Whether meets version requirements
   */
  meetRequirement: boolean;
  /**
   * Dependency name
   */
  name: string;
  requiredVersion?: string;
  /**
   * Version information
   */
  version?: string;
}
