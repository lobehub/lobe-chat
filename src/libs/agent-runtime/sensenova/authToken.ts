import CryptoJS from 'crypto-js';

const base64UrlEncode = (obj: object) => {
    return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(JSON.stringify(obj)))
      .replaceAll('=', '')
      .replaceAll('+', '-')
      .replaceAll('/', '_')
}

// https://console.sensecore.cn/help/docs/model-as-a-service/nova/overview/Authorization
export const generateJwtTokenSenseNova = (accessKeyID: string = '', accessKeySecret: string = '', expiredAfter: number = 1800, notBefore: number = 5) => {
      const headers = {
        alg: 'HS256',
        typ: 'JWT'
      }

      const payload = {
        exp: Math.floor(Date.now() / 1000) + expiredAfter,
        iss: accessKeyID,
        nbf: Math.floor(Date.now() / 1000) - notBefore,
      }

      const data = `${ base64UrlEncode(headers) }.${ base64UrlEncode(payload) }`

      const signature = CryptoJS.HmacSHA256(data, accessKeySecret)
        .toString(CryptoJS.enc.Base64)
        .replaceAll('=', '')
        .replaceAll('+', '-')
        .replaceAll('/', '_')

      const apiKey = `${ data }.${ signature }`

      return apiKey
};
