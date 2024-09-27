import { SignJWT } from 'jose';

// https://console.sensecore.cn/help/docs/model-as-a-service/nova/overview/Authorization
export const encodeJwtTokenSenseCore = (ak?: string, sk?: string) => {
    const secret = new TextEncoder().encode(sk);
    return new SignJWT({
            iss: ak,
        })
        .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
        .setIssuedAt()
        .setExpirationTime(1800)
        .setNotBefore(-5)
        .sign(secret);
};
