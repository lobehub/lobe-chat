import { memo, useState } from 'react';
import Lightbox from 'react-spring-lightbox';

import { filesSelectors, useFileStore } from '@/store/files';

const Light = memo(() => {
  const list = useFileStore(filesSelectors.imageList);
  console.log(list);
  const [currentImageIndex, setCurrentIndex] = useState(0);

  const gotoPrevious = () => currentImageIndex > 0 && setCurrentIndex(currentImageIndex - 1);

  const gotoNext = () =>
    currentImageIndex + 1 < list.length && setCurrentIndex(currentImageIndex + 1);

  return (
    <Lightbox
      currentIndex={currentImageIndex}
      images={list.map((i) => ({
        alt: i.name,
        src: i.url,
      }))}
      isOpen={true}
      onNext={gotoNext}
      onPrev={gotoPrevious}
      /* Add your own UI */
      // renderHeader={() => (<CustomHeader />)}
      // renderFooter={() => (<CustomFooter />)}
      // renderPrevButton={() => (<CustomLeftArrowButton />)}
      // renderNextButton={() => (<CustomRightArrowButton />)}
      // renderImageOverlay={() => (<ImageOverlayComponent >)}

      /* Add styling */
      // className="cool-class"
      // style={{ background: "grey" }}

      /* Handle closing */
      // onClose={handleClose}

      /* Use single or double click to zoom */
      singleClickToZoom

      /* react-spring config for open/close animation */
      // pageTransitionConfig={{
      //   from: { transform: "scale(0.75)", opacity: 0 },
      //   enter: { transform: "scale(1)", opacity: 1 },
      //   leave: { transform: "scale(0.75)", opacity: 0 },
      //   config: { mass: 1, tension: 320, friction: 32 }
      // }}
    />
  );
});

export default Light;
