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
import { modelConfigSelectors } from '@/store/user/selectors';
import { GlobalLLMProviderKey } from '@/types/settings';

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
            <Flexbox gap={2} horizontal>
              {id}
              {!!modelCard?.deploymentName && (
                <>
                  <Icon icon={LucideArrowRight} />
                  {modelCard?.deploymentName}
                </>
              )}
            </Flexbox>
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

            // delete model and deactive id
            if (isConfirm) {
              await dispatchCustomModelCards(provider, { id, type: 'delete' });
              await removeEnabledModels(provider, id);
            }
          }}
          title={t('delete')}
        />
      </Flexbox>
    </Flexbox>
  );
});

export default CustomModelOption;
