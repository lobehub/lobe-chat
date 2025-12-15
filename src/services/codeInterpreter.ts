import { toolsClient } from '@/libs/trpc/client';
import type { CallToolInput, CallToolResult } from '@/server/routers/tools/codeInterpreter';

class CodeInterpreterService {
  /**
   * Call a cloud code interpreter tool
   * @param toolName - The name of the tool to call (e.g., 'runCommand', 'writeLocalFile')
   * @param params - The parameters for the tool
   * @param context - Session context containing userId and topicId for isolation
   */
  async callTool(
    toolName: string,
    params: Record<string, any>,
    context: { topicId: string; userId: string },
  ): Promise<CallToolResult> {
    const input: CallToolInput = {
      params,
      toolName,
      topicId: context.topicId,
      userId: context.userId,
    };

    return toolsClient.codeInterpreter.callTool.mutate(input);
  }
}

export const codeInterpreterService = new CodeInterpreterService();
