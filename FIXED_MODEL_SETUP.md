# Nastavitev Fiksnega Modela (OpenAI o1)

Uspešno implementirano! Uporabnik ne more izbirati LLM modela - vedno je izbran **OpenAI o1**.

## 🎯 Kaj je bilo narejeno

### 1. Default Model Spremenjen

**File**: `packages/const/src/settings/llm.ts`

```typescript
export const DEFAULT_MODEL = 'o1'; // Prej: 'gpt-5-mini'
```

### 2. Dodan Nov Feature Flag

**File**: `src/config/featureFlags/schema.ts`

```typescript
// Dodana nova flag
model_selection: FeatureFlagValue.optional(),

// Default vrednost
model_selection: false, // Disabled for minimal chat

// Mapped state
enableModelSelection: evaluateFeatureFlag(config.model_selection, userId),
```

### 3. Model Selector Skrit v Chat Input

**File**: `src/features/ChatInput/ActionBar/Model/index.tsx`

```typescript
const ModelSwitch = memo(() => {
  const { enableModelSelection } = useServerConfigStore(featureFlagsSelectors);

  // Hide model selector if model selection is disabled
  if (!enableModelSelection) return null;

  // ... rest of component
});
```

### 4. Model Selector Skrit v Agent Settings

**File**: `src/features/AgentSetting/AgentModal/index.tsx`

```typescript
const model: FormGroupItemType = {
  children: [
    // Model selector je viden samo če je feature flag enabled
    ...(enableModelSelection
      ? [
          {
            children: <ModelSelect />,
            // ...
          } satisfies FormItemProps,
        ]
      : []),
    // ... ostale nastavitve
  ],
  title: t('settingModel.title'),
};
```

## ✅ Rezultat

### Trenutno Stanje (model_selection: false)

- ❌ **Model selector ni viden** v chat input-u
- ❌ **Model selector ni viden** v agent settings
- ✅ **Vedno uporabljen OpenAI o1** model
- ✅ Uporabnik ne more spreminjati modela

### Test

1. Zaženi aplikacijo: `bun run dev`
2. Pojdi na chat - **model selector ne bo prikazan**
3. Pojdi v agent settings - **model izbira ne bo prikazana**
4. Chat uporablja **OpenAI o1** model privzeto

## 🔧 Kako Vključiti Model Selection (če želiš)

### Metoda 1: Environment Variable

```bash
# V .env.local
FEATURE_FLAGS='{"model_selection":true}'
```

### Metoda 2: Spremeni Default v Schema

```typescript
// src/config/featureFlags/schema.ts
model_selection: true, // Namesto false
```

Po spremembi bo uporabnik lahko izbiral modele.

## 📋 Feature Flags Summary

```typescript
// Trenutna konfiguracija minimal chata
{
  // UI features
  market: false,           // ❌ Marketplace
  ai_image: false,         // ❌ Image generation
  changelog: false,        // ❌ Changelog

  // Model selection
  model_selection: false,  // ❌ **NEW**: Ne more izbirati modelov

  // Core features
  knowledge_base: false,   // ❌ RAG
  mcp: false,              // ❌ MCP
  plugins: false,          // ❌ Plugins

  // Basic features
  create_session: true,    // ✅ Create sessions
  edit_agent: true,        // ✅ Edit agents
  provider_settings: true, // ✅ Provider settings
}
```

## 🚀 Quick Start

```bash
# 1. Zaženi aplikacijo
bun run dev

# 2. Odpri v brskalniku
# http://localhost:3000

# 3. Preveri
# - Model selector NI viden v chat input-u
# - Model selector NI viden v agent settings
# - Chat uporablja OpenAI o1 privzeto
```

## ⚡ Kako Spremeniti Default Model

Če želiš uporabljati drug model namesto o1:

```typescript
// packages/const/src/settings/llm.ts
export const DEFAULT_MODEL = 'gpt-4'; // Spremeni na željen model
```

Možni modeli (OpenAI):

- `o1` - O1 model
- `o1-mini` - O1 Mini model
- `o1-preview` - O1 Preview model
- `gpt-5-mini` - GPT-4o Mini model
- `gpt-4` - GPT-4 model
- `gpt-4-turbo` - GPT-4 Turbo model
- `gpt-3.5-turbo` - GPT-3.5 Turbo model

## 📊 Status

- ✅ Default model: **OpenAI o1**
- ✅ Model selection: **Disabled**
- ✅ Type-check: **Passed (0 errors)**
- ✅ Build: **Ready**

---

**Datum**: 2025-11-02
**Feature**: Model Selection Control via Feature Flag
**Status**: ✅ Complete
