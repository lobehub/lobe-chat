import { createStyles } from 'antd-style';
import { memo } from 'react';
import Lightbox from 'react-spring-lightbox';

import { filesSelectors, useFileStore } from '@/store/files';

const useStyles = createStyles(({ css, token }) => ({
  wrapper: css`
    background: ${token.colorBgMask};
    backdrop-filter: blur(4px);
  `,
}));

interface LightBoxProps {
  index: number;
  items: string[];
  onNext: () => void;
  onOpenChange: (open: boolean) => void;
  onPrev: () => void;
  open: boolean;
}

const LightBox = memo<LightBoxProps>(({ onOpenChange, open, items, index, onNext, onPrev }) => {
  const { styles } = useStyles();

  const list = useFileStore(filesSelectors.getImageDetailByList(items));
  return (
    <Lightbox
      className={styles.wrapper}
      currentIndex={index}
      images={list.map((i) => ({
        alt: i.name,
        loading: 'lazy',
        src: i.url,
      }))}
      isOpen={open}
      onClose={() => {
        onOpenChange(false);
      }}
      onNext={onNext}
      onPrev={onPrev}
    />
  );
});

export default LightBox;
