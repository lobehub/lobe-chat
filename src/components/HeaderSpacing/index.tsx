import { memo } from 'react';

import { HEADER_HEIGHT } from '@/const/layoutTokens';

const HeaderSpacing = memo<{ height?: number }>(({ height = HEADER_HEIGHT }) => (
  <div style={{ flex: 'none', height }} />
));

export default HeaderSpacing;
