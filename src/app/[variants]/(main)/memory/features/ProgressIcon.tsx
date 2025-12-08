import { Text, Tooltip } from '@lobehub/ui';
import { Progress, ProgressProps } from 'antd';
import { useTheme } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

interface ProgressIconProps extends Omit<ProgressProps, 'percent'> {
  percent?: number | null;
}

const ProgressIcon = memo<ProgressIconProps>(({ showInfo, format, percent, ...rest }) => {
  const theme = useTheme();
  if (typeof percent !== 'number') return;

  const content = (
    <Progress
      format={format}
      percent={percent}
      showInfo={false}
      size={[2, 12]}
      steps={5}
      {...rest}
    />
  );

  if (showInfo)
    return (
      <Flexbox align={'center'} gap={8} horizontal>
        {content}
        <Text color={theme.colorTextSecondary} fontSize={12}>
          {format?.(percent)}
        </Text>
      </Flexbox>
    );

  return <Tooltip title={format?.(percent)}>{content}</Tooltip>;
});

export default ProgressIcon;
