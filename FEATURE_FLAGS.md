# 🎛️ Feature Flags Documentation

This document explains how to use Feature Flags in LobeChat to enable/disable optional features.

## Overview

LobeChat uses a Feature Flags system to allow you to customize which features are enabled in your installation. By default, the minimal chat configuration has most advanced features **disabled**, keeping the application lightweight and focused on core chat functionality.

## Default Configuration (Minimal Chat)

By default, these features are **ENABLED**:

- ✅ Chat with OpenAI models
- ✅ Agent creation and management
- ✅ Session groups and organization
- ✅ Topics and threads
- ✅ Export/Import functionality
- ✅ Authentication (NextAuth/Clerk/Logto/OIDC)
- ✅ Dark/Light mode
- ✅ i18n (multi-language support)

By default, these features are **DISABLED**:

- ❌ MCP (Model Context Protocol) integration
- ❌ RAG / Knowledge Base
- ❌ File Upload
- ❌ Marketplace / Discovery
- ❌ Image Generation (DALL-E, AI Image)
- ❌ Speech-to-Text (STT)
- ❌ Changelog
- ❌ Plugins
- ❌ Advanced Model Parameters (temperature, top_p, frequency_penalty, presence_penalty)
- ❌ Chat Settings Button (top right corner)
- ❌ Topic Panel Toggle Button (show/hide topics sidebar)

## How to Enable Features

Feature flags are configured using the `FEATURE_FLAGS` environment variable.

### Syntax

```env
FEATURE_FLAGS=feature_name:true
```

### Enable Multiple Features

Use commas to separate multiple features:

```env
FEATURE_FLAGS=mcp:true,knowledge_base:true,file_upload:true
```

## Available Feature Flags

### Core Optional Features

#### `mcp` - Model Context Protocol

Enables MCP integration for advanced tool calling and context management.

```env
FEATURE_FLAGS=mcp:true
```

**Enables:**

- MCP server installation UI
- MCP tools in chat
- MCP settings in Settings page
- Desktop MCP support (if using desktop app)

---

#### `knowledge_base` - RAG / Knowledge Base

Enables Retrieval Augmented Generation and Knowledge Base functionality.

```env
FEATURE_FLAGS=knowledge_base:true
```

**Requires:** `file_upload:true` (to upload documents)

**Enables:**

- Knowledge Base UI (`/knowledge` page)
- Document management
- Document chunking & embeddings
- Semantic search in chat
- RAG evaluation tools

---

#### `file_upload` - File Upload

Enables file upload functionality.

```env
FEATURE_FLAGS=file_upload:true
```

**Enables:**

- File upload UI
- File management
- File viewer
- File attachment in chat

---

### Additional Features

#### `market` - Marketplace / Discovery

Enables the marketplace for discovering assistants, models, and providers.

```env
FEATURE_FLAGS=market:true
```

---

#### `dalle` - DALL-E Image Generation

Enables DALL-E image generation.

```env
FEATURE_FLAGS=dalle:true
```

---

#### `ai_image` - AI Image Generation

Enables general AI image generation features.

```env
FEATURE_FLAGS=ai_image:true
```

---

#### `speech_to_text` - Speech-to-Text

Enables speech-to-text (STT) functionality.

```env
FEATURE_FLAGS=speech_to_text:true
```

---

#### `advanced_model_params` - Advanced Model Parameters

Enables advanced model parameter controls (temperature, top_p, frequency_penalty, presence_penalty) in the chat input toolbar.

```env
FEATURE_FLAGS=advanced_model_params:true
```

**Enables:**

- Temperature (Creativity Level) slider
- Top P (Openness to Ideas) slider
- Frequency Penalty (Vocabulary Richness) slider
- Presence Penalty (Expression Divergence) slider

---

#### `chat_settings_button` - Chat Settings Button

Shows/hides the chat settings button and avatar click access to settings.

```env
FEATURE_FLAGS=chat_settings_button:true
```

**Enables:**

- Chat settings button (three horizontal lines icon) in desktop/mobile header
- Click on avatar/group avatar to open settings
- Access to agent/group configuration panel

**When disabled:**

- Users cannot access agent/group settings
- Avatar/group avatar clicks are disabled
- Settings button is hidden

---

#### `topic_panel_button` - Topic Panel Toggle Button

Shows/hides the topic panel toggle button and the topics sidebar itself.

```env
FEATURE_FLAGS=topic_panel_button:true
```

**Enables:**

- Toggle button for topics/conversation panel in chat header
- Panel open/close icon (PanelRightOpen/PanelRightClose)
- The topics sidebar panel itself
- "Save current session as topic" button (right side of chat input)
- Access to conversation topics

**When disabled:**

- Topic panel toggle button is hidden
- Topics sidebar panel is completely hidden
- "Save current session as topic" button is hidden
- Users cannot access, view, or save conversation topics

---

#### `changelog` - Changelog

Enables the changelog page.

