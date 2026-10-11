export const InteractiveUIIdentifier = 'lobe-interactive-ui';
export const InteractiveUIApiName = { renderUI: 'renderUI' } as const;

/** Persisted in the tool arguments. Local JavaScript state is intentionally ephemeral. */
export interface RenderUIParams {
  css: string;
  fallback: string;
  html: string;
  js: string;
  title: string;
  version: 1;
}

/** Result-domain data only; the source is already persisted in tool arguments. */
export interface RenderUIState {
  status: 'ready';
  version: 1;
}
