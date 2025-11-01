# 📋 Minimal Chat - Task Checklist

> **Napredek implementacije**
>
> Ta dokument sledi napredku implementacije minimalnega chat-a.
> Označi checkbox (`[x]`) ko zaključiš task.

---

## 🚀 Priprava

- [ ] Backup trenutne verzije ali ustvari git backup
- [ ] Ustvari novo git branch: `git checkout -b minimal-chat`
- [ ] Preberi celoten `MINIMAL_CHAT_PLAN.md`
- [ ] Razumi Feature Flags koncept

---

## 📦 FAZA 0: Feature Flags Sistem

**Status**: ⏳ V teku

### 0.1 Ustvari Feature Flags konfiguracija

- [ ] Ustvari `src/config/featureFlags.ts`
- [ ] Dodaj `FEATURE_FLAGS` objekt
- [ ] Dodaj `isFeatureEnabled()` funkcijo
- [ ] Dodaj TypeScript type `FeatureFlag`

### 0.2 Posodobi environment variables

- [ ] Dodaj `NEXT_PUBLIC_ENABLE_MCP=false` v `.env.example`
- [ ] Dodaj `NEXT_PUBLIC_ENABLE_RAG=false` v `.env.example`
- [ ] Dodaj `NEXT_PUBLIC_ENABLE_FILE_UPLOAD=false` v `.env.example`
- [ ] Ustvari `.env.local` z istimi vrednostmi

### 0.3 Ustvari FeatureGuard komponento

- [ ] Ustvari `src/components/FeatureGuard/index.tsx`
- [ ] Implementiraj `FeatureGuard` komponento
- [ ] Dodaj TypeScript interface `FeatureGuardProps`
- [ ] Testiraj da komponenta deluje

### 0.4 Dokumentacija

- [ ] Dodaj README opombe o Feature Flags
- [ ] Dokumentiraj kako uporabljati FeatureGuard
- [ ] Dodaj primere uporabe

### ✅ Zaključek FAZE 0

- [ ] Run `bun run type-check` - brez errorjev
- [ ] Run `bun run build` - uspešen build
- [ ] Git commit: `feat: add feature flags system for MCP and RAG`

---

## 📦 FAZA 1: Odstranitev UI strani in routing-a

**Status**: ⏳ Čaka

### 1.1 Odstrani glavne strani

- [ ] Odstrani `src/app/[variants]/(main)/discover/`
- [ ] Odstrani `src/app/[variants]/(main)/image/`
- [ ] Odstrani `src/app/[variants]/(main)/profile/`
- [ ] Odstrani `src/app/[variants]/(main)/labs/`
- [ ] Odstrani `src/app/[variants]/(main)/changelog/`

### 1.2 Dodaj FeatureGuard za knowledge strani

- [ ] Odpri vse page.tsx v `src/app/[variants]/(main)/knowledge/`
- [ ] Wrap content z `<FeatureGuard feature="ENABLE_RAG">`
- [ ] Dodaj fallback (redirect ali 404)
- [ ] Testiraj da stran ni dostopna ko ENABLE_RAG=false

### 1.3 Poenostavi Settings strani

- [ ] Odstrani vse provider strani razen OpenAI v `src/app/[variants]/(main)/settings/provider/`
- [ ] Odstrani `src/app/[variants]/(main)/settings/modal-image/`
- [ ] Odstrani `src/app/[variants]/(main)/settings/tts/`
- [ ] Odstrani `src/app/[variants]/(main)/settings/storage/`
- [ ] Odstrani `src/app/[variants]/(main)/settings/sync/` (če obstaja)

### 1.4 Posodobi navigacijo

- [ ] Odstrani links na odstranjene strani iz navigation menijev
- [ ] Posodobi sidebar/header komponente
- [ ] Odstrani route definitions za odstranjene strani

### ✅ Zaključek FAZE 1

- [ ] Run `bun run type-check` - odpravi vse type errors
- [ ] Run `bun run build` - uspešen build
- [ ] Testiraj navigacijo v browser-ju
- [ ] Git commit: `refactor: remove unused UI pages and simplify settings`

