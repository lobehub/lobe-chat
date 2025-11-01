# 📋 Načrt poenostavitve lobe-chat na minimalni chat

> **Posodobljen načrt z opcijskimi funkcionalnostmi**
>
> Ta načrt uporablja **Feature Flags** pristop, kjer MCP in RAG funkcionalnosti
> **NISO ODSTRANJENE**, ampak samo **DISABLED po defaultu**. To pomeni:
> - Minimalna aplikacija po buildu (vse disabled)
> - Možnost vključitve MCP/RAG z environment variables
> - Ni potrebe za code changes - samo config
> - Enostavna nadgradnja kasneje

## 🎯 Cilj
Poenostaviti lobe-chat na minimalno chat aplikacijo z:
- ✅ Samo OpenAI provider
- ✅ Trenutna avtentikacija (NextAuth/Clerk/Logto/OIDC)
- ✅ Agenti, Teme, Session groups
- ✅ Export/Import funkcionalnost
- ✅ Samo PGLite (client-side DB)
- ⚡ MCP in RAG - opcijsko (disabled po defaultu, lahko vključiš kasneje)
- ❌ Brez marketplace, pluginov, image gen, voice, search, chat groups

---

## 📦 FAZA 0: Feature Flags Sistem

### 0.1 Ustvari Feature Flags konfiguracija
**Lokacija**: `src/config/featureFlags.ts`

**Ustvari novo datoteko:**
```typescript
/**
 * Feature Flags - Enable/Disable optional features
 */
export const FEATURE_FLAGS = {
  // Optional features - disabled by default
  ENABLE_MCP: process.env.NEXT_PUBLIC_ENABLE_MCP === 'true',
  ENABLE_RAG: process.env.NEXT_PUBLIC_ENABLE_RAG === 'true',
  ENABLE_FILE_UPLOAD: process.env.NEXT_PUBLIC_ENABLE_FILE_UPLOAD === 'true',

  // Features that can be removed entirely
  ENABLE_PLUGINS: false,
  ENABLE_IMAGE_GENERATION: false,
  ENABLE_VOICE: false,
  ENABLE_WEB_SEARCH: false,
  ENABLE_CHAT_GROUPS: false,
  ENABLE_MARKETPLACE: false,
} as const;

export type FeatureFlag = keyof typeof FEATURE_FLAGS;

/**
 * Check if a feature is enabled
 */
export const isFeatureEnabled = (feature: FeatureFlag): boolean => {
  return FEATURE_FLAGS[feature];
};
```

### 0.2 Posodobi environment variables
**Lokacija**: `.env.example`

**Dodaj:**
```env
# Optional Features (disabled by default)
NEXT_PUBLIC_ENABLE_MCP=false
NEXT_PUBLIC_ENABLE_RAG=false
NEXT_PUBLIC_ENABLE_FILE_UPLOAD=false
```

### 0.3 Ustvari Feature Guard komponento
**Lokacija**: `src/components/FeatureGuard/index.tsx`

```typescript
import { type FC, type ReactNode } from 'react';
import { isFeatureEnabled, type FeatureFlag } from '@/config/featureFlags';

interface FeatureGuardProps {
  feature: FeatureFlag;
  children: ReactNode;
  fallback?: ReactNode;
}

export const FeatureGuard: FC<FeatureGuardProps> = ({
  feature,
  children,
  fallback = null
}) => {
  if (!isFeatureEnabled(feature)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
```

### 0.4 Implementacija napotki
**Uporaba Feature Flags:**
1. Za UI komponente: uporabi `<FeatureGuard>` komponento
2. Za API routers: dodaj checks na začetku endpoint-ov
3. Za services: lazy load samo če je feature enabled
4. Za database modele: obdrži sheme, vendar ne uporabljaj če disabled

