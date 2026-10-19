import type { DeviceListItem } from '@lobechat/types';

/**
 * Sentinel for "run on this machine". Not an empty string: Select treats `''`
 * as no value and renders a blank trigger instead of the option's label.
 */
export const LOCAL_TARGET = '__local__';

interface TargetOption {
  label: string;
  value: string;
}

/** Options for the terminal target picker; `localLabel` adds "this machine" first. */
export const buildTargetOptions = (
  devices: DeviceListItem[],
  localLabel?: string,
): TargetOption[] => [
  ...(localLabel ? [{ label: localLabel, value: LOCAL_TARGET }] : []),
  ...devices.map((device) => ({
    label: device.friendlyName || device.hostname || device.deviceId,
    value: device.deviceId,
  })),
];

interface ResolveTerminalDeviceParams {
  /** The device list has loaded, so `targets` is the real answer rather than empty-for-now */
  listLoaded: boolean;
  /** Whether this build has a shell of its own (the desktop app) */
  localAvailable: boolean;
  /** The user's pick in the terminal picker; `undefined` inside it means this machine */
  pick?: { deviceId?: string };
  /** Devices that can host a terminal right now */
  targets: DeviceListItem[];
  /** Remote device the conversation runs on, if any */
  topicDeviceId?: string;
}

interface ResolvedTerminalDevice {
  /** Where the next shell runs; `undefined` is this machine */
  deviceId?: string;
  /** Whether that answer is final — false while the topic's device may still show up */
  ready: boolean;
}

/**
 * Where a topic's next terminal opens. An explicit pick wins; otherwise the
 * terminal follows the device the conversation runs on, so the shell lands on
 * the same machine as the agent. A topic device that cannot host a shell
 * (offline, desktop-only connection) falls back to this machine, or on the web
 * to the first usable device.
 */
export const resolveTerminalDevice = ({
  listLoaded,
  localAvailable,
  pick,
  targets,
  topicDeviceId,
}: ResolveTerminalDeviceParams): ResolvedTerminalDevice => {
  if (pick) return { deviceId: pick.deviceId, ready: true };
  if (topicDeviceId && targets.some((device) => device.deviceId === topicDeviceId))
    return { deviceId: topicDeviceId, ready: true };
  // Hold off until the list arrives: spawning now would open the shell on the
  // fallback and leave it there once the topic's device turns up.
  if (topicDeviceId && !listLoaded) return { ready: false };
  if (localAvailable) return { ready: true };
  const fallback = targets[0]?.deviceId;
  return { deviceId: fallback, ready: !!fallback };
};
