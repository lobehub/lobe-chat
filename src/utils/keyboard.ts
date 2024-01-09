import { KeyboardEvent } from 'react';

import { isMacOS } from './platform';

export const isCommandPressed = (event: KeyboardEvent) => {
  const isMac = isMacOS();

  if (isMac) {
    return event.metaKey; // Use metaKey (Command key) on macOS
  } else {
    return event.ctrlKey; // Use ctrlKey on Windows/Linux
  }
};