**Primer uporabe:**
```typescript
// V React komponenti
<FeatureGuard feature="ENABLE_MCP">
  <MCPSettings />
</FeatureGuard>

// V tRPC router
if (!isFeatureEnabled('ENABLE_RAG')) {
  throw new TRPCError({ code: 'FORBIDDEN', message: 'RAG is disabled' });
}

// V service
if (isFeatureEnabled('ENABLE_MCP')) {
  await initializeMCP();
}
```

---

## 📦 FAZA 1: Odstranitev UI strani in routing-a

### 1.1 Odstrani glavne strani
**Lokacija**: `src/app/[variants]/(main)/`

**Odstrani celotne direktorije:**
```
✗ discover/          # Marketplace za assistants, models, providers
✗ image/            # Text-to-image generacija
✗ profile/          # User profile (lahko poenostaviš na basic verzijo)
✗ labs/             # Experimental features
✗ changelog/        # Changelog
```

**Obdrži z Feature Guards:**
```
~ knowledge/         # Obdrži, dodaj FeatureGuard za ENABLE_RAG
```

**Ohrani:**
```
✓ chat/             # Osnovni chat
✓ settings/         # Poenostavljena verzija (samo OpenAI provider, common, agent)
```

### 1.2 Poenostavi Settings strani
**Lokacija**: `src/app/[variants]/(main)/settings/`

**Odstrani:**
```
✗ provider/ (vse razen openai page)
✗ modal-image/      # Image generation settings
✗ tts/              # Text-to-speech settings
✗ storage/          # Storage settings (ker imaš samo client DB)
```

**Poenostavi:**
```
~ provider/         # Obdrži samo OpenAI konfiguracija
~ common/           # Obdrži appearance, language, hotkeys
~ agent/            # Obdrži default agent settings
~ sync/             # Odstrani (ni server sync)
```

---

## 📦 FAZA 2: Odstranitev Features komponent

### 2.1 Odstrani celotne feature module
**Lokacija**: `src/features/`

**Odstrani:**
```
✗ PluginStore/
✗ PluginManager/
✗ PluginGateway/
✗ ImageGeneration/
✗ VoiceChat/
✗ WebSearch/
✗ ChatGroup/
✗ DiscoverMarket/
✗ Labs/
✗ Changelog/
```

**Obdrži z Feature Guards (za opcijske funkcionalnosti):**
```
~ MCP/               # Obdrži, dodaj guards za ENABLE_MCP
~ KnowledgeBase/     # Obdrži, dodaj guards za ENABLE_RAG
~ FileManager/       # Obdrži, dodaj guards za ENABLE_FILE_UPLOAD
~ FileViewer/        # Obdrži, dodaj guards za ENABLE_FILE_UPLOAD
```

**Ohrani in preveri:**
```
✓ Conversation/      # Chat UI
✓ ChatInput/         # Input komponenta
✓ ChatItem/          # Message display
✓ SessionList/       # Session sidebar
✓ TopicList/         # Topics
✓ AgentConfig/       # Agent nastavitve
✓ ShareModal/        # Za export funkcionalnost
```

---

## 📦 FAZA 3: Čiščenje Database modelov

### 3.1 Odstrani neuporabljene modele
**Lokacija**: `packages/database/src/models/`

**Odstrani:**
```
✗ plugin.ts
✗ generation.ts
✗ generationBatch.ts
✗ generationTopic.ts
✗ chatGroup.ts
```

**Obdrži (za opcijske funkcionalnosti - MCP/RAG):**
```
~ knowledgeBase.ts   # Za ENABLE_RAG
~ file.ts            # Za ENABLE_FILE_UPLOAD in ENABLE_RAG
~ document.ts        # Za ENABLE_RAG
~ chunk.ts           # Za ENABLE_RAG
~ embedding.ts       # Za ENABLE_RAG
```

