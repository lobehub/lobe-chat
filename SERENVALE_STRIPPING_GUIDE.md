# Serenvale Stripping Guide

This document tracks the transformation from LobeChat to Serenvale.

## 🎯 Philosophy

**Keep:** Infrastructure, RAG system, database, Electron setup, authentication framework
**Remove:** Chat UI, agent marketplace, web search, monitoring (for MVP)
**Adapt:** Settings, agent system (→ report templates), input system (→ dictation)

---

## ✅ KEEP (Critical Infrastructure)

### Desktop Application
- `apps/desktop/` - **KEEP ALL** - Electron app structure
  - Main process, IPC, window management
  - File system, local storage integration
  - PGLite initialization

### Database & RAG
- `packages/database/` - **KEEP ALL**
  - `schemas/rag.ts` - chunks, embeddings, documents
  - `schemas/document.ts` - document storage
  - `schemas/user.ts` - user and settings
  - `models/embedding.ts` - RAG semantic search
  - `models/chunk.ts` - document chunking
  - `models/file.ts` - file management

### AI/Model Integration
- `packages/model-runtime/` - **KEEP**
  - `providers/openai/` - Whisper, GPT-4o, embeddings API
  - Core runtime for model abstraction

### UI Libraries (npm packages)
- `@lobehub/ui` - **KEEP** - UI components
- `@lobehub/editor` - **KEEP** - Rich text editor for reports
- `@lobehub/tts` - **KEEP** - Audio recording and STT

### Core Features to Keep
- `src/app/[variants]/(main)/knowledge/` - **KEEP** - RAG/knowledge base UI
- `src/app/[variants]/(main)/chat/settings/` - **ADAPT** - Settings system
- `src/app/[variants]/(main)/_layout/` - **KEEP** - Layout system
- `src/store/user/` - **KEEP** - User state management
- `src/store/file/` - **KEEP** - File management
- `src/store/agent/` - **ADAPT → reportTemplates** - Agent system becomes report templates
- `src/features/ChatInput/` - **ADAPT → ReportInput** - Text/dictation input
- `src/libs/trpc/` - **KEEP** - API layer
- `src/server/routers/` - **KEEP & SIMPLIFY** - Backend routes
- `src/server/services/` - **KEEP SELECTIVE** - Backend services

### Authentication Framework
- `src/libs/trpc/middleware/userAuth.ts` - **KEEP** - Already supports DESKTOP_USER_ID
- Desktop mode: No auth (userId = DESKTOP_USER_ID)
- Server mode: NextAuth integration

---

## ❌ REMOVE (Chat-Specific Features)

### Chat UI
- `src/app/[variants]/(main)/chat/(workspace)/` - **DELETE**
  - Chat conversation UI
  - Message bubbles, streaming
  - Chat-specific layouts

### Agent Marketplace
- `src/app/[variants]/(main)/discover/` - **DELETE**
  - Agent marketplace
  - Discovery features
  - Public agent sharing

### Chat State Management
- `src/store/chat/slices/message/` - **DELETE** - Message threading
- `src/store/chat/slices/aiChat/` - **SELECTIVE** - Keep RAG logic, remove chat
- `src/store/chat/slices/topic/` - **DELETE** - Chat topics

### Chat Features
- `src/features/Conversation/` - **DELETE** - Chat conversation components
- `src/features/ChatInput/ActionBar/` - **SELECTIVE** - Remove plugins, keep mic