---

## 📦 FAZA 2: Odstranitev Features komponent

**Status**: ⏳ Čaka

### 2.1 Odstrani celotne feature module

- [ ] Odstrani `src/features/PluginStore/`
- [ ] Odstrani `src/features/PluginManager/`
- [ ] Odstrani `src/features/PluginGateway/`
- [ ] Odstrani `src/features/ImageGeneration/`
- [ ] Odstrani `src/features/VoiceChat/`
- [ ] Odstrani `src/features/WebSearch/`
- [ ] Odstrani `src/features/ChatGroup/`
- [ ] Odstrani `src/features/DiscoverMarket/`
- [ ] Odstrani `src/features/Labs/`
- [ ] Odstrani `src/features/Changelog/`

### 2.2 Dodaj FeatureGuards za opcijske features

- [ ] Dodaj guards v `src/features/MCP/` komponente
- [ ] Dodaj guards v `src/features/KnowledgeBase/` komponente
- [ ] Dodaj guards v `src/features/FileManager/` komponente
- [ ] Dodaj guards v `src/features/FileViewer/` komponente

### 2.3 Odstrani imports odstranjenih features

- [ ] Preglej vse fajle ki importajo odstranjene features
- [ ] Odstrani ali zakomentiraj te importe
- [ ] Odstrani komponente ki uporabljajo odstranjene features

### ✅ Zaključek FAZE 2

- [ ] Run `bun run type-check` - odpravi vse type errors
- [ ] Run `bun run build` - uspešen build
- [ ] Git commit: `refactor: remove unused feature modules`

---

## 📦 FAZA 3: Čiščenje Database modelov

**Status**: ⏳ Čaka

### 3.1 Odstrani neuporabljene modele

- [ ] Odstrani `packages/database/src/models/plugin.ts`
- [ ] Odstrani `packages/database/src/models/generation.ts`
- [ ] Odstrani `packages/database/src/models/generationBatch.ts`
- [ ] Odstrani `packages/database/src/models/generationTopic.ts`
- [ ] Odstrani `packages/database/src/models/chatGroup.ts`

### 3.2 Obdrži RAG modele

- [ ] Preveri da `knowledgeBase.ts` obstaja
- [ ] Preveri da `file.ts` obstaja
- [ ] Preveri da `document.ts` obstaja
- [ ] Preveri da `chunk.ts` obstaja
- [ ] Preveri da `embedding.ts` obstaja

### 3.3 Odstrani database schemas

- [ ] Odstrani schema za `plugin` iz `packages/database/src/schemas/`
- [ ] Odstrani schema za `generation*` iz `packages/database/src/schemas/`
- [ ] Odstrani schema za `chatGroup` iz `packages/database/src/schemas/`

### 3.4 Posodobi database index/exports

- [ ] Posodobi `packages/database/src/models/index.ts` - odstrani exports
- [ ] Posodobi `packages/database/src/schemas/index.ts` - odstrani exports
- [ ] Preveri database migrations - posodobi če potrebno

### ✅ Zaključek FAZE 3

- [ ] Run `bun run type-check` - odpravi vse type errors
- [ ] Run database migration test (če obstaja)
- [ ] Git commit: `refactor: remove unused database models and schemas`

---

## 📦 FAZA 4: Čiščenje Services

**Status**: ⏳ Čaka

### 4.1 Odstrani client services

- [ ] Odstrani `src/services/plugin/`
- [ ] Odstrani `src/services/image/`
- [ ] Odstrani `src/services/voice/`
- [ ] Odstrani `src/services/search/`
- [ ] Odstrani `src/services/chatGroup/`
- [ ] Odstrani `src/services/discover/`
- [ ] Odstrani `src/services/market/`

### 4.2 Obdrži RAG services z guards

- [ ] Preveri `src/services/knowledgeBase/` - dodaj guards če potrebno
- [ ] Preveri `src/services/file/` - dodaj guards če potrebno