**Ohrani:**
```
✓ user.ts
✓ session.ts
✓ sessionGroup.ts
✓ message.ts
✓ topic.ts
✓ thread.ts
✓ agent.ts
✓ aiProvider.ts (samo OpenAI)
✓ aiModel.ts (samo OpenAI models)
✓ asyncTask.ts (za export)
✓ oauth.ts (za auth)
```

### 3.2 Poenostavi Database schema
**Lokacija**: `packages/database/src/schemas/`

**Odstrani sheme za:**
- plugin
- generation, generationBatch, generationTopic
- chatGroup

**Obdrži sheme za RAG/MCP** (disabled po defaultu, vendar dostopne če vključiš):
- knowledgeBase, file, document, chunk, embedding

---

## 📦 FAZA 4: Čiščenje Services

### 4.1 Odstrani client services
**Lokacija**: `src/services/`

**Odstrani:**
```
✗ plugin/
✗ image/
✗ voice/
✗ search/
✗ chatGroup/
✗ discover/
✗ market/
```

**Obdrži z Feature Guards:**
```
~ knowledgeBase/     # Za ENABLE_RAG
~ file/              # Za ENABLE_FILE_UPLOAD in ENABLE_RAG
```

**Ohrani:**
```
✓ session/
✓ message/
✓ topic/
✓ thread/
✓ agent/
✓ user/
✓ config/
✓ export/
✓ import/
```

### 4.2 Odstrani server services
**Lokacija**: `src/server/services/`

**Odstrani:**
```
✗ comfyui.ts
✗ discover.ts
✗ generation.ts
✗ search.ts
```

**Obdrži z Feature Guards:**
```
~ chunk.ts           # Za ENABLE_RAG
~ document.ts        # Za ENABLE_RAG
~ file.ts            # Za ENABLE_FILE_UPLOAD in ENABLE_RAG
~ mcp.ts             # Za ENABLE_MCP
```

**Ohrani:**
```
✓ user.ts
✓ agent.ts
✓ aiChat.ts
✓ nextAuthUser.ts (za auth)
✓ oidc.ts (za auth)
```

---

## 📦 FAZA 5: Čiščenje API Routers

### 5.1 Poenostavi tRPC routers
**Lokacija**: `src/server/routers/lambda/`

**Odstrani:**
```
✗ plugin.ts
✗ generation.ts
✗ image.ts
✗ market.ts
✗ chatGroup.ts
```

**Obdrži z Feature Guards:**
```
~ knowledgeBase.ts   # Dodaj guards za ENABLE_RAG
~ chunk.ts           # Dodaj guards za ENABLE_RAG
~ document.ts        # Dodaj guards za ENABLE_RAG
~ file.ts            # Dodaj guards za ENABLE_FILE_UPLOAD
```

**Ohrani:**
```
✓ session.ts
✓ message.ts
✓ topic.ts
✓ thread.ts
✓ agent.ts
✓ user.ts
✓ config.ts
✓ exporter.ts
✓ importer.ts
✓ aiModel.ts (poenostavljen za samo OpenAI)
✓ aiProvider.ts (poenostavljen za samo OpenAI)
✓ aiChat.ts
```

### 5.2 Odstrani async router features
**Lokacija**: `src/server/routers/async/`

**Odstrani:**
```
✗ generation.ts
```

**Obdrži z Feature Guards:**
```
~ rag.ts             # Dodaj guards za ENABLE_RAG
~ file.ts            # Dodaj guards za ENABLE_FILE_UPLOAD
```

### 5.3 Poenostavi tools router
**Lokacija**: `src/server/routers/tools/`

**Odstrani:**
```
✗ search.ts
```

**Obdrži z Feature Guards:**
```
~ mcp.ts             # Dodaj guards za ENABLE_MCP
```

---

## 📦 FAZA 6: Čiščenje WebAPI (REST endpoints)

### 6.1 Odstrani REST API endpoints
**Lokacija**: `src/app/(backend)/webapi/`

**Odstrani:**
```
✗ plugin/
✗ text-to-image/
✗ create-image/
✗ tts/
✗ stt/
✗ search/
```

