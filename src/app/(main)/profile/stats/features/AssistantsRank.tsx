import { BarList } from '@lobehub/charts';
import { ActionIcon, Avatar, FormGroup, Modal } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { MaximizeIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import qs from 'query-string';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { FORM_STYLE } from '@/const/layoutTokens';
import { DEFAULT_AVATAR } from '@/const/meta';
import { useClientDataSWR } from '@/libs/swr';
import { sessionService } from '@/services/session';
import { SessionRankItem } from '@/types/session';

export const AssistantsRank = memo(() => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation(['auth', 'chat']);
  const theme = useTheme();
  const router = useRouter();
  const { data, isLoading } = useClientDataSWR('rank-sessions', async () =>
    sessionService.rankSessions(),
  );

  const mapData = (item: SessionRankItem) => {
    const link = qs.stringifyUrl({
      query: {
        session: item.id,
      },
      url: '/chat',
    });
    return {
      icon: (
        <Avatar
          alt={item.title || t('defaultAgent', { ns: 'chat' })}
          avatar={item.avatar || DEFAULT_AVATAR}
          background={item.backgroundColor || theme.colorFillSecondary}
          size={28}
          style={{
            backdropFilter: 'blur(8px)',
          }}
        />
      ),
      link,
      name: (
        <Link href={link} style={{ color: 'inherit' }}>
          {item.title || t('defaultAgent', { ns: 'chat' })}
        </Link>
      ),
      value: item.count,
    };
  };

  return (
    <>
      <FormGroup
        extra={
          <ActionIcon
            icon={MaximizeIcon}
            onClick={() => setOpen(true)}
            size={{ blockSize: 28, fontSize: 20 }}
          />
        }
        style={FORM_STYLE.style}
        title={t('stats.assistantsRank.title')}
        variant={'pure'}
      >
        <Flexbox paddingBlock={16}>
          <BarList
            data={data?.slice(0, 5).map((item) => mapData(item)) || []}
            height={220}
            leftLabel={t('stats.assistantsRank.left')}
            loading={isLoading || !data}
            onValueChange={(item) => router.push(item.link)}
            rightLabel={t('stats.assistantsRank.right')}
          />
        </Flexbox>
      </FormGroup>
      <Modal
        footer={null}
        loading={isLoading || !data}
        onCancel={() => setOpen(false)}
        open={open}
        title={t('stats.assistantsRank.title')}
      >
        <BarList
          data={data?.map((item) => mapData(item)) || []}
          height={340}
          leftLabel={t('stats.assistantsRank.left')}
          loading={isLoading || !data}
          onValueChange={(item) => router.push(item.link)}
          rightLabel={t('stats.assistantsRank.right')}
        />
      </Modal>
    </>
  );
});

export default AssistantsRank;
