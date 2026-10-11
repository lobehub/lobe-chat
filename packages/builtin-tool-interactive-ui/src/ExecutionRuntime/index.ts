import type { BuiltinServerRuntimeOutput } from '@lobechat/types';

import { RenderUIParamsSchema } from '../schema';
import type { RenderUIState } from '../types';

export class InteractiveUIExecutionRuntime {
  async renderUI(args: unknown): Promise<BuiltinServerRuntimeOutput> {
    const result = RenderUIParamsSchema.safeParse(args);
    if (!result.success) {
      const message =
        'The interactive UI is invalid or exceeds the source size limits. Return a smaller complete version-1 artifact, or answer in plain text.';
      return { content: message, error: { message, type: 'InvalidInteractiveUI' }, success: false };
    }

    const state: RenderUIState = { status: 'ready', version: 1 };
    return {
      content: `Interactive UI "${result.data.title}" is ready in the conversation. ${result.data.fallback}\nControls run locally. Any proposed follow-up requires the user to press Send in the host. The artifact is saved; local control state resets on reopen.`,
      state,
      success: true,
    };
  }
}
