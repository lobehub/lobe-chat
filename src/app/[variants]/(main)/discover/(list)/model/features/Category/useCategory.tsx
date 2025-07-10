import { ProviderIcon } from '@lobehub/icons';
import { uniqBy } from 'lodash-es';
import { LayoutPanelTopIcon } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { DEFAULT_MODEL_PROVIDER_LIST } from '@/config/modelProviders';

export const useCategory = () => {
  const { t } = useTranslation('discover');

  const items = useMemo(
    () =>
      uniqBy(DEFAULT_MODEL_PROVIDER_LIST, (item) => item.id).map((item) => {
        return {
          icon: <ProviderIcon provider={item.id} size={18} type={'mono'} />,
          key: item.id,
          label: item.name,
        };
      }),
    [],
  );

  return useMemo(
    () => [
      {
        icon: LayoutPanelTopIcon,
        key: 'all',
        label: t('mcp.categories.all.name'),
      },
      ...items,
    ],
    [t, items],
  );
};

export const useCategoryItem = (key?: string) => {
  const items = useCategory();
  if (!key) return;
  return items.find((item) => item.key === key);
};
