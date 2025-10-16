# Issue Triage Guide

This guide is used for batch triaging GitHub issues - analyzing issues and applying appropriate labels.

## Workflow

For EACH issue, follow these steps:

### Step 1: Get Available Labels (run once per batch)

```bash
gh label list --json name,description --limit 300
```

### Step 2: Get Issue Details

For each issue number, run:

```bash
gh issue view [ISSUE_NUMBER] --json number,title,body,labels,comments
```

### Step 3: Analyze and Select Labels

Extract information from the issue template and content:

#### Template Fields Mapping

- 📦 Platform field → `platform:web/desktop/mobile`
- 💻 Operating System → `os:windows/macos/linux/ios`
- 🌐 Browser → `device:pc/mobile`
- 📦 Deployment mode → `deployment:server/client/pglite`
- Platform (hosting) → `hosting:cloud/self-host/vercel/zeabur/railway`

#### Provider Detection

**IMPORTANT**: Always check issue title and body for provider mentions!

**Official Providers** (check for these keywords in title/body):

- `openai`, `gpt` → `provider:openai`
- `gemini` → `provider:gemini`
- `claude`, `anthropic` → `provider:claude`
- `deepseek` → `provider:deepseek`
- `google` → `provider:google`
- `ollama` → `provider:ollama`
- `azure` → `provider:azure`
- `bedrock` → `provider:bedrock`
- `vertex` → `provider:vertex`
- `groq`, `grok` → `provider:groq`
- `mistral` → `provider:mistral`
- `moonshot` → `provider:moonshot`
- `zhipu` → `provider:zhipu`
- `minimax` → `provider:minimax`
- `doubao` → `provider:doubao`

**Third-party Aggregation Providers**:

- `aihubmix`, `AIHubMix`, `AIHUBMIX` → `provider:aihubmix`
- Check environment variables like `AIHUBMIX_*` in issue body

**Multiple Providers**: If issue mentions multiple providers, add ALL applicable provider labels.

### Label Categories

#### a) Issue Type (select ONE if applicable)

- `💄 Design` - UI/UX design issues
- `📝 Documentation` - Documentation improvements
- `⚡️ Performance` - Performance optimization

#### b) Priority (select ONE if applicable)

- `priority:high` - Critical issues, data loss, security, maintainer mentions "urgent"/"serious"/"critical"
- `priority:medium` - Important issues affecting multiple users, significant functionality impact
- `priority:low` - Nice to have, minor issues, edge cases

**Priority Guidelines**:

- Set `priority:high` for: data loss, authentication failures, deployment blockers, critical bugs
- Set `priority:medium` for: feature bugs affecting multiple users, workflow issues
- Set `priority:low` for: cosmetic issues, feature requests, configuration questions

#### c) Platform (select ALL applicable)

- `platform:web`
- `platform:desktop`
- `platform:mobile`

#### d) Device (for platform:web, select ONE)

- `device:pc`
- `device:mobile`

#### e) Operating System (select ALL applicable)

- `os:windows`
- `os:macos`
- `os:linux`
- `os:ios`
- `os:android`

#### f) Hosting Platform (select ONE)

- `hosting:cloud` - Official LobeHub Cloud
- `hosting:self-host` - Self-hosted deployment
- `hosting:vercel` - Vercel deployment
- `hosting:zeabur` - Zeabur deployment
- `hosting:railway` - Railway deployment

#### g) Deployment Mode (select ONE if mentioned)

- `deployment:server` - Server-side database mode
- `deployment:client` - Client-side database mode
- `deployment:pglite` - PGLite mode

**Additional deployment tags**:

- `docker` - If using Docker deployment
- `electron` - If desktop/Electron specific

#### h) Model Provider (select ALL applicable)

See "Provider Detection" section above for complete list.

**IMPORTANT**: Always scan issue title and body for provider keywords!

#### i) Feature/Component (select ALL applicable)

Core Features:

