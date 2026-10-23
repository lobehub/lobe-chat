'use client';

import { cssVar, Flexbox, Segmented, toast } from '@lobehub/ui';
import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useUploadFiles } from '@/components/DragUploadZone';
import {
  type ActionKeys,
  ChatInputProvider,
  DesktopChatInput,
  type SendButtonHandler,
} from '@/features/ChatInput';
import FileUpload from '@/features/ChatInput/ActionBar/Upload';
import InputDragUpload from '@/features/Home/InputArea/InputDragUpload';
import { useInitAgentConfig } from '@/hooks/useInitAgentConfig';
import { useAgentStore } from '@/store/agent';
import { agentByIdSelectors } from '@/store/agent/selectors';
import type { ProjectDetail } from '@/store/project';

import {
  AttachmentsNotReadyError,
  type ProjectComposerMode,
  useProjectComposer,
} from './useProjectComposer';

const leftActions: ActionKeys[] = [];
const rightActions: ActionKeys[] = [];

const CONTAINER_RADIUS = 18;
/** Clearance from the container edge to the round controls sitting in its corners. */
const ACTION_BAR_INSET = 8;

const inputContainerProps = {
  minHeight: 88,
  resize: false,
  style: {
    borderRadius: CONTAINER_RADIUS,
    boxShadow: cssVar.boxShadowSecondary,
  },
};
const actionBarStyle = { paddingBlockEnd: ACTION_BAR_INSET, paddingInline: ACTION_BAR_INSET };

interface ProjectComposerProps {
  project: ProjectDetail['project'];
}

/**
 * The project home composer is the regular chat input — line breaks, pasted
 * images and attachments behave as in any conversation — sending to the
 * project's main agent, or recording a task for it.
 */
const ProjectComposer = memo<ProjectComposerProps>(({ project }) => {
  const { t } = useTranslation('project');
  const { t: tHome } = useTranslation('home');
  const [mode, setMode] = useState<ProjectComposerMode>('chat');
  const { send, sending } = useProjectComposer(project, mode);
  const agentId = project.coordinatorAgentId;

  useInitAgentConfig(agentId);
  const isAgentConfigLoading = useAgentStore((s) =>
    agentByIdSelectors.isAgentConfigLoadingById(agentId)(s),
  );
  const model = useAgentStore((s) => agentByIdSelectors.getAgentModelById(agentId)(s));
  const provider = useAgentStore((s) => agentByIdSelectors.getAgentModelProviderById(agentId)(s));
  const { handleUploadFiles } = useUploadFiles({ agentId, model, provider });

  const submit: SendButtonHandler = async (params) => {
    try {
      await send(params);
    } catch (error) {
      if (error instanceof AttachmentsNotReadyError) {
        toast.error(tHome('dashboard.task.attachmentsNotReady'));
        return;
      }
      console.error('Failed to send from the project home', error);
      toast.error(t(mode === 'task' ? 'overview.createTaskFailed' : 'overview.sendFailed'));
    }
  };

  const sendButtonProps = useMemo(
    () => ({
      disabled: sending || isAgentConfigLoading,
      generating: sending,
      onStop: () => {},
      shape: 'round' as const,
    }),
    [sending, isAgentConfigLoading],
  );

  return (
    <InputDragUpload radius={CONTAINER_RADIUS} onUploadFiles={handleUploadFiles}>
      <ChatInputProvider
        agentId={agentId}
        allowExpand={false}
        contextSelectionKey={`project-home:${project.id}`}
        leftActions={leftActions}
        rightActions={rightActions}
        sendButtonProps={sendButtonProps}
        slashPlacement="bottom"
        topicId={null}
        onSend={submit}
      >
        <DesktopChatInput
          actionBarStyle={actionBarStyle}
          dropdownPlacement="bottomLeft"
          inputContainerProps={inputContainerProps}
          showControlBar={false}
          leftContent={
            <Flexbox horizontal align={'center'} gap={4}>
              <Segmented
                size={'small'}
                value={mode}
                options={[
                  { label: t('overview.mode.chat'), value: 'chat' },
                  { label: t('overview.mode.task'), value: 'task' },
                ]}
                onChange={(value) => setMode(value as ProjectComposerMode)}
              />
              <FileUpload includeKnowledge={false} />
            </Flexbox>
          }
          placeholder={t(
            mode === 'task' ? 'overview.taskPlaceholder' : 'overview.composerPlaceholder',
          )}
        />
      </ChatInputProvider>
    </InputDragUpload>
  );
});

ProjectComposer.displayName = 'ProjectComposer';

export default ProjectComposer;
