import { Markdown, MarkdownProps } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { AssistantContentBlock } from '@/types/message';

import { normalizeThinkTags, processWithArtifact } from '../../utils/markdown';
import ImageFileListViewer from '../User/ImageFileListViewer';
import Tool from './Tool';

const useStyles = createStyles(({ css, token }) => {
  const lineBlock = css`
    content: '';

    position: absolute;
    inset-inline-start: 3px;

    width: 1px;

    background: ${token.colorBorderSecondary};
  `;

  return {
    blockEnd: css`
      padding-block: 0 12px;
      padding-inline: 12px;
      border: 1px solid ${token.colorBorderSecondary};
      border-block-start: 0;
      border-end-start-radius: 8px;
      border-end-end-radius: 8px;
    `,
    blockInMiddle: css`
      padding-inline: 12px;
      border: 1px solid ${token.colorBorderSecondary};
      border-block-start: 0;
      border-block-end: 0;
      border-radius: 0;
    `,
    blockStandalone: css`
      padding-block: 6px;
      padding-inline: 12px;
      border: 1px solid ${token.colorBorderSecondary};
      border-radius: 8px;
    `,
    blockStart: css`
      padding-block: 12px 0;
      padding-inline: 12px;
      border: 1px solid ${token.colorBorderSecondary};
      border-block-end: 0;
      border-start-start-radius: 8px;
      border-start-end-radius: 8px;
    `,
    headerLineBottom: css`
      &::after {
        ${lineBlock};
        inset-block: 14px 0;
      }
    `,
    headerLineTop: css`
      &::before {
        ${lineBlock};
        inset-block-start: 0;
        height: 17px;
      }
    `,
    status: css`
      position: relative;
      z-index: 1;

      display: flex;
      flex-shrink: 0;
      align-items: center;
      justify-content: center;

      width: 6px;
      height: 6px;
      margin-block-start: 10px;
      border-radius: 50%;

      background-color: ${token.colorTextQuaternary};
    `,
    toolContent: css`
      flex: 1;
      min-width: 0;
    `,
    toolHeader: css`
      position: relative;
      display: flex;
      gap: 6px;
      padding-block: 4px;
    `,
    toolHeaderFirst: css`
      padding-block-start: 0;
    `,
    toolHeaderLast: css`
      padding-block-end: 0;
    `,
  };
});

interface AssistantBlockProps extends AssistantContentBlock {
  blockPosition?: 'start' | 'middle' | 'end' | 'standalone';
  index: number;
  markdownProps?: Omit<MarkdownProps, 'className' | 'style' | 'children'>;
}
export const AssistantBlock = memo<AssistantBlockProps>(
  ({ id, tools, content, imageList, markdownProps, blockPosition }) => {
    const { styles, cx } = useStyles();
    // const generating = useChatStore(chatSelectors.isMessageGenerating(id));

    // const isToolCallGenerating = generating && (content === LOADING_FLAT || !content) && !!tools;
    const message = normalizeThinkTags(processWithArtifact(content));

    const showImageItems = !!imageList && imageList.length > 0;

    if (tools && tools.length > 0) {
      return (
        <Flexbox
          className={cx(
            blockPosition === 'standalone' && styles.blockStandalone,
            blockPosition === 'start' && styles.blockStart,
            blockPosition === 'middle' && styles.blockInMiddle,
            blockPosition === 'end' && styles.blockEnd,
          )}
          gap={0}
        >
          {tools.map((toolCall, index) => {
            const isFirstToolInBlock = blockPosition === 'start';
            const isLastToolInBlock = blockPosition === 'end';

            // 根据 blockPosition 判断是否需要连接到其他 block
            const needConnectToPrevBlock = blockPosition === 'middle' || blockPosition === 'end';
            const needConnectToNextBlock = blockPosition === 'middle' || blockPosition === 'start';

            // header 需要上方连线：不是第一个 tool，或者是第一个但需要连接到上一个 block
            const needTopLine = !isFirstToolInBlock || needConnectToPrevBlock;

            // header 需要下方连线：不是最后一个 tool，或者是最后一个但需要连接到下一个 block
            const needBottomLine = !isLastToolInBlock || needConnectToNextBlock;

            const headerClassName = cx(
              styles.toolHeader,
              isFirstToolInBlock && styles.toolHeaderFirst,
              isLastToolInBlock && styles.toolHeaderLast,
              needTopLine && styles.headerLineTop,
              needBottomLine && styles.headerLineBottom,
            );

            return (
              <Flexbox key={toolCall.id}>
                <div className={headerClassName}>
                  <div className={styles.status} />
                  <div className={styles.toolContent}>
                    <Tool
                      apiName={toolCall.apiName}
                      arguments={toolCall.arguments}
                      id={toolCall.id}
                      identifier={toolCall.identifier}
                      index={index}
                      messageId={id}
                      payload={toolCall}
                      type={toolCall.type}
                    />
                  </div>
                </div>
              </Flexbox>
            );
          })}
        </Flexbox>
      );
    }

    return (
      <Flexbox gap={8} id={id} style={{ marginBlock: 8 }}>
        <Markdown {...markdownProps} variant={'chat'}>
          {message}
        </Markdown>
        {showImageItems && <ImageFileListViewer items={imageList} />}
      </Flexbox>
    );
  },
);