- `feature:settings` - Settings and configuration
- `feature:agent` - Agent/Assistant functionality
- `feature:topic` - Topic/Conversation management
- `feature:marketplace` - Agent marketplace

File & Knowledge:

- `feature:files` - File upload/management
- `feature:knowledge-base` - Knowledge base and RAG
- `feature:export` - Export functionality

Model Capabilities:

- `feature:streaming` - Streaming responses
- `feature:tool` - Tool calling
- `feature:vision` - Vision/multimodal capabilities
- `feature:image` - AI image generation
- `feature:dalle` - DALL-E specific
- `feature:tts` - Text-to-speech

Technical:

- `feature:api` - Backend API
- `feature:auth` - Authentication/authorization
- `feature:sync` - Cloud sync functionality
- `feature:search` - Search functionality
- `feature:mcp` - MCP integration
- `feature:editor` - Lobe Editor
- `feature:markdown` - Markdown rendering
- `feature:thread` - Thread/Subtopic functionality

Collaboration:

- `feature:group-chat` - Group chat functionality
- `feature:memory` - Memory feature
- `feature:team-workspace` - Team workspace

#### j) Workflow/Status

- `Duplicate` - Only if duplicate of an OPEN issue (mention issue number)
- `needs-reproduction` - Cannot reproduce, needs more information
- `good-first-issue` - Good for first-time contributors
- `🤔 Need Reproduce` - Needs reproduction steps

### Step 4: Apply Labels

Add labels (comma-separated, no spaces after commas):

```bash
gh issue edit [ISSUE_NUMBER] --add-label "label1,label2,label3"
```

Remove "unconfirm" label if adding other labels:

```bash
gh issue edit [ISSUE_NUMBER] --remove-label "unconfirm"
```

**Important**: Combine both commands when possible for efficiency.

### Step 5: Log Summary

For each issue, provide reasoning (2-4 sentences):

- Labels applied and why
- Key factors from issue template/comments
- Provider detection reasoning (if applicable)

## Important Rules

1. **Read Carefully**: Read issue template fields AND issue body/title for complete context
2. **Provider Detection**: ALWAYS check title and body for provider keywords (including aihubmix, etc.)
3. **Multiple Categories**: Use ALL applicable labels from different categories
4. **Label Prefixes**: Always use proper prefixes (`feature:`, `provider:`, `os:`, `platform:`, etc.)
5. **Maintainer Comments**: Check maintainer comments for priority/status hints
6. **No Comments**: Only apply labels, DO NOT post comments to issues
7. **Batch Efficiency**: Process issues in parallel when possible

## Common Patterns

### Provider in Environment Variables

If issue body contains `AIHUBMIX_*`, add `provider:aihubmix`

### Multiple Provider Issues

If comparing providers (e.g., "works with OpenAI but not Gemini"), add both provider labels

### Desktop Issues

Desktop issues often need: `platform:desktop`, `electron`, specific `os:*`, and `deployment:client` or `deployment:server`

### Knowledge Base Issues

Usually need: `feature:knowledge-base`, often with `feature:files`, may need `provider:*` for embedding models

### Tool Calling Issues

Usually need: `feature:tool`, specific `provider:*`, may need `feature:mcp` if MCP-related

### Streaming Issues

Usually need: `feature:streaming`, specific `provider:*`, check for timeout/performance issues

## Example Triage

**Issue #8850**: "aihubmix 的优惠 app 没有生效"

**Analysis**:

- Title contains "aihubmix" → `provider:aihubmix`
- Template shows: Windows, Chrome, Docker, Client mode
- About API discount codes not working

**Labels Applied**:

```bash
gh issue edit 8850 --add-label "provider:aihubmix,platform:web,os:windows,deployment:client,hosting:self-host,docker"
gh issue edit 8850 --remove-label "unconfirm"
```

**Reasoning**: AIHubMix provider discount feature not working. Client mode deployment on Windows with Docker. Provider detection from title keyword "aihubmix".
