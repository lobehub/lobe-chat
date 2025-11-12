export interface UserToolConfig {
  /**
   * Tool approval mode
   * - auto-run: Automatically approve all tools without user consent
   * - allow-list: Only approve tools in the allow list
   * - manual: Require manual approval for each tool execution
   */
  approvalMode?: 'auto-run' | 'allow-list' | 'manual';

  dalle: {
    autoGenerate: boolean;
  };

  /**
   * Tool intervention configuration
   */
  humanIntervention?: {
    /**
     * Allow list of approved tools (used in 'allow-list' mode)
     * Format: "identifier/apiName"
     *
     * Examples:
     * - "web-browsing/crawlSinglePage"
     * - "bash/bash"
     * - "search/search"
     */
    allowList?: string[];
  };
}