### 4.3 Odstrani server services

- [ ] Odstrani `src/server/services/comfyui.ts`
- [ ] Odstrani `src/server/services/discover.ts`
- [ ] Odstrani `src/server/services/generation.ts`
- [ ] Odstrani `src/server/services/search.ts`

### 4.4 Obdrži RAG/MCP server services

- [ ] Preveri `src/server/services/chunk.ts` - obdrži
- [ ] Preveri `src/server/services/document.ts` - obdrži
- [ ] Preveri `src/server/services/file.ts` - obdrži
- [ ] Preveri `src/server/services/mcp.ts` - obdrži

### 4.5 Posodobi service exports

- [ ] Posodobi `src/services/index.ts` - odstrani exports
- [ ] Posodobi `src/server/services/index.ts` - odstrani exports

### ✅ Zaključek FAZE 4

- [ ] Run `bun run type-check` - odpravi vse type errors
- [ ] Git commit: `refactor: remove unused services`

---

## 📦 FAZA 5: Čiščenje API Routers

**Status**: ⏳ Čaka

### 5.1 Odstrani tRPC lambda routers

- [ ] Odstrani `src/server/routers/lambda/plugin.ts`
- [ ] Odstrani `src/server/routers/lambda/generation.ts`
- [ ] Odstrani `src/server/routers/lambda/image.ts`
- [ ] Odstrani `src/server/routers/lambda/market.ts`
- [ ] Odstrani `src/server/routers/lambda/chatGroup.ts`

### 5.2 Dodaj guards za RAG routers

- [ ] Dodaj guards v `src/server/routers/lambda/knowledgeBase.ts`
- [ ] Dodaj guards v `src/server/routers/lambda/chunk.ts`
- [ ] Dodaj guards v `src/server/routers/lambda/document.ts`
- [ ] Dodaj guards v `src/server/routers/lambda/file.ts`

### 5.3 Odstrani async router features

- [ ] Odstrani `src/server/routers/async/generation.ts`

### 5.4 Dodaj guards za async RAG routers

- [ ] Dodaj guards v `src/server/routers/async/rag.ts`
- [ ] Dodaj guards v `src/server/routers/async/file.ts`

### 5.5 Poenostavi tools router

- [ ] Odstrani `src/server/routers/tools/search.ts`
- [ ] Dodaj guards v `src/server/routers/tools/mcp.ts`

### 5.6 Posodobi router exports

- [ ] Posodobi `src/server/routers/lambda/index.ts`
- [ ] Posodobi `src/server/routers/async/index.ts`
- [ ] Posodobi `src/server/routers/tools/index.ts`
- [ ] Posodobi main router aggregator

### ✅ Zaključek FAZE 5

- [ ] Run `bun run type-check` - odpravi vse type errors
- [ ] Run `bun run build` - uspešen build
- [ ] Git commit: `refactor: remove unused API routers and add guards`

---

## 📦 FAZA 6: Čiščenje WebAPI (REST endpoints)

**Status**: ⏳ Čaka

### 6.1 Odstrani REST API endpoints

- [ ] Odstrani `src/app/(backend)/webapi/plugin/`
- [ ] Odstrani `src/app/(backend)/webapi/text-to-image/`
- [ ] Odstrani `src/app/(backend)/webapi/create-image/`
- [ ] Odstrani `src/app/(backend)/webapi/tts/`
- [ ] Odstrani `src/app/(backend)/webapi/stt/`
- [ ] Odstrani `src/app/(backend)/webapi/search/`

### 6.2 Odstrani chat providerje

- [ ] Odstrani `src/app/(backend)/webapi/chat/anthropic/`
- [ ] Odstrani `src/app/(backend)/webapi/chat/azure/`
- [ ] Odstrani `src/app/(backend)/webapi/chat/bedrock/`
- [ ] Odstrani `src/app/(backend)/webapi/chat/google/`
- [ ] Odstrani `src/app/(backend)/webapi/chat/ollama/`
- [ ] Odstrani vse ostale providerje razen OpenAI