**Ohrani:**
```
✓ chat/[provider]/    # Poenostavi - samo OpenAI
✓ models/[provider]/  # Poenostavi - samo OpenAI
✓ tokenizer/
```

### 6.2 Odstrani chat providerje
**Lokacija**: `src/app/(backend)/webapi/chat/`

**Odstrani vse razen:**
```
✓ openai/
```

Odstrani:
```
✗ anthropic/, azure/, bedrock/, google/, ollama/, itd.
```

---

## 📦 FAZA 7: Poenostavitev Model Runtime

### 7.1 Odstrani nepotrebne AI providerje
**Lokacija**: `packages/model-runtime/src/providers/`

**Obdrži samo:**
```
✓ openai/
```

**Odstrani vse ostale:**
```
✗ anthropic/, azure/, bedrock/, google/, ollama/, mistral/, itd.
```

### 7.2 Posodobi AI Model Bank
**Lokacija**: `packages/model-bank/src/aiModels/`

**Obdrži samo:**
```
✓ openai.ts
```

Odstrani vse ostale provider config fajle.

---

## 📦 FAZA 8: Čiščenje Third-party integracij

### 8.1 Obdrži libs za opcijske funkcionalnosti
**Lokacija**: `src/libs/`

**Odstrani:**
```
(nič - vse potrebne libs ohranjamo za opcijske funkcionalnosti)
```

**Obdrži (za opcijske funkcionalnosti):**
```
~ langchain/        # Za ENABLE_RAG
~ mcp/              # Za ENABLE_MCP
```

**Ohrani:**
```
✓ nextAuth/         # Auth
✓ clerk/            # Auth (če uporabljaš)
✓ swr/              # Data fetching
✓ traces/           # Telemetry (opcijsko)
✓ analytics/        # Analytics (opcijsko)
```

### 8.2 Odstrani server modules
**Lokacija**: `src/server/modules/`

**Odstrani:**
```
✗ AssistantStore/
✗ PluginStore/
✗ ElectronIPCClient/ (če ne potrebuješ desktop app)
```

**Obdrži (za opcijske funkcionalnosti):**
```
~ ContentChunk/     # Za ENABLE_RAG
~ S3/               # Za ENABLE_FILE_UPLOAD (opcijsko)
```

**Ohrani:**
```
✓ ModelRuntime/     # Poenostavljen za samo OpenAI
✓ KeyVaultsEncrypt/ # Za API key encryption
✓ EdgeConfig/       # Konfiguracija
```

---

## 📦 FAZA 9: Odstranitev Server DB funkcionalnosti

### 9.1 Odstrani PostgreSQL/Neon integration
**Lokacija**: Različne lokacije

**Posodobitve:**
```
1. packages/database/drizzle.config.ts
   - Odstrani PostgreSQL config

2. src/services/*/server.ts
   - Odstrani vse server-side DB operacije
   - Vse operacije naj gredo skozi client.ts z PGLite

3. src/server/routers/
   - Poenostavi vse routerje da uporabljajo samo client DB

4. .env variables
   - Odstrani DATABASE_URL, NEON_* variables
```

### 9.2 Poenostavi Database Provider
**Lokacija**: `packages/database/src/client.ts`

**Ohrani samo PGLite:**
```typescript
// Odstrani PostgreSQL client logic
// Obdrži samo PGLite initialization
```

---

## 📦 FAZA 10: Čiščenje Desktop App (opcijsko)

**Ali želiš ohraniti desktop app?** Če ne:

**Lokacija**: `apps/desktop/`

**Odstrani celoten desktop app:**
```
✗ apps/desktop/
```

**Posodobi:**
```
1. package.json - odstrani desktop scripts
2. tsconfig.json - odstrani desktop references
3. turbo.json - odstrani desktop build steps
```

---

## 📦 FAZA 11: Čiščenje package.json dependencies

