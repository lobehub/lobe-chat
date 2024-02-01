import { ComponentPropsWithoutRef, forwardRef } from 'react';

type IconProps = ComponentPropsWithoutRef<'svg'> & {
  /**
   * Hex color or color name or "default" to use the default hex for each icon
   */
  color?: string;
  /**
   * The size of the Icon.
   */
  size?: string | number;
  /**
   * The title provides an accessible short text description to the SVG
   */
  title?: string;
};

export const GoogleDeepMind = forwardRef<SVGSVGElement, IconProps>(
  ({ size = 24, color = 'currentColor', ...res }, ref) => {
    return (
      <svg
        fill={color}
        height={size}
        ref={ref}
        viewBox="0 0 24 24"
        width={size}
        xmlns="http://www.w3.org/2000/svg"
        {...res}
      >
        <path d="M4.28732 8.37226C3.96008 4.2371 7.01907 0 12.13635 0c1.69548 0 3.48108.43154 4.97975 1.14286C21.18526 3.06343 24 7.20332 24 11.99763c0 4.43153-2.4045 8.3035-5.98755 10.38056 1.72868-1.69532 2.75309-4.12804 2.5373-6.82395-.34858-4.40783-4.50549-7.99526-8.27586-7.99526-3.50717 0-4.88015 3.06106-4.54106 5.14049.12805.78008.46478 1.4914.95327 2.07231-.63314-.33906-1.24494-.77534-1.8093-1.29934-1.52002-1.41553-2.44008-3.22703-2.58948-5.10018Z" />
        <path d="M19.71268 15.62774C20.03992 19.7629 16.98093 24 11.86365 24c-1.69548 0-3.48108-.43154-4.97975-1.14286C2.81474 20.93657 0 16.79668 0 12.00237c0-4.43153 2.4045-8.3035 5.98755-10.38056-1.72868 1.69532-2.75309 4.12804-2.5373 6.82395.34858 4.40783 4.50549 7.99526 8.27586 7.99526 3.50717 0 4.88015-3.06106 4.54106-5.14049-.12805-.78008-.46478-1.4914-.9509-2.07231.63314.33906 1.24494.77534 1.80931 1.29934 1.52 1.41553 2.44008 3.2294 2.5871 5.10018Z" />
      </svg>
    );
  },
);

export default GoogleDeepMind;
