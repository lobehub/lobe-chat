'use client';

import { ActionIcon, Avatar, GroupAvatar, List, Modal, SearchBar, Text } from '@lobehub/ui';
import { Button, Checkbox, Empty } from 'antd';
import { createStyles } from 'antd-style';
import { Users, X } from 'lucide-react';
import { type ChangeEvent, memo, useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { MemberSelectionModal } from '@/components/MemberSelectionModal';
import { DEFAULT_AVATAR } from '@/const/meta';
import ModelSelect from '@/features/ModelSelect';
import { useEnabledChatModels } from '@/hooks/useEnabledChatModels';

import { useGroupTemplates } from './templates';

const TemplateItem = memo<{
  cx: any;
  isSelected: boolean;
  // eslint-disable-next-line unused-imports/no-unused-vars
  onToggle: (templateId: string) => void;
  styles: any;
  t: any;
  template: any;
}>(({ template, isSelected, onToggle, styles, cx, t }) => {
  const ref = useRef(null);

  return (
    <div className={cx(styles.listItem)} onClick={() => onToggle(template.id)} ref={ref}>
      <Flexbox align="center" gap={12} horizontal width="100%">
        <Checkbox
          checked={isSelected}
          onChange={() => onToggle(template.id)}
          onClick={(e) => e.stopPropagation()}
        />
        <GroupAvatar
          avatars={template.members.map((member: any) => ({
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
  rightColumn: css`
    overflow-y: auto;
    display: flex;
    flex: 1;
    flex-direction: column;

    padding: ${token.paddingSM}px;
  `,
  settingsPanel: css`
    padding: ${token.paddingSM}px;
    border-top: 1px solid ${token.colorBorderSecondary};
    background: ${token.colorBgContainer};
  `,
  templateCard: css`
    cursor: pointer;
    border: 1px solid ${token.colorBorderSecondary};
    transition: all 0.2s ease;

    &:hover {
      background: ${token.colorFillTertiary};
    }
  `,
  templateList: css`
    overflow-y: auto;
    flex: 1;
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
  onCreateCustom: (selectedAgents: string[], hostConfig?: { model?: string; provider?: string }) => void | Promise<void>;
  onCreateFromTemplate: (templateId: string, hostConfig?: { model?: string; provider?: string }) => void | Promise<void>;
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
    const groupTemplates = useGroupTemplates();
    const enabledModels = useEnabledChatModels();
    
    // Get default model from the first enabled provider's first model
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

    const [isMemberSelectionOpen, setIsMemberSelectionOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState<string>('');
    const [removedMembers, setRemovedMembers] = useState<Record<string, string[]>>({});
    const [hostModelConfig, setHostModelConfig] = useState<{ model?: string; provider?: string }>(defaultModel);

    // Use external loading state if provided, otherwise use internal state
    const isCreatingFromTemplate = externalLoading ?? false;

    const handleTemplateToggle = (templateId: string) => {
      setSelectedTemplate((prev) => (prev === templateId ? '' : templateId));
    };

    const handleReset = () => {
      setSelectedTemplate('');
      setSearchTerm('');
      setRemovedMembers({});
      setHostModelConfig(defaultModel);
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

    const handleTemplateConfirm = async () => {
      if (!selectedTemplate) return;

      // If using external loading state, don't manage loading internally
      if (externalLoading !== undefined) {
        await onCreateFromTemplate(selectedTemplate, hostModelConfig);
        // Reset will be handled by parent after successful creation
        handleReset();
      } else {
        // Fallback for backwards compatibility
        try {
          await onCreateFromTemplate(selectedTemplate, hostModelConfig);
          handleReset();
        } catch (error) {
          console.error('Failed to create group from template:', error);
        }
      }
    };

    const handleCustomCreate = () => {
      onCancel(); // Close the wizard modal first
      // Use setTimeout to ensure modal close animation completes before opening new modal
      setTimeout(() => {
        setIsMemberSelectionOpen(true);
      }, 100);
    };

    const handleMemberSelectionCancel = () => {
      setIsMemberSelectionOpen(false);
    };

    const handleMemberSelectionConfirm = async (selectedAgents: string[]) => {
      setIsMemberSelectionOpen(false);
      await onCreateCustom(selectedAgents, hostModelConfig);
    };

    const handleSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
    }, []);

    // Filter templates based on search term
    const filteredTemplates = useMemo(() => {
      if (!searchTerm.trim()) return groupTemplates;

      return groupTemplates.filter((template) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          template.title.toLowerCase().includes(searchLower) ||
          template.description.toLowerCase().includes(searchLower)
        );
      });
    }, [searchTerm]);

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
          description: template.title,
          key: `${selectedTemplate}-${member.title}`,
          title: member.title,
        }));
    }, [selectedTemplate, removedMembers, groupTemplates]);

    const handleCancel = () => {
      handleReset();
      onCancel();
    };

    return (
      <>
        <Modal
          footer={
            <Flexbox gap={8} horizontal justify="space-between">
              <Button onClick={handleCustomCreate} type="default">
                {t('groupWizard.chooseMembers')}
              </Button>
              <Flexbox gap={8} horizontal>
                <Button onClick={handleCancel}>{t('cancel', { ns: 'common' })}</Button>
                <Button
                  disabled={!selectedTemplate}
                  loading={isCreatingFromTemplate}
                  onClick={handleTemplateConfirm}
                  type="primary"
                >
                  {t('groupWizard.createGroup')}
                </Button>
              </Flexbox>
            </Flexbox>
          }
          onCancel={handleCancel}
          open={open}
          title={t('groupWizard.title')}
          width={800}
        >
          <Flexbox className={styles.container} horizontal>
            {/* Left Column - Templates */}
            <Flexbox className={styles.leftColumn} flex={1} gap={12}>
              <SearchBar
                allowClear
                onChange={handleSearchChange}
                placeholder={t('groupWizard.searchTemplates')}
                value={searchTerm}
                variant="filled"
              />

              <Flexbox flex={1} style={{ overflowY: 'auto' }}>
                {filteredTemplates.length === 0 ? (
                  <Empty
                    description={
                      searchTerm
                        ? t('groupWizard.noMatchingTemplates')
                        : t('groupWizard.noTemplates')
                    }
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ) : (
                  <div>
                    {filteredTemplates.map((template) => {
                      const isSelected = selectedTemplate === template.id;

                      return (
                        <TemplateItem
                          cx={cx}
                          isSelected={isSelected}
                          key={template.id}
                          onToggle={handleTemplateToggle}
                          styles={styles}
                          t={t}
                          template={template}
                        />
                      );
                    })}
                  </div>
                )}
              </Flexbox>
            </Flexbox>

            {/* Right Column - Group Members */}
            <Flexbox className={styles.rightColumn} flex={1}>
              {selectedTemplateMembers.length === 0 ? (
                <Flexbox align="center" flex={1} justify="center">
                  <Empty
                    description={t('groupWizard.noSelectedTemplates')}
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                </Flexbox>
              ) : (
                <Flexbox flex={1} style={{ overflowY: 'auto' }}>
                  {/* Host Item */}
                  <Flexbox
                    align="center"
                    gap={12}
                    horizontal
                    justify="center"
                    padding={16}
                    style={{
                      marginBottom: 16,
                    }}
                  >
                    <Avatar avatar="🎙️" shape="circle" size={40} />
                    <Flexbox flex={1} gap={2}>
                      <Text style={{ fontSize: 14, fontWeight: 500 }}>Host</Text>
                      <Text style={{ color: '#999', fontSize: 12 }}>Built-in</Text>
                    </Flexbox>
                    <ModelSelect 
                      value={hostModelConfig.model && hostModelConfig.provider ? {
                        model: hostModelConfig.model,
                        provider: hostModelConfig.provider,
                      } : undefined}
                      onChange={handleHostModelChange}
                    />
                  </Flexbox>

                  <Text style={{ marginBottom: 16, textAlign: 'center' }} type="secondary">
                    {t('groupWizard.groupMembers')}
                  </Text>

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
                      description: member.description,
                      key: member.key,
                      showAction: true,
                      title: member.title,
                    }))}
                  />
                </Flexbox>
              )}
            </Flexbox>
          </Flexbox>
        </Modal>

        <MemberSelectionModal
          mode="create"
          onCancel={handleMemberSelectionCancel}
          onConfirm={handleMemberSelectionConfirm}
          open={isMemberSelectionOpen}
        />
      </>
    );
  },
);

export default ChatGroupWizard;
