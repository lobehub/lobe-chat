/**
 * URL Hydration Store State
 *
 * Tracks initialization status to ensure one-time URL reading.
 */
export interface UrlHydrationState {
  isAgentPinnedInitialized: boolean;
}

export const initialState: UrlHydrationState = {
  isAgentPinnedInitialized: false,
};
