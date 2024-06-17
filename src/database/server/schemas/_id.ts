// refs: https://unkey.dev/blog/uuid-ux

// If I have 100 million users, each generating up to 1 million messages.
// Then the total number of IDs that need to be generated: 100 million × 1 million = 10^14 (100 trillion)
// 11-digit Nano ID: 36^11 ≈ 1.3 × 10^17 (130 trillion trillion)

export const FILE_ID_LENGTH = 19; // 5 prefix + 14 random, e.g. file_ydGX5gmaxL32fh

export const MESSAGE_ID_LENGTH = 18; // 4 prefix + 14 random, e.g. msg_GX5ymaxL3d2ds2

export const SESSION_ID_LENGTH = 16; // 4 prefix + 12 random, e.g. ssn_GX5y3d2dmaxL

export const TOPIC_ID_LENGTH = 16; // 4 prefix + 12 random, e.g. tpc_GX5ymd7axL3y

export const USER_ID_LENGTH = 14; // 4 prefix + 10 random, e.g. user_GXyxLmd75a
