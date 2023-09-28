import { ActionIcon } from '@lobehub/ui';
import { Button, Dropdown, Skeleton } from 'antd';
import { MenuItemType } from 'antd/lib/menu/hooks/useItems';
import { RotateCwIcon } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { getModelList } from './getModelList';

interface ModelListProps {
  value?: string[];
}
const ModelList = memo<ModelListProps>(({ value }) => {
  const { t } = useTranslation('setting');

  const isLoading = !value;

  if (isLoading)
    return (
      <Skeleton active paragraph={false} title={{ style: { marginBottom: 0 }, width: '50%' }} />
    );

  const isEmpty = value?.length === 0;

  return isEmpty ? (
    <Button
      onClick={() => {
        getModelList('openAI');
      }}
    >
      {t('llm.OpenAI.models.fetch')}
    </Button>
  ) : (
    <Dropdown
      menu={{
        items: (value || []).map<MenuItemType>((v) => ({
          key: v,
          label: v,
        })),
      }}
    >
      <Flexbox align={'center'} gap={8} horizontal>
        {t('llm.OpenAI.models.count', { count: value.length })}
        <ActionIcon icon={RotateCwIcon} size={'small'} title={t('llm.OpenAI.models.refetch')} />
      </Flexbox>
    </Dropdown>
  );
});

export default ModelList;
