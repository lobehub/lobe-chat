# Quick Fix: Onemogoči Provider Optimizacijo

Če se zatika, lahko začasno onemogočiš optimizacijo:

## Metoda 1: Environment Variable

```bash
# V .env.local ali terminal
NODE_ENV=production bun run dev
```

## Metoda 2: Revert Spremembe

Če želiš popolnoma revertat optimizacijo, lahko spremeniš:

```typescript
// src/server/globalConfig/genServerAiProviderConfig.ts
// Line 26 - spremeni na:
const providersToProcess = allProviders; // Vzemi vse
```

## Metoda 3: Force Enable Vse

Ali pa dodaj logging da vidiš kaj se dogaja.
