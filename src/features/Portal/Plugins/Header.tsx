import { ActionIcon, Icon } from '@lobehub/ui';
import { Typography } from 'antd';
import isEqual from 'fast-deep-equal';
import { ArrowLeft, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import PluginAvatar from '@/features/PluginAvatar';
import { useChatStore } from '@/store/chat';
import { chatPortalSelectors } from '@/store/chat/selectors';
import { pluginHelpers, useToolStore } from '@/store/tool';
import { toolSelectors } from '@/store/tool/selectors';
import { WebBrowsingManifest } from '@/tools/web-browsing';

const Header = () => {
  const [closeToolUI, toolUIIdentifier = ''] = useChatStore((s) => [
    s.closeToolUI,
    chatPortalSelectors.toolUIIdentifier(s),
  ]);

  const { t } = useTranslation('plugin');
  const pluginMeta = useToolStore(toolSelectors.getMetaById(toolUIIdentifier), isEqual);
  const pluginTitle = pluginHelpers.getPluginTitle(pluginMeta) ?? t('unknownPlugin');

  if (toolUIIdentifier === WebBrowsingManifest.identifier) {
    return (
      <Flexbox align={'center'} gap={8} horizontal>
        <ActionIcon icon={ArrowLeft} onClick={() => closeToolUI()} size={'small'} />
        <Icon icon={Globe} size={16} />
        <Typography.Text style={{ fontSize: 16 }} type={'secondary'}>
          {t('search.title')}
        </Typography.Text>
      </Flexbox>
    );
  }
  return (
    <Flexbox align={'center'} gap={4} horizontal>
      <ActionIcon icon={ArrowLeft} onClick={() => closeToolUI()} size={'small'} />
      <PluginAvatar identifier={toolUIIdentifier} size={28} />
      <Typography.Text style={{ fontSize: 16 }} type={'secondary'}>
        {pluginTitle}
      </Typography.Text>
    </Flexbox>
  );
};

export default Header;