### 11.1 Poenostavi npm pakete

**Odstrani:**
```
✗ comfyui-*             # Image generation
✗ electron-*            # Desktop (če odstraniš)
✗ sharp, jimp           # Image processing (če ne rabiš za file upload)
✗ cheerio               # Web scraping
✗ puppeteer             # Browser automation
```

**Obdrži (za opcijske funkcionalnosti - MCP/RAG):**
```
~ @langchain/*          # Za ENABLE_RAG
~ @modelcontextprotocol/* # Za ENABLE_MCP
~ @aws-sdk/*            # Za ENABLE_FILE_UPLOAD (če uporabiš S3)
~ pdf-parse             # Za ENABLE_RAG (file parsing)
~ mammoth               # Za ENABLE_RAG (file parsing)
~ unstructured-client   # Za ENABLE_RAG (document parsing)
```

**Ohrani:**
```
✓ next, react, react-dom
✓ @trpc/*
✓ zustand
✓ swr
✓ @lobehub/ui
✓ antd, antd-style
✓ @auth/*               # Auth packages
✓ openai                # OpenAI SDK
✓ @electric-sql/pglite  # Client DB
✓ drizzle-orm
✓ react-i18next
```

**Napotki:**
- Dependencies za MCP/RAG ostanejo v package.json
- Ker so disabled po defaultu, lahko kasneje enostavno vključiš funkcionalnost brez reinstall
- Če želiš zmanjšati bundle size, lahko uporabiš dynamic imports za MCP/RAG kodo

---

## 📦 FAZA 12: Posodobitev konfiguracije

### 12.1 Posodobi environment variables
**Lokacija**: `.env.example`

**Poenostavi na:**
```env
# OpenAI (required)
OPENAI_API_KEY=

# NextAuth (za authentication)
NEXTAUTH_URL=
NEXTAUTH_SECRET=

# Auth providers (opcijsko)
CLERK_*
LOGTO_*
AUTH0_*

# Optional Features (disabled by default)
NEXT_PUBLIC_ENABLE_MCP=false
NEXT_PUBLIC_ENABLE_RAG=false
NEXT_PUBLIC_ENABLE_FILE_UPLOAD=false

# S3 Upload (samo če vključiš ENABLE_FILE_UPLOAD)
# S3_*

# Telemetry (opcijsko)
NEXT_PUBLIC_ANALYTICS_*
```

**Odstrani:**
```
DATABASE_URL
NEON_*
COMFYUI_*
Vse ostale AI provider API keys (razen OpenAI)
```

**Napotki:**
- Ko želiš vključiti MCP, nastavi `NEXT_PUBLIC_ENABLE_MCP=true`
- Ko želiš vključiti RAG, nastavi `NEXT_PUBLIC_ENABLE_RAG=true`
- Ko želiš vključiti file upload, nastavi `NEXT_PUBLIC_ENABLE_FILE_UPLOAD=true`

### 12.2 Posodobi next.config.ts
**Odstrani:**
- S3 upload config
- Desktop app config
- Image optimization za external domains (če ni potrebno)

---

## 📦 FAZA 13: Posodobitev Store (Zustand)

### 13.1 Odstrani nepotrebne stores
**Lokacija**: `src/store/`

**Odstrani:**
```
✗ plugin/
✗ image/
✗ voice/
✗ chatGroup/
✗ market/
```

**Obdrži z conditional loading:**
```
~ knowledgeBase/     # Za ENABLE_RAG
~ file/              # Za ENABLE_FILE_UPLOAD
```

**Ohrani:**
```
✓ session/
✓ message/
✓ topic/
✓ thread/
✓ agent/
✓ user/
✓ global/
✓ chat/
```

---

## 📦 FAZA 14: i18n Čiščenje

### 14.1 Odstrani nepotrebne translation keys
**Lokacija**: `src/locales/default/`

