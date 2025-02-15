import { Icon, SliderWithInput } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { AtomIcon, RepeatIcon } from 'lucide-react';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

interface PresencePenaltyProps {
  onChange?: (value: number) => void;
  value?: number;
}

const PresencePenalty = memo<PresencePenaltyProps>(({ value, onChange }) => {
  const theme = useTheme();

  return (
    <Flexbox style={{ paddingInlineStart: 8 }}>
      <SliderWithInput
        marks={{
          '-2': (
            <Icon icon={RepeatIcon} size={'small'} style={{ color: theme.colorTextQuaternary }} />
          ),
          0: <div />,
          2: <Icon icon={AtomIcon} size={'small'} style={{ color: theme.colorTextQuaternary }} />,
        }}
        max={2}
        min={-2}
        onChange={onChange}
        size={'small'}
        step={0.1}
        value={value}
      />
    </Flexbox>
  );
});
export default PresencePenalty;
