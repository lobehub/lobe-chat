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

export const Anthropic = forwardRef<SVGSVGElement, IconProps>(
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
        <path d="m13.8269 3.5206 6.57012 16.479H24l-6.57013-16.479H13.8269ZM6.20464 13.4786l2.2481-5.79118 2.24808 5.79119H6.20464Zm.36447-9.958L0 19.9996h3.67305l1.3435-3.4606h6.8726l1.34326 3.4606h3.67305l-6.5691-16.479H6.5691Z" />
      </svg>
    );
  },
);

export default Anthropic;
