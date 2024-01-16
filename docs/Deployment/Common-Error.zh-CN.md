# 常见问题

## 配置 `OPENAI_PROXY_URL` 环境变量但返回值为空

### 问题描述

配置 `OPENAI_PROXY_URL` 环境变量后，可能会遇到 AI 的返回消息为空的情况。这可能是由于 `OPENAI_PROXY_URL` 配置不正确导致。

### 解决方案

重新检查并确认 `OPENAI_PROXY_URL` 是否设置正确，包括是否正确地添加了 `/v1` 后缀（如果需要）。

### 相关讨论链接

- [Docker 安装，配置好环境变量后，为何返回值是空白？](https://github.com/lobehub/lobe-chat/discussions/623)
- [使用第三方接口报错的原因](https://github.com/lobehub/lobe-chat/discussions/734)
- [代理服务器地址填了聊天没任何反应](https://github.com/lobehub/lobe-chat/discussions/1065)

如果问题依旧无法解决，建议在社区中提出问题，附上相关日志和配置信息，以便其他开发者或维护者提供帮助。

## 使用代理中转请求时（例如：Surge），报 `UNABLE_TO_VERIFY_LEAF_SIGNATURE` 错误

### 问题描述

在私有化部署时，进行网络请求可能会遇到证书验证错误。错误信息可能如下：

```
[TypeError: fetch failed] {
  cause: [Error: unable to verify the first certificate] {
    code: 'UNABLE_TO_VERIFY_LEAF_SIGNATURE'
  }
}
```

或者是：

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

这个问题通常出现在使用代理服务器时，代理服务器使用的自签名证书或中间人证书不被 Node.js 默认信任。

### 解决方案

要解决这个问题，可以在启动应用时添加环境变量，跳过 Node.js 的证书验证。具体做法是在启动命令中加入 `NODE_TLS_REJECT_UNAUTHORIZED=0`。例如：

```bash
NODE_TLS_REJECT_UNAUTHORIZED=0 npm run start
```

或者在 Docker 容器中运行时，可以在 Dockerfile 或者 docker-compose.yml 中设置环境变量：

```dockerfile
# 在 Dockerfile 中
ENV NODE_TLS_REJECT_UNAUTHORIZED=0
```

```yaml
# 在 docker-compose.yml 中
environment:
  - NODE_TLS_REJECT_UNAUTHORIZED=0
```

Docker 运行命令示例：

```bash
docker run -e NODE_TLS_REJECT_UNAUTHORIZED=0 <其他参数> <镜像名>
```

请注意，这种方法会降低安全性，因为它允许 Node.js 接受未经验证的证书。因此，仅建议在完全信任网络环境的私有化部署中使用，且需要在解决证书问题后恢复默认的证书验证设置。

### 更安全的替代方案

如果可能，建议通过以下方法解决证书问题：

1. 确保所有的中间人证书都被正确地安装在代理服务器和相应的客户端上。
2. 使用有效的、由受信任的证书颁发机构签发的证书替换自签名或中间人证书。
3. 在代码中正确配置证书链，确保 Node.js 可以验证到根证书。

采用这些方法可以在不牺牲安全性的前提下解决证书验证问题。
