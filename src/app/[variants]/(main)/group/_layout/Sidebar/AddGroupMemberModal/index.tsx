'use client';

import { ActionIcon, Avatar, List, Modal, SearchBar, Text, Tooltip } from '@lobehub/ui';
import { useHover } from 'ahooks';
import { List as AntdList, Button, Checkbox, Empty, Skeleton, Switch, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { X } from 'lucide-react';
import { type ChangeEvent, memo, useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import useSWR from 'swr';

import { DEFAULT_AVATAR } from '@/const/meta';
import ModelSelect from '@/features/ModelSelect';
import { useEnabledChatModels } from '@/hooks/useEnabledChatModels';
import { agentService } from '@/services/agent';

const { Text: AntText } = Typography;

/**
 * Agent info returned from getAgentsForSelection API
 */
interface AgentSelectionItem {
  avatar: string | null;
  backgroundColor: string | null;
  description: string | null;
  id: string;
  title: string | null;
}

const AvailableAgentItem = memo<{
  agent: AgentSelectionItem;
  cx: any;
  isSelected: boolean;
  onToggle: (_agentId: string) => void;
  styles: any;
  t: any;
}>(({ agent, isSelected, onToggle, styles, cx, t }) => {
  const ref = useRef(null);
  const isHovering = useHover(ref);

  const agentId = agent.id;
  const title = agent.title || t('defaultSession', { ns: 'common' });
  const description = agent.description || '';
  const avatar = agent.avatar || DEFAULT_AVATAR;
  const avatarBackground = agent.backgroundColor ?? undefined;

  return (
    <AntdList.Item className={cx(styles.listItem)} onClick={() => onToggle(agentId)} ref={ref}>
      <Flexbox align="center" gap={12} horizontal width="100%">
        <Checkbox
          checked={isSelected}
          onChange={() => {
            onToggle(agentId);
          }}
          onClick={(e) => {
            e.stopPropagation();
          }}
        />
        <Flexbox style={{ flexShrink: 0 }}>
          <Avatar
            animation={isHovering}
            avatar={avatar}
            background={avatarBackground}
            shape="circle"
            size={40}
          />
        </Flexbox>
        <Flexbox flex={1} gap={2} style={{ minWidth: 0 }}>
          <AntText className={styles.title}>{title}</AntText>
          {description && (
            <AntText className={styles.description} ellipsis>
              {description}
            </AntText>
          )}
        </Flexbox>
      </Flexbox>
    </AntdList.Item>
  );
});

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    display: flex;
    flex-direction: row;

    height: 500px;
    border: 1px solid ${token.colorBorderSecondary};
    border-radius: ${token.borderRadius}px;
  `,
  description: css`
    font-size: 11px;
    line-height: 1.2;
    color: ${token.colorTextSecondary};
  `,
  hostCard: css`
    margin-block-end: ${token.paddingSM}px;
    padding: ${token.padding}px;
    border: 1px solid ${token.colorBorderSecondary};
    border-radius: ${token.borderRadiusLG}px;

    background: ${token.colorFillTertiary};
  `,
  leftColumn: css`
    user-select: none;

    overflow-y: auto;
    flex: 1;

    padding-block: ${token.paddingSM}px 0;
    padding-inline: ${token.paddingSM}px;
    border-inline-end: 1px solid ${token.colorBorderSecondary};
  `,
  listItem: css`
    cursor: pointer;

    position: relative;

    margin-block: 2px;
    padding: ${token.paddingSM}px !important;
    border-radius: ${token.borderRadius}px;

    transition: all 0.2s ease;

    &:hover {
      background: ${token.colorFillTertiary};
    }
  `,
  modelSelectDisabled: css`
    pointer-events: none;
  `,
  rightColumn: css`
    overflow-y: auto;
    flex: 1;
    padding: ${token.paddingSM}px;
  `,
  selectedItem: css`
    opacity: 0.6;
    background: ${token.colorFillQuaternary};
  `,
}));

export type MemberSelectionMode = 'create' | 'add';

export interface AddGroupMemberModalProps {
  /**
   * Current host configuration (for add mode)
   */
  currentHostConfig?: {
    enableSupervisor?: boolean;
    orchestratorModel?: string;
    orchestratorProvider?: string;
  };
  /**
   * Existing group members to exclude from available agents (for add mode)
   */
  existingMembers?: string[];
  /**
   * Group ID for add mode (required when mode is 'add')
   */
  groupId?: string;
  /**
   * The mode of the modal:
   * - 'create': For selecting initial members when creating a new group
   * - 'add': For adding members to an existing group
   */
  mode: MemberSelectionMode;
  onCancel: () => void;
  onConfirm: (
    selectedAgents: string[],
    hostConfig?: { model?: string; provider?: string },
    enableSupervisor?: boolean,
  ) => void | Promise<void>;
  open: boolean;
  /**
   * Pre-selected agent IDs (useful for editing existing groups)
   */
  preSelectedAgents?: string[];
}

const AddGroupMemberModal = memo<AddGroupMemberModalProps>(
  ({
    currentHostConfig,
    existingMembers = [],
    mode,
    onCancel,
    onConfirm,
    open,
    preSelectedAgents = [],
  }) => {
    const { t } = useTranslation(['chat', 'common']);
    const { styles, cx } = useStyles();
    const enabledModels = useEnabledChatModels();
    const [selectedAgents, setSelectedAgents] = useState<string[]>(preSelectedAgents);
    const [searchTerm, setSearchTerm] = useState('');

    // Determine if host card should be shown
    const isHostCurrentlyEnabled = mode === 'add' && currentHostConfig?.enableSupervisor === true;

    // Initialize host state:
    // - In create mode: default to enabled (isHostRemoved = false)
    // - In add mode with host disabled: default to disabled (isHostRemoved = true)
    const [isHostRemoved, setIsHostRemoved] = useState(mode === 'add' ? true : false);
    const [hostModelConfig, setHostModelConfig] = useState<{ model?: string; provider?: string }>(
      () => {
        if (mode === 'add' && currentHostConfig) {
          return {
            model: currentHostConfig.orchestratorModel,
            provider: currentHostConfig.orchestratorProvider,
          };
        }
        // Set default for create mode
        if (enabledModels.length > 0 && enabledModels[0].children.length > 0) {
          const firstProvider = enabledModels[0];
          const firstModel = firstProvider.children[0];

          return {
            model: firstModel.id,
            provider: firstProvider.id,
          };
        }
        return {};
      },
    );

    // Fetch agents from the new API (non-virtual agents only)
    const { data: agents = [], isLoading: isLoadingAgents } = useSWR(
      open ? 'getAgentsForSelection' : null,
      () => agentService.getAgentsForSelection(),
    );

    const handleAgentToggle = (agentId: string) => {
      setSelectedAgents((prev) =>
        prev.includes(agentId) ? prev.filter((id) => id !== agentId) : [...prev, agentId],
      );
    };

    const handleRemoveAgent = (agentId: string) => {
      setSelectedAgents((prev) => prev.filter((id) => id !== agentId));
    };

    const handleSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
    }, []);

    const handleHostToggle = useCallback((enabled: boolean) => {
      setIsHostRemoved(!enabled);
    }, []);

    const handleHostModelChange = useCallback((config: { model?: string; provider?: string }) => {
      setHostModelConfig(config);
    }, []);

    // Filter logic based on mode
    const availableAgents = useMemo(() => {
      if (mode === 'create') {
        // When creating a new group, all agents are available
        return agents;
      } else {
        // When adding to existing group, filter out existing members
        return agents.filter((agent) => !existingMembers.includes(agent.id));
      }
    }, [agents, mode, existingMembers]);

    // Filter available agents based on search term
    const filteredAvailableAgents = useMemo(() => {
      if (!searchTerm.trim()) return availableAgents;

      return availableAgents.filter((agent) => {
        const title = agent.title || '';
        const description = agent.description || '';
        const searchLower = searchTerm.toLowerCase();

        return (
          title.toLowerCase().includes(searchLower) ||
          description.toLowerCase().includes(searchLower)
        );
      });
    }, [availableAgents, searchTerm]);

    const selectedAgentListItems = useMemo(() => {
      return selectedAgents
        .map((agentId) => {
          const agent = agents.find((a) => a.id === agentId);
          if (!agent) return null;

          const title = agent.title || t('defaultSession', { ns: 'common' });
          const avatar = agent.avatar || DEFAULT_AVATAR;
          const avatarBackground = agent.backgroundColor ?? undefined;
          const description = agent.description || '';

          return {
            actions: (
              <ActionIcon
                icon={X}
                onClick={() => handleRemoveAgent(agentId)}
                size="small"
                style={{ color: '#999' }}
              />
            ),
            avatar: (
              <Avatar avatar={avatar} background={avatarBackground} shape="circle" size={40} />
            ),
            description,
            key: agentId,
            showAction: true,
            title,
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);
    }, [selectedAgents, agents, t, handleRemoveAgent]);

    const handleReset = () => {
      setSelectedAgents(preSelectedAgents);
      setSearchTerm('');
      setIsHostRemoved(mode === 'add' ? true : false);
      if (mode === 'add' && currentHostConfig) {
        setHostModelConfig({
          model: currentHostConfig.orchestratorModel,
          provider: currentHostConfig.orchestratorProvider,
        });
      }
    };

    const [isAdding, setIsAdding] = useState(false);

    const normalizedHostModelConfig = useMemo(() => {
      const model = hostModelConfig.model;
      const provider = hostModelConfig.provider;

      if (!model || !provider) return undefined;

      return { model, provider };
    }, [hostModelConfig]);

    const handleConfirm = async () => {
      try {
        setIsAdding(true);
        // Only pass host config if the host card is visible (being managed in this modal)
        const shouldManageHost = !isHostCurrentlyEnabled;
        const hostConfig =
          shouldManageHost && !isHostRemoved ? normalizedHostModelConfig : undefined;
        const enableSupervisor = shouldManageHost ? !isHostRemoved : undefined;
        await onConfirm(selectedAgents, hostConfig, enableSupervisor);
        handleReset();
      } catch (error) {
        console.error('Failed to confirm action:', error);
      } finally {
        setIsAdding(false);
      }
    };

    const handleCancel = () => {
      handleReset();
      onCancel();
    };

    // Dynamic content based on mode
    const modalTitle =
      mode === 'create' ? t('memberSelection.setInitialMembers') : t('memberSelection.addMember');

    const confirmButtonText =
      mode === 'create' ? t('memberSelection.createGroup') : t('memberSelection.addMember');

    // Calculate total member count including host if enabled
    // Only count the host when the host card is visible (create mode or add mode with host disabled)
    const shouldShowHostCard = !isHostCurrentlyEnabled;
    const totalMemberCount = selectedAgents.length + (shouldShowHostCard && !isHostRemoved ? 1 : 0);

    const minMembersRequired = mode === 'create' ? 1 : 0; // At least 1 member for group creation
    const isConfirmDisabled = totalMemberCount < minMembersRequired || isAdding;

    return (
      <Modal
        allowFullscreen
        footer={
          <Flexbox gap={8} horizontal justify="end">
            <Button onClick={handleCancel}>{t('cancel', { ns: 'common' })}</Button>
            <Button
              disabled={isConfirmDisabled}
              loading={isAdding}
              onClick={handleConfirm}
              type="primary"
            >
              {confirmButtonText} ({totalMemberCount})
            </Button>
          </Flexbox>
        }
        onCancel={handleCancel}
        open={open}
        title={modalTitle}
        width={800}
      >
        <Flexbox className={styles.container} horizontal>
          {/* Left Column - Available Agents */}
          <Flexbox className={styles.leftColumn} flex={1} gap={12}>
            <SearchBar
              allowClear
              onChange={handleSearchChange}
              placeholder={t('memberSelection.searchAgents')}
              value={searchTerm}
              variant="filled"
            />

            <Flexbox flex={1} style={{ overflowY: 'auto' }}>
              {isLoadingAgents ? (
                <Flexbox gap={8} padding={8}>
                  <Skeleton active paragraph={{ rows: 2 }} title={false} />
                  <Skeleton active paragraph={{ rows: 2 }} title={false} />
                  <Skeleton active paragraph={{ rows: 2 }} title={false} />
                </Flexbox>
              ) : filteredAvailableAgents.length === 0 ? (
                <Empty
                  description={
                    searchTerm
                      ? t('noMatchingAgents', { ns: 'chat' })
                      : t('noAvailableAgents', { ns: 'chat' })
                  }
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ) : (
                <AntdList
                  dataSource={filteredAvailableAgents}
                  renderItem={(agent) => {
                    const agentId = agent.id;
                    const isSelected = selectedAgents.includes(agentId);

                    return (
                      <AvailableAgentItem
                        agent={agent}
                        cx={cx}
                        isSelected={isSelected}
                        key={agentId}
                        onToggle={handleAgentToggle}
                        styles={styles}
                        t={t}
                      />
                    );
                  }}
                  split={false}
                />
              )}
            </Flexbox>
          </Flexbox>

          {/* Right Column - Host and Selected Agents */}
          <Flexbox className={styles.rightColumn} flex={1}>
            <Flexbox gap={16}>
              {/* Host Card - Only show in create mode or when host is disabled in add mode */}
              {!isHostCurrentlyEnabled && (
                <Flexbox align="center" className={styles.hostCard} gap={12} horizontal>
                  <Flexbox flex={1} gap={2}>
                    <Text
                      style={{ fontSize: 14, fontWeight: 500 }}
                      type={isHostRemoved ? 'secondary' : undefined}
                    >
                      {t('groupWizard.host.title')}
                    </Text>
                    <Text
                      style={{ color: '#999', fontSize: 12 }}
                      type={isHostRemoved ? 'secondary' : undefined}
                    >
                      {t('groupWizard.host.description')}
                    </Text>
                  </Flexbox>
                  <Flexbox align="center" gap={12} horizontal>
                    <div
                      className={cx(isHostRemoved && styles.modelSelectDisabled)}
                      style={{ opacity: isHostRemoved ? 0.6 : 1 }}
                    >
                      <ModelSelect
                        onChange={handleHostModelChange}
                        requiredAbilities={['functionCall']}
                        value={normalizedHostModelConfig}
                      />
                    </div>
                    <Tooltip title={t('groupWizard.host.tooltip')}>
                      <Switch
                        checked={!isHostRemoved}
                        onChange={(checked) => handleHostToggle(checked)}
                        size="small"
                      />
                    </Tooltip>
                  </Flexbox>
                </Flexbox>
              )}

              {/* Selected Agents List */}
              <Flexbox flex={1}>
                {selectedAgentListItems.length === 0 ? (
                  <Flexbox align="center" flex={1} justify="center">
                    <Empty
                      description={
                        mode === 'create'
                          ? t('memberSelection.noSelectedAgents')
                          : t('memberSelection.noSelectedAgents')
                      }
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  </Flexbox>
                ) : (
                  <List items={selectedAgentListItems} />
                )}
              </Flexbox>
            </Flexbox>
          </Flexbox>
        </Flexbox>
      </Modal>
    );
  },
);

export default AddGroupMemberModal;
