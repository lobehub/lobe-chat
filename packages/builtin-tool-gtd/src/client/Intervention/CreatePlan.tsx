'use client';

import { BuiltinInterventionProps } from '@lobechat/types';
import { Flexbox, Input, Text, TextArea } from '@lobehub/ui';
import isEqual from 'fast-deep-equal';
import { memo, useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { CreatePlanParams } from '../../types';

const CreatePlanIntervention = memo<BuiltinInterventionProps<CreatePlanParams>>(
  ({ args, onArgsChange, registerBeforeApprove }) => {
    const { t } = useTranslation('tool');

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
      <Flexbox gap={12}>
        <Flexbox gap={8}>
          <Text>{t('lobe-gtd.createPlan.goal.label')}</Text>
          <Input
            onChange={(e) => handleGoalChange(e.target.value)}
            placeholder={t('lobe-gtd.createPlan.goal.placeholder')}
            value={goal}
          />
        </Flexbox>
        <Flexbox gap={8}>
          <Text>{t('lobe-gtd.createPlan.description.label')}</Text>
          <Input
            onChange={(e) => handleDescriptionChange(e.target.value)}
            placeholder={t('lobe-gtd.createPlan.description.placeholder')}
            value={description}
          />
        </Flexbox>
        <Flexbox gap={8}>
          <Text>{t('lobe-gtd.createPlan.context.label')}</Text>
          <TextArea
            autoSize={{ minRows: 10 }}
            onChange={(e) => handleContextChange(e.target.value)}
            placeholder={t('lobe-gtd.createPlan.context.placeholder')}
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
