import { Block, Text } from '@lobehub/ui';
import { Progress } from 'antd';
import { useTheme } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { motion } from 'framer-motion';
import { memo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import PluginAvatar from '@/components/Plugins/PluginAvatar';
import { useToolStore } from '@/store/tool';
import { mcpStoreSelectors } from '@/store/tool/selectors';
import { MCPInstallStep } from '@/store/tool/slices/mcpStore/initialState';
import { DiscoverMcpItem } from '@/types/discover';
import { LobeToolType } from '@/types/tool/tool';

import Actions from './Action';
import InstallError from './InstallError';
import MCPConfigForm from './MCPConfigForm';

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
    const needsConfig = installProgress?.needsConfig;
    const hasError = installProgress?.step === MCPInstallStep.ERROR;
    const errorInfo = installProgress?.errorInfo;

    const containerRef = useRef<HTMLButtonElement | null>(null);

    useEffect(() => {
      if (!needsConfig || !containerRef.current) return;

      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, [needsConfig]);

    return (
      <Flexbox gap={0} ref={containerRef}>
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

        {installProgress && !hasError && (
          <Flexbox paddingBlock={4} paddingInline={12}>
            <Progress
              percent={installProgress.progress}
              showInfo={false}
              size="small"
              status="active"
              strokeColor={{ '0%': theme.blue, '100%': theme.geekblue }}
            />
            {stepText && (
              <Text fontSize={11} style={{ marginTop: 4 }} type={'secondary'}>
                ({installProgress.progress}%) {stepText}
              </Text>
            )}
          </Flexbox>
        )}

        {hasError && errorInfo && (
          <motion.div
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            initial={{ height: 0, opacity: 0 }}
            transition={{
              duration: 0.3,
              ease: [0.4, 0, 0.2, 1],
              height: { duration: 0.2 },
            }}
          >
            <Flexbox paddingBlock={8} paddingInline={12}>
              <InstallError errorInfo={errorInfo} identifier={identifier} />
            </Flexbox>
          </motion.div>
        )}

        {needsConfig && installProgress && (
          <motion.div
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            initial={{ height: 0, opacity: 0 }}
            transition={{
              duration: 0.3,
              ease: [0.4, 0, 0.2, 1],
              height: { duration: 0.2 },
            }}
          >
            <Flexbox paddingInline={12}>
              <MCPConfigForm configSchema={installProgress.configSchema} identifier={identifier} />
            </Flexbox>
          </motion.div>
        )}
      </Flexbox>
    );
  },
);

export default Item;
