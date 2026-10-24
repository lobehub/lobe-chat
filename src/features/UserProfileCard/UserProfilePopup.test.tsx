import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import UserProfilePopup, {
  USER_PROFILE_CLOSE_DELAY,
  USER_PROFILE_OPEN_DELAY,
} from './UserProfilePopup';

vi.mock('@/business/client/hooks/useUserProfile', () => ({
  useUserProfile: (userId?: string | null) => (userId ? { fullName: userId } : undefined),
}));

vi.mock('./index', () => ({
  default: ({ profile }: { profile: { fullName: string } }) => <span>{profile.fullName}</span>,
}));

const renderAvatars = () =>
  render(
    <>
      <UserProfilePopup userId={'alice'}>
        <span data-testid={'avatar-alice'}>A</span>
      </UserProfilePopup>
      <UserProfilePopup userId={'bob'}>
        <span data-testid={'avatar-bob'}>B</span>
      </UserProfilePopup>
    </>,
  );

const avatar = (name: string) => screen.getByTestId(`avatar-${name}`);

const cardOf = (name: string) =>
  screen
    .queryAllByTestId('user-profile-card')
    .find((card) => card.textContent === name && !card.closest('[data-ending-style]'));

const hover = (element: HTMLElement) => {
  fireEvent.pointerEnter(element, { pointerType: 'mouse' });
  fireEvent.mouseEnter(element);
  fireEvent.mouseMove(element, { clientX: 1, clientY: 1 });
};

const unhover = (element: HTMLElement) => {
  fireEvent.mouseLeave(element, { relatedTarget: document.body });
};

const advance = (ms: number) => {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
};

/** Hovers the avatar and reports whether a card opened after the open delay. */
const hoverOpens = (name: string) => {
  hover(avatar(name));
  advance(USER_PROFILE_OPEN_DELAY - 50);
  const openedEarly = Boolean(cardOf(name));
  advance(100);
  return { opened: Boolean(cardOf(name)), openedEarly };
};

const pinByClick = (name: string) => {
  fireEvent.pointerDown(avatar(name), { pointerType: 'mouse' });
  fireEvent.mouseDown(avatar(name));
  fireEvent.click(avatar(name));
  advance(0);
  expect(cardOf(name)).toBeTruthy();
  expect(avatar(name)).toHaveAttribute('data-pinned');
};

describe('UserProfilePopup', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: false });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('previews on hover after the open delay and closes after leaving', () => {
    renderAvatars();

    expect(hoverOpens('alice')).toEqual({ opened: true, openedEarly: false });

    unhover(avatar('alice'));
    advance(USER_PROFILE_CLOSE_DELAY + 50);
    expect(cardOf('alice')).toBeUndefined();
  });

  // K5: a card opened by a direct click and then closed by the window losing
  // focus used to leave Base UI remembering the click, so hover never opened
  // that avatar again.
  it('hover-opens a clicked avatar again after the window loses focus', () => {
    renderAvatars();

    pinByClick('alice');
    unhover(avatar('alice'));

    act(() => {
      window.dispatchEvent(new Event('blur'));
    });
    advance(0);
    expect(cardOf('alice')).toBeUndefined();
    expect(avatar('alice')).not.toHaveAttribute('data-pinned');

    expect(hoverOpens('alice')).toEqual({ opened: true, openedEarly: false });
  });

  it('hover-opens a clicked avatar again after hovering another avatar closed it', () => {
    renderAvatars();

    pinByClick('alice');
    unhover(avatar('alice'));

    // Only one card stays open: previewing Bob closes the pinned Alice card.
    expect(hoverOpens('bob').opened).toBe(true);
    expect(cardOf('alice')).toBeUndefined();
    expect(avatar('alice')).not.toHaveAttribute('data-pinned');
    unhover(avatar('bob'));
    advance(USER_PROFILE_CLOSE_DELAY + 50);
    expect(cardOf('bob')).toBeUndefined();

    expect(hoverOpens('alice')).toEqual({ opened: true, openedEarly: false });
  });

  it('hover-opens a clicked avatar again after a second click closed it', () => {
    renderAvatars();

    pinByClick('alice');
    fireEvent.click(avatar('alice'));
    advance(0);
    expect(cardOf('alice')).toBeUndefined();
    unhover(avatar('alice'));

    expect(hoverOpens('alice')).toEqual({ opened: true, openedEarly: false });
  });
});
