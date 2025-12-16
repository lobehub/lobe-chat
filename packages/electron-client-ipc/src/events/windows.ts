export interface OpenSettingsWindowOptions {
  /**
   * Query parameters that should be appended to the settings URL.
   */
  searchParams?: Record<string, string | undefined>;
  /**
   * Settings page tab path or identifier.
   */
  tab?: string;
}
