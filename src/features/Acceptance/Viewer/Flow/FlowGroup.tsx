import { Flexbox, Icon } from '@lobehub/ui';
import { Button, Text } from '@lobehub/ui/base-ui';
import { Handle, Position } from '@xyflow/react';
import { createStaticStyles, cssVar } from 'antd-style';
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleDashed,
  CircleDot,
  CircleHelp,
  CirclePause,
  CircleX,
  Maximize2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { FlowGraphData } from './flowGraph';
import { flowStateColor } from './FlowNode';

const styles = createStaticStyles(({ css }) => ({
  group: css`
    overflow: hidden;

    width: 100%;
    height: 100%;
    border: 1px solid ${cssVar.colorBorderSecondary};
    border-radius: ${cssVar.borderRadiusLG};

    background: ${cssVar.colorBgContainer};
  `,
  header: css`
    height: 36px;
    padding-inline: 16px;
    background: transparent;
  `,
  handle: css`
    width: 1px;
    min-width: 0;
    height: 1px;
    min-height: 0;
    border: 0;

    opacity: 0;
  `,
}));

export function FlowGroup({ data }: { data: FlowGraphData }) {
  const { t } = useTranslation('verify');
  const statusIcon =
    data.state === 'passed'
      ? CheckCircle2
      : data.state === 'failed'
        ? CircleX
        : data.state === 'blocked'
          ? CirclePause
          : data.state === 'uncertain'
            ? CircleHelp
            : data.state === 'partial'
              ? CircleDot
              : CircleDashed;
  return (
    <>
      <Handle className={styles.handle} id="in" position={Position.Left} type="target" />
      <div className={styles.group}>
        <Flexbox horizontal align="center" className={styles.header} gap={8}>
          {data.onToggle && (
            <Button
              className="nodrag nopan"
              size="small"
              type="text"
              aria-label={t(data.collapsed ? 'flow.expandGroup' : 'flow.collapseGroup', {
                title: data.title,
              })}
              onClick={(e) => {
                e.stopPropagation();
                data.onToggle?.();
              }}
            >
              <Icon icon={data.collapsed ? ChevronRight : ChevronDown} size={16} />
            </Button>
          )}
          <Icon icon={statusIcon} size={18} style={{ color: flowStateColor(data.state) }} />
          <Text ellipsis fontSize={13} style={{ flex: 1 }}>
            {data.title}
          </Text>
          <Text fontSize={12} type="secondary">
            {`${data.passed}/${data.total}`}
          </Text>
          {Boolean(data.reviewed) && (
            <Text fontSize={12} type="secondary">
              {t('flow.groupReviewed', { count: data.reviewed })}
            </Text>
          )}
          {data.onEnter && (
            <Button
              aria-label={t('flow.enterGroup', { title: data.title })}
              className="nodrag nopan"
              size="small"
              type="text"
              onClick={(e) => {
                e.stopPropagation();
                data.onEnter?.();
              }}
            >
              <Icon icon={Maximize2} size={14} />
            </Button>
          )}
        </Flexbox>
        {data.collapsed && (
          <Flexbox style={{ padding: '10px 16px' }}>
            <Text fontSize={12} type="secondary">
              {t(`flow.state.${data.state ?? 'pending'}`)}
            </Text>
          </Flexbox>
        )}
      </div>
      <Handle className={styles.handle} id="stack-in" position={Position.Top} type="target" />
      <Handle className={styles.handle} id="stack-out" position={Position.Bottom} type="source" />
      <Handle className={styles.handle} id="out" position={Position.Right} type="source" />
      <Handle
        className={styles.handle}
        id="return-in"
        position={Position.Bottom}
        style={{ left: '35%' }}
        type="target"
      />
      <Handle
        className={styles.handle}
        id="return-out"
        position={Position.Bottom}
        style={{ left: '65%' }}
        type="source"
      />
    </>
  );
}
