'use client';

import { DEFAULT_AVATAR } from '@lobechat/const';
import type { BuiltinInspectorProps } from '@lobechat/types';
import { Avatar, cx, Flexbox, useTheme } from '@lobehub/ui';
import { cssVar } from '@lobehub/ui/stylex/cssVar.stylex';
import * as stylex from '@stylexjs/stylex';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useAgentGroupStore } from '@/store/agentGroup';
import { agentGroupSelectors } from '@/store/agentGroup/selectors';
import { highlightTextStyles, shinyTextStyles } from '@/styles';

import type { SpeakParams } from '../../../types';

const styles = stylex.create({
  root: { overflow: 'hidden', display: 'flex', gap: '8px', alignItems: 'center' },
  title: { flexShrink: 0, color: cssVar.colorTextSecondary, whiteSpace: 'nowrap' },
});

export const SpeakInspector = memo<BuiltinInspectorProps<SpeakParams>>(
  ({ args, partialArgs, isArgumentsStreaming }) => {
    const { t } = useTranslation('plugin');

    const agentId = args?.agentId || partialArgs?.agentId;

    // Get active group ID and agent from store
    const activeGroupId = useAgentGroupStore(agentGroupSelectors.activeGroupId);
    const agent = useAgentGroupStore((s) =>
      activeGroupId && agentId
        ? agentGroupSelectors.getAgentByIdFromGroup(activeGroupId, agentId)(s)
        : undefined,
    );
    const theme = useTheme();

    if (isArgumentsStreaming && !agent) {
      return (
        <div {...stylex.props(styles.root)}>
          <span className={shinyTextStyles.shinyText}>
            {t('builtins.lobe-group-management.apiName.speak')}
          </span>
        </div>
      );
    }

    const agentName = agent?.title || agentId;

    return (
      <Flexbox horizontal align={'center'} className={stylex.props(styles.root).className} gap={8}>
        <span
          className={cx(
            stylex.props(styles.title).className,
            isArgumentsStreaming && shinyTextStyles.shinyText,
          )}
        >
          {t('builtins.lobe-group-management.inspector.speak.title')}
        </span>
        {agent && (
          <Avatar
            avatar={agent.avatar || DEFAULT_AVATAR}
            background={agent.backgroundColor || theme.colorBgContainer}
            shape={'square'}
            size={24}
            title={agent.title || undefined}
          />
        )}
        {agentName && <span className={highlightTextStyles.primary}>{agentName}</span>}
      </Flexbox>
    );
  },
);

SpeakInspector.displayName = 'SpeakInspector';

export default SpeakInspector;
