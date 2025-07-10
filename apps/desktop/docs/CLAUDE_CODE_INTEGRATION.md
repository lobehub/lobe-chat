# Claude Code Integration

This document describes the Claude Code SDK integration in LobeChat Desktop application.

## Overview

Claude Code SDK enables running Claude Code as a subprocess, providing AI-powered coding assistance capabilities. The integration supports:

- **Multi-turn conversations** with context retention
- **File operations** (read/write)
- **Code execution** through bash commands
- **Session management** and continuation
- **Real-time streaming** responses
- **Cost tracking** per session

## Accessing Claude Code

In the LobeChat Desktop application, you can access Claude Code through:

1. **Sidebar Navigation**: Click the code icon (`</>`) in the sidebar (desktop only)
2. **Direct URL**: Navigate to `/claude-code` in the application

The Claude Code interface provides:
- A code editor for writing prompts
- Real-time streaming message display
- Session management with history
- Cost tracking and usage statistics

## Architecture

### Components

1. **IPC Layer** (`packages/electron-client-ipc`)
   - Type definitions for Claude Code events
   - IPC event interfaces for main/render communication

2. **Main Process Controller** (`apps/desktop/src/main/controllers/ClaudeCodeCtr.ts`)
   - Handles Claude Code SDK integration
   - Manages streaming sessions and abort controllers
   - Tracks session history

3. **React Hook** (`src/hooks/useClaudeCode.ts`)
   - Provides easy-to-use interface for React components
   - Handles IPC communication with main process
   - Manages streaming state and events

4. **UI Page** (`src/app/[variants]/(main)/claude-code/`)
   - User interface for interacting with Claude Code
   - Query editor with syntax highlighting
   - Session management interface
   - Real-time message streaming display

## Setup

### Prerequisites

1. Install Claude Code SDK dependency:
   ```bash
   npm install @anthropic-ai/claude-code
   ```

2. Set up authentication:
   ```bash
   # Option 1: Anthropic API Key
   export ANTHROPIC_API_KEY="your-api-key"
   
   # Option 2: Amazon Bedrock
   export CLAUDE_CODE_USE_BEDROCK=1
   # Configure AWS credentials
   
   # Option 3: Google Vertex AI
   export CLAUDE_CODE_USE_VERTEX=1
   # Configure Google Cloud credentials
   ```

## Usage

### Basic Query

```typescript
import { useClaudeCode } from '@/hooks/useClaudeCode';

const MyComponent = () => {
  const { query, isLoading } = useClaudeCode();

  const handleQuery = async () => {
    const result = await query('Write a function to calculate Fibonacci numbers', {
      maxTurns: 3,
      outputFormat: 'json',
    });
    
    console.log(result.messages);
    console.log(result.sessionId);
  };
};
```

### Streaming Query

```typescript
const { startStreamingQuery, isLoading } = useClaudeCode({
  onStreamMessage: (message) => {
    console.log('New message:', message);
  },
  onStreamComplete: (sessionId) => {
    console.log('Stream completed:', sessionId);
  },
  onStreamError: (error) => {
    console.error('Stream error:', error);
  },
});

const handleStream = async () => {
  await startStreamingQuery('Build a React component', {
    maxTurns: 5,
    outputFormat: 'stream-json',
    allowedTools: ['Read', 'Write', 'Bash'],
  });
};
```

### Session Management

```typescript
const { recentSessions, fetchRecentSessions, clearSession } = useClaudeCode();

// Get recent sessions
await fetchRecentSessions();

// Continue a previous session
await startStreamingQuery('Continue', {
  resumeSessionId: session.sessionId,
});

// Clear a session
await clearSession(sessionId);
```

## IPC Events

### Client Dispatch Events (Renderer → Main)

- `claudeCodeQuery` - Execute a Claude Code query
- `claudeCodeStreamStart` - Start a streaming query
- `claudeCodeStreamStop` - Stop an active stream
- `claudeCodeCreateAbortController` - Create abort controller
- `claudeCodeAbort` - Trigger abort
- `claudeCodeGetRecentSessions` - Get session history
- `claudeCodeClearSession` - Clear a specific session
- `claudeCodeCheckAvailability` - Check if Claude Code is available

### Broadcast Events (Main → Renderer)

- `claudeCodeStreamMessage` - Stream message event
- `claudeCodeStreamComplete` - Stream completion event
- `claudeCodeStreamError` - Stream error event

## Configuration Options

```typescript
interface ClaudeCodeOptions {
  maxTurns?: number;              // Maximum conversation turns
  systemPrompt?: string;           // Override system prompt
  appendSystemPrompt?: string;     // Append to system prompt
  cwd?: string;                   // Working directory
  allowedTools?: string[] | string; // Allowed tools
  disallowedTools?: string[] | string; // Disallowed tools
  permissionMode?: 'default' | 'acceptEdits' | 'bypassPermissions' | 'plan';
  outputFormat?: 'text' | 'json' | 'stream-json';
  inputFormat?: 'text' | 'stream-json';
  mcpConfig?: string;             // MCP configuration file path
  permissionPromptTool?: string;   // MCP tool for permissions
  verbose?: boolean;              // Enable verbose logging
  continueLastSession?: boolean;   // Continue last session
  resumeSessionId?: string;        // Resume specific session
}
```

## Message Types

```typescript
interface ClaudeCodeMessage {
  type: 'assistant' | 'user' | 'system' | 'result';
  message?: any;
  session_id?: string;
  subtype?: string;
  duration_ms?: number;
  duration_api_ms?: number;
  is_error?: boolean;
  num_turns?: number;
  result?: string;
  total_cost_usd?: number;
  apiKeySource?: string;
  cwd?: string;
  tools?: string[];
  mcp_servers?: Array<{ name: string; status: string }>;
  model?: string;
  permissionMode?: 'default' | 'acceptEdits' | 'bypassPermissions' | 'plan';
}
```

## Best Practices

1. **Always check availability** before using Claude Code
2. **Handle errors gracefully** - both sync and async errors
3. **Use abort controllers** for long-running operations
4. **Monitor costs** through session tracking
5. **Clean up sessions** when no longer needed
6. **Set appropriate tool permissions** based on use case

## Troubleshooting

### Claude Code not available

1. Check if running in Electron desktop app
2. Verify API key is set correctly
3. Check environment variables

### Streaming not working

1. Ensure proper event listeners are set up
2. Check for abort controller conflicts
3. Verify stream ID is unique

### Session continuation fails

1. Check if session ID is valid
2. Ensure session hasn't been cleared
3. Verify prompt is appropriate for continuation 