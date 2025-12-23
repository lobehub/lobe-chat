'use client';

import { BuiltinInterventionProps } from '@lobechat/types';
import { Flexbox, Input, TextArea } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { memo, useCallback, useRef, useState } from 'react';

import type { CreatePlanParams } from '../../types';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    padding: 12px;
    border-radius: ${token.borderRadius}px;
    background: ${token.colorFillQuaternary};
  `,
  label: css`
    margin-block-end: 4px;
    font-size: 12px;
    font-weight: 500;
    color: ${token.colorTextSecondary};
  `,
}));

const CreatePlanIntervention = memo<BuiltinInterventionProps<CreatePlanParams>>(
  ({ args, onArgsChange, registerBeforeApprove }) => {
    const { styles } = useStyles();

    const [goal, setGoal] = useState(args?.goal || '');
    const [description, setDescription] = useState(args?.description || '');
    const [context, setContext] = useState(args?.context || '');

    // Track pending changes
    const pendingChangesRef = useRef<CreatePlanParams | null>(null);

    // Save function
    const save = useCallback(async () => {
      if (pendingChangesRef.current) {
        await onArgsChange?.(pendingChangesRef.current);
        pendingChangesRef.current = null;
      }
    }, [onArgsChange]);

    // Register before approve callback
    registerBeforeApprove?.('createPlan', save);

    const handleGoalChange = useCallback(
      (value: string) => {
        setGoal(value);
        pendingChangesRef.current = {
          context: context || undefined,
          description,
          goal: value,
        };
      },
      [context, description],
    );

    const handleDescriptionChange = useCallback(
      (value: string) => {
        setDescription(value);
        pendingChangesRef.current = {
          context: context || undefined,
          description: value,
          goal,
        };
      },
      [context, goal],
    );

    const handleContextChange = useCallback(
      (value: string) => {
        setContext(value);
        pendingChangesRef.current = {
          context: value || undefined,
          description,
          goal,
        };
      },
      [description, goal],
    );

    return (
      <Flexbox className={styles.container} gap={12}>
        <Flexbox>
          <div className={styles.label}>Goal</div>
          <Input
            onChange={(e) => handleGoalChange(e.target.value)}
            placeholder="What do you want to achieve?"
            value={goal}
          />
        </Flexbox>
        <Flexbox>
          <div className={styles.label}>Description</div>
          <Input
            onChange={(e) => handleDescriptionChange(e.target.value)}
            placeholder="Brief summary of the plan"
            value={description}
          />
        </Flexbox>
        <Flexbox>
          <div className={styles.label}>Context (optional)</div>
          <TextArea
            autoSize={{ minRows: 10 }}
            onChange={(e) => handleContextChange(e.target.value)}
            placeholder="Background, constraints, considerations..."
            value={context}
          />
        </Flexbox>
      </Flexbox>
    );
  },
  isEqual,
);

CreatePlanIntervention.displayName = 'CreatePlanIntervention';

export default CreatePlanIntervention;
