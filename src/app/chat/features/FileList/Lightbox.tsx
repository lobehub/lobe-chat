import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
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
  onNext: () => void;
  onOpenChange: (open: boolean) => void;
  onPrev: () => void;
  open: boolean;
}

const LightBox = memo<LightBoxProps>(({ onOpenChange, open, index, onNext, onPrev }) => {
  const list = useFileStore(filesSelectors.imageList, isEqual);
  const imgs = useFileStore(filesSelectors.imageUrlOrBase64List);
  console.log(imgs);

  const { styles } = useStyles();

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
