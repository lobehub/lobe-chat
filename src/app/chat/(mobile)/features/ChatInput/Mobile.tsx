import { Icon, Input } from '@lobehub/ui';
import { Button, type InputRef } from 'antd';
import { Loader2, SendHorizonal } from 'lucide-react';
import { forwardRef, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import useControlledState from 'use-merge-value';

import ActionBar from '@/app/chat/features/ChatInput/ActionBar';
import SaveTopic from '@/app/chat/features/ChatInput/Topic';

import { useStyles } from './style.mobile';

export type ChatInputAreaMobile = {
  loading?: boolean;
  onChange?: (value: string) => void;
  onSend?: (value: string) => void;
  onStop?: () => void;
  value?: string;
};

const ChatInputArea = forwardRef<InputRef, ChatInputAreaMobile>(
  ({ onSend, loading, onChange, onStop, value }) => {
    const { t } = useTranslation('chat');
    const [currentValue, setCurrentValue] = useControlledState<string>('', {
      onChange: onChange,
      value,
    });
    const { cx, styles } = useStyles();
    const isChineseInput = useRef(false);

    const handleSend = useCallback(() => {
      if (loading) return;
      if (onSend) onSend(currentValue);
      setCurrentValue('');
    }, [currentValue]);

    return (
      <Flexbox className={cx(styles.container)} gap={12}>
        <ActionBar rightAreaStartRender={<SaveTopic />} />
        <Flexbox className={styles.inner} gap={8} horizontal>
          <Input
            className={cx(styles.input)}
            onBlur={(e) => {
              setCurrentValue(e.target.value);
            }}
            onChange={(e) => {
              setCurrentValue(e.target.value);
            }}
            onCompositionEnd={() => {
              isChineseInput.current = false;
            }}
            onCompositionStart={() => {
              isChineseInput.current = true;
            }}
            onPressEnter={(e) => {
              if (!loading && !e.shiftKey && !isChineseInput.current) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={t('sendPlaceholder')}
            type={'block'}
            value={currentValue}
          />
          <div>
            {loading ? (
              <Button icon={loading && <Icon icon={Loader2} spin />} onClick={onStop} />
            ) : (
              <Button icon={<Icon icon={SendHorizonal} />} onClick={handleSend} type={'primary'} />
            )}
          </div>
        </Flexbox>
      </Flexbox>
    );
  },
);

export default ChatInputArea;
