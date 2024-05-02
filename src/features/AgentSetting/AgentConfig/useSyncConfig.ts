import { FormInstance } from 'antd/es/form/hooks/useForm';
import { useEffect } from 'react';

import { useStoreApi } from '../store';

export const useSyncConfig = (form: FormInstance) => {
  const storeApi = useStoreApi();

  useEffect(() => {
    // set the first time
    form.setFieldsValue(storeApi.getState().config);

    // sync with later updated settings
    const unsubscribe = storeApi.subscribe(
      (s) => s.config,
      (config) => form.setFieldsValue(config),
    );

    return () => {
      unsubscribe();
    };
  }, []);
};