### 6.3 Obdrži samo OpenAI

- [ ] Preveri da `src/app/(backend)/webapi/chat/openai/` obstaja
- [ ] Preveri da `src/app/(backend)/webapi/models/openai/` obstaja
- [ ] Preveri da `src/app/(backend)/webapi/tokenizer/` obstaja

### ✅ Zaključek FAZE 6

- [ ] Run `bun run type-check` - odpravi vse type errors
- [ ] Run `bun run build` - uspešen build
- [ ] Git commit: `refactor: remove unused WebAPI endpoints, keep only OpenAI`

---

## 📦 FAZA 7: Poenostavitev Model Runtime

**Status**: ⏳ Čaka

### 7.1 Odstrani AI providerje

- [ ] Odstrani `packages/model-runtime/src/providers/anthropic/`
- [ ] Odstrani `packages/model-runtime/src/providers/azure/`
- [ ] Odstrani `packages/model-runtime/src/providers/bedrock/`
- [ ] Odstrani `packages/model-runtime/src/providers/google/`
- [ ] Odstrani `packages/model-runtime/src/providers/ollama/`
- [ ] Odstrani `packages/model-runtime/src/providers/mistral/`
- [ ] Odstrani vse ostale providerje razen OpenAI

### 7.2 Obdrži samo OpenAI provider

- [ ] Preveri da `packages/model-runtime/src/providers/openai/` obstaja
- [ ] Testiraj OpenAI provider

### 7.3 Posodobi AI Model Bank

- [ ] Odstrani vse AI model configs razen OpenAI iz `packages/model-bank/src/aiModels/`
- [ ] Obdrži samo `packages/model-bank/src/aiModels/openai.ts`
- [ ] Posodobi exports v `packages/model-bank/src/aiModels/index.ts`

### 7.4 Posodobi model runtime exports

- [ ] Posodobi `packages/model-runtime/src/providers/index.ts`
- [ ] Posodobi registry files

### ✅ Zaključek FAZE 7

- [ ] Run `bun run type-check` - odpravi vse type errors
- [ ] Run `bun run build` - uspešen build
- [ ] Testiraj OpenAI chat completion
- [ ] Git commit: `refactor: remove AI providers, keep only OpenAI`

---

## 📦 FAZA 8: Čiščenje Third-party integracij

**Status**: ⏳ Čaka

### 8.1 Preveri libs (obdrži vse za MCP/RAG)

- [ ] Preveri da `src/libs/langchain/` obstaja - obdrži
- [ ] Preveri da `src/libs/mcp/` obstaja - obdrži
- [ ] Preveri ostale libs (nextAuth, clerk, swr, traces, analytics) - obdrži

### 8.2 Odstrani server modules

- [ ] Odstrani `src/server/modules/AssistantStore/`
- [ ] Odstrani `src/server/modules/PluginStore/`
- [ ] Odstrani `src/server/modules/ElectronIPCClient/` (če ne rabiš desktop)

### 8.3 Obdrži server modules za RAG/MCP

- [ ] Preveri `src/server/modules/ContentChunk/` - obdrži
- [ ] Preveri `src/server/modules/S3/` - obdrži (opcijsko)
- [ ] Preveri `src/server/modules/ModelRuntime/` - obdrži
- [ ] Preveri `src/server/modules/KeyVaultsEncrypt/` - obdrži
- [ ] Preveri `src/server/modules/EdgeConfig/` - obdrži

### 8.4 Posodobi module exports

- [ ] Posodobi `src/server/modules/index.ts` - odstrani exports

### ✅ Zaključek FAZE 8

- [ ] Run `bun run type-check` - odpravi vse type errors
- [ ] Git commit: `refactor: remove unused third-party integrations`

---

## 📦 FAZA 9: Odstranitev Server DB funkcionalnosti

**Status**: ⏳ Čaka

### 9.1 Odstrani PostgreSQL/Neon integration

