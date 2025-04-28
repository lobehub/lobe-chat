import { Icon } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { LucideIcon, SquareArrowOutUpRight } from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

export interface ItemLinkProps {
  href: string;
  icon?: LucideIcon;
  label: string;
  value: string;
}

const ItemLink = memo<ItemLinkProps>(({ label, href }) => {
  const theme = useTheme();

  return (
    <Link href={href} style={{ color: 'inherit' }} target={'_blank'}>
      <Flexbox align={'center'} gap={8} horizontal>
        {label}
        <Icon color={theme.colorTextDescription} icon={SquareArrowOutUpRight} size={14} />
      </Flexbox>
    </Link>
  );
});

export default ItemLink;
