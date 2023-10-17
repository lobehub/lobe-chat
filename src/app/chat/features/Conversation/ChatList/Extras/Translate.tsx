import { ActionIcon, Icon, Markdown, Tag } from '@lobehub/ui';
import { App } from 'antd';
import { createStyles } from 'antd-style';
import copy from 'copy-to-clipboard';
import { ChevronDown, ChevronUp, ChevronsRight, CopyIcon, TrashIcon } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import BubblesLoading from '@/app/chat/features/Conversation/ChatList/Loading';
import { useSessionStore } from '@/store/session';
import { ChatTranslate } from '@/types/chatMessage';

const useStyles = createStyles(({ css }) => ({
  container: css`
    margin-top: 8px;
  `,
}));

interface TranslateProps extends ChatTranslate {
  id: string;
  loading?: boolean;
}

const Translate = memo<TranslateProps>(({ content = '', from, to, id, loading }) => {
  const { theme } = useStyles();
  const { t } = useTranslation('common');
  const [show, setShow] = useState(true);
  const clearTranslate = useSessionStore((s) => s.clearTranslate);

  const { message } = App.useApp();
  return (
    <Flexbox gap={8}>
      <Flexbox align={'center'} horizontal justify={'space-between'}>
        <div>
          <Flexbox gap={4} horizontal>
            <Tag style={{ margin: 0 }}>{from ? t(`lang.${from}` as any) : '...'}</Tag>
            <Icon color={theme.colorTextTertiary} icon={ChevronsRight} />
            <Tag>{t(`lang.${to}` as any)}</Tag>
          </Flexbox>
        </div>
        <Flexbox horizontal>
          <ActionIcon
            icon={CopyIcon}
            onClick={() => {
              copy(content);
              message.success(t('copySuccess'));
            }}
            size={'small'}
            title={t('copy')}
          />
          <ActionIcon
            icon={TrashIcon}
            onClick={() => {
              clearTranslate(id);
            }}
            size={'small'}
            title={t('translate.clear', { ns: 'chat' })}
          />
          <ActionIcon
            icon={show ? ChevronDown : ChevronUp}
            onClick={() => {
              setShow(!show);
            }}
            size={'small'}
          />
        </Flexbox>
      </Flexbox>
      {show && !content ? <BubblesLoading /> : <Markdown>{content}</Markdown>}
    </Flexbox>
  );
});

export default Translate;
