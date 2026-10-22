'use client';

import { Flexbox, type FlexboxProps } from '@lobehub/ui';
import { memo } from 'react';

import { useMinimapGutterWidth } from './useMinimapVisible';

interface MinimapGutterProps extends FlexboxProps {
  /** Set to false where the minimap is not mounted (e.g. mobile group chat). */
  enabled?: boolean;
}

/**
 * Message-list wrapper that reserves the minimap rail's lane at the inline
 * end while the rail is shown, so wide content (tables, code) is never
 * covered by the absolutely positioned rail.
 */
const MinimapGutter = memo<MinimapGutterProps>(({ enabled = true, style, ...rest }) => {
  const gutterWidth = useMinimapGutterWidth(enabled);

  return <Flexbox {...rest} style={{ ...style, paddingInlineEnd: gutterWidth }} />;
});

MinimapGutter.displayName = 'ChatMinimapGutter';

export default MinimapGutter;
