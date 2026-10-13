import { AGENT_CHAT_URL, isDesktop } from '@lobechat/const';
import { ActionIcon, toast } from '@lobehub/ui/base-ui';
import { FolderPlusIcon } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useActiveWorkspaceSlug } from '@/business/client/hooks/useActiveWorkspaceSlug';
import { useCommitWorkingDirectory } from '@/features/ChatInput/ControlBar/useCommitWorkingDirectory';
import { openPickWorkingDirModal, type PickedWorkingDir } from '@/features/WorkingDirectory';
import { resolveTargetDeviceId } from '@/helpers/agentWorkingDirectory';
import { getWorkingDirectoryPathString } from '@/helpers/workingDirectoryPath';
import { useActiveLocation } from '@/hooks/useActiveLocation';
import { useEffectiveAgencyConfig } from '@/hooks/useEffectiveAgencyConfig';
import { useQueryRoute } from '@/hooks/useQueryRoute';
import { electronSystemService } from '@/services/electron/system';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { useChatStore } from '@/store/chat';
import { deviceSelectors, useDeviceStore } from '@/store/device';
import { useElectronStore } from '@/store/electron';

import { buildPrefixedAgentRoutePath, parseAgentPathname } from '../utils/agentPathname';

/**
 * Topics header action for heterogeneous agents: pick (or create) a folder on
 * the agent's target device and open a new conversation in it — the header
 * counterpart of a project group's "+". The folder becomes the agent's default
 * for that device and joins the device's recent list; the topic row (and so
 * the folder group) appears once the first message is sent.
 */
const AddFolderAction = memo<{ agentId: string }>(({ agentId }) => {
  const { t } = useTranslation('device');
  const { agencyConfig, workspaceScoped } = useEffectiveAgencyConfig(agentId, { topicId: null });
  const currentDeviceId = useElectronStore((s) => s.gatewayDeviceInfo?.deviceId);
  const targetDeviceId = resolveTargetDeviceId(agencyConfig, currentDeviceId, {
    workspaceScoped,
  });
  // The local machine is browsed with the native dialog; any other device
  // through its directory RPC.
  const isLocalDevice = isDesktop && !!targetDeviceId && targetDeviceId === currentDeviceId;
  const deviceDefaultCwd = getWorkingDirectoryPathString(
    useDeviceStore(deviceSelectors.getDeviceDefaultCwd(targetDeviceId)),
  );
  // `null` topic: write the agent's per-device choice that a new topic inherits,
  // never the override of whatever conversation is currently open.
  const { commit, isPreferenceLoading } = useCommitWorkingDirectory(agentId, null);

  const router = useQueryRoute();
  const { pathname } = useActiveLocation();
  const agentRoute = useMemo(() => parseAgentPathname(pathname), [pathname]);
  const activeWorkspaceSlug = useActiveWorkspaceSlug();

  const startInFolder = async (entry: PickedWorkingDir) => {
    await commit(entry, { rethrow: true, showErrorMessage: false });
    const chat = useChatStore.getState();
    chat.setPendingNewTopicDirectory();
    chat.switchTopic(null, { skipRefreshMessage: true });
    router.push(
      buildPrefixedAgentRoutePath(AGENT_CHAT_URL(agentId), agentRoute, activeWorkspaceSlug),
    );
  };

  const handleClick = async () => {
    if (!isLocalDevice) {
      openPickWorkingDirModal({
        defaultPath: deviceDefaultCwd,
        deviceId: targetDeviceId,
        onPick: startInFolder,
      });
      return;
    }

    try {
      const result = await electronSystemService.selectFolder({
        defaultPath: deviceDefaultCwd,
        title: t('workingDirectory.selectFolder'),
      });
      if (result) await startInFolder({ path: result.path, repoType: result.repoType });
    } catch (error) {
      console.error('Failed to add working directory', error);
      toast.error(t('workingDirectory.addFolderFailed'));
    }
  };

  if (!targetDeviceId) return null;

  return (
    <ActionIcon
      aria-label={t('workingDirectory.addFolder')}
      disabled={isPreferenceLoading}
      icon={FolderPlusIcon}
      size={'small'}
      title={t('workingDirectory.addFolder')}
      onClick={() => void handleClick()}
    />
  );
});

AddFolderAction.displayName = 'AddFolderAction';

/** Only heterogeneous (CLI) agents work inside folders, so others get no action. */
const AddFolder = memo(() => {
  const agentId = useAgentStore((s) => s.activeAgentId);
  const isHeterogeneous = !!useAgentStore(agentSelectors.currentAgentHeterogeneousProviderType);

  if (!agentId || !isHeterogeneous) return null;

  return <AddFolderAction agentId={agentId} />;
});

AddFolder.displayName = 'AddFolder';

export default AddFolder;
