# LobeChat Vietnam Market Development Environment Setup Guide

## Overview

This comprehensive guide establishes a fully functional local LobeChat development environment optimized for Vietnam market testing and validation. This setup supports your $34,000 development budget allocation by enabling thorough UI/UX testing, feature validation, and performance assessment.

## System Requirements

### Minimum Requirements

- **OS**: Windows 10/11, macOS 10.15+, or Linux (Ubuntu 18.04+)
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 10GB free space
- **CPU**: 4 cores minimum, 8 cores recommended
- **Network**: Stable internet connection for AI model providers

### Required Software

- **Node.js**: v18.17+ or v20+ (LTS recommended)
- **pnpm**: v8.0+ (package manager)
- **Bun**: v1.0+ (script runner)
- **Git**: Latest version
- **Docker**: v20.10+ with Docker Compose v2.0+
- **PostgreSQL**: v14+ (or use Docker setup)

## Quick Start (Client-Side Mode)

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/lobehub/lobe-chat.git
cd lobe-chat

# Install dependencies
pnpm install

# Start development server
bun run dev
```

Access at: `http://localhost:3010`

### 2. Basic Configuration

Create `.env.local` file:

```bash
# Basic AI Provider (required for testing)
OPENAI_API_KEY=sk-your-openai-key-here

# Optional: Access code for security
ACCESS_CODE=your-secure-code

# Vietnam-specific settings
NEXT_PUBLIC_DEFAULT_LANG=vi-VN
```

## Full Server-Side Setup (Recommended for Vietnam Market Testing)

### 1. Environment Setup

```bash
# Copy development environment template
cp .env.example.development .env.development

# Edit the file with your specific settings
```

### 2. Start Docker Services

```bash
# Start all required services
docker-compose -f docker-compose.development.yml up -d

# Verify services are running
docker-compose -f docker-compose.development.yml ps
```

### 3. Database Migration

```bash
# Run database migrations
pnpm db:migrate
```

### 4. Start Development Server

```bash
# Start LobeChat in server mode
pnpm dev
```

## Vietnam Market-Specific Configuration

### 1. Vietnamese Localization

The system already includes complete Vietnamese translations in `locales/vi-VN/`. To set Vietnamese as default:

```bash
# In your .env file
NEXT_PUBLIC_DEFAULT_LANG=vi-VN
```

### 2. Currency and Pricing Configuration

For testing Vietnamese pricing (29,000 VND model):

```bash
# Custom pricing configuration
DEFAULT_AGENT_CONFIG='{"model":"gpt-3.5-turbo","temperature":0.7,"pricing":{"currency":"VND","rate":29000}}'
```

### 3. Mobile-First Testing Setup

Enable mobile debugging:

```bash
# Add to .env
NEXT_PUBLIC_ENABLE_MOBILE_DEBUG=1
```

### 4. Voice Features for Language Learning

Configure TTS/STT for Vietnamese:

```bash
# Enable voice features
NEXT_PUBLIC_ENABLE_TTS=1
NEXT_PUBLIC_ENABLE_STT=1

# Vietnamese voice settings
TTS_DEFAULT_VOICE=vi-VN-HoaiMyNeural
STT_DEFAULT_LANGUAGE=vi-VN
```

## AI Model Provider Configuration

### 1. Multiple Provider Testing

Configure multiple providers for comprehensive testing:

```bash
# OpenAI
OPENAI_API_KEY=sk-your-key
OPENAI_PROXY_URL=https://api.openai.com/v1

# Anthropic
ANTHROPIC_API_KEY=sk-ant-your-key

# Google AI
GOOGLE_API_KEY=your-google-key

# Local Ollama (for offline testing)
OLLAMA_PROXY_URL=http://localhost:11434/v1
```

### 2. Model List Customization

```bash
# Customize available models for Vietnam market
OPENAI_MODEL_LIST=gpt-3.5-turbo,gpt-4,gpt-4-turbo
```

## Testing Infrastructure Setup

### 1. Run Test Suite

```bash
# Run all tests
bun run test

# Run specific test patterns
bunx vitest run --silent='passed-only' 'src/components/**/*.test.ts'

# Run with coverage
bun run test-app:coverage
```

### 2. Mobile Responsiveness Testing

```bash
# Install mobile testing tools
pnpm add -D @testing-library/jest-dom @testing-library/react

# Run mobile-specific tests
bunx vitest run --silent='passed-only' 'src/components/mobile/**'
```

### 3. Vietnamese Text Rendering Tests

```bash
# Test Vietnamese character rendering
bunx vitest run --silent='passed-only' 'src/locales/vi-VN/**'
```

## Performance Monitoring Setup

### 1. Enable Performance Tracking

