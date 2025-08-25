# Bedrock API Key Migration

## Quick Setup

1. **Get your Amazon Bedrock API key:**
   - Go to [AWS Bedrock Console](https://console.aws.amazon.com/bedrock/)
   - Navigate to **API keys** in the left panel
   - Generate a new API key (short-term recommended for production)

2. **Set environment variable:**
   ```bash
   AWS_BEARER_TOKEN_BEDROCK=your_api_key_here
   ```

3. **Optional - Set region:**
   ```bash
   AWS_REGION=us-west-2  # defaults to us-east-1
   ```

4. **Remove deprecated variables (optional):**
   ```bash
   # These are no longer used:
   # AWS_ACCESS_KEY_ID=...
   # AWS_SECRET_ACCESS_KEY=...
   ```

## How It Works

### Automatic Configuration Check
The migration uses a lightweight approach integrated into the existing prebuild process:

- **Build Integration**: Configuration check runs automatically during `npm run build`
- **Conditional Execution**: Only runs when Bedrock-related environment variables are present
- **Zero New Files**: 20-line function added to existing `scripts/prebuild.mts`
- **Immediate Feedback**: Shows configuration issues during build time

### What Gets Checked
- ✅ Validates `AWS_BEARER_TOKEN_BEDROCK` is set
- ⚠️ Warns about deprecated AWS credentials
- ❌ Verifies API key format
- 🔍 Only runs when relevant environment variables are detected

### Build Commands
```bash
# Local development (pnpm)
pnpm build        # includes Bedrock config validation in prebuild step
pnpm prebuild     # runs configuration check directly
pnpm dev          # includes prebuild validation

# Vercel deployment (bun)
bun run build     # includes Bedrock config validation in prebuild step
bun run prebuild  # runs configuration check directly
bun run dev       # includes prebuild validation
```

## API Key Types

- **Short-term** (recommended): Valid up to 12 hours
- **Long-term** (development): Valid up to 30 days

## Environment Variables

```bash
# Required
AWS_BEARER_TOKEN_BEDROCK=your_api_key_here

# Optional
AWS_REGION=us-west-2

# Deprecated (can be removed)
# AWS_ACCESS_KEY_ID=...
# AWS_SECRET_ACCESS_KEY=...
```

## Implementation Details

This migration uses a minimal approach:
- **Lightweight**: Only 20 lines of code added to existing prebuild script
- **Integrated**: No standalone migration scripts or UI components
- **Conditional**: Skips check when Bedrock isn't configured
- **Automatic**: Runs as part of normal build process

## Documentation

- [AWS Bedrock API Keys](https://docs.aws.amazon.com/bedrock/latest/userguide/api-keys.html)
- [How to use API keys](https://docs.aws.amazon.com/bedrock/latest/userguide/api-keys-use.html)