'use client';

import { Popover, Tooltip, usePopoverContext } from '@lobehub/ui';
import { cssVar } from '@lobehub/ui/stylex/cssVar.stylex';
import * as stylex from '@stylexjs/stylex';
import { memo, type ReactElement, useEffect } from 'react';

import { useUserProfile } from '@/business/client/hooks/useUserProfile';

import UserProfileCard from '.';
import { useUserProfilePopupState } from './useUserProfilePopupState';

/** Hover preview: wait for the pointer to settle so scanning a list stays quiet. */
export const USER_PROFILE_OPEN_DELAY = 400;
/** Grace period for moving the pointer from the avatar onto the card. */
export const USER_PROFILE_CLOSE_DELAY = 200;
/** Gap between the avatar and the card, as in Discord's popout. */
export const USER_PROFILE_SIDE_OFFSET = 8;

// Discord's popout slides 10px in from the avatar side over 0.2s and has no
// exit transition. Flipping to the left reverses the direction.
const slideIn = stylex.keyframes({
  from: { transform: 'translate3d(var(--user-profile-enter-x), 0, 0)' },
  to: { transform: 'translate3d(0, 0, 0)' },
});

const fadeIn = stylex.keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
});

const styles = stylex.create({
  popup: {
    '--user-profile-enter-x': {
      'default': '-10px',
      ':is([data-side="left"], [data-side="inline-start"])': '10px',
    },
    'animationDuration': {
      'default': '0.2s',
      '@media (prefers-reduced-motion: reduce)': '0.08s',
    },
    'animationName': {
      'default': slideIn,
      ':is([data-ending-style])': 'none',
      '@media (prefers-reduced-motion: reduce)': fadeIn,
    },
    'animationTimingFunction': 'ease-out',
    // Replace the library's scale/fade transition with the slide above, and
    // close instantly.
    'transitionProperty': 'none',
  },
  trigger: {
    borderRadius: '50%',
    // Pinned (clicked or opened from the keyboard) reads as pressed.
    boxShadow: {
      'default': null,
      ':is([data-pinned])': `0 0 0 2px ${cssVar.colorPrimary}`,
    },
    cursor: 'pointer',
  },
});

const POPOVER_STYLES = {
  content: { borderRadius: 12, overflow: 'hidden', padding: 0 },
} as const;

const POSITIONER_PROPS = {
  collisionAvoidance: { align: 'shift', fallbackAxisSide: 'none', side: 'flip' },
  sideOffset: USER_PROFILE_SIDE_OFFSET,
} as const;

/** Hands the popover's own close to the popup state while the card is mounted. */
const PopoverCloseBridge = memo<{ onRegister: (close: (() => void) | undefined) => void }>(
  ({ onRegister }) => {
    const { close } = usePopoverContext();

    useEffect(() => {
      onRegister(close);
      return () => onRegister(undefined);
    }, [close, onRegister]);

    return null;
  },
);

interface UserProfilePopupProps {
  children: ReactElement;
  /** Tooltip kept when no local profile resolves for this user. */
  fallbackTitle?: string | null;
  /**
   * `both` (default): hover previews the card, a click pins it.
   * `hover`: the avatar's click already belongs to another control (such as an
   * assignee picker), so hover only previews and a click closes the preview and
   * passes through.
   */
  trigger?: 'both' | 'hover';
  userId?: string | null;
}

/**
 * Profile popup for a user avatar. Hovering previews the card and leaving
 * closes it; a click (or Enter / Space) pins it open until Esc, an outside
 * click or another click on the avatar. Data comes only from the local member
 * copy through `useUserProfile`, so opening it never sends a request.
 */
const UserProfilePopup = memo<UserProfilePopupProps>(
  ({ children, fallbackTitle, trigger = 'both', userId }) => {
    const profile = useUserProfile(userId);
    const { onOpenChange, open, registerClose, triggerProps } = useUserProfilePopupState(trigger);

    if (!profile)
      return fallbackTitle ? <Tooltip title={fallbackTitle}>{children}</Tooltip> : children;

    return (
      <Popover
        className={stylex.props(styles.popup).className}
        classNames={{ trigger: stylex.props(styles.trigger).className }}
        closeDelay={USER_PROFILE_CLOSE_DELAY}
        nativeButton={false}
        open={open}
        openDelay={USER_PROFILE_OPEN_DELAY}
        placement={'rightTop'}
        positionerProps={POSITIONER_PROPS}
        styles={POPOVER_STYLES}
        trigger={trigger}
        triggerProps={triggerProps}
        content={
          <div data-testid={'user-profile-card'} onClick={(event) => event.stopPropagation()}>
            <PopoverCloseBridge onRegister={registerClose} />
            <UserProfileCard profile={profile} />
          </div>
        }
        onOpenChange={onOpenChange}
      >
        {children}
      </Popover>
    );
  },
);

UserProfilePopup.displayName = 'UserProfilePopup';

export default UserProfilePopup;
