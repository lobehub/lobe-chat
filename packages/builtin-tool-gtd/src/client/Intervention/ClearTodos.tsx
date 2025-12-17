'use client';

import { BuiltinInterventionProps } from '@lobechat/types';
import { Radio, RadioChangeEvent } from 'antd';
import { createStyles } from 'antd-style';
import { Trash2 } from 'lucide-react';
import { memo, useCallback, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import type { ClearTodosParams } from '../../types';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    padding: 12px;
    border-radius: ${token.borderRadius}px;
    background: ${token.colorFillTertiary};
  `,
  dangerText: css`
    font-size: 13px;
    color: ${token.colorError};
  `,
  header: css`
    color: ${token.colorWarning};
  `,
  label: css`
    font-size: 13px;
    color: ${token.colorTextSecondary};
  `,
  normalText: css`
    font-size: 13px;
  `,
}));

/**
 * ClearTodos Intervention component
 * Allows users to choose between clearing completed items or all items
 */
const ClearTodosIntervention = memo<BuiltinInterventionProps<ClearTodosParams>>(
  ({ args, onArgsChange }) => {
    const { styles } = useStyles();
    const [mode, setMode] = useState<ClearTodosParams['mode']>(args?.mode || 'completed');

    const handleModeChange = useCallback(
      async (e: RadioChangeEvent) => {
        const newMode = e.target.value as ClearTodosParams['mode'];
        setMode(newMode);
        await onArgsChange?.({ mode: newMode });
      },
      [onArgsChange],
    );

    return (
      <Flexbox gap={12}>
        <Flexbox align="center" className={styles.header} gap={8} horizontal>
          <Trash2 size={16} />
          <span style={{ fontSize: 14, fontWeight: 500 }}>Clear Todo Items</span>
        </Flexbox>

        <Flexbox className={styles.container} gap={8}>
          <span className={styles.label}>Choose what to clear:</span>
          <Radio.Group onChange={handleModeChange} value={mode}>
            <Flexbox gap={8}>
              <Radio value="completed">
                <span className={styles.normalText}>Clear completed items only</span>
              </Radio>
              <Radio value="all">
                <span className={styles.dangerText}>Clear all items (including pending)</span>
              </Radio>
            </Flexbox>
          </Radio.Group>
        </Flexbox>
      </Flexbox>
    );
  },
);

ClearTodosIntervention.displayName = 'ClearTodosIntervention';

export default ClearTodosIntervention;
