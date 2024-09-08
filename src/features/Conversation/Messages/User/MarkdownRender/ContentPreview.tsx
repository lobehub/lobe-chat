import { Markdown } from '@lobehub/ui';
import { Button } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';

const useStyles = createStyles(({ css, token }) => ({
  mask: css`
    position: absolute;
    inset-block: 0 0;

    width: 100%;

    background: linear-gradient(0deg, ${token.colorBgContainer} 0%, transparent 100%);
  `,
}));

interface ContentPreviewProps {
  content: string;
  id: string;
}

const ContentPreview = ({ content, id }: ContentPreviewProps) => {
  const { t } = useTranslation('chat');

  const [openMessageDetail] = useChatStore((s) => [s.openMessageDetail]);

  const { styles } = useStyles();
  return (
    <Flexbox>
      <Flexbox style={{ position: 'relative' }}>
        <Markdown variant={'chat'}>{content.slice(0, 1000)}</Markdown>
        <div className={styles.mask} />
      </Flexbox>
      <Flexbox padding={4}>
        <Button
          block
          onClick={() => {
            openMessageDetail(id);
          }}
          size={'small'}
        >
          {t('chatList.longMessageDetail')}
        </Button>
      </Flexbox>
    </Flexbox>
  );
};
export default ContentPreview;
