import { ConfigProvider } from 'antd';
import { useContext, useMemo } from 'react';

export const useDirection = () => {
  const { direction } = useContext(ConfigProvider.ConfigContext);

  return useMemo(() => {
    return direction;
  }, [direction]);
};
