import { ActionIcon } from '@lobehub/ui';
import { App, Typography } from 'antd';
import { LucideSettings, LucideTrash2 } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import ModelIcon from '@/components/ModelIcon';
import { useGlobalStore } from '@/store/global';
import { GlobalLLMProviderKey } from '@/types/settings';

import ModelConfigModal from './ModelConfigModal';

interface CustomModelOptionProps {
  id: string;
  provider: GlobalLLMProviderKey;
}

const CustomModelOption = memo<CustomModelOptionProps>(({ id, provider }) => {
  const { t } = useTranslation('common');
  const { t: s } = useTranslation('setting');
  const { modal } = App.useApp();

  const [open, setOpen] = useState(true);
  const [dispatchCustomModelCards] = useGlobalStore((s) => [s.dispatchCustomModelCards]);

  return (
    <>
      <Flexbox align={'center'} distribution={'space-between'} gap={8} horizontal>
        <Flexbox>
          <ModelIcon model={id} size={32} />
          <Flexbox>
            <Flexbox align={'center'} gap={8} horizontal>
              {id}
              {/*<ModelInfoTags id={id} isCustom />*/}
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
              setOpen(true);
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
      <ModelConfigModal onOpenChange={setOpen} open={open} provider={provider} />
    </>
  );
});

export default CustomModelOption;
