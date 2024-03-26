import { useResponsive } from 'antd-style';

export const useIsMobile = (): boolean => {
  const { mobile } = useResponsive();

  return !!mobile;
};
