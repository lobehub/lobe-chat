# Frequently Asked Questions

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

