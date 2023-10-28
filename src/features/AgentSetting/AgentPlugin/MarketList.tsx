import { Avatar, Form, Icon, Tooltip } from '@lobehub/ui';
import { Button, Skeleton, Space, Switch, Tag } from 'antd';
import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { LucideBlocks, LucideSettings, LucideStore, LucideTrash2 } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import DevModal from 'src/features/PluginDevModal';

import { FORM_STYLE } from '@/const/layoutTokens';
import { pluginHelpers, pluginSelectors, usePluginStore } from '@/store/plugin';

import { useStore } from '../store';
import LocalPluginItem from './LocalPluginItem';
import MarketSettingModal from './MarketSettingModal';

const useStyles = createStyles(({ css, prefixCls }) => ({
  avatar: css`
    .${prefixCls}-skeleton-header {
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
  const [showSettings, setShowSettings] = useState(false);

  const [userEnabledPlugins, hasPlugin, toggleAgentPlugin] = useStore((s) => [
    s.config.plugins || [],
    !!s.config.plugins,
    s.toggleAgentPlugin,
  ]);

  const [useFetchPluginList, fetchPluginManifest, saveToDevList, updateNewDevPlugin] =
    usePluginStore((s) => [
      s.useFetchPluginList,
      s.fetchPluginManifest,
      s.saveToCustomPluginList,
      s.updateNewCustomPlugin,
    ]);
  const pluginManifestLoading = usePluginStore((s) => s.pluginManifestLoading, isEqual);
  const pluginList = usePluginStore((s) => s.pluginList, isEqual);
  const customPluginList = usePluginStore((s) => s.customPluginList, isEqual);
  const totalList = usePluginStore(pluginSelectors.pluginList, isEqual);

  useFetchPluginList();

  const togglePlugin = async (pluginId: string, fetchManifest?: boolean) => {
    toggleAgentPlugin(pluginId);
    if (fetchManifest) {
      await fetchPluginManifest(pluginId);
    }
  };

  //  =========== Skeleton Loading =========== //
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

  //  =========== Plugin List =========== //

  const list = pluginList.map(({ identifier, meta }) => ({
    avatar: <Avatar avatar={meta.avatar} />,
    children: (
      <Switch
        checked={
          // 如果在加载中，说明激活了
          pluginManifestLoading[identifier] || !hasPlugin
            ? false
            : userEnabledPlugins.includes(identifier)
        }
        loading={pluginManifestLoading[identifier]}
        onChange={(checked) => {
          togglePlugin(identifier, checked);
        }}
      />
    ),
    desc: pluginHelpers.getPluginDesc(meta),
    label: pluginHelpers.getPluginTitle(meta),
    minWidth: undefined,
    tag: identifier,
  }));

  //  =========== Custom Plugin List =========== //

  const customList = customPluginList.map(({ identifier, meta }) => ({
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

  //  =========== Deprecated Plugin List =========== //

  // 基于 userEnabledPlugins 和完整的 totalList，检查出不在 totalList 中的插件
  const deprecatedList = userEnabledPlugins
    .filter((pluginId) => totalList.findIndex((p) => p.identifier === pluginId) < 0)
    .map((id) => ({
      avatar: <Avatar avatar={'♻️'} />,
      children: (
        <Switch
          checked={true}
          onChange={(checked) => {
            togglePlugin(id, checked);
          }}
        />
      ),
      label: (
        <Flexbox align={'center'} gap={8} horizontal>
          {id}
          <Tag bordered={false} color={'red'}>
            {t('list.item.deprecated.title', { ns: 'plugin' })}
          </Tag>
        </Flexbox>
      ),
      minWidth: undefined,
      tag: id,
    }));

  const hasDeprecated = deprecatedList.length > 0;

  return (
    <>
      <DevModal
        onOpenChange={setModal}
        onSave={async (devPlugin) => {
          // 先保存
          saveToDevList(devPlugin);
          // 再开启插件
          await togglePlugin(devPlugin.identifier, true);
        }}
        onValueChange={updateNewDevPlugin}
        open={showModal}
      />
      <MarketSettingModal onOpenChange={setShowSettings} open={showSettings} />
      <Form
        items={[
          {
            children: isEmpty ? loadingList : [...deprecatedList, ...customList, ...list],
            extra: (
              <Space.Compact style={{ width: 'auto' }}>
                <Button
                  icon={<Icon icon={LucideBlocks} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    setModal(true);
                  }}
                  size={'small'}
                >
                  {t('settingPlugin.addTooltip')}
                </Button>
                {hasDeprecated ? (
                  <Tooltip title={t('settingPlugin.clearDeprecated')}>
                    <Button
                      icon={<Icon icon={LucideTrash2} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        for (const i of deprecatedList) {
                          togglePlugin(i.tag as string, false);
                        }
                      }}
                      size={'small'}
                    />
                  </Tooltip>
                ) : null}
                <Tooltip title={t('settingPlugin.settings')}>
                  <Button
                    icon={<Icon icon={LucideSettings} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowSettings(true);
                    }}
                    size={'small'}
                  />
                </Tooltip>
              </Space.Compact>
            ),
            icon: LucideStore,
            title: t('settingPlugin.title'),
          },
        ]}
        {...FORM_STYLE}
      />
    </>
  );
});

export default MarketList;
