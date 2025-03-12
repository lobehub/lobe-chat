import { App } from 'antd';
import { ModalFuncProps } from 'antd/es/modal/interface';
import { MutableRefObject, ReactNode, RefObject, useRef } from 'react';

import { closeIcon, useStyles } from './style';

interface CreateModalProps extends ModalFuncProps {
  content: ReactNode;
}

interface ModalInstance {
  destroy: (...args: any[]) => void;
}

type PropsFunc<T = undefined> = (
  instance: MutableRefObject<ModalInstance | undefined>,
  props?: T,
) => CreateModalProps;

const createModal = <T>(params: CreateModalProps | PropsFunc<T>) => {
  const useModal = () => {
    const { styles } = useStyles();
    const { modal } = App.useApp();
    const instanceRef = useRef<ModalInstance>(null);

    const open = (outProps?: T) => {
      const props =
        typeof params === 'function'
          ? params(instanceRef as RefObject<ModalInstance>, outProps)
          : params;

      instanceRef.current = modal.confirm({
        className: styles.content,
        closable: true,
        closeIcon,
        footer: false,
        icon: null,
        wrapClassName: styles.wrap,
        ...props,
      });
    };

    return { open };
  };

  return useModal;
};

export { createModal };
