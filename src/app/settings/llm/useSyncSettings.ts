import { FormInstance } from 'antd/es/form/hooks/useForm';
import { useEffect } from 'react';

import { useGlobalStore } from '@/store/global';

export const useSyncSettings = (form: FormInstance) => {
  useEffect(() => {
    const unsubscribe = useGlobalStore.subscribe(
      (s) => s.settings,
      (settings) => {
        form.setFieldsValue(settings);
      },
    );
    return () => {
      unsubscribe();
    };
  }, []);
};
