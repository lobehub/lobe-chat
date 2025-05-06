import { StorageMode, StorageModeEnum } from '@lobechat/electron-client-ipc';
import { Button, Input } from '@lobehub/ui';
import { LobeHub } from '@lobehub/ui/brand';
import { createStyles } from 'antd-style';
import { ComputerIcon, Server } from 'lucide-react';
import { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import { useElectronStore } from '@/store/electron';
import { electronSyncSelectors } from '@/store/electron/selectors';

import { Option } from './Option';

const useStyles = createStyles(({ token, css }) => {
  return {
    cardGroup: css`
      width: 400px; /* Increased width */
    `,
    container: css`
      overflow-y: auto;

      width: 100%;
      height: 100%;
      padding-block: 0 40px;
      padding-inline: 24px; /* Increased top padding */
    `,
    continueButton: css`
      width: 100%;
      margin-block-start: 40px;
    `,
    groupTitle: css`
      padding-inline-start: 4px; /* Align with card padding */
      font-size: 16px;
      font-weight: 500;
      color: ${token.colorTextSecondary};
    `,
    header: css`
      text-align: center;
    `,
    inputError: css`
      margin-block-start: 8px;
      font-size: 12px;
      color: ${token.colorError};
    `,
    modal: css`
      .ant-drawer-close {
        position: absolute;
        inset-block-start: 8px;
        inset-inline-end: 0;
      }
    `,
    selfHostedInput: css`
      margin-block-start: 12px;
    `,
    selfHostedText: css`
      cursor: pointer;
      font-size: 14px;
      color: ${token.colorTextTertiary};

      :hover {
        color: ${token.colorTextSecondary};
      }
    `,
    title: css`
      margin-block: 16px 48px; /* Increased Spacing below title */
      font-size: 24px; /* Increased font size */
      font-weight: 600;
      color: ${token.colorTextHeading};
    `,
  };
});

interface ConnectionModeProps {
  setIsOpen: (open: boolean) => void;
  setWaiting: (waiting: boolean) => void;
}

const ConnectionMode = memo<ConnectionModeProps>(({ setIsOpen, setWaiting }) => {
  const { styles } = useStyles();
  const { t } = useTranslation(['electron', 'common']);
  const [urlError, setUrlError] = useState<string | undefined>();

  const connect = useElectronStore((s) => s.connectRemoteServer);
  const disconnect = useElectronStore((s) => s.disconnectRemoteServer);
  const storageMode = useElectronStore(electronSyncSelectors.storageMode);
  const remoteServerUrl = useElectronStore(electronSyncSelectors.remoteServerUrl);

  const [selectedOption, setSelectedOption] = useState<StorageMode>(storageMode);
  const [selfHostedUrl, setSelfHostedUrl] = useState(remoteServerUrl);

  const validateUrl = useCallback((url: string) => {
    if (!url) {
      return t('remoteServer.urlRequired');
    }
    try {
      new URL(url);
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        throw new Error('Invalid protocol');
      }
      return undefined;
    } catch {
      return t('remoteServer.invalidUrl');
    }
  }, []);

  const handleSelectOption = (option: StorageMode) => {
    setSelectedOption(option);
    if (option !== StorageModeEnum.SelfHost) {
      setUrlError(undefined);
    } else {
      setUrlError(validateUrl(selfHostedUrl));
    }
  };

  const handleContinue = async () => {
    if (selectedOption === StorageModeEnum.SelfHost) {
      const error = validateUrl(selfHostedUrl);
      setUrlError(error);
      if (error) {
        return;
      }
    }

    if (selectedOption === StorageModeEnum.Local) {
      await disconnect();
      setIsOpen(false);
      return;
    }

    // try to connect
    setWaiting(true);
    await connect({ remoteServerUrl: selfHostedUrl, storageMode: selectedOption });
  };

  return (
    <Center className={styles.container}>
      <Flexbox align={'center'} gap={0}>
        <h1 className={styles.title}>{t('sync.mode.title')}</h1>
      </Flexbox>

      <Flexbox className={styles.cardGroup} gap={24}>
        <Flexbox gap={16}>
          <Flexbox align="center" horizontal justify="space-between">
            <div className={styles.groupTitle}>{t('sync.mode.cloudSync')}</div>
            <div
              className={styles.selfHostedText}
              onClick={() => handleSelectOption(StorageModeEnum.SelfHost)}
            >
              {t('sync.mode.useSelfHosted')}
            </div>
          </Flexbox>
          <Option
            description={t('sync.lobehubCloud.description')}
            icon={LobeHub}
            isSelected={selectedOption === 'cloud'}
            label={t('sync.lobehubCloud.title')}
            onClick={handleSelectOption}
            value={StorageModeEnum.Cloud}
          />
          {selectedOption === StorageModeEnum.SelfHost && (
            <Option
              description={t('sync.selfHosted.description')}
              icon={Server}
              isSelected={selectedOption === StorageModeEnum.SelfHost}
              label={t('sync.selfHosted.title')}
              onClick={handleSelectOption}
              value={StorageModeEnum.SelfHost}
            >
              {selectedOption === StorageModeEnum.SelfHost && (
                <>
                  <Input
                    autoFocus
                    className={styles.selfHostedInput}
                    onChange={(e) => {
                      const newUrl = e.target.value;
                      setSelfHostedUrl(newUrl);
                      setUrlError(validateUrl(newUrl));
                    }}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="https://your-lobechat.com"
                    status={urlError ? 'error' : undefined}
                    value={selfHostedUrl}
                  />
                  {urlError && <div className={styles.inputError}>{urlError}</div>}
                </>
              )}
            </Option>
          )}
        </Flexbox>
        <Flexbox>
          <div className={styles.groupTitle} style={{ marginBottom: 12 }}>
            {t('sync.mode.localStorage')}
          </div>
          <Option
            description={t('sync.local.description')}
            icon={ComputerIcon}
            isSelected={selectedOption === StorageModeEnum.Local}
            label={t('sync.local.title')}
            onClick={handleSelectOption}
            value={StorageModeEnum.Local}
          />
        </Flexbox>
      </Flexbox>

      <Button
        className={styles.continueButton}
        disabled={
          !selectedOption ||
          (selectedOption === StorageModeEnum.SelfHost && (!!urlError || !selfHostedUrl))
        }
        onClick={handleContinue}
        size="large"
        style={{ maxWidth: 400 }}
        type="primary"
      >
        {selectedOption === 'local' ? t('save', { ns: 'common' }) : t('sync.continue')}
      </Button>
    </Center>
  );
});

export default ConnectionMode;
