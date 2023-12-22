import { useResponsive } from 'antd-style';

/**
 * 确定当前设备是否为移动端
 */
export const useIsMobile = (): boolean => {
  const { mobile } = useResponsive();

  return !!mobile;
};
