import { type MouseEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';

/** Base UI's merged handlers let the handler we pass skip the library's own one. */
type TriggerClickEvent = MouseEvent & { preventBaseUIHandler?: () => void };

// Avatars sit inside clickable rows (topic links, task items). A click on the
// avatar or inside the card belongs to the popup, not to the row behind it.
const stopRowClick = (event: MouseEvent) => {
  event.preventDefault();
  event.stopPropagation();
};

// Only one profile card is open at a time, as in Discord: opening another one
// closes the previous card even when it was pinned.
let closeOpenPopup: (() => void) | undefined;

/**
 * Open state of a user profile popup.
 *
 * - `both`: hover previews the card and a click (or Enter / Space) pins it.
 *   While pinned, hover no longer closes it; another click, Esc or an outside
 *   click does.
 * - `hover`: the avatar's click belongs to another control, so it only closes
 *   the preview and passes through.
 *
 * Opening a card closes any other open one, and the window losing focus closes
 * it.
 *
 * Closes we start ourselves go through the popover's own close (handed over by
 * `registerClose` from inside the card), not by flipping `open`. Base UI
 * remembers the click that opened the popover until its own close runs, and
 * while it remembers one it never hover-opens that trigger again.
 */
export const useUserProfilePopupState = (trigger: 'both' | 'hover') => {
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const closePopoverRef = useRef<(() => void) | undefined>(undefined);

  const onClosed = useCallback(() => {
    setOpen(false);
    setPinned(false);
  }, []);

  const onOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) setOpen(true);
      else onClosed();
    },
    [onClosed],
  );

  /** Called from inside the open card with the popover's close; `undefined` on unmount. */
  const registerClose = useCallback((closePopover: (() => void) | undefined) => {
    closePopoverRef.current = closePopover;
  }, []);

  // The popover's close reports back through `onOpenChange(false)`. Before the
  // card has mounted there is nothing for the library to reset yet.
  const close = useCallback(() => {
    if (closePopoverRef.current) closePopoverRef.current();
    else onClosed();
  }, [onClosed]);

  useEffect(() => {
    if (!open) return;

    if (closeOpenPopup !== close) closeOpenPopup?.();
    closeOpenPopup = close;
    window.addEventListener('blur', close);

    return () => {
      window.removeEventListener('blur', close);
      if (closeOpenPopup === close) closeOpenPopup = undefined;
    };
  }, [open, close]);

  const triggerProps = useMemo(() => {
    if (trigger === 'hover') return { onClick: close };

    return {
      'data-pinned': pinned ? '' : undefined,
      // Base UI treats a click more than 500ms after a hover open as a
      // "patient" click and toggles the popover closed. A click on a hover
      // preview pins it here instead, so clicks on an open card are handled
      // before the library's toggle runs.
      'onClick': (event: TriggerClickEvent) => {
        stopRowClick(event);
        if (!open) {
          // Closed: the library's press opens it.
          setPinned(true);
          return;
        }
        event.preventBaseUIHandler?.();
        if (pinned) close();
        else setPinned(true);
      },
      'openOnHover': !pinned,
    };
  }, [close, open, pinned, trigger]);

  return { onOpenChange, open, pinned, registerClose, triggerProps };
};
