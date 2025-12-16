import { ChatContextContent } from '@lobechat/types';
import { Tag, Tooltip } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { TextIcon } from 'lucide-react';
import { memo, useMemo } from 'react';

import { useFileStore } from '@/store/file';

const useStyles = createStyles(({ css }) => ({
  name: css`
    overflow: hidden;
    flex: 1;

    min-width: 0;

    text-overflow: ellipsis;
    white-space: nowrap;
  `,
}));

const getPreviewText = (content?: string, fallback?: string) => {
  const source = content || fallback || '';
  if (!source) return 'Text selection';

  const plain = source
    .replaceAll(/<[^>]*>/g, ' ')
    .replaceAll(/\s+/g, ' ')
    .trim();
  if (!plain) return 'Text selection';

  return plain.length > 120 ? `${plain.slice(0, 117)}...` : plain;
};

const SelectionItem = memo<ChatContextContent>(({ content, preview, title, id }) => {
  const { styles } = useStyles();
  const [removeSelection] = useFileStore((s) => [s.removeChatContextSelection]);

  const displayText = useMemo(
    () => title || preview || getPreviewText(content, preview),
    [content, preview, title],
  );

  return (
    <Tag closable icon={<TextIcon size={16} />} onClose={() => removeSelection(id)} size={'large'}>
      <Tooltip title={displayText}>
        <span className={styles.name}>{displayText}</span>
      </Tooltip>
    </Tag>
  );
});

SelectionItem.displayName = 'SelectionItem';

export default SelectionItem;
