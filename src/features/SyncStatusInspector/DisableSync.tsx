import { Icon, Tag } from '@lobehub/ui';
import { Badge, Button, Popover } from 'antd';
import { LucideCloudCog, LucideCloudy } from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

interface DisableSyncProps {
  noPopover?: boolean;
}
const DisableSync = memo<DisableSyncProps>(({ noPopover }) => {
  const { t } = useTranslation('common');
  const tag = (
    <div>
      <Tag>
        <Badge status="default" />
        {t('sync.status.disabled')}
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
          {t('sync.disabled.desc')}
          <Link href={'/settings/sync'}>
            <Button block icon={<Icon icon={LucideCloudCog} />} type={'primary'}>
              {t('sync.disabled.actions.settings')}
            </Button>
          </Link>
        </Flexbox>
      }
      placement={'bottomLeft'}
      title={
        <Flexbox gap={8} horizontal>
          <Icon icon={LucideCloudy} />
          {t('sync.disabled.title')}
        </Flexbox>
      }
    >
      {tag}
    </Popover>
  );
});

export default DisableSync;
