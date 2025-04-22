import { toolsClient } from '@/libs/trpc/client';

class MCPService{
  invokeMcpToolCall(){
    toolsClient.mcp.callTool.mutate({})
  }
}
