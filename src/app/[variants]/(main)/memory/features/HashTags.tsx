import { Flexbox, Icon, Tag } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { HashIcon } from 'lucide-react';
import { memo } from 'react';

interface HashTagsProps {
  hashTags?: string[] | null;
}

const HashTags = memo<HashTagsProps>(({ hashTags }) => {
  const theme = useTheme();
  if (!hashTags || hashTags.length === 0) return;
  return (
    hashTags &&
    hashTags.length > 0 && (
      <Flexbox horizontal wrap="wrap">
        {hashTags.map((tag, index) => (
          <Tag
            icon={<Icon icon={HashIcon} />}
            key={index}
            style={{
              color: theme.colorTextDescription,
              gap: 2,
              marginRight: 12,
              paddingInline: 0,
            }}
            variant={'borderless'}
          >
            {tag}
          </Tag>
        ))}
      </Flexbox>
    )
  );
});

export default HashTags;
