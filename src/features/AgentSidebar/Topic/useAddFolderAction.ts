import { AGENT_CHAT_URL, isDesktop } from '@lobechat/const';
import { toast } from '@lobehub/ui/base-ui';
import { useCallback, useMemo } from 'react';
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

export interface AddFolderAction {
  /** Whether the surface should offer the action at all. */
  canAddFolder: boolean;
  /** The working-directory preference is still in flight — acting now would read a stale target. */
  disabled: boolean;
  /** Menu label, shared with the other folder pickers. */
  label: string;
  /** Open the folder picker. */
  run: () => void;
}

/**
 * For heterogeneous agents: pick (or create) a folder on the agent's target
 * device and open a new conversation in it — the topic menu counterpart of a
 * project group's "+". The folder becomes the agent's default for that device
 * and joins the device's recent list; the topic row (and so the folder group)
 * appears once the first message is sent.
 *
 * Lives in the "more" dropdown rather than as a header icon: it is a
 * start-something action, not a view toggle, so it belongs with the other topic
 * actions instead of competing with the header's group/filter controls.
 */
export const useAddFolderAction = (): AddFolderAction => {
  const { t } = useTranslation('device');
  const activeAgentId = useAgentStore((s) => s.activeAgentId);
  const isHeterogeneous = !!useAgentStore(agentSelectors.currentAgentHeterogeneousProviderType);
  // Every hook below is fed an agent id even when the action is unavailable —
  // both `useEffectiveAgencyConfig` and `useCommitWorkingDirectory` treat an
  // empty id as "nothing to resolve" (same as `ByProjectMode/GroupItem`). The
  // picker behind `run` is only reachable once `canAddFolder` is true.
  const agentId = activeAgentId ?? '';

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

  const startInFolder = useCallback(
    async (entry: PickedWorkingDir) => {
      await commit(entry, { rethrow: true, showErrorMessage: false });
      const chat = useChatStore.getState();
      chat.setPendingNewTopicDirectory();
      chat.switchTopic(null, { skipRefreshMessage: true });
      router.push(
        buildPrefixedAgentRoutePath(AGENT_CHAT_URL(agentId), agentRoute, activeWorkspaceSlug),
      );
    },
    [activeWorkspaceSlug, agentId, agentRoute, commit, router],
  );

  const run = useCallback(() => {
    const openPicker = async () => {
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

    void openPicker();
  }, [deviceDefaultCwd, isLocalDevice, startInFolder, t, targetDeviceId]);

  return {
    canAddFolder: !!activeAgentId && isHeterogeneous && !!targetDeviceId,
    disabled: isPreferenceLoading,
    label: t('workingDirectory.addFolder'),
    run,
  };
};
