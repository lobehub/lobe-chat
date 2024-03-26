import { useResponsive } from 'antd-style';
import { useMemo } from 'react';

export const useIsMobile = (): boolean => {
  const { mobile } = useResponsive();

  return useMemo(() => !!mobile, [mobile]);
};
