import type { EscapedResourceRef } from '@lobechat/html-artifact';
import { confirmModal, toast } from '@lobehub/ui/base-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { copyWorkspaceHtmlArtifactIntoWorkspace } from './copyWorkspaceHtmlArtifactIntoWorkspace';
import {
  notifyWorkspaceHtmlPublishBlocked,
  prepareWorkspaceHtmlPublish,
  publishPreparedWorkspaceHtml,
  type ReadyWorkspaceHtmlPublishPlan,
  type WorkspaceHtmlPublishPlan,
} from './prepareWorkspaceHtmlPublish';
import { openWorkspaceHtmlPublishConfirm } from './PublishHtmlArtifactConfirm';
import type {
  WorkspaceHtmlArtifactPublisher,
  WorkspaceHtmlArtifactPublishResult,
} from './workspaceHtmlArtifact';

type OutsideWorkspacePlan = Extract<WorkspaceHtmlPublishPlan, { blocked: 'outside-workspace' }>;

export interface BlockedWorkspaceHtmlPublishInput {
  agentId?: string | null;
  close: () => void;
  copyFile: (from: string, to: string) => Promise<void>;
  deviceId?: string;
  filePath: string;
  hasExisting: boolean;
  onError?: (error: unknown) => boolean;
  onPublished?: (
    result: WorkspaceHtmlArtifactPublishResult,
    plan: ReadyWorkspaceHtmlPublishPlan,
  ) => void;
  plan: OutsideWorkspacePlan;
  publish: WorkspaceHtmlArtifactPublisher['publish'];
  sandboxTopicId?: string;
  topicId: string;
  workingDirectory: string;
}

export const useBlockedWorkspaceHtmlPublish = ({
  agentId,
  close,
  copyFile,
  deviceId,
  filePath,
  hasExisting,
  onError,
  onPublished,
  plan,
  publish,
  sandboxTopicId,
  topicId,
  workingDirectory,
}: BlockedWorkspaceHtmlPublishInput) => {
  const { t } = useTranslation(['chat', 'common']);
  const [force, setForce] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState<EscapedResourceRef[]>([]);
  const htmlEntry = plan.gathered.files.find((file) => file.path === plan.gathered.entryPath);
  const htmlContent = htmlEntry?.encoding === 'utf8' ? htmlEntry.content : '';

  const handleForceChange = (checked: boolean) => {
    if (!checked) {
      setForce(false);
      return;
    }

    confirmModal({
      cancelText: t('cancel', { ns: 'common' }),
      content: t('workingPanel.localFile.publish.outsideWorkspace.forceHint', { ns: 'chat' }),
      okButtonProps: { danger: true },
      okText: t('confirm', { ns: 'common' }),
      onOk: () => setForce(true),
      title: t('workingPanel.localFile.publish.outsideWorkspace.forceLabel', { ns: 'chat' }),
    });
  };

  const openConfirm = (ready: ReadyWorkspaceHtmlPublishPlan, copiedDirectory?: string) => {
    close();
    openWorkspaceHtmlPublishConfirm({
      hasExisting,
      plan: ready,
      onOk: () => {
        void publishPreparedWorkspaceHtml({
          agentId,
          onError,
          plan: ready,
          publish,
          successMessage: copiedDirectory
            ? t('workingPanel.localFile.publish.outsideWorkspace.copiedToast', {
                dir: copiedDirectory,
              })
            : undefined,
          topicId,
        }).then((result) => {
          if (result) onPublished?.(result, ready);
        });
      },
    });
  };

  const prepareNext = async (input: Parameters<typeof prepareWorkspaceHtmlPublish>[0]) => {
    const next = await prepareWorkspaceHtmlPublish(input);
    if ('blocked' in next) {
      notifyWorkspaceHtmlPublishBlocked(next);
      if (next.blocked === 'outside-workspace') {
        toast.error(t('workingPanel.localFile.publish.failed'));
      }
      return;
    }
    return next;
  };

  const handleContinue = async () => {
    if (busy || (!force && failed.length > 0)) return;
    setBusy(true);
    try {
      if (force) {
        const ready = await prepareNext({
          allowExternalReads: true,
          content: htmlContent,
          deviceId,
          filePath,
          sandboxTopicId,
          workingDirectory,
        });
        if (ready) openConfirm(ready);
        return;
      }

      const copied = await copyWorkspaceHtmlArtifactIntoWorkspace({
        copyFile,
        escaped: plan.escaped,
        htmlContent,
        htmlFilePath: filePath,
        workingDirectory,
      });
      if (copied.failed.length > 0) {
        setFailed(copied.failed);
        return;
      }

      const ready = await prepareNext({
        content: copied.htmlContent,
        deviceId,
        filePath: copied.entryPath,
        sandboxTopicId,
        workingDirectory,
      });
      if (ready) openConfirm(ready, copied.targetDirectory);
    } catch {
      setFailed([{ absolutePath: filePath, href: filePath }]);
    } finally {
      setBusy(false);
    }
  };

  return { busy, failed, force, handleContinue, handleForceChange };
};
