import { MobileSafeArea, type MobileSafeAreaProps } from '@lobehub/ui';
import { memo } from 'react';

import { HEADER_HEIGHT, MOBILE_NABBAR_HEIGHT, MOBILE_TABBAR_HEIGHT } from '@/const/layoutTokens';

interface SafeSpacingProps {
  height?: number;
  mobile?: boolean;
  position?: MobileSafeAreaProps['position'];
}

const SafeSpacing = memo<SafeSpacingProps>(({ height, position = 'top', mobile }) => {
  let h;
  if (mobile) {
    h = position === 'top' ? MOBILE_NABBAR_HEIGHT : MOBILE_TABBAR_HEIGHT;
  } else {
    h = HEADER_HEIGHT;
  }
  return (
    <>
      <div style={{ flex: 'none', height: height || h }} />
      {mobile && <MobileSafeArea position={position} />}
    </>
  );
});

export default SafeSpacing;
