'use client';

import { BuiltinInterventionProps } from '@lobechat/types';
import { Flexbox } from '@lobehub/ui';
import { Input, Select } from 'antd';
import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { memo, useCallback, useEffect, useRef, useState } from 'react';

import { CreateDocumentArgs, DocumentType } from '../../../types';

const { TextArea } = Input;

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    padding: 16px;
    border-radius: ${token.borderRadius}px;
    background: ${token.colorFillQuaternary};
  `,
  input: css`
    font-size: 14px;
  `,
  label: css`
    min-width: 60px;
    font-size: 13px;
    color: ${token.colorTextSecondary};
  `,
  row: css`
    align-items: flex-start;
  `,
  textArea: css`
    font-family: ${token.fontFamilyCode};
    font-size: 13px;
    line-height: 1.6;
  `,
}));

const typeOptions = [
  { label: 'Markdown', value: 'markdown' },
  { label: 'Note', value: 'note' },
  { label: 'Report', value: 'report' },
  { label: 'Article', value: 'article' },
];

const CreateDocumentIntervention = memo<BuiltinInterventionProps<CreateDocumentArgs>>(
  ({ args, onArgsChange, registerBeforeApprove }) => {
    const { styles } = useStyles();

    const [title, setTitle] = useState(args?.title || '');
    const [content, setContent] = useState(args?.content || '');
    const [type, setType] = useState<DocumentType>(args?.type || 'markdown');

    // Track if there are pending changes
    const pendingChangesRef = useRef(false);
    const latestValuesRef = useRef({ content, title, type });

    // Update latest values ref when state changes
    useEffect(() => {
      latestValuesRef.current = { content, title, type };
    }, [title, content, type]);

    // Register flush callback
    useEffect(() => {
      if (!registerBeforeApprove) return;

      const cleanup = registerBeforeApprove('create-document', async () => {
        if (pendingChangesRef.current) {
          await onArgsChange?.(latestValuesRef.current);
          pendingChangesRef.current = false;
        }
      });

      return cleanup;
    }, [registerBeforeApprove, onArgsChange]);

    const handleChange = useCallback(
      (field: 'title' | 'content' | 'type', value: string) => {
        switch (field) {
          case 'title':
            setTitle(value);
            break;
          case 'content':
            setContent(value);
            break;
          case 'type':
            setType(value as DocumentType);
            break;
        }
        pendingChangesRef.current = true;
      },
      [],
    );

    return (
      <Flexbox className={styles.container} gap={12}>
        <Flexbox className={styles.row} gap={8} horizontal>
          <span className={styles.label}>Title</span>
          <Input
            className={styles.input}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Document title"
            value={title}
          />
        </Flexbox>

        <Flexbox className={styles.row} gap={8} horizontal>
          <span className={styles.label}>Type</span>
          <Select
            onChange={(value) => handleChange('type', value)}
            options={typeOptions}
            style={{ width: 120 }}
            value={type}
          />
        </Flexbox>

        <Flexbox className={styles.row} gap={8} horizontal>
          <span className={styles.label}>Content</span>
          <TextArea
            autoSize={{ maxRows: 20, minRows: 6 }}
            className={styles.textArea}
            onChange={(e) => handleChange('content', e.target.value)}
            placeholder="Document content in Markdown format..."
            value={content}
          />
        </Flexbox>
      </Flexbox>
    );
  },
  isEqual,
);

CreateDocumentIntervention.displayName = 'CreateDocumentIntervention';

export default CreateDocumentIntervention;
