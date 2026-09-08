import { Flexbox, Icon } from '@lobehub/ui';
import { Button, Text } from '@lobehub/ui/base-ui';
import type { Edge, Node } from '@xyflow/react';
import { createStaticStyles, cssVar } from 'antd-style';
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleDashed,
  CircleDot,
  CircleHelp,
  CirclePause,
  CircleX,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { FlowGraphData } from './flowGraph';
import { flowStateColor } from './FlowNode';

const styles = createStaticStyles(({ css }) => ({
  item: css`
    width: 100%;
    height: auto;
    min-height: 44px;
    padding-block: 10px;
    padding-inline: 12px;

    text-align: start;
    white-space: normal;
  `,
  branch: css`
    justify-content: flex-start;

    width: 100%;
    height: auto;
    min-height: 44px;
    padding-block: 8px;
    padding-inline: 12px;

    color: ${cssVar.colorTextSecondary};
    text-align: start;
    white-space: normal;
  `,
  group: css`
    padding-inline-start: 8px;
    border-inline-start: 1px solid ${cssVar.colorBorderSecondary};
  `,
}));

/** A readable traversal of the same graph, including every branch and its target. */
export function FlowOutline({
  nodes,
  edges,
  onSelect,
}: {
  nodes: Node<FlowGraphData>[];
  edges: Edge[];
  onSelect: (id: string) => void;
}) {
  const { t } = useTranslation('verify');
  const renderNode = (node: Node<FlowGraphData>) => {
    const { data } = node;
    const group = node.type === 'flowGroup';
    const glyph =
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
      <Flexbox gap={4} key={node.id}>
        <Button
          aria-expanded={group ? !data.collapsed : undefined}
          className={styles.item}
          type={data.selected ? 'default' : 'text'}
          onClick={() => (group ? data.onToggle?.() : onSelect(node.id))}
        >
          <Flexbox horizontal align="center" gap={10} width="100%">
            {group && <Icon icon={data.collapsed ? ChevronRight : ChevronDown} size={14} />}
            <Icon
              aria-label={t(`flow.state.${data.state ?? 'pending'}`)}
              icon={glyph}
              size={18}
              style={{ color: flowStateColor(data.state), flex: 'none' }}
            />
            <Flexbox flex={1} gap={4} style={{ minWidth: 0 }}>
              <Text strong={group} style={{ overflowWrap: 'anywhere' }}>
                {data.title}
              </Text>
              {!group && (
                <Text fontSize={13} style={{ overflowWrap: 'anywhere' }} type="secondary">
                  {String(data.expected ?? '')}
                </Text>
              )}
            </Flexbox>
            {group ? (
              <Text fontSize={12} type="secondary">
                {data.passed}/{data.total}
              </Text>
            ) : (
              <Icon icon={ChevronRight} size={16} />
            )}
          </Flexbox>
        </Button>
        {group && !data.collapsed && (
          <Flexbox className={styles.group} gap={12}>
            {nodes.filter((child) => child.parentId === node.id).map(renderNode)}
          </Flexbox>
        )}
        {edges
          .filter((edge) => edge.source === node.id)
          .map((edge) => (
            <Button
              className={styles.branch}
              key={edge.id}
              type="text"
              onClick={() => onSelect(edge.id)}
            >
              <Flexbox horizontal align="center" gap={8}>
                <Icon icon={ArrowRight} size={14} style={{ flex: 'none' }} />
                <span>
                  {String(edge.label ?? '')} →{' '}
                  {nodes.find((target) => target.id === edge.target)?.data.title}
                </span>
              </Flexbox>
            </Button>
          ))}
      </Flexbox>
    );
  };
  return <Flexbox gap={24}>{nodes.filter((node) => !node.parentId).map(renderNode)}</Flexbox>;
}
