import { TraeAcpAdapter } from './traeAcp';

export class DevinAcpAdapter extends TraeAcpAdapter {
  constructor() {
    super({ eventPrefix: 'devin', provider: 'devin' });
  }
}
