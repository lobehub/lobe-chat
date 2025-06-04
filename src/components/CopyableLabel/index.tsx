import { CopyButton } from '@lobehub/ui';
import { Typography } from 'antd';
import { CSSProperties, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

const CopyableLabel = memo<{ style?: CSSProperties; value?: string | null }>(
  ({ style, value = '--' }) => {
    return (
      <Flexbox
        align={'center'}
        gap={4}
        horizontal
        style={{
          overflow: 'hidden',
          position: 'relative',
          ...style,
        }}
      >
        <Typography.Paragraph
          ellipsis={{ rows: 1 }}
          style={{
            color: 'inherit',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            margin: 0,
            overflow: 'hidden',
            width: '100%',
          }}
        >
          {value || '--'}
        </Typography.Paragraph>
        <CopyButton content={value || '--'} size={'small'} />
      </Flexbox>
    );
  },
);

export default CopyableLabel;
