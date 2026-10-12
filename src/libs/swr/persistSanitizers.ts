import type { DeviceListItem } from '@lobechat/types';

/**
 * Per-key reshaping applied right before an SWR cache entry is written to a
 * persistence tier (see `CACHE_TIERS`). The in-memory entry is untouched — only
 * what survives a reload is narrowed. Returning `undefined` skips persisting.
 */
type PersistSanitizer = (value: unknown) => unknown;

/**
 * Both device-list entries: the device store's `deviceKeys.listDevices()` and
 * the workspace-aware `useDeviceList` (`DEVICE_LIST_SWR_KEY`). Matched as
 * substrings of the serialized key, like `CACHE_TIERS`.
 */
export const DEVICE_LIST_CACHE_PATTERNS = ['device:listDevices', 'device/listDevices'] as const;

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

/** Reshape an SWR cache entry for persistence; identity for keys with no sanitizer. */
export const sanitizeForPersistence = (key: string, value: unknown): unknown => {
  for (const [patterns, sanitize] of SANITIZERS) {
    if (patterns.some((pattern) => key.includes(pattern))) return sanitize(value);
  }
  return value;
};
