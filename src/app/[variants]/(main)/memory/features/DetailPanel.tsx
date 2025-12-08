import { memo } from 'react';
import { Flexbox, FlexboxProps } from 'react-layout-kit';

import NavHeader from '@/features/NavHeader';
import RightPanel from '@/features/RightPanel';
import ToggleRightPanelButton from '@/features/RightPanel/ToggleRightPanelButton';

const DetailPanel = memo<FlexboxProps>(({ children, style, ...rest }) => {
  return (
    <RightPanel defaultWidth={600} maxWidth={800}>
      <NavHeader left={<ToggleRightPanelButton />} />
      <Flexbox
        flex={1}
        gap={16}
        height={'100%'}
        paddingInline={16}
        style={{
          overflowY: 'auto',
          paddingBottom: 64,
          paddingTop: 16,
          ...style,
        }}
        {...rest}
      >
        {children}
      </Flexbox>
    </RightPanel>
  );
});

export default DetailPanel;
