import { Icon, Tag } from '@lobehub/ui';
import { Badge, Button, Popover } from 'antd';
import { LucideCloudCog, LucideCloudy } from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

interface DisableSyncProps {
  noPopover?: boolean;
}
const DisableSync = memo<DisableSyncProps>(({ noPopover }) => {
  const tag = (
    <div>
      <Tag>
        <Badge status="default" />
        同步未开启
      </Tag>
    </div>
  );

  return noPopover ? (
    tag
  ) : (
    <Popover
      arrow={false}
      content={
        <Flexbox gap={12} width={320}>
          当前会话数据仅存储于此浏览器中。如果你需要在多个设备间同步数据，请配置并开启云端同步。
          <Link href={'/settings/sync'}>
            <Button block icon={<Icon icon={LucideCloudCog} />} type={'primary'}>
              配置云端同步
            </Button>
          </Link>
        </Flexbox>
      }
      placement={'bottomLeft'}
      title={
        <Flexbox gap={8} horizontal>
          <Icon icon={LucideCloudy} />
          数据同步未开启
        </Flexbox>
      }
    >
      {tag}
    </Popover>
  );
});

export default DisableSync;
