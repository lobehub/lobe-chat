/**
 * Operation-metadata patch for a gateway step event.
 *
 * `stepIndex` stays the internal execution counter (`stepCount`); `llmCalls`
 * is the user-facing metric (actual model calls, retries included) and is
 * independent of it. Returns `undefined` when the event carries neither.
 */
export const resolveStepMetricPatch = (
  stepIndex: unknown,
  llmCalls: unknown,
): Record<string, number> | undefined => {
  const patch: Record<string, number> = {};
  if (typeof stepIndex === 'number') patch.stepCount = stepIndex + 1;
  if (typeof llmCalls === 'number') patch.llmCalls = llmCalls;
  return Object.keys(patch).length > 0 ? patch : undefined;
};
