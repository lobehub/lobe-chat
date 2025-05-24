import { Block, MarkdownProps } from '@lobehub/ui';
import { ChatItem } from '@lobehub/ui/chat';
import { useTheme } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { BRANDING_NAME } from '@/const/branding';
import { DEFAULT_INBOX_AVATAR } from '@/const/meta';

const ChatPreview = memo<Pick<MarkdownProps, 'fontSize'>>(({ fontSize }) => {
  const theme = useTheme();
  const { t } = useTranslation('welcome');
  return (
    <Block
      style={{
        background: theme.colorBgContainerSecondary,
        marginBlock: 16,
        minHeight: 110,
      }}
      variant={'outlined'}
    >
      <ChatItem
        avatar={{
          avatar: DEFAULT_INBOX_AVATAR,
        }}
        fontSize={fontSize}
        message={t('guide.defaultMessageWithoutCreate', {
          appName: BRANDING_NAME,
        })}
      />
    </Block>
  );
});

export default ChatPreview;
