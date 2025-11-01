# 📋 Načrt poenostavitve lobe-chat na minimalni chat (UI-Only Hiding Approach)

> **⚡ UI-Only Hiding pristop - brez brisanja kode!**
>
> Ta načrt uporablja **Feature Flags** za skrivanje UI elementov, ampak VSA KODA OSTANE.
>
> - ✅ Vsa koda ostane na mestu - nič se ne briše
> - ✅ Samo UI elementi se skrijejo z feature flags
> - ✅ Ni breaking changes ali zlomljenih odvisnosti
> - ✅ Enostavno vključevanje funkcionalnosti - samo toggling flags
> - ✅ Veliko manjše tveganje napak
> - ✅ Bundle size se zmanjša preko tree-shaking (production build)

## 🎯 Cilj

Poenostaviti lobe-chat **UI** na minimalno chat aplikacijo z:

- ✅ Samo OpenAI provider (v UI)
- ✅ Trenutna avtentikacija (NextAuth/Clerk/Logto/OIDC)
- ✅ Agenti, Teme, Session groups
- ✅ Export/Import funkcionalnost
- ✅ Samo PGLite (client-side DB)
- ⚡ MCP in RAG - opcijsko (hidden po defaultu, lahko vključiš)
- 🙈 Marketplace, plugini, image gen, voice, search, chat groups - **SKRITI** (ne izbrisani!)

---

## ⚠️ Pomembna razlika: UI Hiding vs Code Deletion

### ❌ Stari pristop (izogibaj se)

- Brišeš celotne direktorije (discover/, image/, profile/, labs/)
- Brišeš database modele, services, routers
- Brišeš dependencies iz package.json
- **Rezultat**: Cel kup napak, zlomljene odvisnosti, težko revertat

### ✅ Novi pristop (uporabi tega!)

- **Ničesar ne brišeš**
- Samo dodaš feature flag checks v **navigacijo in layout**
- Koda ostane → Next.js tree-shaking jo odstrani v production buildu
- **Rezultat**: Ni napak, enostavno revertat, varna implementacija

---

## 📦 FAZA 0: Feature Flags Sistem

**Status**: ✅ Že implementirano

Feature Flags sistem že obstaja v:

- `src/config/featureFlags/schema.ts` - schema z vsemi flags
- `src/store/global/slices/settings/initialState.ts` - DEFAULT_FEATURE_FLAGS
- `.env.example` - FEATURE_FLAGS dokumentacija
- `src/components/FeatureGuard/index.tsx` - helper komponenta

### 0.1 Feature Flags ki jih uporabljamo

**Že implementirani flags:**

```typescript
{
  enableMCP: false,                 // MCP server integration
  enableKnowledgeBase: false,       // RAG / Knowledge base
  enableFileUpload: false,          // File upload functionality
  showMarket: false,                // Marketplace / Discover
  showDalle: false,                 // DALL-E image generation
  showAiImage: false,               // AI Image generation
  showSpeechToText: false,          // Speech to text
  showChangelog: false,             // Changelog page
}
```

**Kako uporabljati:**

```typescript
// V React komponenti (client-side)
import { featureFlagsSelectors, useGlobalStore } from '@/store/global';

const showMarket = useGlobalStore(featureFlagsSelectors.showMarket);
if (!showMarket) return null; // Skrij UI element

// V Server Component
import { serverFeatureFlags } from '@/config/featureFlags';

const flags = serverFeatureFlags();
if (!flags.showMarket) {
  notFound(); // Redirect to 404
}
```

---

## 📦 FAZA 1: Skrivanje UI Navigation Links

**Cilj**: Skrij navigacijske linke za funkcionalnosti, ki jih ne želimo prikazat

### 1.1 Desktop Top Actions

**Lokacija**: `src/app/[variants]/(main)/_layout/Desktop/TopActions.tsx`

**Dodaj feature flag checks:**

```typescript
// Že implementirano - preveri da deluje pravilno
const showMarket = useGlobalStore(featureFlagsSelectors.showMarket);
const showAiImage = useGlobalStore(featureFlagsSelectors.showAiImage);
const enableKnowledgeBase = useGlobalStore(featureFlagsSelectors.enableKnowledgeBase);

// Market link
{showMarket && <Link to="/discover">...</Link>}

// AI Image link
{showAiImage && <Link to="/image">...</Link>}

// Knowledge Base link
{enableKnowledgeBase && <Link to="/knowledge">...</Link>}
```

