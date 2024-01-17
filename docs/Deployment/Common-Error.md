# Frequently Asked Questions

## Configuring the `OPENAI_PROXY_URL` Environment Variable but Receiving an Empty Response

### Problem Description

After configuring the `OPENAI_PROXY_URL` environment variable, you may encounter a situation where the response from the AI is empty. This could be due to an incorrect configuration of the `OPENAI_PROXY_URL`.

### Solution

Recheck and confirm if the `OPENAI_PROXY_URL` is set correctly, including the correct addition of the `/v1` suffix (if required).

### Related Discussion Links

- [Why is the response blank after installing and configuring Docker and environment variables?](https://github.com/lobehub/lobe-chat/discussions/623)
- [Reasons for errors when using third-party APIs](https://github.com/lobehub/lobe-chat/discussions/734)
- [No response from the chat when the proxy server address is filled](https://github.com/lobehub/lobe-chat/discussions/1065)

If the issue persists, it is recommended to raise the problem in the community with relevant logs and configuration information for other developers or maintainers to provide assistance.

## When using a proxy(e.g. Surge), I encounter the `UNABLE_TO_VERIFY_LEAF_SIGNATURE` error

### Problem Description

When making network requests during private deployment, certificate validation errors may occur. The error messages may be as follows:

```
[TypeError: fetch failed] {
  cause: [Error: unable to verify the first certificate] {
    code: 'UNABLE_TO_VERIFY_LEAF_SIGNATURE'
  }
}
```

Or:

```
{
  "endpoint": "https://api.openai.com/v1",
  "error": {
    "cause": {
      "code": "UNABLE_TO_VERIFY_LEAF_SIGNATURE"
    }
  }
}
```

This problem typically occurs when using a proxy server with a self-signed certificate or a man-in-the-middle certificate that is not trusted by Node.js by default.

### Solution

To resolve this issue, you can add an environment variable to bypass Node.js certificate validation when starting the application. The specific approach is to include `NODE_TLS_REJECT_UNAUTHORIZED=0` in the startup command. For example:

```bash
NODE_TLS_REJECT_UNAUTHORIZED=0 npm run start
```

Alternatively, when running in a Docker container, you can set the environment variable in the Dockerfile or docker-compose.yml:

```dockerfile
# In the Dockerfile
ENV NODE_TLS_REJECT_UNAUTHORIZED=0
```

```yaml
# In the docker-compose.yml
environment:
  - NODE_TLS_REJECT_UNAUTHORIZED=0
```

Example Docker run command:

```bash
docker run -e NODE_TLS_REJECT_UNAUTHORIZED=0 <other parameters> <image name>
```

Please note that this method reduces security because it allows Node.js to accept unverified certificates. Therefore, it is only recommended for use in private deployments with fully trusted network environments, and the default certificate validation settings should be restored after resolving the certificate issue.

### More Secure Alternatives

If possible, it is recommended to address certificate issues using the following methods:

1. Ensure that all man-in-the-middle certificates are correctly installed on the proxy server and the corresponding clients.
2. Replace self-signed or man-in-the-middle certificates with valid certificates issued by trusted certificate authorities.
3. Properly configure the certificate chain in the code to ensure that Node.js can validate to the root certificate.

Implementing these methods can resolve certificate validation issues without sacrificing security.
