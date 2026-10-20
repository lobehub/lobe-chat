'use client';

import { Alert, Button, Text, toast } from '@lobehub/ui';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { describeError } from './errorMessage';
import { type SandboxEnvironment, useEnvironmentActions, useInstances } from './useEnvironmentData';

interface RebuildNoticeProps {
  /** Only the environment's owner can add a copy to it. */
  editable: boolean;
  environment: SandboxEnvironment;
}

/**
 * An environment whose directories are on the wrong drive for who may run it.
 *
 * A private environment's directories still on the workspace's public drive,
 * from before members had drives of their own: every member can reach the
 * public drive, and an environment directory's home holds whatever
 * credentials its sessions left there — so those directories are hidden on it
 * and no longer run in. Private environments now keep their directories on
 * the owner's personal drive.
 *
 * And the other way round: an environment just published whose directories
 * were all made while it was private, so they are on the owner's personal
 * drive, where no colleague can reach them. Publishing does not copy them —
 * a directory's home is its owner's — so until one is made on the public
 * drive the workspace sees the environment but has nothing to run in.
 *
 * Either way this says so, and initializes a new copy on the right drive in
 * one click (the drive follows the environment's visibility).
 */
const RebuildNotice = memo<RebuildNoticeProps>(({ editable, environment }) => {
  const { t } = useTranslation('setting');
  const { data } = useInstances();
  const actions = useEnvironmentActions();
  const [rebuilding, setRebuilding] = useState(false);

  const own = (data?.instances ?? []).filter(
    (instance) => instance.environmentId === environment.id,
  );
  const legacy = own.filter((instance) => instance.rebuildRequired);
  const unpublished =
    legacy.length === 0 &&
    !!environment.workspaceId &&
    environment.visibility === 'public' &&
    own.length > 0 &&
    own.every((instance) => instance.drive === 'personal');
  if (legacy.length === 0 && !unpublished) return null;

  const keys = unpublished
    ? {
        action: 'environments.instances.publishPublic',
        desc: 'environments.instances.publishPublicDesc',
        failed: 'environments.instances.publishPublicFailed',
        started: 'environments.instances.publishPublicStarted',
      }
    : {
        action: 'environments.instances.rebuildPersonal',
        desc: 'environments.instances.rebuildPersonalDesc',
        failed: 'environments.instances.rebuildPersonalFailed',
        started: 'environments.instances.rebuildPersonalStarted',
      };

  const rebuild = async () => {
    setRebuilding(true);
    try {
      await actions.rebuildOnOwnDrive(environment.id);
      toast.success(t(keys.started));
    } catch (error) {
      toast.error(describeError(error, t, t(keys.failed)));
    } finally {
      setRebuilding(false);
    }
  };

  return (
    <Alert
      showIcon
      style={{ marginBlockEnd: 12 }}
      type={'warning'}
      variant={'soft'}
      action={
        editable ? (
          <Button loading={rebuilding} size={'small'} onClick={rebuild}>
            {t(keys.action)}
          </Button>
        ) : undefined
      }
      title={
        <Text fontSize={13} weight={400}>
          {t(keys.desc, {
            count: legacy.length,
            names: legacy.map((instance) => instance.workingDirectory).join(', '),
          })}
        </Text>
      }
    />
  );
});

RebuildNotice.displayName = 'RebuildNotice';

export default RebuildNotice;
