import { BuiltinRenderProps } from '@lobechat/types';
import { Flexbox } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { CheckCircle, FileText } from 'lucide-react';
import { memo } from 'react';

import type { UpdatePromptParams, UpdatePromptState } from '../../types';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    font-size: 13px;
  `,
  fileIcon: css`
    color: ${token.colorTextTertiary};
  `,
  promptCard: css`
    background: ${token.colorFillTertiary};
    border-left: 3px solid ${token.colorSuccess};
    margin-left: 12px;
    padding: 12px;
  `,
  promptContent: css`
    color: ${token.colorText};
    font-size: 13px;
    line-height: 1.6;
    margin-left: 20px;
    max-height: 200px;
    overflow: auto;
    white-space: pre-wrap;
    word-break: break-word;
    margin-inline: -12px;
    padding-inline: 12px;
  `,
  promptLabel: css`
    color: ${token.colorTextSecondary};
    font-size: 12px;
    font-weight: 500;
  `,
  statusRow: css`
    color: ${token.colorSuccess};
    margin-left: 9px;
    margin-bottom: 6px;
  `,
  statusText: css`
    font-weight: 500;
  `,
}));

const UpdatePrompt = memo<BuiltinRenderProps<UpdatePromptParams, UpdatePromptState>>(
  ({ pluginState }) => {
    const { newPrompt } = pluginState || {};
    const { styles } = useStyles();

    return (
      <Flexbox className={styles.container} gap={8}>
        <Flexbox align={'center'} className={styles.statusRow} gap={6} horizontal>
          <CheckCircle size={14} />
          <span className={styles.statusText}>
            {newPrompt ? 'System prompt updated' : 'System prompt cleared'}
          </span>
        </Flexbox>

        {newPrompt && (
          <Flexbox className={styles.promptCard} gap={8}>
            <Flexbox align={'center'} gap={6} horizontal>
              <FileText className={styles.fileIcon} size={14} />
              <span className={styles.promptLabel}>
                New prompt ({newPrompt.length} characters):
              </span>
            </Flexbox>
            <div className={styles.promptContent}>
              {newPrompt.length > 500 ? newPrompt.slice(0, 500) + '...' : newPrompt}
            </div>
          </Flexbox>
        )}
      </Flexbox>
    );
  },
);

export default UpdatePrompt;
