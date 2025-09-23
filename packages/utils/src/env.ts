export const isDev = process.env.NODE_ENV === 'development';

export const isOnServerSide = typeof window === 'undefined';

const MAX_DURATION = Number(process.env.MAX_DURATION);
export const maxDuration = MAX_DURATION > 0 ? MAX_DURATION : 300;
