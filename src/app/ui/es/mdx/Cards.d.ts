import { FC, PropsWithChildren } from 'react';
export interface CardsProps extends PropsWithChildren {
    maxItemWidth?: string | number;
    rows?: number;
}
declare const Cards: FC<CardsProps>;
export default Cards;
