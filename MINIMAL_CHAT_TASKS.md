# 📋 Minimal Chat - Task Checklist (UI-Only Hiding Approach)

> **Napredek implementacije - UI-Only Hiding pristop**
>
> Ta dokument sledi napredku implementacije minimalnega chat-a z UI-Only hiding pristopom.
> **Koda se NE BRIŠE** - samo UI elementi se skrijejo z feature flags.
> Označi checkbox (\`\[x]\`) ko zaključiš task.

---

## 🚀 Priprava

- [x] Backup trenutne verzije ali ustvari git backup
- [x] Ustvari novo git branch: \`git checkout -b minimal-chat\`
- [x] Preberi celoten \`MINIMAL_CHAT_PLAN.md\`
- [x] Razumi Feature Flags koncept
- [x] **REVERT**: Revertiraj FAZO 1 (brisanje kode) - vrnemo vse direktorije nazaj

---

## 📦 FAZA 0: Feature Flags Sistem

**Status**: ✅ Zaključeno

### 0.1 Pregled Feature Flags sistema

- [x] Feature Flags sistem že obstaja v \`src/config/featureFlags/schema.ts\`
- [x] DEFAULT_FEATURE_FLAGS že obstaja
- [x] FeatureGuard komponenta že obstaja (\`src/components/FeatureGuard/index.tsx\`)
- [x] \`.env.example\` ima že dokumentacijo

**Opomba**: Feature Flags sistem je že implementiran. Samo uporabimo ga!

### ✅ Zaključek FAZE 0

- [x] Feature Flags sistem je ready to use
- [x] Razumemo kako uporabljati \`featureFlagsSelectors\`
- [x] Razumemo kako uporabljati \`serverFeatureFlags()\`

---

## 📦 FAZA 1: Skrivanje UI Navigation Links

**Status**: ⏳ Čaka

**Cilj**: Skrij navigacijske linke za disabled features (brez brisanja kode!)

### 1.1 Desktop Top Actions

- [ ] Preveri \`src/app/\[variants]/(main)/\_layout/Desktop/TopActions.tsx\`
- [ ] Feature flag checks že obstajajo? (\`showMarket\`, \`showAiImage\`, \`enableKnowledgeBase\`)
- [ ] Če ne, dodaj conditional rendering za vsak link
- [ ] Testiraj da linki niso vidni ko so flags disabled

### 1.2 Mobile Navigation

- [ ] Posodobi \`src/app/\[variants]/(main)/(mobile)/me/(home)/features/useCategory.tsx\`
- [ ] Dodaj \`showChangelog\` feature flag check
- [ ] Dodaj \`showMarket\` feature flag check
- [ ] Uporabi spread operator za conditional inclusion kategorij
- [ ] Testiraj mobilno navigacijo

### 1.3 Settings Navigation

- [ ] Posodobi \`src/app/\[variants]/(main)/settings/hooks/useCategory.tsx\`
- [ ] Dodaj \`showAiImage\` check za Image tab
- [ ] Dodaj \`showSpeechToText\` check za TTS tab
- [ ] Filter kategorije glede na feature flags
- [ ] Testiraj settings navigation

### 1.4 Update DEFAULT_FEATURE_FLAGS

- [ ] Odpri \`src/config/featureFlags/schema.ts\`
- [ ] Nastavi vse flags na \`false\` (minimal chat)

### ✅ Zaključek FAZE 1

- [ ] Run \`bun run type-check\` - ni errorjev
- [ ] Navigacijski linki so skriti
- [ ] Git commit: \`feat: hide navigation links for disabled features\`

---

## 📦 FAZA 2: Skrivanje Page Routes (Layout Guards)

**Status**: ⏳ Čaka

**Cilj**: Dodaj guards v layout.tsx da preprečiš dostop do disabled strani

### 2.1 Discover / Market Page

- [ ] Dodaj layout guard v \`src/app/\[variants]/(main)/discover/\_layout/DiscoverLayout.tsx\`
- [ ] Uporabi \`serverFeatureFlags()\` za check
- [ ] Če \`!flags.showMarket\` → \`notFound()\`
- [ ] Testiraj da direkten dostop do \`/discover\` vrne 404

### 2.2 Image Generation Page

- [ ] Dodaj layout guard v \`src/app/\[variants]/(main)/image/layout.tsx\`
- [ ] Check \`flags.showAiImage || flags.showDalle\`
- [ ] Če disabled → \`notFound()\`
- [ ] Testiraj da \`/image\` vrne 404

### 2.3 Changelog Page

- [ ] Dodaj layout guard v \`src/app/\[variants]/(main)/changelog/layout.tsx\`
- [ ] Check \`flags.showChangelog\`
- [ ] Če disabled → \`notFound()\`
- [ ] Testiraj da \`/changelog\` vrne 404

### 2.4 Knowledge Base Page

- [ ] Preveri \`src/app/\[variants]/(main)/knowledge/layout.tsx\`
- [ ] Guard že obstaja za \`enableKnowledgeBase\`
- [ ] Samo preveri da deluje pravilno
- [ ] Testiraj da \`/knowledge\` vrne 404

### ✅ Zaključek FAZE 2

- [ ] Run \`bun run type-check\` - ni errorjev
- [ ] Direkten dostop do disabled strani vrne 404
- [ ] Git commit: \`feat: add layout guards for disabled pages\`

---

## 📦 FAZA 3: Settings Page Guards

**Status**: ⏳ Čaka

**Cilj**: Skrij settings strani za disabled features

### 3.1 Image Settings

- [ ] Dodaj guard v \`src/app/\[variants]/(main)/settings/image/index.tsx\`
- [ ] Check \`showAiImage\`
- [ ] Če disabled → \`notFound()\`

### 3.2 TTS Settings

- [ ] Dodaj guard v \`src/app/\[variants]/(main)/settings/tts/index.tsx\`
- [ ] Check \`showSpeechToText\`
- [ ] Če disabled → \`notFound()\`

### ✅ Zaključek FAZE 3

- [ ] Run \`bun run type-check\` - ni errorjev
- [ ] Settings tab-i za disabled features niso dostopni
- [ ] Git commit: \`feat: add guards for settings pages\`

---

## 📦 FAZA 4: Testing & Verification

**Status**: ⏳ Čaka

### 4.1 Type Check

- [ ] Run \`bun run type-check\`
- [ ] Pričakovano: 0 errorjev

### 4.2 Build Test

- [ ] Run \`bun run build\`
- [ ] Build uspešen

### 4.3 Manual Testing

- [ ] Discover/Market link ni viden
- [ ] Image link ni viden
- [ ] Changelog link ni viden
- [ ] Direkten dostop do \`/discover\` → 404
- [ ] Direkten dostop do \`/image\` → 404
- [ ] Direkten dostop do \`/changelog\` → 404
- [ ] Chat functionality deluje
- [ ] OpenAI provider deluje

### 4.4 Reversibility Test

- [ ] Nastavi feature flags na \`true\` v \`.env.local\`
- [ ] Rebuild
- [ ] Preveri da se features prikažejo
- [ ] Nastavi nazaj na \`false\`

---

## 📊 Napredek

**Napredek po fazah:**

| Faza | Naziv                  | Status        | Progress |
| ---- | ---------------------- | ------------- | -------- |
| 0    | Feature Flags Sistem   | ✅ Zaključeno | 100%     |
| 1    | UI Navigation Hiding   | ⏳ Čaka       | 0%       |
| 2    | Layout Guards          | ⏳ Čaka       | 0%       |
| 3    | Settings Guards        | ⏳ Čaka       | 0%       |
| 4    | Testing & Verification | ⏳ Čaka       | 0%       |

**Overall Progress: 1/5 faz (20%)**

---

## 📝 Changelog

### 2025-01-11 - 00:15

- ✅ **OPCIJA A Izbrana**: UI-Only Hiding pristop
- ✅ Revertirane spremembe iz FAZE 1 (brisanje kode)
- ✅ Vrnjeni vsi direktoriji nazaj
- ✅ Posodobljen MINIMAL_CHAT_PLAN.md z UI-only pristopom
- ✅ Posodobljen MINIMAL_CHAT_TASKS.md z novim task listom
- ✅ Type-check clean (0 errorjev)
- ✅ **Ready za FAZO 1**: Skrivanje UI navigation links

---

**Zadnja posodobitev**: 2025-01-11 00:15

**Status**: ✅ Ready za implementacijo FAZE 1
