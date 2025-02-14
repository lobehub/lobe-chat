import { Icon, SliderWithInput } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { BookOpenText, FileIcon } from 'lucide-react';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

interface FrequencyPenaltyProps {
  onChange?: (value: number) => void;
  value?: number;
}

const FrequencyPenalty = memo<FrequencyPenaltyProps>(({ value, onChange }) => {
  const theme = useTheme();

  return (
    <Flexbox style={{ paddingInlineStart: 8 }}>
      <SliderWithInput
        marks={{
          '-2': (
            <Icon icon={FileIcon} size={'small'} style={{ color: theme.colorTextQuaternary }} />
          ),
          0: <div />,
          2: (
            <Icon icon={BookOpenText} size={'small'} style={{ color: theme.colorTextQuaternary }} />
          ),
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
export default FrequencyPenalty;
