import { createStyles } from 'antd-style';
import { Fragment, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

const useStyles = createStyles(
  ({ css, token }) => css`
    font-size: 12px;

    span {
      font-weight: 600;
      opacity: 0.5;
    }

    kbd {
      padding: 3px 5px;

      line-height: 1;
      color: ${token.colorTextSecondary};

      background: ${token.colorBgContainer};
      border: 1px solid ${token.colorBorderSecondary};
      border-bottom-color: ${token.colorBorder};
      border-radius: ${token.borderRadius}px;
      box-shadow: inset 0 -1px 0 ${token.colorBorder};
    }
  `,
);

export interface HotKeysProps {
  desc?: string;
  keys: string;
}

const HotKeys = memo<HotKeysProps>(({ keys, desc }) => {
  const { styles } = useStyles();
  const keysGroup = keys.split('+').filter(Boolean);
  const content = (
    <Flexbox align={'center'} className={styles} gap={2} horizontal>
      {keysGroup.map((key, index) => (
        <Fragment key={index}>
          <kbd>{key.toUpperCase()}</kbd>
          {index + 1 < keysGroup.length && <span>+</span>}
        </Fragment>
      ))}
    </Flexbox>
  );

  if (!desc) return content;
  return (
    <Flexbox align={'center'} style={{ textAlign: 'center' }}>
      {desc}
      {content}
    </Flexbox>
  );
});

export default HotKeys;
