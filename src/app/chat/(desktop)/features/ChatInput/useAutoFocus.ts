import { TextAreaRef } from 'antd/es/input/TextArea';
import { RefObject, useEffect } from 'react';

export const useAutoFocus = (inputRef: RefObject<TextAreaRef>) => {
  useEffect(() => {
    let isInputOrMarkdown = false;

    const onMousedown = (e: MouseEvent) => {
      isInputOrMarkdown = false;
      const element = document.elementFromPoint(e.clientX, e.clientY);
      if (!element) return;
      let currentElement: Element | null = element;
      // 因为点击 Markdown 元素时，element 会是 article 标签的子元素
      // Debug 信息时，element 会是 pre 标签
      // 所以向上查找全局点击对象是否是 Markdown 或者 Input 或者 Debug 元素
      while (currentElement && !isInputOrMarkdown) {
        isInputOrMarkdown = ['TEXTAREA', 'INPUT', 'ARTICLE', 'PRE'].includes(
          currentElement.tagName,
        );
        currentElement = currentElement.parentElement;
      }
    };

    const onMouseup = () => {
      // 因为有时候要复制 Markdown 里生成的内容，或者点击别的 Input
      // 所以全局点击元素不是 Markdown 或者 Input 元素的话就聚焦
      if (!isInputOrMarkdown) {
        inputRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', onMousedown);
    document.addEventListener('mouseup', onMouseup);
    return () => {
      document.removeEventListener('mousedown', onMousedown);
      document.removeEventListener('mouseup', onMouseup);
    };
  }, []);
};
