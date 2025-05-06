import { Block, Icon } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';

export interface ItemCardProps {
  href: string;
  icon?: LucideIcon;
  label: string;
  value: string;
}

const ItemCard = memo<ItemCardProps>(({ label, icon, href }) => {
  const theme = useTheme();
  return (
    <Link href={href} style={{ color: 'inherit' }} target={'_blank'}>
      <Block clickable gap={12} horizontal paddingBlock={12} paddingInline={18}>
        {icon && <Icon fill={theme.colorText} icon={icon} size={18} />}
        {label}
      </Block>
    </Link>
  );
});

export default ItemCard;
