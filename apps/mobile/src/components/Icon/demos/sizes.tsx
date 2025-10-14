import { Flexbox, Icon } from '@lobehub/ui-rn';
import { ZoomIn, ZoomOut } from 'lucide-react-native';

const SizesDemo = () => {
  return (
    <Flexbox gap={16}>
      <Flexbox gap={16} horizontal>
        <Icon icon={ZoomOut} size="small" />
        <Icon icon={ZoomIn} size="middle" />
        <Icon icon={ZoomOut} size="large" />
        <Icon icon={ZoomIn} size={36} />
      </Flexbox>
      <Flexbox gap={16} horizontal>
        <Icon
          icon={ZoomOut}
          size={{
            size: 36,
            strokeWidth: 1,
          }}
        />
        <Icon
          icon={ZoomOut}
          size={{
            size: 36,
            strokeWidth: 2,
          }}
        />
        <Icon
          icon={ZoomOut}
          size={{
            size: 36,
            strokeWidth: 3,
          }}
        />
        <Icon
          icon={ZoomOut}
          size={{
            size: 36,
            strokeWidth: 4,
          }}
        />
      </Flexbox>
    </Flexbox>
  );
};

export default SizesDemo;
