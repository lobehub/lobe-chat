import { BarList } from '@lobehub/charts';
import { ModelIcon } from '@lobehub/icons';
import { ActionIcon, FormGroup, Modal } from '@lobehub/ui';
import { MaximizeIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import urlJoin from 'url-join';

import { FORM_STYLE } from '@/const/layoutTokens';
import { useClientDataSWR } from '@/libs/swr';
import { messageService } from '@/services/message';
import { ModelRankItem } from '@/types/message';

const genUrl = (id: string | null): string =>
  id ? urlJoin('/discover/model', id) : '/discover/models';

export const TopicsRank = memo(() => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation('auth');
  const router = useRouter();
  const { data, isLoading } = useClientDataSWR('rank-models', async () =>
    messageService.rankModels(),
  );

  const showExtra = Boolean(data && data?.length > 5);

  const mapData = (item: ModelRankItem) => {
    return {
      icon: <ModelIcon model={item.id as string} size={24} />,
      id: item.id,
      link: genUrl(item.id),
      name: item.id,
      value: item.count,
    };
  };

  return (
    <>
      <FormGroup
        extra={
          showExtra ? (
            <ActionIcon
              icon={MaximizeIcon}
              onClick={() => setOpen(true)}
              size={{ blockSize: 28, fontSize: 20 }}
            />
          ) : undefined
        }
        style={FORM_STYLE.style}
        title={t('stats.modelsRank.title')}
        variant={'pure'}
      >
        <Flexbox horizontal paddingBlock={16}>
          <BarList
            data={data?.slice(0, 5).map((item) => mapData(item)) || []}
            height={220}
            leftLabel={t('stats.modelsRank.left')}
            loading={isLoading || !data}
            onValueChange={(item) => router.push(genUrl(item.id))}
            rightLabel={t('stats.modelsRank.right')}
          />
        </Flexbox>
      </FormGroup>
      {showExtra && (
        <Modal
          footer={null}
          loading={isLoading || !data}
          onCancel={() => setOpen(false)}
          open={open}
          title={t('stats.modelsRank.title')}
        >
          <BarList
            data={data?.map((item) => mapData(item)) || []}
            height={340}
            leftLabel={t('stats.assistantsRank.left')}
            loading={isLoading || !data}
            onValueChange={(item) => router.push(genUrl(item.id))}
            rightLabel={t('stats.assistantsRank.right')}
          />
        </Modal>
      )}
    </>
  );
});

export default TopicsRank;