### Docker Services (MVP)
- `docker-compose/local/searxng/` - **REMOVE** - Web search (not needed)
- `docker-compose/local/grafana/` - **REMOVE** - Monitoring (add later)
- `docker-compose/local/casdoor/` - **REMOVE FOR MVP** - Auth (desktop mode doesn't need)
- `docker-compose/local/logto/` - **REMOVE** - Alternative auth
- `docker-compose/local/zitadel/` - **REMOVE** - Alternative auth

---

## 🔄 ADAPT (Transform for Serenvale)

### Agent System → Report Templates
**Current:** `src/store/agent/`
**New Purpose:** Report templates (IRM, TDM, etc.)

```typescript
// OLD: Chat Agent
{
  name: "Code Assistant",
  systemRole: "You are a coding expert...",
  knowledgeBase: ["docs"]
}

// NEW: Report Template
{
  name: "IRM Cérébrale",
  systemRole: "You are a French radiology AI specializing in brain MRI...",
  reportStructure: "TECHNIQUE, FINDINGS, IMPRESSION",
  knowledgeBase: ["irm-medical-terms", "past-irm-reports"]
}
```

### ChatInput → ReportInput
**Current:** `src/features/ChatInput/`
**Adaptation:**
- Keep: Text input, keyboard shortcuts
- Remove: Plugin buttons, image upload
- Add: Microphone button, Whisper integration
- Add: Exam type selector (IRM, TDM, Echo, etc.)

### Settings
**Current:** `src/app/[variants]/(main)/chat/settings/`
**Adaptation:**
- Remove: Chat-specific settings
- Add: PACS configuration (IP, port, AE title, credentials)
- Add: Clinic information (name, address, logo, NIF)
- Add: Doctor information (name, signature, stamp)
- Add: Report templates editor
- Keep: OpenAI API key configuration

---

## 🏗️ BUILD (New Serenvale Features)

### Worklist
- `src/app/[variants]/(main)/worklist/` - **NEW**
  - Patient list from PACS
  - Columns: Patient Name, ID, Exam Date, Exam Type
  - Launch Weasis button

### Dictation
- `src/features/DictationInput/` - **NEW**
  - Microphone recording UI
  - Waveform visualization
  - Whisper API integration
  - Fallback to text input

### PACS Integration
- `src/server/modules/HL7Client/` - **NEW**
  - DICOM C-FIND / HL7 MLLP client
  - Query worklist (MWL)
  - Node.js implementation (runs in Electron main process)

### Weasis Launcher
- `src/server/modules/WeasisLauncher/` - **NEW**
  - Generate `weasis://` URI
  - Launch local Weasis app
  - Pass study UID, patient ID

### Report Generation
- `src/features/ReportEditor/` - **NEW** (using @lobehub/editor)
  - Template engine (merge patient data)
  - Medical terms autocomplete (from RAG)
  - PDF export
  - Print with clinic letterhead

### Medical Terms Manager
- `src/features/MedicalTermsManager/` - **NEW**
  - Add/edit medical terminology
  - Categorize by exam type
  - Auto-embed into RAG
  - Import/export dictionary

---

## 📦 Docker Compose Strategy

### Desktop Mode (MVP)
**No Docker needed** - Everything runs in the Electron app:
- PGLite (embedded PostgreSQL)
- Local file system
- No authentication

### Server Mode (Future)
**Use:** `docker-compose.serenvale.yml`
- PostgreSQL (with pgvector)
- MinIO
- Serenvale app container
- (Later: Casdoor for auth, Grafana for monitoring)

---

## 🔐 Authentication Strategy

### Phase 1 (MVP - Desktop)
```typescript
const userId = DESKTOP_USER_ID; // Fixed user, no auth
```

### Phase 2 (Server)
```typescript
const userId = session?.userId || DESKTOP_USER_ID;
// If logged in → real user ID
// If local → fallback to desktop user
```

**Database schema remains identical!** Just swap the userId.

---

## 📊 File Removal Checklist

### Safe to Delete
- [ ] `src/app/[variants]/(main)/chat/(workspace)/`
- [ ] `src/app/[variants]/(main)/discover/`
- [ ] `src/store/chat/slices/message/`
- [ ] `src/store/chat/slices/topic/`
- [ ] `src/features/Conversation/`
- [ ] `docker-compose/local/searxng/`
- [ ] `docker-compose/local/grafana/` (keep config for later)
- [ ] `docker-compose/local/casdoor/` (keep config for later)
- [ ] `docker-compose/local/logto/`
- [ ] `docker-compose/local/zitadel/`

### Adapt (Don't Delete)
- [ ] `src/store/agent/` → Rename to `src/store/reportTemplate/`
- [ ] `src/features/ChatInput/` → Adapt to `src/features/ReportInput/`
- [ ] `src/app/[variants]/(main)/chat/settings/` → Adapt for Serenvale settings

### Keep Everything Else
- [x] `apps/desktop/`
- [x] `packages/database/`
- [x] `packages/model-runtime/`
- [x] `src/app/[variants]/(main)/knowledge/`
- [x] `src/libs/trpc/`
- [x] `src/server/routers/`
- [x] `docker-compose/local/docker-compose.yml` (PostgreSQL + MinIO only)

---

## 🧪 Testing Checklist

After stripping, verify:
- [ ] Desktop app launches
- [ ] PGLite initializes
- [ ] RAG models work (embedding, chunk, document)
- [ ] Settings page loads
- [ ] Knowledge base UI accessible
- [ ] DESKTOP_USER_ID authentication works
- [ ] File storage works
- [ ] OpenAI API integration works

---

## 📝 Next Steps

1. Remove chat workspace UI
2. Remove discover/marketplace
3. Clean up docker-compose
4. Test that core infrastructure works
5. Begin building Serenvale features:
   - Worklist
   - Dictation
   - PACS integration
   - Report templates

---

## 🎯 Success Criteria

Serenvale MVP is ready when:
- ✅ Desktop app runs standalone (no server)
- ✅ Doctor can add medical terms → RAG
- ✅ Doctor can dictate → Whisper → RAG-enhanced text
- ✅ Doctor can type directly (mic fallback)
- ✅ Report generated with clinic template
- ✅ Past reports feed back into RAG
- ✅ Zero chat features remain
- ✅ Code is 50%+ smaller than LobeChat
