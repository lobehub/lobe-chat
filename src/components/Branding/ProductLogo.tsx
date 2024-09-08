import { LobeChat } from '@lobehub/ui/brand';
import { memo } from 'react';

interface ProductLogoProps {
  className?: string;
  extra?: string;
  size?: number;
}

export const ProductLogo = memo<ProductLogoProps>(({ size, className, extra }) => {
  return <LobeChat className={className} extra={extra} size={size} type={'text'} />;
});

export default ProductLogo;
