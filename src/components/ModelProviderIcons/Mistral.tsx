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

export const Mistral = forwardRef<SVGSVGElement, IconProps>(({ size = 24, ...res }, ref) => {
  return (
    <svg
      height={size}
      ref={ref}
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      {...res}
    >
      <g fill="none" fillRule="nonzero">
        <path d="M17.45455 1h4.36364v4.4h-4.36364z" fill="#000" />
        <path d="M19.63636 1H24v4.4h-4.36364z" fill="#F7D046" />
        <path d="M0 1h4.36364v4.4H0zM0 5.4h4.36364v4.4H0zM0 9.8h4.36364v4.4H0z" fill="#000" />
        <path d="M0 14.2h4.36364v4.4H0zM0 18.6h4.36364V23H0z" fill="#000" />
        <path d="M2.18182 1h4.36364v4.4H2.18182z" fill="#F7D046" />
        <path d="M19.63636 5.4H24v4.4h-4.36364zM2.18182 5.4h4.36364v4.4H2.18182z" fill="#F2A73B" />
        <path d="M13.09091 5.4h4.36364v4.4h-4.36364z" fill="#000" />
        <path
          d="M15.27273 5.4h4.36364v4.4h-4.36364zM6.54545 5.4h4.36364v4.4H6.54545z"
          fill="#F2A73B"
        />
        <path d="M10.90909 9.8h4.36364v4.4h-4.36364z" fill="#EE792F" />
        <path
          d="M15.27273 9.8h4.36364v4.4h-4.36364zM6.54545 9.8h4.36364v4.4H6.54545z"
          fill="#EE792F"
        />
        <path d="M8.72727 14.2h4.36364v4.4H8.72727z" fill="#000" />
        <path d="M10.90909 14.2h4.36364v4.4h-4.36364z" fill="#EB5829" />
        <path d="M19.63636 9.8H24v4.4h-4.36364zM2.18182 9.8h4.36364v4.4H2.18182z" fill="#EE792F" />
        <path d="M17.45455 14.2h4.36364v4.4h-4.36364z" fill="#000" />
        <path d="M19.63636 14.2H24v4.4h-4.36364z" fill="#EB5829" />
        <path d="M17.45455 18.6h4.36364V23h-4.36364z" fill="#000" />
        <path d="M2.18182 14.2h4.36364v4.4H2.18182z" fill="#EB5829" />
        <path d="M19.63636 18.6H24V23h-4.36364zM2.18182 18.6h4.36364V23H2.18182z" fill="#EA3326" />
      </g>
    </svg>
  );
});

export default Mistral;
