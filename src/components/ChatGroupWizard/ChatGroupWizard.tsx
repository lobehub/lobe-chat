'use client';

import {
  ActionIcon,
  Avatar,
  Collapse,
  GroupAvatar,
  List,
  Modal,
  SearchBar,
  Text,
  Tooltip,
} from '@lobehub/ui';
import { Button, Checkbox, Empty } from 'antd';
import { createStyles, useTheme } from 'antd-style';
import { Users, X } from 'lucide-react';
import { ChangeEvent, memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { DEFAULT_AVATAR, DEFAULT_SUPERVISOR_AVATAR } from '@/const/meta';
import ModelSelect from '@/features/ModelSelect';
import { useEnabledChatModels } from '@/hooks/useEnabledChatModels';
import { useSessionStore } from '@/store/session';
import { LobeAgentSession, LobeSessionType } from '@/types/session';

import { GroupTemplate, useGroupTemplates } from './templates';

const TemplateItem = memo<{
  cx: (...args: any[]) => string;
  isSelected: boolean;
  onToggle: (templateId: string) => void;
  styles: Record<string, string>;
  template: GroupTemplate;
}>(({ template, isSelected, onToggle, styles, cx }) => {
  const { t } = useTranslation('chat');

  return (
    <div className={cx(styles.listItem)} onClick={() => onToggle(template.id)}>
      <Flexbox align="center" gap={12} horizontal width="100%">
        <Checkbox
          checked={isSelected}
          onChange={() => onToggle(template.id)}
          onClick={(e) => e.stopPropagation()}
        />
        <GroupAvatar
          avatars={template.members.map((member) => ({
            avatar: member.avatar || DEFAULT_AVATAR,
            background: member.backgroundColor || undefined,
          }))}
          size={40}
        />
        <Flexbox flex={1} gap={2}>
          <Text className={styles.title}>{template.title}</Text>
          <Text className={styles.description} ellipsis>
            {template.description}
          </Text>
          <Flexbox align="center" gap={4} horizontal>
            <Users size={11} style={{ color: '#999' }} />
            <Text style={{ fontSize: 11 }} type="secondary">
              {t('groupWizard.memberCount', {
                count: template.members.length,
              })}
            </Text>
          </Flexbox>
        </Flexbox>
      </Flexbox>
    </div>
  );
});

const ExistingMemberItem = memo<{
  agent: LobeAgentSession;
  cx: (...args: any[]) => string;
  isSelected: boolean;
  onToggle: (agentId: string) => void;
  styles: Record<string, string>;
}>(({ agent, isSelected, onToggle, styles, cx }) => {
  const { t } = useTranslation(['chat', 'common']);
  const agentId = agent.config?.id;
  const title = agent.meta?.title || t('defaultSession', { ns: 'common' });
  const description = agent.meta?.description || '';
  const avatar = agent.meta?.avatar || DEFAULT_AVATAR;
  const avatarBackground = agent.meta?.backgroundColor;

  if (!agentId) return null;

  return (
    <div className={cx(styles.listItem)} onClick={() => onToggle(agentId)}>
      <Flexbox align="center" gap={12} horizontal width="100%">
        <Checkbox
          checked={isSelected}
          onChange={() => onToggle(agentId)}
          onClick={(e) => e.stopPropagation()}
        />
        <Avatar avatar={avatar} background={avatarBackground} shape="circle" size={40} />
        <Flexbox flex={1} gap={2} style={{ minWidth: 0 }}>
          <Text className={styles.title}>{title}</Text>
          {description && (
            <Text className={styles.description} ellipsis>
              {description}
            </Text>
          )}
        </Flexbox>
      </Flexbox>
    </div>
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
    font-size: 12px;
    line-height: 1.2;
    color: ${token.colorTextSecondary};
  `,
  hostCard: css`
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
  listHeader: css`
    padding: 0;
    color: ${token.colorTextDescription};
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
  memberDescription: css`
    display: block;
    padding-inline-end: 48px;
  `,
  rightColumn: css`
    overflow-y: auto;
    display: flex;
    flex: 1;
    flex-direction: column;

    padding: ${token.paddingSM}px;
  `,
  title: css`
    font-size: 14px;
    font-weight: 500;
  `,
}));

export interface ChatGroupWizardProps {
  /**
   * External loading state for template creation (controlled by parent)
   */
  isCreatingFromTemplate?: boolean;
  onCancel: () => void;
  onCreateCustom: (
    selectedAgents: string[],
    hostConfig?: { model?: string; provider?: string },
    enableSupervisor?: boolean,
  ) => void | Promise<void>;
  onCreateFromTemplate: (
    templateId: string,
    hostConfig?: { model?: string; provider?: string },
    enableSupervisor?: boolean,
  ) => void | Promise<void>;
  open: boolean;
}

const ChatGroupWizard = memo<ChatGroupWizardProps>(
  ({
    onCancel,
    onCreateFromTemplate,
    onCreateCustom,
    open,
    isCreatingFromTemplate: externalLoading,
  }) => {
    const { t } = useTranslation(['chat', 'common']);
    const { styles, cx } = useStyles();
    const theme = useTheme();
    const groupTemplates = useGroupTemplates();
    const enabledModels = useEnabledChatModels();
    const agentSessions = useSessionStore((s) =>
      (s.sessions || []).filter((session) => session.type === LobeSessionType.Agent),
    );

    const memberDescriptionClass = useMemo(
      () => cx(styles.description, styles.memberDescription),
      [cx, styles.description, styles.memberDescription],
    );

    const defaultModel = useMemo(() => {
      if (enabledModels.length > 0 && enabledModels[0].children.length > 0) {
        const firstProvider = enabledModels[0];
        const firstModel = firstProvider.children[0];

        return {
          model: firstModel.id,
          provider: firstProvider.id,
        };
      }
      return { model: undefined, provider: undefined };
    }, [enabledModels]);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState<string>('');
    const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
    const [removedMembers, setRemovedMembers] = useState<Record<string, string[]>>({});
    const [isHostRemoved, setIsHostRemoved] = useState(false);
    const [hostModelConfig, setHostModelConfig] = useState<{ model?: string; provider?: string }>(
      defaultModel.model && defaultModel.provider ? defaultModel : {},
    );
    const [isCreatingCustom, setIsCreatingCustom] = useState(false);
    const [activePanel, setActivePanel] = useState<'templates' | 'agents'>('templates');

    const isCreatingFromTemplate = externalLoading ?? false;

    const handleTemplateToggle = useCallback((templateId: string) => {
      setSelectedTemplate((prev) => {
        const next = prev === templateId ? '' : templateId;

        if (next !== prev) {
          setRemovedMembers({});
          setIsHostRemoved(false);
        }

        if (next) {
          setSelectedAgents([]);
        }

        return next;
      });
    }, []);

    const handleAgentToggle = useCallback((agentId: string) => {
      setSelectedTemplate('');
      setRemovedMembers({});
      setSelectedAgents((prev) =>
        prev.includes(agentId) ? prev.filter((id) => id !== agentId) : [...prev, agentId],
      );
    }, []);

    const handleRemoveAgent = useCallback((agentId: string) => {
      setSelectedAgents((prev) => prev.filter((id) => id !== agentId));
    }, []);

    const handleReset = () => {
      setSelectedTemplate('');
      setSelectedAgents([]);
      setSearchTerm('');
      setRemovedMembers({});
      setIsHostRemoved(false);
      setHostModelConfig(defaultModel.model && defaultModel.provider ? defaultModel : {});
    };

    const handleHostModelChange = useCallback((config: { model?: string; provider?: string }) => {
      setHostModelConfig(config);
    }, []);

    const handleRemoveMember = useCallback((templateId: string, memberTitle: string) => {
      setRemovedMembers((prev) => ({
        ...prev,
        [templateId]: [...(prev[templateId] || []), memberTitle],
      }));
    }, []);

    const handleRemoveHost = useCallback(() => {
      setIsHostRemoved(true);
    }, []);

    const handleSearchChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(event.target.value);
    }, []);

    const agentCount = agentSessions.length;

    useEffect(() => {
      if (!open) return;

      setActivePanel(agentCount > 2 ? 'agents' : 'templates');
    }, [open, agentCount]);

    const handlePanelChange = useCallback((key: string | string[]) => {
      if (!key) return;

      const nextKey = Array.isArray(key) ? key[0] : key;

      if (nextKey === 'templates' || nextKey === 'agents') {
        setActivePanel(nextKey);
      }
    }, []);

    const filteredTemplates = useMemo(() => {
      const searchLower = searchTerm.trim().toLowerCase();
      if (!searchLower) return groupTemplates;

      return groupTemplates.filter((template) => {
        if (template.title.toLowerCase().includes(searchLower)) return true;
        if (template.description.toLowerCase().includes(searchLower)) return true;

        return template.members.some((member) => member.title.toLowerCase().includes(searchLower));
      });
    }, [groupTemplates, searchTerm]);

    const filteredAgents = useMemo(() => {
      const searchLower = searchTerm.trim().toLowerCase();
      if (!searchLower) return agentSessions;

      return agentSessions.filter((agent) => {
        const title = agent.meta?.title || '';
        const description = agent.meta?.description || '';

        return (
          title.toLowerCase().includes(searchLower) ||
          description.toLowerCase().includes(searchLower)
        );
      });
    }, [agentSessions, searchTerm]);

    const selectedTemplateMembers = useMemo(() => {
      if (!selectedTemplate) return [];

      const template = groupTemplates.find((t) => t.id === selectedTemplate);
      if (!template) return [];

      const removedForTemplate = removedMembers[selectedTemplate] || [];

      return template.members
        .filter((member) => !removedForTemplate.includes(member.title))
        .map((member) => ({
          avatar: member.avatar || DEFAULT_AVATAR,
          backgroundColor: member.backgroundColor,
          description: member.systemRole,
          key: `${selectedTemplate}-${member.title}`,
          systemRole: member.systemRole,
          title: member.title,
        }));
    }, [selectedTemplate, removedMembers, groupTemplates]);

    const selectedAgentListItems = useMemo(() => {
      return (
        selectedAgents
          .map((agentId) => {
            const agent = agentSessions.find((session) => session.config?.id === agentId);
            if (!agent) return null;

            const title = agent.meta?.title || t('defaultSession', { ns: 'common' });
            const avatar = agent.meta?.avatar || DEFAULT_AVATAR;
            const avatarBackground = agent.meta?.backgroundColor;
            const description = agent.meta?.description || '';

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
              description: description ? (
                <Tooltip title={description}>
                  <Text className={memberDescriptionClass} ellipsis={{ rows: 1 }}>
                    {description}
                  </Text>
                </Tooltip>
              ) : null,
              key: agentId,
              showAction: true,
              title,
            };
          })
          // eslint-disable-next-line unicorn/prefer-native-coercion-functions
          .filter((item): item is NonNullable<typeof item> => Boolean(item))
      );
    }, [selectedAgents, agentSessions, t, handleRemoveAgent, memberDescriptionClass]);

    const normalizedHostModelConfig = useMemo(() => {
      const model = hostModelConfig.model ?? defaultModel.model;
      const provider = hostModelConfig.provider ?? defaultModel.provider;

      if (!model || !provider) return undefined;

      return { model, provider };
    }, [hostModelConfig, defaultModel]);

    const handleTemplateConfirm = useCallback(async () => {
      if (!selectedTemplate) return;

      const hostConfig = isHostRemoved ? undefined : normalizedHostModelConfig;

      try {
        await onCreateFromTemplate(selectedTemplate, hostConfig, !isHostRemoved);
        handleReset();
      } catch (error) {
        console.error('Failed to create group from template:', error);
      }
    }, [selectedTemplate, onCreateFromTemplate, normalizedHostModelConfig, isHostRemoved]);

    const handleCustomConfirm = useCallback(async () => {
      if (selectedAgents.length === 0) return;

      const hostConfig = isHostRemoved ? undefined : normalizedHostModelConfig;

      try {
        setIsCreatingCustom(true);
        await onCreateCustom(selectedAgents, hostConfig, !isHostRemoved);
        handleReset();
        onCancel();
      } catch (error) {
        console.error('Failed to create group with selected members:', error);
      } finally {
        setIsCreatingCustom(false);
      }
    }, [selectedAgents, onCreateCustom, normalizedHostModelConfig, isHostRemoved, onCancel]);

    const handleConfirm = useCallback(async () => {
      if (selectedTemplate) {
        await handleTemplateConfirm();
        return;
      }

      await handleCustomConfirm();
    }, [selectedTemplate, handleTemplateConfirm, handleCustomConfirm]);

    const handleCancel = () => {
      handleReset();
      onCancel();
    };

    const confirmDisabled = selectedTemplate
      ? selectedTemplateMembers.length === 0 && isHostRemoved
      : selectedAgents.length === 0;

    const confirmLoading = selectedTemplate ? isCreatingFromTemplate : isCreatingCustom;

    const hasAnySelection = selectedTemplate
      ? selectedTemplateMembers.length > 0 || !isHostRemoved
      : selectedAgentListItems.length > 0 || !isHostRemoved;

    return (
      <Modal
        footer={
          <Flexbox gap={8} horizontal justify="end">
            <Button onClick={handleCancel}>{t('cancel', { ns: 'common' })}</Button>
            <Button
              disabled={confirmDisabled}
              loading={confirmLoading}
              onClick={handleConfirm}
              type="primary"
            >
              {t('groupWizard.createGroup')}
            </Button>
          </Flexbox>
        }
        onCancel={handleCancel}
        open={open}
        title={t('groupWizard.title')}
        width={900}
      >
        <Flexbox className={styles.container} horizontal>
          <Flexbox className={styles.leftColumn} flex={1} gap={12}>
            <SearchBar
              allowClear
              onChange={handleSearchChange}
              placeholder={t('memberSelection.searchAgents')}
              value={searchTerm}
              variant="filled"
            />
            <Flexbox flex={1} style={{ overflowY: 'auto' }}>
              <Collapse
                accordion
                activeKey={activePanel}
                collapsible
                expandIconPosition="end"
                gap={12}
                items={[
                  {
                    children:
                      filteredTemplates.length === 0 ? (
                        <Empty
                          description={
                            searchTerm
                              ? t('groupWizard.noMatchingTemplates')
                              : t('groupWizard.noTemplates')
                          }
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                      ) : (
                        <Flexbox gap={4}>
                          {filteredTemplates.map((template) => (
                            <TemplateItem
                              cx={cx}
                              isSelected={selectedTemplate === template.id}
                              key={template.id}
                              onToggle={handleTemplateToggle}
                              styles={styles}
                              template={template}
                            />
                          ))}
                        </Flexbox>
                      ),
                    key: 'templates',
                    label: t('groupWizard.useTemplate'),
                  },
                  {
                    children:
                      filteredAgents.length === 0 ? (
                        <Empty
                          description={
                            searchTerm
                              ? t('noMatchingAgents', { ns: 'chat' })
                              : t('noAvailableAgents', { ns: 'chat' })
                          }
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                      ) : (
                        <Flexbox gap={4}>
                          {filteredAgents.map((agent) => (
                            <ExistingMemberItem
                              agent={agent}
                              cx={cx}
                              isSelected={selectedAgents.includes(agent.config?.id || '')}
                              key={agent.id}
                              onToggle={handleAgentToggle}
                              styles={styles}
                            />
                          ))}
                        </Flexbox>
                      ),
                    key: 'agents',
                    label: t('groupWizard.existingMembers'),
                  },
                ]}
                onChange={handlePanelChange}
                size="small"
                styles={{
                  header: {
                    color: theme.colorTextDescription,
                    fontSize: theme.fontSize,
                    padding: 0,
                  },
                }}
                variant="borderless"
              />
            </Flexbox>
          </Flexbox>

          <Flexbox className={styles.rightColumn} flex={1}>
            {!hasAnySelection ? (
              <Flexbox align="center" flex={1} justify="center">
                <Empty
                  description={
                    selectedTemplate
                      ? t('groupWizard.noSelectedTemplates')
                      : t('memberSelection.noSelectedAgents')
                  }
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              </Flexbox>
            ) : (
              <Flexbox flex={1} gap={16} style={{ overflowY: 'auto' }}>
                {!isHostRemoved && (
                  <Flexbox align="center" className={styles.hostCard} gap={12} horizontal>
                    <Avatar avatar={DEFAULT_SUPERVISOR_AVATAR} shape="circle" size={40} />
                    <Flexbox flex={1} gap={2}>
                      <Text style={{ fontSize: 14, fontWeight: 500 }}>
                        {t('groupWizard.host.title')}
                      </Text>
                      <Text style={{ color: '#999', fontSize: 12 }}>
                        {t('groupWizard.host.description')}
                      </Text>
                    </Flexbox>
                    <ModelSelect
                      onChange={handleHostModelChange}
                      value={normalizedHostModelConfig}
                    />
                    <ActionIcon
                      icon={X}
                      onClick={handleRemoveHost}
                      size="small"
                      style={{ color: '#999' }}
                    />
                  </Flexbox>
                )}

                {selectedTemplate ? (
                  selectedTemplateMembers.length > 0 ? (
                    <List
                      items={selectedTemplateMembers.map((member) => ({
                        actions: (
                          <ActionIcon
                            icon={X}
                            onClick={() => handleRemoveMember(selectedTemplate, member.title)}
                            size="small"
                            style={{ color: '#999' }}
                          />
                        ),
                        avatar: (
                          <Avatar
                            avatar={member.avatar}
                            background={member.backgroundColor}
                            shape="circle"
                            size={40}
                          />
                        ),
                        description: member.systemRole ? (
                          <Tooltip title={member.systemRole}>
                            <Text className={memberDescriptionClass} ellipsis={{ rows: 1 }}>
                              {member.systemRole}
                            </Text>
                          </Tooltip>
                        ) : null,
                        key: member.key,
                        showAction: true,
                        title: member.title,
                      }))}
                    />
                  ) : (
                    <Empty
                      description={t('groupWizard.noTemplateMembers')}
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  )
                ) : selectedAgentListItems.length > 0 ? (
                  <List items={selectedAgentListItems} />
                ) : null}
              </Flexbox>
            )}
          </Flexbox>
        </Flexbox>
      </Modal>
    );
  },
);

export default ChatGroupWizard;
