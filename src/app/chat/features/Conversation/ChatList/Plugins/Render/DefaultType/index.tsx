import { Skeleton } from 'antd';
import { createStyles } from 'antd-style';
import dynamic from 'next/dynamic';
import { Suspense, memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useToolStore } from '@/store/tool';
import { pluginSelectors } from '@/store/tool/selectors';

import IFrameRender from './IFrameRender';

const SystemJsRender = dynamic(() => import('./SystemJsRender'), { ssr: false });

const useStyles = createStyles(
  ({ css, token }) => css`
    position: relative;

    overflow: hidden;
    display: block;

    width: 300px;
    height: 12px;

    border: 1px solid ${token.colorBorder};
    border-radius: 10px;

    &::after {
      content: '';

      position: absolute;
      top: 0;
      left: 0;

      box-sizing: border-box;
      width: 40%;
      height: 100%;

      background: ${token.colorPrimary};

      animation: animloader 2s linear infinite;
    }

    @keyframes animloader {
      0% {
        left: 0;
        transform: translateX(-100%);
      }

      100% {
        left: 100%;
        transform: translateX(0%);
      }
    }
  `,
);
const Loading = () => {
  const { t } = useTranslation('plugin');
  const { styles } = useStyles();

  return (
    <Flexbox align={'center'} gap={8} padding={16}>
      <span className={styles} />
      {t('loading.content')}
    </Flexbox>
  );
};

export interface PluginDefaultTypeProps {
  content: string;
  loading?: boolean;
  name?: string;
}

const PluginDefaultType = memo<PluginDefaultTypeProps>(({ content, name }) => {
  const manifest = useToolStore(pluginSelectors.getPluginManifestById(name || ''));
  let isJSON = true;
  try {
    JSON.parse(content);
  } catch {
    isJSON = false;
  }

  const contentObj = useMemo<object>(() => (isJSON ? JSON.parse(content) : content), [content]);

  if (!isJSON) {
    return (
      <Flexbox gap={8}>
        <Loading />
      </Flexbox>
    );
  }

  if (!manifest?.ui) return;

  const ui = manifest.ui;

  if (!ui.url) return;

  if (ui.mode === 'module')
    return (
      <Suspense fallback={<Skeleton active style={{ width: 400 }} />}>
        <SystemJsRender content={contentObj} name={name || 'unknown'} url={ui.url} />
      </Suspense>
    );

  return (
    <IFrameRender
      content={contentObj}
      height={ui.height}
      name={name || 'unknown'}
      url={ui.url}
      width={ui.width}
    />
  );
});

export default PluginDefaultType;
