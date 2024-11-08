import { Icon } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { BringToFrontIcon, ChevronDown, ChevronRight, Loader2Icon } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { ARTIFACT_THINKING_TAG } from '@/const/plugin';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';
import { dotLoading } from '@/styles/loading';

import { MarkdownElementProps } from '../type';

/**
 * Replace all line breaks in the matched `lobeArtifact` tag with an empty string
 */
export const isLobeThinkingClosed = (input: string = '') => {
  const openTag = `<${ARTIFACT_THINKING_TAG}>`;
  const closeTag = `</${ARTIFACT_THINKING_TAG}>`;

  return input.includes(openTag) && input.includes(closeTag);
};

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    cursor: pointer;

    padding-block: 8px;
    padding-inline: 12px;
    padding-inline-end: 12px;

    color: ${token.colorText};

    background: ${token.colorFillQuaternary};
    border-radius: 8px;
  `,
  title: css`
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;

    font-size: 12px;
    text-overflow: ellipsis;
  `,
}));

const Render = memo<MarkdownElementProps>(({ children, id }) => {
  const { t } = useTranslation('chat');
  const { styles, cx } = useStyles();

  const [isGenerating] = useChatStore((s) => {
    const message = chatSelectors.getMessageById(id)(s);
    return [!isLobeThinkingClosed(message?.content)];
  });

  const [showDetail, setShowDetail] = useState(false);

  const expand = showDetail || isGenerating;
  return (
    <Flexbox
      className={styles.container}
      gap={16}
      onClick={() => {
        setShowDetail(!showDetail);
      }}
      width={'100%'}
    >
      <Flexbox distribution={'space-between'} flex={1} horizontal>
        <Flexbox gap={8} horizontal>
          <Icon icon={isGenerating ? Loader2Icon : BringToFrontIcon} spin={isGenerating} />
          {isGenerating ? (
            <span className={cx(dotLoading)}>{t('artifact.thinking')}</span>
          ) : (
            t('artifact.thought')
          )}
        </Flexbox>
        <Icon icon={expand ? ChevronDown : ChevronRight} />
      </Flexbox>
      {expand && children}
    </Flexbox>
  );
});

export default Render;