### 1.2 Mobile Navigation

**Lokacija**: `src/app/[variants]/(main)/(mobile)/me/(home)/features/useCategory.tsx`

**Dodaj feature flag checks:**

```typescript
const showChangelog = useGlobalStore(featureFlagsSelectors.showChangelog);
const showMarket = useGlobalStore(featureFlagsSelectors.showMarket);
const showAiImage = useGlobalStore(featureFlagsSelectors.showAiImage);

const categories = [
  // Profile - vedno prikaži
  { icon: User, key: TabsEnum.Profile, label: t('profile') },

  // Changelog - samo če enabled
  ...(showChangelog ? [{ icon: Changelog, key: TabsEnum.Changelog, label: t('changelog') }] : []),

  // Market - samo če enabled
  ...(showMarket ? [{ icon: Store, key: TabsEnum.Market, label: t('market') }] : []),

  // Settings - vedno prikaži
  { icon: Settings, key: TabsEnum.Settings, label: t('settings') },
];
```

### 1.3 Settings Navigation

**Lokacija**: `src/app/[variants]/(main)/settings/hooks/useCategory.tsx`

**Dodaj feature flag checks:**

```typescript
const showAiImage = useGlobalStore(featureFlagsSelectors.showAiImage);
const showSpeechToText = useGlobalStore(featureFlagsSelectors.showSpeechToText);

const settingsCategories = [
  { key: SettingsTabs.Common, label: t('tab.common'), icon: Settings },
  { key: SettingsTabs.Provider, label: t('tab.llm'), icon: Bot },
  { key: SettingsTabs.Agent, label: t('tab.agent'), icon: BotMessageSquare },

  // Image settings - samo če enabled
  ...(showAiImage ? [{ key: SettingsTabs.Image, label: t('tab.image'), icon: Image }] : []),

  // TTS settings - samo če enabled
  ...(showSpeechToText ? [{ key: SettingsTabs.TTS, label: t('tab.tts'), icon: Mic }] : []),

  { key: SettingsTabs.About, label: t('tab.about'), icon: Info },
];
```

### 1.4 Update DEFAULT_FEATURE_FLAGS

**Lokacija**: `src/config/featureFlags/schema.ts`

**Nastavi vse na `false` za minimal chat:**

```typescript
export const DEFAULT_FEATURE_FLAGS = {
  enableMCP: false,
  enableKnowledgeBase: false,
  enableFileUpload: false,
  showMarket: false,
  showDalle: false,
  showAiImage: false,
  showSpeechToText: false,
  showChangelog: false,
} satisfies FeatureFlags;
```

---

## 📦 FAZA 2: Skrivanje Page Routes (Layout Guards)

**Cilj**: Dodaj feature flag checks v layout.tsx fajle, da preprečiš dostop do disabled strani

### 2.1 Discover / Market Page

**Lokacija**: `src/app/[variants]/(main)/discover/_layout/DiscoverLayout.tsx`

**Dodaj guard na vrhu layout:**

```typescript
import { notFound } from 'next/navigation';
import { serverFeatureFlags } from '@/config/featureFlags';

export default function DiscoverLayout({ children }: { children: React.ReactNode }) {
  const flags = serverFeatureFlags();

  // Če market ni enabled, preusmeri na 404
  if (!flags.showMarket) {
    notFound();
  }

  return <>{children}</>;
}
```

### 2.2 Image Generation Page

**Lokacija**: `src/app/[variants]/(main)/image/layout.tsx`

**Dodaj guard:**

```typescript
import { notFound } from 'next/navigation';
import { serverFeatureFlags } from '@/config/featureFlags';

export default function ImageLayout({ children }: { children: React.ReactNode }) {
  const flags = serverFeatureFlags();

  if (!flags.showAiImage && !flags.showDalle) {
    notFound();
  }

  return <>{children}</>;
}
```

### 2.3 Changelog Page

**Lokacija**: `src/app/[variants]/(main)/changelog/layout.tsx`

**Dodaj guard:**

```typescript
import { notFound } from 'next/navigation';
import { serverFeatureFlags } from '@/config/featureFlags';

export default function ChangelogLayout({ children }: { children: React.ReactNode }) {
  const flags = serverFeatureFlags();

  if (!flags.showChangelog) {
    notFound();
  }

  return <>{children}</>;
}
```

### 2.4 Knowledge Base Page

**Lokacija**: `src/app/[variants]/(main)/knowledge/layout.tsx`

