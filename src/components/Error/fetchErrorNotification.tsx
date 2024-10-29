import { FluentEmoji } from '@lobehub/ui';
import { t } from 'i18next';

import { notification } from '@/components/AntdStaticMethods';

import Description from './Description';

export const fetchErrorNotification = {
  error: ({ status, errorMessage }: { errorMessage: string; status: number }) => {
    notification.error({
      description: <Description message={errorMessage} status={status} />,
      icon: <FluentEmoji emoji={'🤧'} size={24} />,
      message: t('fetchError.title', { ns: 'error' }),
      type: 'error',
    });
  },
};
