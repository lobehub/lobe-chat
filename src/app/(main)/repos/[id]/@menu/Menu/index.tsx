'use client';

import { Icon } from '@lobehub/ui';
import { FileText } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import Menu from '@/components/Menu';
import type { MenuProps } from '@/components/Menu';

const FileMenu = memo<{ id: string }>(({ id }) => {
  const { t } = useTranslation('knowledgeBase');
  const pathname = usePathname();

  const [activeKey, setActiveKey] = useState(pathname);

  const items: MenuProps['items'] = useMemo(
    () => [
      {
        icon: <Icon icon={FileText} />,
        key: `/repos/${id}`,
        label: <Link href={`/repos/${id}`}>{t('tab.files')}</Link>,
      },
      // {
      //   icon: <Icon icon={TestTubeDiagonal} />,
      //   key: `/repos/${id}/testing`,
      //   label: <Link href={`/repos/${id}/testing`}>{t('tab.testing')}</Link>,
      // },
      // {
      //   icon: <Icon icon={Settings2Icon} />,
      //   key: `/repos/${id}/settings`,
      //   label: <Link href={`/repos/${id}/settings`}>{t('tab.settings')}</Link>,
      // },
    ],
    [t],
  );

  return (
    <Flexbox>
      <Menu
        items={items}
        onClick={({ key }) => {
          setActiveKey(key);
        }}
        selectable
        selectedKeys={[activeKey]}
        variant={'compact'}
      />
    </Flexbox>
  );
});

export default FileMenu;