- [ ] Posodobi `packages/database/drizzle.config.ts` - odstrani PostgreSQL config
- [ ] Odstrani PostgreSQL client initialization iz `packages/database/src/client.ts`
- [ ] Obdrži samo PGLite initialization

### 9.2 Odstrani server-side DB operacije

- [ ] Preglej vse `src/services/*/server.ts` fajle
- [ ] Odstrani server DB operacije ali preusmeri na client
- [ ] Posodobi da vse operacije gredo skozi PGLite

### 9.3 Poenostavi tRPC routers

- [ ] Posodobi vse routerje da uporabljajo samo client DB
- [ ] Odstrani server DB context iz tRPC

### 9.4 Odstrani env variables

- [ ] Odstrani `DATABASE_URL` iz `.env.example`
- [ ] Odstrani `NEON_*` variables iz `.env.example`
- [ ] Posodobi dokumentacijo

### ✅ Zaključek FAZE 9

- [ ] Run `bun run type-check` - odpravi vse type errors
- [ ] Run `bun run build` - uspešen build
- [ ] Testiraj da PGLite deluje
- [ ] Git commit: `refactor: remove server DB, use only PGLite`

---

## 📦 FAZA 10: Čiščenje Desktop App (opcijsko)

**Status**: ⏳ Čaka

### 10.1 Odločitev

- [ ] Ali želiš obdržati desktop app? DA / NE

### 10.2 Če NE - odstrani desktop app

- [ ] Odstrani `apps/desktop/`
- [ ] Odstrani desktop scripts iz root `package.json`
- [ ] Odstrani desktop references iz `tsconfig.json`
- [ ] Odstrani desktop build steps iz `turbo.json`

### 10.3 Če DA - obdrži desktop app

- [ ] Preveri da desktop app še vedno builda
- [ ] Testiraj desktop funkcionalnosti

### ✅ Zaključek FAZE 10

- [ ] Run `bun run type-check` - odpravi vse type errors
- [ ] Run `bun run build` - uspešen build
- [ ] Git commit: `refactor: remove desktop app` ali preskoči

---

## 📦 FAZA 11: Čiščenje package.json dependencies

**Status**: ⏳ Čaka

### 11.1 Odstrani neuporabljene pakete

- [ ] Odstrani `comfyui-*` packages
- [ ] Odstrani `electron-*` (če odstraniš desktop)
- [ ] Odstrani `sharp`, `jimp` (če ne rabiš)
- [ ] Odstrani `cheerio`
- [ ] Odstrani `puppeteer`

### 11.2 Obdrži pakete za MCP/RAG

- [ ] Preveri da `@langchain/*` ostanejo
- [ ] Preveri da `@modelcontextprotocol/*` ostanejo
- [ ] Preveri da `@aws-sdk/*` ostanejo (opcijsko)
- [ ] Preveri da `pdf-parse` ostane
- [ ] Preveri da `mammoth` ostane
- [ ] Preveri da `unstructured-client` ostane

### 11.3 Cleanup

- [ ] Run `pnpm install` za posodobitev lock file
- [ ] Run `pnpm prune` za odstranitev neuporabljenih paketov
- [ ] Preveri package.json v vseh workspace packages

### ✅ Zaključek FAZE 11

- [ ] Run `bun run type-check` - odpravi vse type errors
- [ ] Run `bun run build` - uspešen build
- [ ] Git commit: `chore: remove unused dependencies`

---

## 📦 FAZA 12: Posodobitev konfiguracije

**Status**: ⏳ Čaka

### 12.1 Posodobi environment variables

- [ ] Posodobi `.env.example` z novimi variables
- [ ] Dodaj `NEXT_PUBLIC_ENABLE_MCP=false`
- [ ] Dodaj `NEXT_PUBLIC_ENABLE_RAG=false`
- [ ] Dodaj `NEXT_PUBLIC_ENABLE_FILE_UPLOAD=false`
- [ ] Odstrani `DATABASE_URL`, `NEON_*`, `S3_*`, `COMFYUI_*`
- [ ] Odstrani vse AI provider API keys razen OpenAI

