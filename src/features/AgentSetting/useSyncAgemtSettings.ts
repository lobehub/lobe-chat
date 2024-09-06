import { FormInstance } from 'antd/es/form/hooks/useForm';
import isEqual from 'fast-deep-equal';
import { useLayoutEffect } from 'react';

import { useStore } from './store';

export const useAgentSyncSettings = (form: FormInstance) => {
  const config = useStore((s) => s.config, isEqual);
  useLayoutEffect(() => {
    form.setFieldsValue(config);
  }, [config]);

  return config;
};
