import { Avatar, Icon } from '@lobehub/ui';
import { Button, Input, Segmented } from 'antd';
import { createStyles } from 'antd-style';
import { KeySquare, SquareAsterisk } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';
import { shallow } from 'zustand/shallow';

import { useSessionStore } from '@/store/session';
import { useSettings } from '@/store/settings';

import OtpInput from '../OTPInput';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    background: ${token.colorBgContainer};
    border: 1px solid ${token.colorSplit};
    border-radius: 8px;
  `,
  desc: css`
    color: ${token.colorTextTertiary};
    text-align: center;
  `,
}));

const InvalidAccess = memo<{ id: string }>(({ id }) => {
  const { t } = useTranslation('error');
  const { styles, theme } = useStyles();
  const [mode, setMode] = useState('password');
  const [password, apiKey, setSettings] = useSettings(
    (s) => [s.settings.password, s.settings.OPENAI_API_KEY, s.setSettings],
    shallow,
  );
  const [resend, deleteMessage] = useSessionStore(
    (s) => [s.resendMessage, s.deleteMessage],
    shallow,
  );

  const content =
    mode === 'password'
      ? {
          avatar: '🗳',
          children: (
            <OtpInput
              onChange={(e) => {
                setSettings({ password: e });
              }}
              validationPattern={/[\dA-Za-z]/}
              value={password}
            />
          ),
          desc: t('unlock.password.description'),
          title: t('unlock.password.title'),
        }
      : {
          avatar: '🔑',
          children: (
            <Input
              onChange={(e) => {
                setSettings({ OPENAI_API_KEY: e.target.value });
              }}
              placeholder={'sk-*****************************************'}
              type={'block'}
              value={apiKey}
            />
          ),
          desc: t('unlock.apikey.description'),
          title: t('unlock.apikey.title'),
        };
  return (
    <Center className={styles.container} gap={24} padding={24}>
      <Segmented
        block
        onChange={(value) => setMode(value as string)}
        options={[
          { icon: <Icon icon={SquareAsterisk} />, label: '密码', value: 'password' },
          { icon: <Icon icon={KeySquare} />, label: 'OpenAI API Key', value: 'api' },
        ]}
        style={{ width: '100%' }}
        value={mode}
      />
      <Flexbox gap={24}>
        <Center gap={16} style={{ maxWidth: 300 }}>
          <Avatar avatar={content.avatar} background={theme.colorText} gap={12} size={80} />
          <Flexbox style={{ fontSize: 20 }}>{content.title}</Flexbox>
          <Flexbox className={styles.desc}>{content.desc}</Flexbox>
          {content.children}
        </Center>
        <Button
          onClick={() => {
            resend(id);
            deleteMessage(id);
          }}
          type={'primary'}
        >
          {t('unlock.confirm')}
        </Button>
      </Flexbox>
    </Center>
  );
});

export default InvalidAccess;
