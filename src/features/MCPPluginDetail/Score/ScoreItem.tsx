import { Icon } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { BanIcon, CircleCheckBigIcon, CircleDashedIcon } from 'lucide-react';
import { ReactNode, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import Title from '../../../app/[variants]/(main)/discover/features/Title';

export interface ScoreItemProps {
  check: boolean;
  desc: ReactNode;
  key: string;
  required?: boolean;
  title: ReactNode;
}

const ScoreItem = memo<ScoreItemProps>(({ required, check, desc, title }) => {
  const theme = useTheme();
  return (
    <Flexbox align={'center'} gap={16} horizontal paddingInline={16}>
      <Icon
        color={check ? theme.colorSuccess : required ? theme.colorError : theme.colorTextQuaternary}
        icon={check ? CircleCheckBigIcon : required ? BanIcon : CircleDashedIcon}
        size={24}
      />
      <Flexbox gap={4}>
        <Title level={3}>{title}</Title>
        <p style={{ color: theme.colorTextSecondary, margin: 0 }}>{desc}</p>
      </Flexbox>
    </Flexbox>
  );
});

export default ScoreItem;
