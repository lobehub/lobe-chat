import { Avatar, Form, Icon, Tooltip } from '@lobehub/ui';
import { Button, Skeleton, Switch, Tag } from 'antd';
import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { LucideBlocks, LucideStore } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import DevModal from 'src/features/PluginDevModal';

import { FORM_STYLE } from '@/const/layoutTokens';
import { pluginHelpers, usePluginStore } from '@/store/plugin';

import { useStore } from '../store';
import LocalPluginItem from './LocalPluginItem';

const useStyles = createStyles(({ css }) => ({
  avatar: css`
    .ant-skeleton-header {
      padding-right: 0;
    }
  `,
  label: css`
    li {
      height: 14px !important;
    }

    li + li {
      margin-block-start: 12px !important;
    }
  `,
}));

const MarketList = memo(() => {
  const { t } = useTranslation('setting');
  const { styles } = useStyles();

  const [showModal, setModal] = useState(false);

  // useEffect(() => {
  //   setModal(true);
  // }, []);

  const [plugins, hasPlugin, toggleAgentPlugin] = useStore((s) => [
    s.config.plugins || [],
    !!s.config.plugins,
    s.toggleAgentPlugin,
  ]);

  const [useFetchPluginList, fetchPluginManifest, saveToDevList, updateNewDevPlugin] =
    usePluginStore((s) => [
      s.useFetchPluginList,
      s.fetchPluginManifest,
      s.saveToCustomPluginList,
      s.updateNewDevPlugin,
    ]);
  const pluginManifestLoading = usePluginStore((s) => s.pluginManifestLoading, isEqual);
  const pluginList = usePluginStore((s) => s.pluginList, isEqual);
  const devPluginList = usePluginStore((s) => s.customPluginList, isEqual);

  useFetchPluginList();

  const loadingItem = {
    avatar: (
      <Skeleton
        active
        avatar={{ size: 40 }}
        className={styles.avatar}
        paragraph={false}
        title={false}
      />
    ),
    label: (
      <Skeleton
        active
        avatar={false}
        paragraph={{ className: styles.label, style: { marginBottom: 0 } }}
        style={{ width: 300 }}
        title={false}
      />
    ),
  };

  const loadingList = [loadingItem, loadingItem, loadingItem];

  const isEmpty = pluginList.length === 0;

  const list = pluginList.map(({ identifier, meta }) => ({
    avatar: <Avatar avatar={meta.avatar} />,
    children: (
      <Switch
        checked={
          // 如果在加载中，说明激活了
          pluginManifestLoading[identifier] || !hasPlugin ? false : plugins.includes(identifier)
        }
        loading={pluginManifestLoading[identifier]}
        onChange={(checked) => {
          toggleAgentPlugin(identifier);
          if (checked) {
            fetchPluginManifest(identifier);
          }
        }}
      />
    ),
    desc: pluginHelpers.getPluginDesc(meta),
    label: pluginHelpers.getPluginTitle(meta),
    minWidth: undefined,
    tag: identifier,
  }));

  const devList = devPluginList.map(({ identifier, meta }) => ({
    avatar: <Avatar avatar={pluginHelpers.getPluginAvatar(meta) || '🧩'} />,
    children: <LocalPluginItem id={identifier} />,
    desc: pluginHelpers.getPluginDesc(meta),
    label: (
      <Flexbox align={'center'} gap={8} horizontal>
        {pluginHelpers.getPluginTitle(meta)}
        <Tag bordered={false} color={'gold'}>
          {t('list.item.local.title', { ns: 'plugin' })}
        </Tag>
      </Flexbox>
    ),
    minWidth: undefined,
    tag: identifier,
  }));

  return (
    <>
      <DevModal
        onOpenChange={setModal}
        onSave={(devPlugin) => {
          // 先保存
          saveToDevList(devPlugin);
          // 再开启
          toggleAgentPlugin(devPlugin.identifier);
        }}
        onValueChange={updateNewDevPlugin}
        open={showModal}
      />
      <Form
        items={[
          {
            children: isEmpty ? loadingList : [...devList, ...list],
            extra: (
              <Tooltip title={t('settingPlugin.addTooltip')}>
                <Button
                  icon={<Icon icon={LucideBlocks} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    setModal(true);
                  }}
                  size={'small'}
                >
                  {t('settingPlugin.add')}
                </Button>
              </Tooltip>
            ),
            icon: LucideStore,
            title: t('settingPlugin.title'),
          },
        ]}
        {...FORM_STYLE}
      />{' '}
    </>
  );
});

export default MarketList;