```env
FEATURE_FLAGS=changelog:true
```

---

#### `plugins` - Plugins

Enables the legacy plugin system.

```env
FEATURE_FLAGS=plugins:true
```

**Note:** Plugins are deprecated in favor of MCP. Use `mcp:true` instead.

---

## Common Use Cases

### Minimal Chat (Default)

No configuration needed. All advanced features are disabled by default.

```env
# No FEATURE_FLAGS needed - this is the default
```

---

### Enable MCP Only

Perfect for users who want tool calling without RAG.

```env
FEATURE_FLAGS=mcp:true
```

---

### Enable RAG/Knowledge Base

Perfect for users who want document-based Q\&A.

```env
FEATURE_FLAGS=knowledge_base:true,file_upload:true
```

**Note:** `file_upload:true` is required for uploading documents.

**Optional S3 Configuration:**

```env
S3_ENDPOINT=https://your-s3-endpoint.com
S3_BUCKET=your-bucket-name
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
```

---

### Full Featured Installation

Enable all optional features:

```env
FEATURE_FLAGS=mcp:true,knowledge_base:true,file_upload:true,market:true,dalle:true,ai_image:true,speech_to_text:true,changelog:true
```

---

## Advanced: User-Specific Feature Flags

Feature flags can be enabled for specific users by providing an array of user IDs:

```env
FEATURE_FLAGS=mcp:["user123","user456"],knowledge_base:["user789"]
```

This enables:

- MCP for `user123` and `user456` only
- Knowledge Base for `user789` only

---

## How Feature Flags Work Internally

### Configuration Files

Feature flags are defined in:

- `src/config/featureFlags/schema.ts` - Schema and defaults
- `src/config/featureFlags/index.ts` - Server-side loading
- `src/store/serverConfig/` - Client-side state management

### Usage in Code

**In React Components:**

```typescript
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';

const MyComponent = () => {
  const { enableMCP, enableKnowledgeBase } = useServerConfigStore(featureFlagsSelectors);

  if (!enableMCP) {
    return null; // Hide MCP features
  }

  return <MCPFeature />;
};
```

**In API Routes:**

```typescript
import { serverFeatureFlags } from '@/config/featureFlags';

export const POST = async (req: Request) => {
  const flags = serverFeatureFlags();

  if (!flags.enableMCP) {
    return new Response('MCP is disabled', { status: 403 });
  }

  // ... MCP logic
};
```

---

## Troubleshooting

### Feature is not working after enabling flag

1. **Rebuild the application:**

   ```bash
   bun run build
   ```

2. **Restart the development server:**

   ```bash
   bun run dev
   ```

3. **Clear browser cache and cookies**

4. **Check the console for errors**

---

### Environment variable not working

1. **Create `.env.local` file** (not tracked in git):

   ```env
   FEATURE_FLAGS=mcp:true
   ```

2. **Ensure format is correct:**
   - Use `:` to separate feature and value
   - Use `,` to separate multiple features
   - Use lowercase for feature names

3. **Restart the server after changing environment variables**

---

### How to check current feature flags

**In Development:**
Open browser console and run:

```javascript
window.__NEXT_DATA__.props.pageProps.featureFlags;
```

**In Server Logs:**
Feature flags are logged on server startup with the debug namespace `lobe-feature-flags`.

Enable debug logs:

```bash
DEBUG=lobe-feature-flags bun run dev
```

---

## Migration Guide

### From Full Installation to Minimal Chat

If you have an existing full installation and want to switch to minimal chat:

1. **Remove or comment out FEATURE_FLAGS:**

   ```env
   # FEATURE_FLAGS=mcp:true,knowledge_base:true
   ```

2. **Rebuild:**

   ```bash
   bun run build
   ```

3. **Your data is preserved** - feature flags only affect UI and functionality

---

### From Minimal Chat to Full Featured

To enable all features:

```env
FEATURE_FLAGS=mcp:true,knowledge_base:true,file_upload:true,market:true,dalle:true,ai_image:true,speech_to_text:true
```

Then rebuild and restart.

---

## Performance Impact

| Feature          | Bundle Size Impact | Runtime Impact |
| ---------------- | ------------------ | -------------- |
| MCP              | Medium (\~200KB)   | Low            |
| Knowledge Base   | High (\~500KB)     | Medium         |
| File Upload      | Low (\~50KB)       | Low            |
| Marketplace      | Medium (\~300KB)   | Low            |
| Image Generation | Medium (\~150KB)   | Low            |
| Speech-to-Text   | High (\~400KB)     | High           |

**Minimal Chat Bundle Size:** \~2.5MB (gzipped)\
**Full Featured Bundle Size:** \~4.5MB (gzipped)

---

## Support

For issues or questions:

- Open an issue: <https://github.com/lobehub/lobe-chat/issues>
- Read the docs: <https://lobehub.com/docs>

---

**Last Updated:** 2025-01-11
