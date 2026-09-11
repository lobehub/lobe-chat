import { gatewayConnectionService } from '@/services/electron/gatewayConnection';

export const getLocalDeviceInfo = async () => gatewayConnectionService.getDeviceInfo();
