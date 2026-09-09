import { Position } from '@xyflow/react';

/** Keep ordinary forward-branch captions in the gutter beside their destination. */
export function getFlowEdgeLabelLayout({
  sourceX,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  lane,
  labelX,
  labelY,
}: {
  sourceX: number;
  targetX: number;
  targetY: number;
  sourcePosition: Position;
  targetPosition: Position;
  lane: number;
  labelX: number;
  labelY: number;
}) {
  const gap = targetX - sourceX;
  if (sourcePosition === Position.Right && targetPosition === Position.Left && gap > 16 && !lane)
    return {
      x: (sourceX + targetX) / 2,
      y: targetY,
      maxWidth: Math.min(180, gap - 16),
    };
  return { x: labelX, y: labelY, maxWidth: 180 };
}
