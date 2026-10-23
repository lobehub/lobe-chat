'use client';

import { createContext, use } from 'react';

/**
 * Whether the nav panel's home layer is the layer currently on screen.
 *
 * While another nav panel (settings, agent, …) is active, the home layer stays
 * mounted inside `<Activity mode="hidden">`. `Activity` unmounts the hidden
 * subtree's effects and `display: none`s its DOM, but floating UI portaled to
 * `document.body` escapes both: a controlled popover would stay visible on top
 * of the new panel with its dismiss listeners already torn down (lobehub#21190).
 * Consumers read this flag so they can avoid rendering that UI while the layer is
 * hidden.
 *
 * This is also a React bug: `<Activity>` did not hide portaled content until
 * facebook/react#35091 ("Fix: Activity should hide portal contents"), shipped in
 * React 19.3.0 (see facebook/react#35000). While this repo stays on the React
 * 19.2 line, consumers have to respect the flag themselves.
 *
 * Defaults to `true` for locations where the home layer is not managed by the
 * nav panel (e.g. the mobile sidebar drawer).
 */
const NavPanelHomeActiveContext = createContext(true);

export const NavPanelHomeActiveProvider = NavPanelHomeActiveContext.Provider;

export const useNavPanelHomeActive = () => use(NavPanelHomeActiveContext);
