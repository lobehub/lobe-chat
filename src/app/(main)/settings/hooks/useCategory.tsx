import { Icon } from '@lobehub/ui';
import { Tag } from 'antd';
import { Bot, Brain, Cloudy, Info, Mic2, Settings2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import type { MenuProps } from '@/components/Menu';
import { isDeprecatedEdition } from '@/const/version';
import { SettingsTabs } from '@/store/global/initialState';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';

export const useCategory = () => {
  const { t } = useTranslation('setting');
  const { enableWebrtc, showLLM, enableSTT, hideDocs } =
    useServerConfigStore(featureFlagsSelectors);

  const cateItems: MenuProps['items'] = useMemo(
    () =>
      [
        {
          icon: <Icon icon={Settings2} />,
          key: SettingsTabs.Common,
          label: (
            <Link href={'/settings/common'} onClick={(e) => e.preventDefault()}>
              {t('tab.common')}
            </Link>
          ),
        },
        {
          icon: <Icon icon={Sparkles} />,
          key: SettingsTabs.SystemAgent,
          label: (
            <Link href={'/settings/system-agent'} onClick={(e) => e.preventDefault()}>
              {t('tab.system-agent')}
            </Link>
          ),
        },
        enableWebrtc && {
          icon: <Icon icon={Cloudy} />,
          key: SettingsTabs.Sync,
          label: (
            <Link href={'/settings/sync'} onClick={(e) => e.preventDefault()}>
              <Flexbox align={'center'} gap={8} horizontal>
                {t('tab.sync')}
                <Tag bordered={false} color={'warning'}>
                  {t('tab.experiment')}
                </Tag>
              </Flexbox>
            </Link>
          ),
        },
        showLLM &&
        // TODO: Remove /llm when v2.0
        (isDeprecatedEdition
          ? {
              icon: <Icon icon={Brain} />,
              key: SettingsTabs.LLM,
              label: (
                <Link href={'/settings/llm'} onClick={(e) => e.preventDefault()}>
                  {t('tab.llm')}
                </Link>
              ),
            }
          : {
              icon: <Icon icon={Brain} />,
              key: SettingsTabs.Provider,
              label: (
                <Link href={'/settings/provider'} onClick={(e) => e.preventDefault()}>
                  {t('tab.provider')}
                </Link>
              ),
            }),

        enableSTT && {
          icon: <Icon icon={Mic2} />,
          key: SettingsTabs.TTS,
          label: (
            <Link href={'/settings/tts'} onClick={(e) => e.preventDefault()}>
              {t('tab.tts')}
            </Link>
          ),
        },
        {
          icon: <Icon icon={Bot} />,
          key: SettingsTabs.Agent,
          label: (
            <Link href={'/settings/agent'} onClick={(e) => e.preventDefault()}>
              {t('tab.agent')}
            </Link>
          ),
        },
        !hideDocs && {
          icon: <Icon icon={Info} />,
          key: SettingsTabs.About,
          label: (
            <Link href={'/settings/about'} onClick={(e) => e.preventDefault()}>
              {t('tab.about')}
            </Link>
          ),
        },
      ].filter(Boolean) as MenuProps['items'],
    [t, enableWebrtc, showLLM],
  );

  return cateItems;
};
