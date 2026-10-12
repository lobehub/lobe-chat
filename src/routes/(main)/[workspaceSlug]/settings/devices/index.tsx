'use client';

import type { DeviceVisibility } from '@lobechat/types';
import { Flexbox, Icon } from '@lobehub/ui';
import { Button, Tabs } from '@lobehub/ui/base-ui';
import { LockIcon, RefreshCwIcon, TerminalIcon, UsersIcon } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useSearchParams } from 'react-router';

import {
  DeviceConnectModal,
  DeviceDetailPage,
  DeviceManager,
  useDeviceList,
} from '@/features/DeviceManager';
import { useWorkspaceAwareNavigate } from '@/features/Workspace/useWorkspaceAwareNavigate';

/**
 * Workspace device settings: two pools behind tabs —
 * - Workspace: the shared (public-visibility) pool every member sees.
 * - Private: the caller's own private enrollments in this workspace.
 * The tab also parameterises the connect wizard, so a device enrolled from the
 * Private tab registers as private (`lh connect … --private`).
 * The tab lives in `?visibility=` so leaving a device's detail page
 * (`devices/:sub`) lands back on the tab that device belongs to.
 */
const WorkspaceDevicesSetting = memo(() => {
  const { t } = useTranslation('setting');
  const [open, setOpen] = useState(false);
  const { sub: deviceId } = useParams<{ sub?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const visibility: DeviceVisibility =
    searchParams.get('visibility') === 'private' ? 'private' : 'public';
  const navigate = useWorkspaceAwareNavigate();

  const setVisibility = (next: DeviceVisibility) =>
    setSearchParams(next === 'private' ? { visibility: next } : {}, { replace: true });

  // The connect + refresh actions sit beside the tabs (same header pattern as
  // the workspace credential page). Shares DeviceManager's SWR entry, so
  // `mutate` refreshes the list it renders.
  const { isValidating, mutate } = useDeviceList();

  if (deviceId)
    return (
      <DeviceDetailPage
        deviceId={deviceId}
        scope={'workspace'}
        onBack={(device) =>
          navigate(
            (device?.visibility ?? visibility) === 'private'
              ? '/settings/devices?visibility=private'
              : '/settings/devices',
          )
        }
      />
    );

  return (
    <>
      <Flexbox gap={16}>
        <Flexbox horizontal align={'center'} gap={16} justify={'space-between'}>
          <Tabs
            activeKey={visibility}
            items={[
              {
                icon: <Icon icon={UsersIcon} />,
                key: 'public',
                label: t('devices.visibilityTabs.workspace'),
              },
              {
                icon: <Icon icon={LockIcon} />,
                key: 'private',
                label: t('devices.visibilityTabs.private'),
              },
            ]}
            onChange={(key) => setVisibility(key as DeviceVisibility)}
          />
          <Flexbox horizontal align={'center'} gap={8}>
            <Button
              icon={<Icon icon={RefreshCwIcon} />}
              loading={isValidating}
              title={t('devices.actions.refresh')}
              onClick={() => mutate()}
            />
            <Button
              icon={<Icon icon={TerminalIcon} />}
              type={'primary'}
              onClick={() => setOpen(true)}
            >
              {t('devices.empty.methodCli.title')}
            </Button>
          </Flexbox>
        </Flexbox>

        <DeviceManager
          key={visibility}
          scope={'workspace'}
          visibility={visibility}
          onConnect={() => setOpen(true)}
          onOpenDevice={(id) =>
            navigate(
              `/settings/devices/${encodeURIComponent(id)}${
                visibility === 'private' ? '?visibility=private' : ''
              }`,
            )
          }
        />
      </Flexbox>

      <DeviceConnectModal
        open={open}
        scope={'workspace'}
        visibility={visibility}
        onClose={() => setOpen(false)}
      />
    </>
  );
});

WorkspaceDevicesSetting.displayName = 'WorkspaceDevicesSetting';

export default WorkspaceDevicesSetting;
