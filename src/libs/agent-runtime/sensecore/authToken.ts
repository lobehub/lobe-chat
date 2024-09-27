import { SignJWT } from 'jose';

// https://console.sensecore.cn/help/docs/model-as-a-service/nova/overview/Authorization
const encodeJwtTokenSenseCore = async (ak?: string, sk?: string): Promise<string> => {
    const secret = new TextEncoder().encode(sk);
    const jwt = await new SignJWT({
            iss: ak,
        })
        .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
        .setIssuedAt()
        .setExpirationTime(1800)
        .setNotBefore(-5)
        .sign(secret);

    return jwt;
};
