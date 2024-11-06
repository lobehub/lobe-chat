import { PortalImpl } from '../type';
import Body from './Body';
import Header from './Header';
import { onClose, useEnable } from './hook';

export const Thread: PortalImpl = {
  Body,
  Header,
  Title: () => null,
  onClose,
  useEnable,
};
