import { FormInstance } from 'antd/es/form/hooks/useForm';
import { useEffect } from 'react';

import { useUserStore } from '@/store/user';

export const useSyncSettings = (form: FormInstance) => {
  useEffect(() => {
    // set the first time
    form.setFieldsValue(useUserStore.getState().settings);

    // sync with later updated settings
    const unsubscribe = useUserStore.subscribe(
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
