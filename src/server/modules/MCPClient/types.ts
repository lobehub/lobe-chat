interface InputSchema {
  [k: string]: unknown;

  properties?: unknown | null;
  type: 'object';
}

export interface McpTool {
  description: string;
  inputSchema: InputSchema;
  name: string;
}
