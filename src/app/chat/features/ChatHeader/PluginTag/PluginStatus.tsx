import { ActionIcon } from '@lobehub/ui';
import { Badge, Button, Tag } from 'antd';
import { LucideRotateCw, LucideTrash2, RotateCwIcon } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import ManifestPreviewer from '@/components/ManifestPreviewer';
import { useSessionStore } from '@/store/session';
import { useToolStore } from '@/store/tool';
import { customPluginSelectors, pluginSelectors } from '@/store/tool/selectors';

interface PluginStatusProps {
  deprecated?: boolean;
  id: string;
  title?: string;
}
const PluginStatus = memo<PluginStatusProps>(({ title, id, deprecated }) => {
  const { t } = useTranslation('common');
  const [status, isCustom, reinstallCustomPlugin] = useToolStore((s) => [
    pluginSelectors.getPluginManifestLoadingStatus(id)(s),
    customPluginSelectors.isCustomPlugin(id)(s),
    s.reinstallCustomPlugin,
  ]);

  const manifest = useToolStore(pluginSelectors.getPluginManifestById(id));

  const removePlugin = useSessionStore((s) => s.removePlugin);

  const renderStatus = useMemo(() => {
    switch (status) {
      case 'loading': {
        return <Badge color={'blue'} status={'processing'} />;
      }
      case 'error': {
        return (
          <ActionIcon
            icon={LucideRotateCw}
            onClick={() => {
              reinstallCustomPlugin(id);
            }}
            size={'small'}
            title={t('retry')}
          />
        );
      }
      case 'success': {
        return <Badge status={status} />;
      }
    }
  }, [status]);

  const tag =
    // 废弃标签
    deprecated ? (
      <Tag bordered={false} color={'red'} style={{ marginRight: 0 }}>
        {t('list.item.deprecated.title', { ns: 'plugin' })}
      </Tag>
    ) : // 自定义标签
    isCustom ? (
      <Tag bordered={false} color={'gold'}>
        {t('list.item.local.title', { ns: 'plugin' })}
      </Tag>
    ) : null;

  return (
    <Flexbox gap={12} horizontal justify={'space-between'}>
      <Flexbox align={'center'} gap={8} horizontal>
        {title || id}
        {tag}
      </Flexbox>

      {deprecated ? (
        <ActionIcon
          icon={LucideTrash2}
          onClick={(e) => {
            e.stopPropagation();
            removePlugin(id);
          }}
          size={'small'}
          title={t('plugin.clearDeprecated', { ns: 'setting' })}
        />
      ) : (
        <Flexbox align={'center'} horizontal>
          {isCustom ? (
            <ActionIcon
              icon={RotateCwIcon}
              onClick={(e) => {
                e.stopPropagation();
                reinstallCustomPlugin(id);
              }}
              size={'small'}
              title={t('dev.meta.manifest.refresh', { ns: 'plugin' })}
            />
          ) : null}
          <ManifestPreviewer manifest={manifest || {}} trigger={'hover'}>
            <Button icon={renderStatus} size={'small'} type={'text'} />
          </ManifestPreviewer>
        </Flexbox>
      )}
    </Flexbox>
  );
});

export default PluginStatus;
