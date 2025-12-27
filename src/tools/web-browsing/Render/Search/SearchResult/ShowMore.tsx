import { Flexbox } from '@lobehub/ui';
import { createStaticStyles } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useChatStore } from '@/store/chat';
import { WebBrowsingManifest } from '@/tools/web-browsing';

import { EngineAvatarGroup } from '../../../components/EngineAvatar';

const styles = createStaticStyles(({ css, cssVar }) => ({
  container: css`
    cursor: pointer;

    height: 100%;
    padding: 8px;
    border-radius: 8px;

    font-size: 12px;
    color: initial;

    background: ${cssVar.colorFillQuaternary};

    &:hover {
      background: ${cssVar.colorFillTertiary};
    }
  `,
  title: css`
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;

    text-overflow: ellipsis;
  `,
}));

interface ShowMoreProps {
  engines: string[];
  messageId: string;
  resultsNumber: number;
}
const ShowMore = memo<ShowMoreProps>(({ messageId, engines, resultsNumber }) => {
  const [openToolUI] = useChatStore((s) => [s.openToolUI]);

  const { t } = useTranslation('tool');

  return (
    <Flexbox
      className={styles.container}
      gap={2}
      justify={'space-between'}
      onClick={() => {
        openToolUI(messageId, WebBrowsingManifest.identifier);
      }}
    >
      <div className={styles.title}>{t('search.viewMoreResults', { results: resultsNumber })}</div>
      <Flexbox align={'center'} gap={4} horizontal>
        <EngineAvatarGroup engines={engines} />
      </Flexbox>
    </Flexbox>
  );
});

export default ShowMore;
