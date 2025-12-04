# @lobechat/memory-extract

Memory extraction and gatekeeper utilities for LobeChat.

## Features

- **BaseMemoryExtractor**: Abstract base class for all memory extractors with template rendering
- **UserMemoryGateKeeper**: Analyzes conversations to determine which memory layers should be extracted
- **Four Memory Extractors**: Identity, Context, Preference, and Experience extractors (coming soon)
- Support for multiple AI providers via `@lobechat/model-runtime`
- Template variable support with `{{ props.xxx }}` syntax
- Batch processing via scripts

## Architecture

### BaseMemoryExtractor

All extractors inherit from `BaseMemoryExtractor`, which provides:

1. **Template Rendering**: Automatically renders prompts with `{{ props.xxx }}` variables
2. **Runtime Management**: Handles ModelRuntime initialization and configuration
3. **Structured Output**: Uses `generateObject()` for type-safe extraction
4. **Template Loading**: Loads prompts from `prompts/` directory

### Extractor Lifecycle

```typescript
// 1. Load prompt template
await extractor.loadPromptTemplate();

// 2. Build system prompt with props
const system = extractor.buildSystemPrompt(options);

// 3. Build user prompt with conversation
const user = extractor.buildUserPrompt(conversationText);

// 4. Call LLM with structured output
const result = await runtime.generateObject({ messages, schema });

// 5. Validate with Zod schema
return ResultSchema.parse(result);
```

## Usage

### As a Package

#### GateKeeper

```typescript
import { UserMemoryGateKeeper } from '@lobechat/memory-extract';

const gatekeeper = new UserMemoryGateKeeper({
  provider: 'openai',
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4o-mini',
});

const result = await gatekeeper.check(messages, {
  topK: 10,
  retrievedContext: 'Previous user memories...',
});

console.log(result);
// {
//   identity: { shouldExtract: true, reasoning: '...' },
//   context: { shouldExtract: false, reasoning: '...' },
//   preference: { shouldExtract: true, reasoning: '...' },
//   experience: { shouldExtract: false, reasoning: '...' }
// }
```

#### Custom Extractor

```typescript
import { BaseMemoryExtractor, ExtractorConfig } from '@lobechat/memory-extract';
import { z } from 'zod';

const MySchema = z.object({ data: z.string() });

class MyExtractor extends BaseMemoryExtractor<z.infer<typeof MySchema>> {
  protected getPromptFileName() {
    return 'my-prompt.md';
  }

  protected getSchema() {
    return {
      name: 'my_extraction',
      schema: { type: 'object', properties: { data: { type: 'string' } } },
      strict: true,
    };
  }

  protected getResultSchema() {
    return MySchema;
  }

  protected buildUserPrompt(conversationText: string) {
    return `Extract from: ${conversationText}`;
  }
}
```

### Running the GateKeeper Script

The package includes a script to batch process conversations from JSON files.

#### 1. Set up environment variables

Create a `.env` file in the package root (or set environment variables):

```bash
cp .env.example .env
# Edit .env and add your API key
```

`.env` file content:

```bash
OPENAI_API_KEY=your_api_key
# Optional: customize provider, model, or base URL
EXTRACT_PROVIDER=openai                    # default: openai
EXTRACT_MODEL=gpt-4o-mini                  # default: gpt-4o-mini
EXTRACT_BASE_URL=https://api.openai.com/v1 # optional
```

#### 2. Prepare input data

Create JSON files in `datasets/inputs/` directory. Each file should have the following structure:

```json
{
  "messages": [
    {
      "role": "user",
      "content": "Your message content here"
    },
    {
      "role": "assistant",
      "content": "Assistant response here"
    }
  ],
  "options": {
    "topK": 10,
    "retrievedContext": "Optional: Previous similar memories"
  }
}
```

See `datasets/inputs/example.json` for a complete example.

#### 3. Run the script

```bash
pnpm gatekeeper
```

#### 4. Check results

The script will process all JSON files in `datasets/inputs/` and write results to `datasets/outputs/` with the same filename.

**Note**: The script automatically skips files that have already been processed (output file exists). This allows you to run the script multiple times without re-processing existing files.

Output format:

```json
{
  "input": {
    "messages": [...],
    "options": {...}
  },
  "output": {
    "identity": { "shouldExtract": true, "reasoning": "..." },
    "context": { "shouldExtract": false, "reasoning": "..." },
    "preference": { "shouldExtract": true, "reasoning": "..." },
    "experience": { "shouldExtract": false, "reasoning": "..." }
  },
  "metadata": {
    "provider": "openai",
    "model": "gpt-4o-mini",
    "processedAt": "2025-01-24T10:00:00.000Z"
  }
}
```

## Memory Layers

The gatekeeper evaluates four memory layers:

- **Identity**: Information about actors, relationships, and personal attributes
- **Context**: Situational frameworks and ongoing situations
- **Preference**: Durable user choices and behavioral directives
- **Experience**: Learned insights and practical knowledge

## Template Variables

Prompts support template variable substitution with the following syntax:

```markdown
# Simple variable

{{ props.username }}

# With default value (nullish coalescing)

{{ props.topK ?? 10 }}

# With fallback (logical OR)

{{ props.retrievedContext || 'No similar memories retrieved.' }}

# Array join

{{ props.availableCategories.join(', ') }}
```

### Supported Variables

- `username`: Current user name
- `sessionDate`: Current session date (ISO format)
- `language`: Target language for extraction (default: 'Chinese')
- `topK`: Number of similar memories to retrieve (default: 10/15)
- `retrievedContext`: Previously retrieved similar memories
- `existingContext`: Existing memories for update/delete operations
- `availableCategories`: List of available memory categories

## Configuration

### ExtractorConfig

```typescript
interface ExtractorConfig {
  provider: string; // AI provider name (e.g., 'openai', 'anthropic')
  apiKey?: string; // API key for the provider
  baseURL?: string; // Optional: Custom base URL
  model?: string; // Model name (default: 'gpt-4.1-mini')
}
```

### ExtractorOptions

```typescript
interface ExtractorOptions {
  username?: string; // Current user name
  sessionDate?: string; // Current session date (ISO format)
  language?: string; // Target language (default: 'Chinese')
  topK?: number; // Number of similar memories (default: 15)
  retrievedContext?: string; // Previously retrieved similar memories
  existingContext?: string; // Existing memories for CRUD operations
  availableCategories?: string[]; // Available memory categories
}
```

## Script Features

The gatekeeper script includes several useful features:

- ✅ **Batch Processing**: Processes all JSON files in the input directory
- ✅ **Skip Existing Files**: Automatically skips files that have already been processed (output file exists)
- ✅ **Progress Indicators**: Shows real-time progress with spinners using ora
- ✅ **Error Handling**: Continues processing other files even if one fails
- ✅ **Summary Statistics**: Displays a summary at the end showing:
  - Number of files processed
  - Number of files skipped
  - Number of files failed

Example output:

```
✔ Found 10 input file(s)
ℹ Skipped file1.json (already exists)
ℹ Skipped file2.json (already exists)
✔ Processed file3.json
✖ Failed to process file4.json: API error
✔ All done! ✓ Processed: 1 | ℹ Skipped: 2 | ✖ Failed: 1
```