**Preveri da že ima guard:**

```typescript
// Že implementirano - samo preveri
const flags = serverFeatureFlags();

if (!flags.enableKnowledgeBase) {
  notFound();
}
```

---

## 📦 FAZA 3: Settings Page Guards

**Cilj**: Skrij settings strani za disabled features

### 3.1 Image Settings

**Lokacija**: `src/app/[variants]/(main)/settings/image/index.tsx`

**Dodaj guard na začetek:**

```typescript
'use client';

import { notFound } from 'next/navigation';

import { featureFlagsSelectors, useGlobalStore } from '@/store/global';

export default function ImageSettings() {
  const showAiImage = useGlobalStore(featureFlagsSelectors.showAiImage);

  if (!showAiImage) {
    notFound();
  }

  // Existing code...
}
```

### 3.2 TTS Settings

**Lokacija**: `src/app/[variants]/(main)/settings/tts/index.tsx`

**Dodaj guard:**

```typescript
'use client';

import { notFound } from 'next/navigation';

import { featureFlagsSelectors, useGlobalStore } from '@/store/global';

export default function TTSSettings() {
  const showSpeechToText = useGlobalStore(featureFlagsSelectors.showSpeechToText);

  if (!showSpeechToText) {
    notFound();
  }

  // Existing code...
}
```

### 3.3 Storage Settings

**Opomba**: Storage settings lahko obdržimo, ker PGLite vedno obstaja.
Ampak če želimo skriti, dodamo guard podobno kot zgoraj.

---

## 📦 FAZA 4: Skrivanje Modal Routes

**Cilj**: Skrij modal routes za disabled features

### 4.1 Profile Modal

**Lokacija**: `src/app/[variants]/(main)/profile/layout.tsx`

**Opcijsko** - če želimo skriti profile page:

```typescript
// Lahko obdržimo profile - uporabno za API keys
// Ali dodamo guard če želimo skriti
```

### 4.2 Labs Modal

**Lokacija**: `src/app/[variants]/(main)/labs/`

**Dodaj guard** (če želimo skriti experimental features):

```typescript
// Ustvari layout.tsx z notFound() guardom
// ali ga pusti brez guarda če želimo obdržati
```

---

## 📦 FAZA 5: Provider Settings Simplification

**Cilj**: V provider settings skrij vse razen OpenAI

### 5.1 Provider List

**Lokacija**: `src/app/[variants]/(main)/settings/provider/`

**Filter providerjev po feature flags:**

```typescript
// V provider settings list komponenti
const enabledProviders = allProviders.filter((provider) => {
  // Za minimal chat, samo OpenAI
  // Ostali providers se ne prikažejo v UI
  return provider.id === 'openai';
});
```

**Opomba**: Koda za ostale providerje ostane, samo UI se filtrira.

---

## 📦 FAZA 6: Mobile Profile Tab Cleanup

**Cilj**: Poenostavi mobile profile tabs

### 6.1 Mobile Profile Categories

**Lokacija**: `src/app/[variants]/(main)/(mobile)/me/(home)/features/useCategory.tsx`

**Uporabi feature flags za filtriranje:**

```typescript
const showChangelog = useGlobalStore(featureFlagsSelectors.showChangelog);

// Filter kategorij glede na feature flags
const categories = BASE_CATEGORIES.filter((cat) => {
  if (cat.key === 'changelog') return showChangelog;
  return true;
});
```

---

## 📦 FAZA 7: Testing & Verification

### 7.1 Type Check

```bash
npm run type-check
```

**Pričakovano**: Ni errorjev ✅

### 7.2 Build Test

```bash
npm run build
```

**Pričakovano**: Uspešen build ✅

### 7.3 Manual Testing

**Checklist:**

- [ ] Discover/Market link ni viden v navigaciji
- [ ] Image link ni viden v navigaciji
- [ ] Changelog link ni viden v navigaciji
- [ ] Direkten dostop do `/discover` → 404
- [ ] Direkten dostop do `/image` → 404
- [ ] Direkten dostop do `/changelog` → 404
- [ ] Settings → Image tab ni viden
- [ ] Settings → TTS tab ni viden
- [ ] Chat functionality deluje normalno
- [ ] OpenAI provider deluje normalno
- [ ] Agenti delujejo normalno
- [ ] Export/Import deluje normalno

### 7.4 Vključitev Features (Test Reversibility)

**Test da lahko enostavno vključiš features:**

1. Nastavi v `.env.local`:

