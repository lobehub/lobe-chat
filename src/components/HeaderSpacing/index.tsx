import { memo } from 'react';

import { HEADER_HEIGHT } from '@/const/layoutTokens';

const HeaderSpacing = memo(() => <div style={{ flex: 'none', height: HEADER_HEIGHT }} />);

export default HeaderSpacing;
