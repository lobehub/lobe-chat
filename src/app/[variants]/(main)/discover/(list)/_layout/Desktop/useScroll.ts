import { throttle } from 'lodash-es';
import { useEffect, useRef } from 'react';

import { isOnServerSide } from '@/utils/env';

import { SCROLL_PARENT_ID } from '../../../features/const';

export const useScroll = (onScroll: (scroll: number, delta: number) => void) => {
  const lastScrollTop = useRef(0);

  useEffect(() => {
    if (isOnServerSide) return;

    const element = document.querySelector(`#${SCROLL_PARENT_ID}`);

    if (!element) return;

    const handleScroll = throttle(() => {
      const currentScroll = element.scrollTop;
      const delta = currentScroll - lastScrollTop.current;

      onScroll?.(currentScroll, delta);

      lastScrollTop.current = currentScroll;
    });

    element.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      element.removeEventListener('scroll', handleScroll);
    };
  }, []);
};
