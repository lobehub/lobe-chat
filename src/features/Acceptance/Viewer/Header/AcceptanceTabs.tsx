'use client';

import { Flexbox, Icon } from '@lobehub/ui';
import { Tabs, Tag } from '@lobehub/ui/base-ui';
import { ListChecks, Paperclip, Route } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export type AcceptanceTabKey = 'checks' | 'resources' | 'flow';

interface AcceptanceTabsProps {
  active: AcceptanceTabKey;
  checkCount: number;
  flowCount?: number;
  onChange: (key: AcceptanceTabKey) => void;
  resourceCount: number;
}

/**
 * The delivery's two faces: the checks a person judges, and the artefacts the
 * rounds produced. They sit above the full-width rule so the rule reads as the
 * boundary between "what this delivery is" and "what you are looking at".
 */
const AcceptanceTabs = ({
  active,
  checkCount,
  flowCount = 0,
  onChange,
  resourceCount,
}: AcceptanceTabsProps) => {
  const { t } = useTranslation('verify');
  const tabs = [
    {
      count: checkCount,
      icon: ListChecks,
      key: 'checks' as const,
      label: t('acceptance.tabs.checks'),
    },
    { count: flowCount, icon: Route, key: 'flow' as const, label: t('flow.title') },
    {
      count: resourceCount,
      icon: Paperclip,
      key: 'resources' as const,
      label: t('acceptance.tabs.resources'),
    },
  ];

  return (
    <Tabs
      activeKey={active}
      style={{ minWidth: 0, overflowX: 'auto' }}
      variant={'square'}
      items={tabs
        .filter((tab) => tab.key !== 'flow' || flowCount > 0)
        .map((tab) => ({
          icon: <Icon icon={tab.icon} size={16} />,
          key: tab.key,
          label: (
            <Flexbox horizontal align={'center'} gap={6}>
              {tab.label}
              <Tag shape={'round'}>{tab.count}</Tag>
            </Flexbox>
          ),
        }))}
      onChange={(key) => onChange(key as AcceptanceTabKey)}
    />
  );
};

export default AcceptanceTabs;