### 12.2 Posodobi next.config.ts

- [ ] Odstrani S3 upload config (ali dodaj conditional)
- [ ] Odstrani desktop app config (če odstraniš desktop)
- [ ] Odstrani image optimization za external domains (če ne rabiš)
- [ ] Preveri da config še vedno dela

### 12.3 Posodobi ostale config files

- [ ] Preveri `tsconfig.json`
- [ ] Preveri `turbo.json`
- [ ] Preveri `.eslintrc.js`
- [ ] Preveri `vitest.config.ts`

### ✅ Zaključek FAZE 12

- [ ] Run `bun run type-check` - odpravi vse type errors
- [ ] Run `bun run build` - uspešen build
- [ ] Git commit: `chore: update configuration files`

---

## 📦 FAZA 13: Posodobitev Store (Zustand)

**Status**: ⏳ Čaka

### 13.1 Odstrani neuporabljene stores

- [ ] Odstrani `src/store/plugin/`
- [ ] Odstrani `src/store/image/`
- [ ] Odstrani `src/store/voice/`
- [ ] Odstrani `src/store/chatGroup/`
- [ ] Odstrani `src/store/market/`

### 13.2 Obdrži stores za RAG

- [ ] Preveri `src/store/knowledgeBase/` - obdrži z conditional loading
- [ ] Preveri `src/store/file/` - obdrži z conditional loading

### 13.3 Posodobi store exports

- [ ] Posodobi `src/store/index.ts` - odstrani exports
- [ ] Preveri global store za unused state

### ✅ Zaključek FAZE 13

- [ ] Run `bun run type-check` - odpravi vse type errors
- [ ] Run `bun run build` - uspešen build
- [ ] Git commit: `refactor: remove unused Zustand stores`

---

## 📦 FAZA 14: i18n Čiščenje

**Status**: ⏳ Čaka

### 14.1 Odstrani neuporabljene translation namespaces

- [ ] Odstrani `src/locales/default/plugin.ts`
- [ ] Odstrani `src/locales/default/image.ts`
- [ ] Odstrani `src/locales/default/voice.ts`
- [ ] Odstrani `src/locales/default/market.ts`
- [ ] Odstrani `src/locales/default/discover.ts`

### 14.2 Obdrži translations za RAG/MCP

- [ ] Preveri `src/locales/default/knowledgeBase.ts` - obdrži
- [ ] Preveri `src/locales/default/file.ts` - obdrži
- [ ] Preveri `src/locales/default/mcp.ts` - obdrži

### 14.3 Posodobi postoječe translations

- [ ] Posodobi `src/locales/default/settings.ts` - odstrani unused keys
- [ ] Posodobi `src/locales/default/common.ts` - odstrani unused keys

### 14.4 Sync translations

- [ ] Posodobi `locales/zh-CN/` JSON fajle
- [ ] Posodobi `locales/en-US/` JSON fajle
- [ ] Pusti CI da handle ostale jezike

### ✅ Zaključek FAZE 14

- [ ] Run `bun run type-check` - odpravi vse type errors
- [ ] Git commit: `refactor: remove unused i18n translations`

---

## 📦 FAZA 15: Čiščenje komponent

**Status**: ⏳ Čaka

### 15.1 Odstrani neuporabljene komponente

- [ ] Preglej `src/components/` za plugin UI komponente - odstrani
- [ ] Preglej `src/components/` za image generation UI - odstrani
- [ ] Preglej `src/components/` za voice UI - odstrani
- [ ] Preglej `src/components/` za market/discovery UI - odstrani
- [ ] Preglej `src/components/` za chat groups UI - odstrani

### 15.2 Obdrži komponente za RAG/MCP

- [ ] Preveri knowledge base UI komponente - obdrži
- [ ] Preveri file upload UI komponente - obdrži
- [ ] Preveri MCP UI komponente - obdrži