**Odstrani namespaces za:**
```
✗ plugin.ts
✗ image.ts
✗ voice.ts
✗ market.ts
✗ discover.ts
```

**Obdrži (za opcijske funkcionalnosti):**
```
~ knowledgeBase.ts   # Za ENABLE_RAG
~ file.ts            # Za ENABLE_FILE_UPLOAD
~ mcp.ts             # Za ENABLE_MCP (če obstaja)
```

**Posodobi:**
```
~ settings.ts        # Odstrani keys za odstranjene settings strani
~ common.ts          # Čisti unused keys
```

**Napotki:**
- Translation keys za MCP/RAG/File ostanejo
- Ko je feature disabled, se enostavno ne prikažejo
- Ni potrebe za conditional loading translations

---

## 📦 FAZA 15: Čiščenje komponent

### 15.1 Odstrani unused components
**Lokacija**: `src/components/`

**Preglej in odstrani komponente povezane z:**
- Plugin UI
- Image generation UI
- Voice UI
- Market/Discovery UI
- Chat groups UI

**Obdrži (za opcijske funkcionalnosti):**
- Knowledge base UI (za ENABLE_RAG)
- File upload UI (za ENABLE_FILE_UPLOAD)
- MCP UI (za ENABLE_MCP)

**Ohrani:**
- Layout komponente
- Chat komponente
- Session/Topic komponente
- Agent komponente
- Common UI komponente
- FeatureGuard komponenta (nova v FAZI 0)

---

## 📦 FAZA 16: Testing & Cleanup

### 16.1 Odstrani stare teste
**Odstrani teste za:**
```
✗ Plugin tests
✗ Image generation tests
✗ Voice tests
✗ Server DB tests
✗ Chat groups tests
```

**Obdrži teste (za opcijske funkcionalnosti):**
```
~ Knowledge base tests (za ENABLE_RAG)
~ File tests (za ENABLE_FILE_UPLOAD)
~ MCP tests (za ENABLE_MCP)
```

**Posodobi:**
- Dodaj teste za Feature Flags sistem
- Preveri da testi preverijo guards ko je feature disabled

### 16.2 Run type checking
```bash
bun run type-check
```

Odpravi vse type errore ki nastanejo zaradi odstranjenih funkcionalnosti.

### 16.3 Run tests
```bash
bunx vitest run
```

Odpravi ali odstrani failing teste.

---

## 📦 FAZA 17: Build & Verification

### 17.1 Build projekt
```bash
bun run build
```

### 17.2 Preveri funkcionalnosti
**Manual testing checklist:**
- [ ] Login deluje (NextAuth/Clerk/Logto)
- [ ] Ustvarjanje nove session
- [ ] Pošiljanje sporočil z OpenAI
- [ ] Ustvarjanje agentov
- [ ] Organizacija sessions v groups
- [ ] Ustvarjanje topics/threads
- [ ] Export chat history
- [ ] Import chat history
- [ ] Dark/light mode
- [ ] Mobile responsive
- [ ] Settings strani delujejo

---

## 🎯 Končni rezultat

Po izvedbi tega načrta boš imel **minimalno chat aplikacijo** z:

### ✅ Funkcionalnosti
- Osnovni chat z OpenAI modeli
- Agenti (custom system prompts)
- Session groups (organizacija)
- Topics & Threads
- Export/Import
- Avtentikacija (NextAuth/Clerk/Logto/OIDC)
- Dark/light mode
- Mobile responsive
- i18n (multi-language)

### ✅ Tehnični stack
- Next.js 15 + React 19
- PGLite (samo client-side DB)
- OpenAI API
- tRPC + REST API
- Zustand + SWR
- @lobehub/ui + Ant Design

### ⚡ Opcijsko (disabled po defaultu, lahko vključiš)
- **MCP Integration** - nastavi `NEXT_PUBLIC_ENABLE_MCP=true`
- **RAG/Knowledge Base** - nastavi `NEXT_PUBLIC_ENABLE_RAG=true`
- **File Upload** - nastavi `NEXT_PUBLIC_ENABLE_FILE_UPLOAD=true`

