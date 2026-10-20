import { type PortalImpl } from '../type';
import Body from './Body';
import Title from './Title';
import { useCanvasMoreMenu } from './useMoreMenu';

export const Canvas: PortalImpl = {
  Body,
  Title,
  useMoreMenu: useCanvasMoreMenu,
};
