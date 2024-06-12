/* eslint-disable no-undef */
import { Md5 } from 'ts-md5';

import { JWTPayload, LOBE_CHAT_AUTH_HEADER } from '@/const/auth';
import { createJWT } from '@/utils/jwt';

export const hashRoomName = (roomName: string, password?: string): string => {
  if (!password) {
    return `lobechat:sync:${Md5.hashStr(roomName).toString()}`;
  } else {
    return `lobechat:sync:${Md5.hashStr(`${roomName}:${password}`).toString()}`;
  }
};

export const createSyncAuthHeader = async (
  accessCode?: string,
  headers?: HeadersInit,
): Promise<HeadersInit> => {
  const token = await createJWT<JWTPayload>({ accessCode });
  return { ...headers, [LOBE_CHAT_AUTH_HEADER]: token };
};
