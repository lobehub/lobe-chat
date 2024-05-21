import { t } from 'i18next';

import { notification } from '@/components/AntdStaticMethods';

import Description from './Description';

export const fetchErrorNotification = {
  error: ({ status, errorMessage }: { errorMessage: string; status: number }) => {
    notification.error({
      description: <Description message={errorMessage} status={status} />,
      message: t('fetchError', { ns: 'error' }),
      type: 'error',
    });
  },
};
