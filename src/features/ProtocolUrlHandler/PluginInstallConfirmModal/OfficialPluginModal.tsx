'use client';

import { Block } from '@lobehub/ui';
import { App, Skeleton, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { LobeToolCustomPlugin } from '@/types/tool/plugin';

import { BaseContentProps, McpInstallRequest, ModalConfig } from './types';

const { Text } = Typography;

const useStyles = createStyles(({ css, token }) => ({
  loadingContainer: css`
    padding-block: ${token.paddingLG}px;
    padding-inline: 0;
    text-align: center;
  `,

  metaInfo: css`
    margin-block-end: ${token.marginXS}px;
    color: ${token.colorTextSecondary};
  `,

  officialBadge: css`
    display: inline-flex;
    gap: ${token.marginXXS}px;
    align-items: center;

    margin-block-end: ${token.marginSM}px;
    padding-block: ${token.paddingXXS}px;
    padding-inline: ${token.paddingXS}px;
    border-radius: ${token.borderRadiusSM}px;

    font-size: ${token.fontSizeSM}px;
    font-weight: ${token.fontWeightStrong};
    color: white;

    background: linear-gradient(135deg, #1890ff, #722ed1);
  `,

  pluginInfo: css`
    margin-block-end: ${token.marginLG}px;
    padding: ${token.paddingSM}px;
    border-radius: ${token.borderRadius}px;
    background: ${token.colorFillSecondary};
  `,

  tag: css`
    padding-block: ${token.paddingXXS}px;
    padding-inline: ${token.paddingXS}px;
    border-radius: ${token.borderRadiusSM}px;

    font-size: ${token.fontSizeSM}px;
    color: ${token.colorPrimary};

    background: ${token.colorPrimaryBg};
  `,

  tags: css`
    display: flex;
    flex-wrap: wrap;
    gap: ${token.marginXS}px;
    margin-block-start: ${token.marginXS}px;
  `,
}));

interface OfficialPluginContentProps {
  installRequest: McpInstallRequest;
  loading?: boolean;
  manifest?: LobeToolCustomPlugin;
}

const OfficialPluginContent = memo<OfficialPluginContentProps>(({ manifest, loading }) => {
  const { t } = useTranslation(['plugin', 'common']);
  const { styles } = useStyles();

  // 如果正在加载，显示骨架屏
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Skeleton active paragraph={{ rows: 3 }} />
        <Text type="secondary">{t('protocolInstall.official.loadingMessage')}</Text>
      </div>
    );
  }

  // 如果加载失败，显示错误信息
  if (!manifest) {
    return <Text type="danger">{t('protocolInstall.messages.manifestError')}</Text>;
  }

  return (
    <Flexbox gap={16}>
      <div className={styles.officialBadge}>🏆 {t('protocolInstall.official.badge')}</div>

      {/*<Flexbox gap={8}>*/}
      {/*  <Title level={4} style={{ margin: 0 }}>*/}
      {/*    {pluginManifest.meta.title}*/}
      {/*  </Title>*/}

      {/*  <Flexbox gap={4}>*/}
      {/*    <Text className={styles.metaInfo}>*/}
      {/*      {t('protocolInstall.meta.version')}: {pluginManifest.version}*/}
      {/*    </Text>*/}
      {/*    <Text className={styles.metaInfo}>*/}
      {/*      {t('protocolInstall.meta.identifier')}: {pluginManifest.identifier}*/}
      {/*    </Text>*/}
      {/*  </Flexbox>*/}

      {/*  <Paragraph style={{ margin: 0 }}>{pluginManifest.meta.description}</Paragraph>*/}

      {/*  {pluginManifest.meta.tags && pluginManifest.meta.tags.length > 0 && (*/}
      {/*    <div className={styles.tags}>*/}
      {/*      {pluginManifest.meta.tags.map((tag, index) => (*/}
      {/*        <span className={styles.tag} key={index}>*/}
      {/*          {tag}*/}
      {/*        </span>*/}
      {/*      ))}*/}
      {/*    </div>*/}
      {/*  )}*/}
      {/*</Flexbox>*/}

      <Block className={styles.pluginInfo}>
        <Text type="secondary">{t('protocolInstall.official.description')}</Text>
      </Block>
    </Flexbox>
  );
});

type OfficialPluginModalProps = BaseContentProps;

const OfficialPluginModal = memo<OfficialPluginModalProps>(({ installRequest }) => {
  const { message } = App.useApp();
  const { t } = useTranslation(['plugin', 'common']);

  // const [pluginManifest, setPluginManifest] = useState<LobeToolCustomPlugin | null>(null);
  const [manifestLoading, setManifestLoading] = useState(true);

  // 获取官方插件的 manifest
  useEffect(() => {
    const fetchManifest = async () => {
      if (!installRequest.pluginId) return;

      setManifestLoading(true);
      try {
        // 使用插件助手获取官方插件详情
        // const manifest = await pluginHelpers.getPluginManifest(installRequest.pluginId);
        // setPluginManifest(manifest);
      } catch (error) {
        console.error('Failed to fetch plugin manifest:', error);
        message.error(t('protocolInstall.messages.manifestError'));
      } finally {
        setManifestLoading(false);
      }
    };

    fetchManifest();
  }, [installRequest.pluginId, message, t]);

  return (
    <OfficialPluginContent
      installRequest={installRequest}
      loading={manifestLoading}
      // manifest={pluginManifest}
    />
  );
});

// 导出配置信息
export const getOfficialModalConfig = (t: any): ModalConfig => ({
  okText: t('protocolInstall.actions.install'),
  title: t('protocolInstall.official.title'),
});

OfficialPluginModal.displayName = 'OfficialPluginModal';

export default OfficialPluginModal;
