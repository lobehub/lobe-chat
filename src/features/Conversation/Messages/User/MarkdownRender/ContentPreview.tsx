import { Markdown } from '@lobehub/ui';
import { Button } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';
import { convertAlphaToSolid } from '@/utils/colorUtils';

const useStyles = createStyles(({ css, token, isDarkMode }, displayMode: 'chat' | 'docs') => {
  const darkBg = convertAlphaToSolid(token.colorFillSecondary, token.colorBgContainer);

  const maskBgColor =
    displayMode === 'docs' ? token.colorBgLayout : isDarkMode ? darkBg : token.colorBgContainer;

  return {
    mask: css`
      pointer-events: none;

      position: absolute;
      inset-block: 0 0;

      width: 100%;

      background: linear-gradient(0deg, ${maskBgColor} 0%, transparent 50%);
    `,
  };
});

interface ContentPreviewProps {
  content: string;
  displayMode: 'chat' | 'docs';
  id: string;
}

const ContentPreview = ({ content, id, displayMode }: ContentPreviewProps) => {
  const { t } = useTranslation('chat');

  const [openMessageDetail] = useChatStore((s) => [s.openMessageDetail]);

  const { styles } = useStyles(displayMode);
  return (
    <Flexbox>
      <Flexbox style={{ position: 'relative' }}>
        <Markdown variant={'chat'}>{content.slice(0, 1000)}</Markdown>
        <div className={styles.mask} />
      </Flexbox>
      <Flexbox padding={4}>
        <Button
          block
          color={'default'}
          onClick={() => {
            openMessageDetail(id);
          }}
          size={'small'}
          variant={'filled'}
        >
          {t('chatList.longMessageDetail')}
        </Button>
      </Flexbox>
    </Flexbox>
  );
};
export default ContentPreview;
