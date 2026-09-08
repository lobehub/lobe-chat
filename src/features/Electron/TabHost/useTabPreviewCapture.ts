import { type RefObject, useEffect } from 'react';

import { isDesktop } from '@/const/version';
import { ensureElectronIpc } from '@/utils/electron/ipc';

/**
 * Capturing at switch-away time races the tab swap: `capturePage` resolves against
 * whichever frame the compositor services next, which is already the incoming tab.
 * So the shot is taken while the tab is still on screen and the cached result is what
 * the hover preview reads later.
 *
 * Trailing throttle rather than debounce: a route that is still streaming or loading
 * mutates continuously, and a debounce would keep pushing the capture past the point
 * anyone would see it — the first frames after mount are skeletons.
 */
const THROTTLE = 2000;
const IDLE_TIMEOUT = 1000;
const ACTIVITY_EVENTS = ['pointerup', 'keyup', 'scroll', 'wheel'] as const;
const LISTENER_OPTIONS = { capture: true, passive: true } as const;

export const useTabPreviewCapture = (
  tabId: string,
  isVisible: boolean,
  ref: RefObject<HTMLDivElement | null>,
) => {
  useEffect(() => {
    const element = ref.current;
    if (!isDesktop || !isVisible || !element) return;

    let throttleId: number | undefined;
    let idleId: number | undefined;

    const capture = () => {
      const rect = element.getBoundingClientRect();
      if (rect.width < 8 || rect.height < 8) return;

      ensureElectronIpc()
        .tabPreview.capture({
          rect: { height: rect.height, width: rect.width, x: rect.x, y: rect.y },
          tabId,
        })
        .catch(() => {});
    };

    const schedule = () => {
      if (throttleId !== undefined || document.hidden) return;
      throttleId = window.setTimeout(() => {
        throttleId = undefined;
        idleId = window.requestIdleCallback(capture, { timeout: IDLE_TIMEOUT });
      }, THROTTLE);
    };

    schedule();
    for (const type of ACTIVITY_EVENTS) element.addEventListener(type, schedule, LISTENER_OPTIONS);

    const observer = new MutationObserver(schedule);
    observer.observe(element, { characterData: true, childList: true, subtree: true });

    return () => {
      observer.disconnect();
      for (const type of ACTIVITY_EVENTS)
        element.removeEventListener(type, schedule, LISTENER_OPTIONS);
      if (throttleId !== undefined) window.clearTimeout(throttleId);
      if (idleId !== undefined) window.cancelIdleCallback(idleId);
    };
  }, [isVisible, tabId, ref]);
};
