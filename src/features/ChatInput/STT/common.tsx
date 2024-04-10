import { ActionIcon, Alert, Highlighter } from '@lobehub/ui';
import { Button, Dropdown } from 'antd';
import { createStyles } from 'antd-style';
import { Mic, MicOff } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { ChatMessageError } from '@/types/message';

const useStyles = createStyles(({ css, token }) => ({
  recording: css`
    width: 8px;
    height: 8px;
    background: ${token.colorError};
    border-radius: 50%;
  `,
}));

const CommonSTT = memo<{
  desc: string;
  error?: ChatMessageError;
  formattedTime: string;
  handleCloseError: () => void;
  handleRetry: () => void;
  handleTriggerStartStop: () => void;
  isLoading: boolean;
  isRecording: boolean;
  mobile?: boolean;
  time: number;
}>(
  ({
    mobile,
    isLoading,
    formattedTime,
    time,
    isRecording,
    error,
    handleRetry,
    handleTriggerStartStop,
    handleCloseError,
    desc,
  }) => {
    const { t } = useTranslation('chat');
    const { styles } = useStyles();

    return (
      <Dropdown
        dropdownRender={
          error
            ? () => (
                <Alert
                  action={
                    <Button onClick={handleRetry} size={'small'} type={'primary'}>
                      {t('retry', { ns: 'common' })}
                    </Button>
                  }
                  closable
                  extra={
                    error.body && (
                      <Highlighter copyButtonSize={'small'} language={'json'} type={'pure'}>
                        {JSON.stringify(error.body, null, 2)}
                      </Highlighter>
                    )
                  }
                  message={error.message}
                  onClose={handleCloseError}
                  style={{ alignItems: 'center' }}
                  type="error"
                />
              )
            : undefined
        }
        menu={{
          activeKey: 'time',
          items: [
            {
              key: 'time',
              label: (
                <Flexbox align={'center'} gap={8} horizontal>
                  <div className={styles.recording} />
                  {time > 0 ? formattedTime : t(isRecording ? 'stt.loading' : 'stt.prettifying')}
                </Flexbox>
              ),
            },
          ],
        }}
        open={!!error || isRecording || isLoading}
        placement={mobile ? 'topRight' : 'top'}
        trigger={['click']}
      >
        <ActionIcon
          active={isRecording}
          icon={isLoading ? MicOff : Mic}
          onClick={handleTriggerStartStop}
          placement={'bottom'}
          size={mobile ? { blockSize: 36, fontSize: 16 } : { fontSize: 22 }}
          style={{ flex: 'none' }}
          title={desc}
        />
      </Dropdown>
    );
  },
);

export default CommonSTT;
