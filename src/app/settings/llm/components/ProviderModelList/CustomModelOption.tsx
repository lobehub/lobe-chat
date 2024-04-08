import { ActionIcon } from '@lobehub/ui';
import { App, Typography } from 'antd';
import isEqual from 'fast-deep-equal';
import { LucideSettings, LucideTrash2 } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import ModelIcon from '@/components/ModelIcon';
import { ModelInfoTags } from '@/components/ModelSelect';
import { useGlobalStore } from '@/store/global';
import { modelConfigSelectors } from '@/store/global/slices/settings/selectors';
import { GlobalLLMProviderKey } from '@/types/settings';

interface CustomModelOptionProps {
  id: string;
  provider: GlobalLLMProviderKey;
}

const CustomModelOption = memo<CustomModelOptionProps>(({ id, provider }) => {
  const { t } = useTranslation('common');
  const { t: s } = useTranslation('setting');
  const { modal } = App.useApp();

  const [dispatchCustomModelCards, toggleEditingCustomModelCard] = useGlobalStore((s) => [
    s.dispatchCustomModelCards,
    s.toggleEditingCustomModelCard,
  ]);
  const modelCard = useGlobalStore(
    modelConfigSelectors.getCustomModelCardById({ id, provider }),
    isEqual,
  );

  return (
    <Flexbox align={'center'} distribution={'space-between'} gap={8} horizontal>
      <Flexbox align={'center'} gap={8} horizontal>
        <ModelIcon model={id} size={32} />
        <Flexbox>
          <Flexbox align={'center'} gap={8} horizontal>
            {modelCard?.displayName || id}
            <ModelInfoTags id={id} {...modelCard} isCustom />
          </Flexbox>
          <Typography.Text style={{ fontSize: 12 }} type={'secondary'}>
            {id}
          </Typography.Text>
        </Flexbox>
      </Flexbox>

      <Flexbox horizontal>
        <ActionIcon
          icon={LucideSettings}
          onClick={async (e) => {
            e.stopPropagation();
            toggleEditingCustomModelCard({ id, provider });
          }}
          title={s('llm.customModelCards.config')}
        />
        <ActionIcon
          icon={LucideTrash2}
          onClick={async (e) => {
            e.stopPropagation();
            e.preventDefault();

            const isConfirm = await modal.confirm({
              centered: true,
              content: s('llm.customModelCards.confirmDelete'),
              okButtonProps: { danger: true },
              type: 'warning',
            });

            if (isConfirm) {
              dispatchCustomModelCards(provider, { id, type: 'delete' });
            }
          }}
          title={t('delete')}
        />
      </Flexbox>
    </Flexbox>
  );
});

export default CustomModelOption;