### 15.3 Preveri core komponente

- [ ] Layout komponente - obdrži
- [ ] Chat komponente - obdrži
- [ ] Session/Topic komponente - obdrži
- [ ] Agent komponente - obdrži
- [ ] Common UI komponente - obdrži
- [ ] FeatureGuard komponenta - obdrži

### ✅ Zaključek FAZE 15

- [ ] Run `bun run type-check` - odpravi vse type errors
- [ ] Run `bun run build` - uspešen build
- [ ] Git commit: `refactor: remove unused UI components`

---

## 📦 FAZA 16: Testing & Cleanup

**Status**: ⏳ Čaka

### 16.1 Odstrani stare teste

- [ ] Odstrani plugin tests
- [ ] Odstrani image generation tests
- [ ] Odstrani voice tests
- [ ] Odstrani server DB tests
- [ ] Odstrani chat groups tests

### 16.2 Obdrži teste za RAG/MCP

- [ ] Preveri knowledge base tests - obdrži
- [ ] Preveri file tests - obdrži
- [ ] Preveri MCP tests - obdrži

### 16.3 Dodaj nove teste

- [ ] Dodaj teste za Feature Flags sistem
- [ ] Dodaj teste za FeatureGuard komponento
- [ ] Preveri da testi preverijo guards ko je feature disabled

### 16.4 Run type checking

- [ ] Run `bun run type-check`
- [ ] Odpravi vse type errors
- [ ] Preveri da ni `any` tipov

### 16.5 Run tests

- [ ] Run `bunx vitest run`
- [ ] Odpravi failing teste
- [ ] Odstrani teste za odstranjene funkcionalnosti

### ✅ Zaključek FAZE 16

- [ ] Vsi testi passed
- [ ] Type check clean
- [ ] Git commit: `test: update tests for minimal chat`

---

## 📦 FAZA 17: Build & Verification

**Status**: ⏳ Čaka

### 17.1 Build projekt

- [ ] Run `bun run build`
- [ ] Preveri da build uspe brez errorjev
- [ ] Preveri build size
- [ ] Preveri da ni warningov

### 17.2 Manual testing checklist

- [ ] Login deluje (NextAuth/Clerk/Logto)
- [ ] Ustvarjanje nove session deluje
- [ ] Pošiljanje sporočil z OpenAI deluje
- [ ] Chat history se shrani v PGLite
- [ ] Ustvarjanje agentov deluje
- [ ] Agent system prompts delujejo
- [ ] Organizacija sessions v groups deluje
- [ ] Ustvarjanje topics deluje
- [ ] Ustvarjanje threads deluje
- [ ] Export chat history deluje
- [ ] Import chat history deluje
- [ ] Dark mode deluje
- [ ] Light mode deluje
- [ ] Mobile responsive deluje
- [ ] Settings strani delujejo
- [ ] OpenAI provider settings delujejo

### 17.3 Preveri da disabled features NE delujejo

- [ ] MCP UI ni dostopen (ENABLE_MCP=false)
- [ ] Knowledge Base UI ni dostopen (ENABLE_RAG=false)
- [ ] File upload ni dostopen (ENABLE_FILE_UPLOAD=false)
- [ ] Preveri da API vrne error za disabled features

### 17.4 Performance check

- [ ] Preveri initial page load time
- [ ] Preveri bundle size
- [ ] Preveri memory usage
- [ ] Preveri da ni console errors

### ✅ Zaključek FAZE 17

- [ ] Vse funkcionalnosti delujejo
- [ ] Build je uspešen
- [ ] Performance je sprejemljiv
- [ ] Git commit: `chore: verify build and functionality`

---

## 📦 FAZA 18: Dokumentacija in finalizacija

**Status**: ⏳ Čaka

### 18.1 Posodobi README.md

- [ ] Dodaj opis minimalnega chat-a
- [ ] Dokumentiraj feature flags
- [ ] Dodaj navodila kako vključiti MCP
- [ ] Dodaj navodila kako vključiti RAG
- [ ] Posodobi installation instructions
- [ ] Posodobi environment variables dokumentacijo