```env
FEATURE_FLAGS={"showMarket":true,"showAiImage":true,"showChangelog":true}
```

2. Rebuild:

```bash
npm run build
```

3. Preveri:

- [ ] Market link se prikaže v navigaciji
- [ ] Image link se prikaže v navigaciji
- [ ] Changelog link se prikaže v navigaciji
- [ ] `/discover` page deluje
- [ ] `/image` page deluje
- [ ] `/changelog` page deluje

---

## 🎯 Končni rezultat

### ✅ Prednosti UI-Only pristopa

1. **Ni Code Breaks**
   - Vsa koda ostane → ni import errorjev
   - Vse odvisnosti ostanejo → ni missing dependencies
   - Database schemas ostanejo → ni migration issues

2. **Enostavno Revertat**
   - Samo toggling flags v `.env`
   - Ni potrebe za git revert ali restore
   - Zero downtime

3. **Production Optimizacija**
   - Next.js tree-shaking odstrani neporabljeno kodo
   - Bundle size se zmanjša avtomatično
   - Lazy loading za disabled features

4. **Maintainability**
   - Lažje testiranje (enable/disable features)
   - Lažje debugging (koda je še vedno dostopna)
   - Lažje nadgrajevanje (samo flag toggle)

### ✅ Funkcionalnosti

Po implementaciji boš imel:

- ✅ Minimalen chat UI (samo OpenAI + basic chat)
- ✅ Vsa koda še vedno na mestu
- ✅ Možnost vključitve features kadarkoli
- ✅ Produkcijski build brez neuporabljene kode (tree-shaking)
- ✅ Zero breaking changes
- ✅ Instant reversibility

### ⚡ Kako vključiti funkcionalnosti

**Vključi Market/Discover:**

```env
FEATURE_FLAGS={"showMarket":true}
```

**Vključi Image Generation:**

```env
FEATURE_FLAGS={"showAiImage":true,"showDalle":true}
```

**Vključi MCP:**

```env
FEATURE_FLAGS={"enableMCP":true}
```

**Vključi RAG:**

```env
FEATURE_FLAGS={"enableKnowledgeBase":true,"enableFileUpload":true}
```

**Vključi vse:**

```env
FEATURE_FLAGS={"enableMCP":true,"enableKnowledgeBase":true,"enableFileUpload":true,"showMarket":true,"showDalle":true,"showAiImage":true,"showSpeechToText":true,"showChangelog":true}
```

---

## 📝 Opombe

1. **Backup**: Ni potreben - ni brisanja kode
2. **Postopno**: Lahko implementiraš FAZO po FAZO
3. **Dependencies**: Ostanejo vse - ni potrebe za pnpm install
4. **Type errors**: Pričakovano 0 errorjev
5. **Dead code**: Production build ga samodejno odstrani

---

## 🚀 Quick Start

```bash
# 1. Checkout branch
git checkout -b minimal-chat-ui-only

# 2. Posodobi DEFAULT_FEATURE_FLAGS v src/config/featureFlags/schema.ts
# Nastavi vse na false

# 3. Dodaj navigation guards (FAZA 1)
# 4. Dodaj layout guards (FAZA 2)
# 5. Dodaj settings guards (FAZA 3)

# 6. Test
npm run type-check
npm run build

# 7. Commit
git commit -m "feat: implement UI-only hiding with feature flags"
```

**Predviden čas**: 2-3 ure (namesto 20+ ur z brisanjem kode!)

---

## 🔄 Migration iz Starega Pristopa

Če si že začel z brisanjem kode:

```bash
# Revertat vse spremembe
git revert <commit-hash-of-deletions>

# Začni s tem planom
# Follow FAZA 1-7
```

---

## 📊 Primerjava Pristopov

| Aspect                | Code Deletion      | UI-Only Hiding              |
| --------------------- | ------------------ | --------------------------- |
| Čas implementacije    | 20+ ur             | 2-3 ure                     |
| Breaking changes      | Veliko             | 0                           |
| Type errors           | 50+                | 0                           |
| Reversibility         | Težko (git revert) | Enostavno (toggle flag)     |
| Bundle size reduction | Da (manual)        | Da (automatic tree-shaking) |
| Maintainability       | Nizka              | Visoka                      |
| Testing               | Težko              | Enostavno                   |
| Risk                  | Visok              | Nizek                       |

**Priporočilo**: Vedno uporabi UI-Only Hiding pristop! ✅
