import { ActionIcon, Icon } from '@lobehub/ui';
import { App, Typography } from 'antd';
import isEqual from 'fast-deep-equal';
import { LucideArrowRight, LucideSettings, LucideTrash2 } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import ModelIcon from '@/components/ModelIcon';
import { ModelInfoTags } from '@/components/ModelSelect';
import { useUserStore } from '@/store/user';
import { modelConfigSelectors, modelProviderSelectors } from '@/store/user/selectors';
import { GlobalLLMProviderKey } from '@/types/user/settings';

interface CustomModelOptionProps {
  id: string;
  provider: GlobalLLMProviderKey;
}

const CustomModelOption = memo<CustomModelOptionProps>(({ id, provider }) => {
  const { t } = useTranslation('common');
  const { t: s } = useTranslation('setting');
  const { modal } = App.useApp();

  const [dispatchCustomModelCards, toggleEditingCustomModelCard, removeEnabledModels] =
    useUserStore((s) => [
      s.dispatchCustomModelCards,
      s.toggleEditingCustomModelCard,
      s.removeEnabledModels,
    ]);

  const modelCard = useUserStore(
    modelConfigSelectors.getCustomModelCard({ id, provider }),
    isEqual,
  );

  const isEnabled = useUserStore(
    (s) => modelProviderSelectors.getEnableModelsById(provider)(s)?.includes(id),
    isEqual,
  );

  return (
    <Flexbox align={'center'} distribution={'space-between'} gap={8} horizontal>
      <Flexbox align={'center'} gap={8} horizontal style={{ flex: 1, width: '70%' }}>
        <ModelIcon model={id} size={32} />
        <Flexbox direction={'vertical'} style={{ flex: 1, overflow: 'hidden' }}>
          <Flexbox align={'center'} gap={8} horizontal>
            <Typography.Text ellipsis>{modelCard?.displayName || id}</Typography.Text>
            <ModelInfoTags id={id} {...modelCard} isCustom />
          </Flexbox>
          <Typography.Text ellipsis style={{ fontSize: 12, marginTop: '4px' }} type={'secondary'}>
            {id}
            {!!modelCard?.deploymentName && (
              <>
                <Icon icon={LucideArrowRight} />
                {modelCard?.deploymentName}
              </>
            )}
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

            await modal.confirm({
              centered: true,
              content: s('llm.customModelCards.confirmDelete'),
              okButtonProps: { danger: true },
              onOk: async () => {
                // delete model and deactivate id
                await dispatchCustomModelCards(provider, { id, type: 'delete' });
                await removeEnabledModels(provider, id);
              },
              type: 'warning',
            });
          }}
          style={isEnabled ? { marginRight: '10px' } : {}}
          title={t('delete')}
        />
      </Flexbox>
    </Flexbox>
  );
});

export default CustomModelOption;
