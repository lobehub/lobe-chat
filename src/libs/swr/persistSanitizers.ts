import type { DeviceListItem } from '@lobechat/types';

/**
 * Per-key reshaping applied right before an SWR cache entry is written to a
 * persistence tier (see `CACHE_TIERS`). The in-memory entry is untouched — only
 * what survives a reload is narrowed. Returning `undefined` skips persisting.
 */
type PersistSanitizer = (value: unknown) => unknown;

/**
 * The device store's `deviceKeys.listDevices()` entry, matched as a substring of
 * the serialized key like `CACHE_TIERS`. Only the store's entry is persisted:
 * the store seeds itself from it (names + cwd) while its few presence readers
 * treat a cached row as unknown. The shared `useDeviceList` entry
 * (`device/listDevices`) stays memory-only — its consumers (settings, pickers,
 * policies) read `online` / `channels` as confirmed presence.
 */
export const DEVICE_LIST_CACHE_PATTERNS = ['device:listDevices'] as const;

/** Upper bound on persisted device rows — the snapshot must stay a small shell. */
export const MAX_PERSISTED_DEVICES = 50;

/**
 * A persisted device row keeps what the UI needs to name the device and
 * resolve its working directory (name, platform, `defaultCwd`, `workingDirs`),
 * but presence is a live gateway fact: `online` is forced to `false`, the
 * live `channels` are dropped, and `onlineUnknown` marks the row until the next
 * `listDevices` replaces it.
 */
export const toPersistedDevice = (device: DeviceListItem): DeviceListItem => ({
  ...device,
  channels: [],
  online: false,
  onlineUnknown: true,
});

const sanitizeDeviceList: PersistSanitizer = (value) => {
  const data = (value as { data?: unknown } | null | undefined)?.data;
  if (!Array.isArray(data)) return undefined;
  // Keep only the data — never the request state (`isValidating`, `error`).
  return {
    data: (data as DeviceListItem[]).slice(0, MAX_PERSISTED_DEVICES).map(toPersistedDevice),
  };
};

const SANITIZERS: [patterns: readonly string[], sanitize: PersistSanitizer][] = [
  [DEVICE_LIST_CACHE_PATTERNS, sanitizeDeviceList],
];

const isPersistedDeviceList = (value: unknown): boolean => {
  const data = (value as { data?: unknown } | null | undefined)?.data;
  return Array.isArray(data) && data.some((d) => (d as DeviceListItem).onlineUnknown);
};

/**
 * Whether an in-memory entry holds confirmed data that a persisted snapshot
 * (from another tab) must not replace. A snapshot already in memory — hydrated
 * at boot and not yet revalidated — may be replaced by a newer one.
 */
export const isConfirmedLiveEntry = (key: string, value: unknown): boolean => {
  if (DEVICE_LIST_CACHE_PATTERNS.some((pattern) => key.includes(pattern)))
    return !isPersistedDeviceList(value);
  return false;
};

/** Reshape an SWR cache entry for persistence; identity for keys with no sanitizer. */
export const sanitizeForPersistence = (key: string, value: unknown): unknown => {
  for (const [patterns, sanitize] of SANITIZERS) {
    if (patterns.some((pattern) => key.includes(pattern))) return sanitize(value);
  }
  return value;
};
