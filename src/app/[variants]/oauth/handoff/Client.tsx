'use client';

import { Spin, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

const { Title, Paragraph } = Typography;

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    width: 100%;
    min-height: 100vh;
    padding-block: 40px;
    padding-inline: 24px;

    color: ${token.colorTextBase};

    background-color: ${token.colorBgLayout};
  `,
  content: css`
    max-width: 600px;
    text-align: center;
  `,
  message: css`
    margin-block-end: ${token.marginXL}px;
    color: ${token.colorTextSecondary};
  `,
  title: css`
    margin-block-end: ${token.marginLG}px;
  `,
}));

interface Status {
  desc: string;
  status: 'processing' | 'success';
  title: string;
}
const AuthHandoffPage = () => {
  const { styles } = useStyles();
  const { t } = useTranslation('oauth'); // Assuming 'oauth' namespace exists
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<Status>({
    desc: t('handoff.desc.processing'),
    status: 'processing',
    title: t('handoff.title.processing'),
  });

  const [isError, setIsError] = useState<boolean>(false);

  useEffect(() => {
    const targetUrl = searchParams.get('target');

    if (targetUrl) {
      try {
        const decodedTargetUrl = decodeURIComponent(targetUrl);
        console.log(`Attempting redirect to: ${decodedTargetUrl}`);

        window.location.href = decodedTargetUrl;

        const url = new URL(decodedTargetUrl);
        if (!url.pathname.startsWith('/oidc/auth')) {
          setStatus({
            desc: t('handoff.desc.success'),
            status: 'success',
            title: t('handoff.title.success'),
          });
        }
      } catch (error) {
        console.error('Error decoding or redirecting:', error);
        // setMessage(
        //   t('handoff.error', '无法自动打开桌面应用。请检查链接是否有效或尝试手动打开应用。'),
        // );
        setIsError(true);
      }
    } else {
      console.error('Missing target URL for handoff.');
      setIsError(true);
    }
  }, [searchParams]);

  return (
    <Center className={styles.container} gap={12}>
      {!isError && <Spin size="large" />}
      <Flexbox align="center" className={styles.content} gap={16}>
        <Title className={styles.title} level={3}>
          {status.title}
        </Title>
        <Paragraph className={styles.message}>{status.desc}</Paragraph>
      </Flexbox>
    </Center>
  );
};

export default AuthHandoffPage;
