import { Icon } from '@lobehub/ui';
import { IconSizeType } from '@lobehub/ui/es/Icon';
import { Loader2 } from 'lucide-react';
import { CSSProperties, memo } from 'react';

interface UpdateLoadingProps {
  size?: IconSizeType;
  style?: CSSProperties;
}

const UpdateLoading = memo<UpdateLoadingProps>(({ size, style }) => {
  return (
    <div style={style}>
      <Icon icon={Loader2} size={size} spin />
    </div>
  );
});

export default UpdateLoading;