### ❌ Odstranjeno
- ~50% kode (namesto 70%, ker ohranjamo MCP/RAG)
- Marketplace/Discovery
- Plugins
- Image generation
- Voice (TTS/STT)
- Web search
- Multi-agent chat groups
- Server DB sync
- Desktop app (opcijsko)
- 20+ AI providers (samo OpenAI)

---

## 📦 FAZA 18: Kako vključiti MCP/RAG funkcionalnosti (kasneje)

### 18.1 Vključitev MCP
**Koraki:**
1. Nastavi environment variable:
   ```env
   NEXT_PUBLIC_ENABLE_MCP=true
   ```

2. Ponovno zbuildi projekt:
   ```bash
   bun run build
   ```

3. MCP funkcionalnosti ki postanejo dostopne:
   - MCP server installation UI
   - MCP tools v chat-u
   - MCP settings v Settings strani
   - Desktop MCP support (če imaš desktop app)

### 18.2 Vključitev RAG/Knowledge Base
**Koraki:**
1. Nastavi environment variables:
   ```env
   NEXT_PUBLIC_ENABLE_RAG=true
   NEXT_PUBLIC_ENABLE_FILE_UPLOAD=true  # Potrebno za upload documentov
   ```

2. (Opcijsko) Konfigurira S3 za file storage:
   ```env
   S3_ENDPOINT=
   S3_BUCKET=
   S3_ACCESS_KEY_ID=
   S3_SECRET_ACCESS_KEY=
   ```

3. Ponovno zbuildi projekt:
   ```bash
   bun run build
   ```

4. RAG funkcionalnosti ki postanejo dostopne:
   - Knowledge Base UI (/knowledge)
   - File upload & management
   - Document chunking & embeddings
   - RAG evaluation tools
   - Semantic search v chat-u

### 18.3 Kombinacija funkcionalnosti
**Vse tri lahko vključiš naenkrat:**
```env
NEXT_PUBLIC_ENABLE_MCP=true
NEXT_PUBLIC_ENABLE_RAG=true
NEXT_PUBLIC_ENABLE_FILE_UPLOAD=true
```

**Napotki:**
- Feature flags so checked client-side in server-side
- Ni potrebe za code changes - samo environment variables
- Vse dependencies so že installirane
- Database schemas že obstajajo
- UI komponente so že pripravljene z FeatureGuard

---

## 📝 Opombe

1. **Backup**: Pred začetkom naredi backup ali novo git branch
2. **Postopno**: Izvajaj faze postopno in testiraj vmesne rezultate
3. **Dependencies**: Po odstranitvi večjih delov poženi `pnpm install` za posodobitev lock file
4. **Type errors**: Pričakuj veliko type errors - odpravljaj jih sproti
5. **Dead code**: Po osnovnem čiščenju lahko uporabiš tool kot `ts-prune` za identifikacijo dead code

---

## 🚀 Začetek implementacije

Priporočen vrstni red:
1. Naredi novo git branch: `git checkout -b minimal-chat`
2. **Najprej FAZA 0** - implementiraj Feature Flags sistem (KRITIČNO!)
3. Začni z **FAZO 1** (odstranitev UI strani)
4. Po vsaki fazi testiraj da projekt še vedno zbuilda
5. Commitaj po vsaki uspešno zaključeni fazi
6. Nadaljuj z naslednjimi fazami po vrsti

**POMEMBNO:**
- FAZA 0 je ključna - implementiraj Feature Flags PRED vsemi ostalimi spremembami
- Ko odstranjuješ kodo, preveri ali je označena za odstranitev (✗) ali ohranitev z guards (~)
- MCP in RAG kodo NE odstranjuj - samo dodaj Feature Guards
