import { Block, Text } from '@lobehub/ui';
import { Progress } from 'antd';
import { useTheme } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import PluginAvatar from '@/components/Plugins/PluginAvatar';
import { useToolStore } from '@/store/tool';
import { mcpStoreSelectors } from '@/store/tool/selectors';
import { DiscoverMcpItem } from '@/types/discover';
import { LobeToolType } from '@/types/tool/tool';

import Actions from './Action';

interface PluginItemProps extends DiscoverMcpItem {
  active?: boolean;
  setIdentifier: (identifier?: string) => void;
  type?: LobeToolType;
}

const Item = memo<PluginItemProps>(
  ({ name, description, icon, setIdentifier, active, identifier }) => {
    const { t } = useTranslation('plugin');

    const theme = useTheme();
    const installProgress = useToolStore(
      mcpStoreSelectors.getMCPInstallProgress(identifier),
      isEqual,
    );

    const stepText = installProgress ? t(`mcpInstall.${installProgress.step}` as any) : undefined;

    return (
      <Flexbox gap={0}>
        <Block
          align={'center'}
          clickable
          gap={16}
          horizontal
          justify={'space-between'}
          onClick={() => setIdentifier(identifier)}
          paddingBlock={8}
          paddingInline={12}
          style={{ position: 'relative' }}
          variant={active ? 'filled' : 'borderless'}
        >
          <Flexbox
            align={'center'}
            flex={1}
            gap={8}
            horizontal
            style={{ overflow: 'hidden', position: 'relative' }}
          >
            <PluginAvatar avatar={icon} />
            <Flexbox flex={1} gap={4} style={{ overflow: 'hidden', position: 'relative' }}>
              <Text ellipsis strong>
                {name}
              </Text>
              <Text ellipsis fontSize={12} type={'secondary'}>
                {description}
              </Text>
            </Flexbox>
          </Flexbox>
          <Actions identifier={identifier} />
        </Block>

        {installProgress && (
          <Flexbox paddingBlock={4} paddingInline={12}>
            <Progress
              percent={installProgress.progress}
              size="small"
              status="active"
              strokeColor={{ '0%': theme.blue, '100%': theme.geekblue }}
            />

            {stepText && (
              <Text fontSize={11} style={{ marginTop: 4 }} type={'secondary'}>
                {stepText}
              </Text>
            )}
          </Flexbox>
        )}
      </Flexbox>
    );
  },
);

export default Item;
