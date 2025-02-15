import { FC } from 'react';

export interface PortalImpl {
  Body: FC;
  Header?: FC;
  Title: FC;
  onClose?: () => void;
  useEnable: () => boolean;
}
