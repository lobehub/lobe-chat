'use client';

import { ActionIcon } from '@lobehub/ui';
import { Typography } from 'antd';
import isEqual from 'fast-deep-equal';
import { ArrowLeft, XIcon } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import SidebarHeader from '@/components/SidebarHeader';
import PluginAvatar from '@/features/PluginAvatar';
import { useChatStore } from '@/store/chat';
import { chatPortalSelectors } from '@/store/chat/selectors';
import { pluginHelpers, useToolStore } from '@/store/tool';
import { toolSelectors } from '@/store/tool/selectors';

const Header = memo(() => {
  const [showToolUI, toggleInspector, closeToolUI, toolUIIdentifier = ''] = useChatStore((s) => [
    chatPortalSelectors.showArtifactUI(s),
    s.toggleDock,
    s.closeToolUI,
    chatPortalSelectors.toolUIIdentifier(s),
  ]);

  const { t } = useTranslation(['plugin', 'portal']);
  const pluginMeta = useToolStore(toolSelectors.getMetaById(toolUIIdentifier), isEqual);
  const pluginTitle = pluginHelpers.getPluginTitle(pluginMeta) ?? t('unknownPlugin');

  return (
    <SidebarHeader
      actions={<ActionIcon icon={XIcon} onClick={() => toggleInspector(false)} />}
      title={
        showToolUI ? (
          <Flexbox align={'center'} gap={4} horizontal>
            <ActionIcon icon={ArrowLeft} onClick={() => closeToolUI()} />
            <PluginAvatar identifier={toolUIIdentifier} size={28} />
            <Typography.Text style={{ fontSize: 16 }} type={'secondary'}>
              {pluginTitle}
            </Typography.Text>
          </Flexbox>
        ) : (
          <Typography.Text style={{ fontSize: 16 }} type={'secondary'}>
            {t('portal:title')}
          </Typography.Text>
        )
      }
    />
  );
});

export default Header;
