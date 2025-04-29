'use client';

import { Icon } from '@lobehub/ui';
import { FileText, GaugeIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import Menu from '@/components/Menu';
import type { MenuProps } from '@/components/Menu';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';

const FileMenu = memo<{ id: string }>(({ id }) => {
  const { t } = useTranslation('knowledgeBase');
  const pathname = usePathname();
  const { enableRAGEval } = useServerConfigStore(featureFlagsSelectors);
  const [activeKey, setActiveKey] = useState(
    pathname.startsWith(`/repos/${id}/evals`) ? 'eval' : 'files',
  );

  const items = useMemo(
    () =>
      [
        {
          icon: <Icon icon={FileText} />,
          key: 'files',
          label: <Link href={`/repos/${id}`}>{t('tab.files')}</Link>,
        },
        enableRAGEval && {
          icon: <Icon icon={GaugeIcon} />,
          key: 'eval',
          label: <Link href={`/repos/${id}/evals/dataset`}>{t('tab.evals')}</Link>,
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
      ].filter(Boolean) as MenuProps['items'],
    [t],
  );

  return (
    <Flexbox>
      <Menu
        compact
        items={items}
        onClick={({ key }) => {
          setActiveKey(key);
        }}
        selectable
        selectedKeys={[activeKey]}
      />
    </Flexbox>
  );
});

export default FileMenu;