```bash
# Add to .env
NEXT_PUBLIC_ENABLE_SENTRY=1
NEXT_PUBLIC_VERCEL_ANALYTICS=1
```

### 2. Local Performance Testing

```bash
# Build and analyze bundle
bun run build:analyze

# Performance testing
bun run lighthouse
```

### 3. API Rate Limiting Simulation

```bash
# Configure rate limiting for testing
API_RATE_LIMIT=100
API_RATE_WINDOW=3600
```

## File Upload and Knowledge Base Testing

### 1. Configure S3 Storage (MinIO for local)

The Docker setup includes MinIO. Access at:

- **MinIO Console**: `http://localhost:9001`
- **Credentials**: admin / CHANGE_THIS_PASSWORD_IN_PRODUCTION

### 2. Test File Upload Features

```bash
# Enable file upload testing
S3_BUCKET=lobe
S3_ENDPOINT=http://localhost:9000
S3_PUBLIC_DOMAIN=http://localhost:9000
```

## Service URLs and Access Points

When running the full setup:

| Service       | URL                     | Purpose            |
| ------------- | ----------------------- | ------------------ |
| LobeChat      | <http://localhost:3010> | Main application   |
| PostgreSQL    | localhost:5432          | Database           |
| MinIO Console | <http://localhost:9001> | File storage admin |
| Casdoor       | <http://localhost:8000> | Authentication     |
| SearXNG       | <http://localhost:8080> | Search engine      |

## Vietnam Market Testing Checklist

### 1. Localization Testing

- [ ] Vietnamese UI translation completeness
- [ ] Currency display (VND)
- [ ] Date/time formatting
- [ ] Number formatting
- [ ] RTL text handling (if applicable)

### 2. Mobile Experience Testing

- [ ] Touch interface responsiveness
- [ ] Screen size adaptation (320px to 1920px)
- [ ] Gesture support
- [ ] Offline functionality
- [ ] PWA installation

### 3. Voice Features Testing

- [ ] Vietnamese TTS quality
- [ ] Vietnamese STT accuracy
- [ ] Language learning scenarios
- [ ] Audio quality on mobile devices

### 4. Educational Use Cases

- [ ] File upload for study materials
- [ ] Knowledge base creation
- [ ] Multi-user collaboration
- [ ] Session sharing capabilities

### 5. Performance Testing

- [ ] Load time optimization
- [ ] API response times
- [ ] Mobile network performance
- [ ] Offline capability

## Troubleshooting

### Common Issues

#### Port Conflicts

```bash
# Check port usage
lsof -i :3010 # LobeChat
lsof -i :5432 # PostgreSQL
lsof -i :9000 # MinIO
```

#### Database Connection Issues

```bash
# Reset database
docker-compose -f docker-compose.development.yml down -v
docker-compose -f docker-compose.development.yml up -d
pnpm db:migrate
```

#### Memory Issues

```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=6144"
```

### Performance Optimization

```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules and reinstall
pnpm reinstall
```

## Environment Variables Reference

### Core Configuration

```bash
# Service mode
NEXT_PUBLIC_SERVICE_MODE=server

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/lobechat
KEY_VAULTS_SECRET=your-32-char-secret-key

# Authentication
NEXT_PUBLIC_ENABLE_NEXT_AUTH=1
NEXT_AUTH_SECRET=your-auth-secret
```

### AI Providers

```bash
# OpenAI
OPENAI_API_KEY=sk-your-key
OPENAI_PROXY_URL=https://api.openai.com/v1

# Anthropic
ANTHROPIC_API_KEY=sk-ant-your-key

# Google
GOOGLE_API_KEY=your-google-key
```

### Storage Configuration

```bash
# S3/MinIO
S3_ACCESS_KEY_ID=admin
S3_SECRET_ACCESS_KEY=your-password
S3_ENDPOINT=http://localhost:9000
S3_BUCKET=lobe
S3_PUBLIC_DOMAIN=http://localhost:9000
```

### Vietnam-Specific Settings

```bash
# Localization
NEXT_PUBLIC_DEFAULT_LANG=vi-VN

# Currency
DEFAULT_CURRENCY=VND

# Voice features
TTS_DEFAULT_VOICE=vi-VN-HoaiMyNeural
STT_DEFAULT_LANGUAGE=vi-VN
```

## Next Steps

1. **Complete this setup** to establish your testing environment
2. **Configure PayOS integration** for Vietnamese payment testing
3. **Set up performance monitoring** for production readiness assessment
4. **Create comprehensive test scenarios** for market validation

This environment provides the foundation for thorough evaluation of LobeChat's suitability for the Vietnamese market and supports informed decision-making for your development investment.
