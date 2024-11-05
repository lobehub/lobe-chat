import { Markdown } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { memo } from 'react';

const useStyles = createStyles(({ css, token, stylish, cx }) => ({
  preview: cx(
    stylish.noScrollbar,
    css`
      overflow: hidden scroll;

      width: 100%;
      max-height: 70dvh;
      padding-block: 0;
      padding-inline: 12px;

      background: ${token.colorBgLayout};
      border: 1px solid ${token.colorBorder};
      border-radius: ${token.borderRadiusLG}px;

      * {
        pointer-events: none;

        ::-webkit-scrollbar {
          width: 0 !important;
          height: 0 !important;
        }
      }
    `,
  ),
}));

const Preview = memo<{ content: string }>(({ content }) => {
  const { styles } = useStyles();

  return (
    <div className={styles.preview}>
      <Markdown>{content}</Markdown>
    </div>
  );
});

export default Preview;
