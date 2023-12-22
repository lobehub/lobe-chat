'use client';

import { FC, ReactNode, Suspense } from 'react';
import { useTranslation } from 'react-i18next';

import FullscreenLoading from '@/components/FullscreenLoading';
import { useIsMobile } from '@/hooks/useIsMobile';

interface ResponsiveIndexProps {
  /**
   * 针对移动端设计的会话页面首页,如果是移动端,则渲染这个组件
   */
  Mobile: FC;
  children: ReactNode;
}

/**
 * 响应式首页,根据设备类型渲染不同首页界面
 * @param children
 * @param Mobile
 * @constructor
 */
const ResponsiveIndex = ({ children, Mobile }: ResponsiveIndexProps) => {
  const { t } = useTranslation();
  const mobile = useIsMobile();

  return mobile ? (
    /*
    这里使用了 React 的 Suspense 组件，它允许你的组件在渲染之前等待某些条件满足，并显示一个备用内容（指定在 fallback 属性中）。

    fallback 属性接受任何在组件等待时应该渲染的 React 元素。

    在这个例子中，如果 <Mobile /> 组件内部有任何懒加载组件（使用 React.lazy），那么在组件加载过程中，会显示 <FullscreenLoading> 组件，其中 title 属性的值通过 t 函数进行国际化处理，
     */
    <Suspense fallback={<FullscreenLoading title={t('layoutInitializing', { ns: 'common' })} />}>
      <Mobile />
    </Suspense>
  ) : (
    children
  );
};

export default ResponsiveIndex;
