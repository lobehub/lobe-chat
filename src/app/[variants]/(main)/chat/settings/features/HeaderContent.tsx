import { ActionIcon, Button, Dropdown, type MenuProps } from '@lobehub/ui';
import { HardDriveDownload } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import isEqual from 'fast-deep-equal';

import { HEADER_ICON_SIZE } from '@/const/layoutTokens';
import { isServerMode } from '@/const/version';
import { configService } from '@/services/config';
import { useServerConfigStore } from '@/store/serverConfig';
import { useSessionStore } from '@/store/session';
import { sessionMetaSelectors } from '@/store/session/selectors';

import SubmitAgentButton from './SubmitAgentButton';
import UploadAgentVersionButton from './UploadAgentVersionButton';

export const HeaderContent = memo<{ mobile?: boolean; modal?: boolean }>(({ modal }) => {
  const { t } = useTranslation('setting');
  const id = useSessionStore((s) => s.activeId);
  const meta = useSessionStore(sessionMetaSelectors.currentAgentMeta, isEqual);

  const mobile = useServerConfigStore((s) => s.isMobile);

  // Check if agent has been published to market
  const hasMarketIdentifier = !!meta?.marketIdentifier;

  const items = useMemo<MenuProps['items']>(
    () =>
      isServerMode
        ? []
        : [
            {
              key: 'agent',
              label: <div>{t('exportType.agent', { ns: 'common' })}</div>,
              onClick: () => {
                if (!id) return;

                configService.exportSingleAgent(id);
              },
            },
            {
              key: 'agentWithMessage',
              label: <div>{t('exportType.agentWithMessage', { ns: 'common' })}</div>,
              onClick: () => {
                if (!id) return;

                configService.exportSingleSession(id);
              },
            },
          ],
    [],
  );

  return (
    <>
      {hasMarketIdentifier ? (
        <UploadAgentVersionButton modal={modal} />
      ) : (
        <SubmitAgentButton modal={modal} />
      )}
      {!isServerMode && (
        <Dropdown arrow={false} menu={{ items }} trigger={['click']}>
          {modal ? (
            <Button block icon={HardDriveDownload} variant={'filled'}>
              {t('export', { ns: 'common' })}
            </Button>
          ) : (
            <ActionIcon
              icon={HardDriveDownload}
              size={HEADER_ICON_SIZE(mobile)}
              title={t('export', { ns: 'common' })}
            />
          )}
        </Dropdown>
      )}
    </>
  );
});

export default HeaderContent;