### 18.2 Ustvari FEATURE_FLAGS.md

- [ ] Dokumentiraj kako uporabljati feature flags
- [ ] Dodaj primere za vsak flag
- [ ] Dodaj troubleshooting sekcijo

### 18.3 Posodobi CHANGELOG.md

- [ ] Dodaj entry za minimal chat verzijo
- [ ] Dodaj breaking changes
- [ ] Dodaj navodila za migration

### 18.4 Final git commit

- [ ] Review vseh sprememb
- [ ] Preveri da je commit history čist
- [ ] Git commit: `docs: update documentation for minimal chat`
- [ ] Git tag: `v1.0.0-minimal` (opcijsko)

### ✅ Zaključek FAZE 18

- [ ] Dokumentacija je posodobljena
- [ ] README je jasen
- [ ] Git history je čist
- [ ] Projekt je pripravljen za uporabo

---

## 🎉 Zaključek projekta

### Final checklist

- [ ] Vse faze so zaključene
- [ ] Build je uspešen
- [ ] Vsi testi passed
- [ ] Type check clean
- [ ] Dokumentacija posodobljena
- [ ] Git branch merged (ali pripravljen za merge)

### Test vključitve MCP/RAG (opcijsko)

- [ ] Nastavi `NEXT_PUBLIC_ENABLE_MCP=true`
- [ ] Rebuild projekt
- [ ] Preveri da MCP funkcionalnosti delujejo
- [ ] Nastavi nazaj na `false`

- [ ] Nastavi `NEXT_PUBLIC_ENABLE_RAG=true`
- [ ] Rebuild projekt
- [ ] Preveri da RAG funkcionalnosti delujejo
- [ ] Nastavi nazaj na `false`

### Success metrics

- [ ] Bundle size zmanjšan vsaj 30%
- [ ] Initial load time izboljšan
- [ ] Code complexity zmanjšan
- [ ] Maintainability izboljšan
- [ ] Opcijske funkcionalnosti delujejo ko so enabled

---

## 📊 Napredek

**Napredek po fazah:**

| Faza | Naziv | Status | Progress |
|------|-------|--------|----------|
| 0 | Feature Flags Sistem | ⏳ V teku | 0% |
| 1 | Odstranitev UI strani | ⏳ Čaka | 0% |
| 2 | Odstranitev Features | ⏳ Čaka | 0% |
| 3 | Čiščenje DB modelov | ⏳ Čaka | 0% |
| 4 | Čiščenje Services | ⏳ Čaka | 0% |
| 5 | Čiščenje API Routers | ⏳ Čaka | 0% |
| 6 | Čiščenje WebAPI | ⏳ Čaka | 0% |
| 7 | Model Runtime | ⏳ Čaka | 0% |
| 8 | Third-party libs | ⏳ Čaka | 0% |
| 9 | Server DB removal | ⏳ Čaka | 0% |
| 10 | Desktop App | ⏳ Čaka | 0% |
| 11 | Dependencies | ⏳ Čaka | 0% |
| 12 | Konfiguracija | ⏳ Čaka | 0% |
| 13 | Zustand stores | ⏳ Čaka | 0% |
| 14 | i18n cleanup | ⏳ Čaka | 0% |
| 15 | Komponente | ⏳ Čaka | 0% |
| 16 | Testing | ⏳ Čaka | 0% |
| 17 | Build & Verification | ⏳ Čaka | 0% |
| 18 | Dokumentacija | ⏳ Čaka | 0% |

**Overall Progress: 0/18 faz (0%)**

---

## 📝 Opombe

- Po vsaki fazi naredi git commit
- Testiraj build po večjih spremembah
- Ne nadaljuj če type check faila
- Backup projekt pred večjimi spremembami
- Referenca na `MINIMAL_CHAT_PLAN.md` za podrobnosti

---

**Zadnja posodobitev**: 2025-01-11
