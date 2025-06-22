import { ActionIcon, Text } from '@lobehub/ui';
import isEqual from 'fast-deep-equal';
import { ArrowDownUpIcon, ToggleLeft } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import { useAiInfraStore } from '@/store/aiInfra';
import { aiModelSelectors } from '@/store/aiInfra/selectors';

import ModelItem from '../ModelItem';
import SortModelModal from '../SortModelModal';

const EnabledModelList = () => {
  const { t } = useTranslation('modelProvider');

  const enabledModels = useAiInfraStore(aiModelSelectors.enabledAiProviderModelList, isEqual);
  const batchToggleAiModels = useAiInfraStore((s) => s.batchToggleAiModels);
  const [open, setOpen] = useState(false);
  const [batchLoading, setBatchLoading] = useState(false);

  const isEmpty = enabledModels.length === 0;
  return (
    <>
      <Flexbox horizontal justify={'space-between'}>
        <Text style={{ fontSize: 12, marginTop: 8 }} type={'secondary'}>
          {t('providerModels.list.enabled')}
        </Text>
        {!isEmpty && (
          <Flexbox horizontal>
            <ActionIcon
              icon={ToggleLeft}
              loading={batchLoading}
              onClick={async () => {
                setBatchLoading(true);
                await batchToggleAiModels(
                  enabledModels.map((i) => i.id),
                  false,
                );
                setBatchLoading(false);
              }}
              size={'small'}
              title={t('providerModels.list.enabledActions.disableAll')}
            />

            <ActionIcon
              icon={ArrowDownUpIcon}
              onClick={() => {
                setOpen(true);
              }}
              size={'small'}
              title={t('providerModels.list.enabledActions.sort')}
            />
          </Flexbox>
        )}
        {open && (
          <SortModelModal
            defaultItems={enabledModels}
            onCancel={() => {
              setOpen(false);
            }}
            open={open}
          />
        )}
      </Flexbox>
      {isEmpty ? (
        <Center padding={12}>
          <Text style={{ fontSize: 12 }} type={'secondary'}>
            {t('providerModels.list.enabledEmpty')}
          </Text>
        </Center>
      ) : (
        <Flexbox gap={2}>
          {enabledModels.map(({ displayName, id, ...res }) => {
            const label = displayName || id;

            return <ModelItem displayName={label as string} id={id as string} key={id} {...res} />;
          })}
        </Flexbox>
      )}
    </>
  );
};
export default EnabledModelList;
