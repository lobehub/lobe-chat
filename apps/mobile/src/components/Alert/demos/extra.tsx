import { Alert, Flexbox, Highlighter, Text } from '@lobehub/ui-rn';

const demoError = {
  details: {
    exception: 'Validation filter failed',
    msgId: 'Id-f5aab7304f6c754804f70000',
  },
  reasons: [
    {
      language: 'en',
      message: 'Validation filter failed',
    },
  ],
};

const ExtraDemo = () => {
  return (
    <Flexbox gap={16}>
      {/* 基础 extra - 可展开的额外信息 */}
      <Alert
        extra={
          <Highlighter
            code={JSON.stringify(demoError, null, 2)}
            lang="json"
            showLanguage={false}
            variant="borderless"
          />
        }
        message="请求失败"
        type="error"
      />

      {/* 带 description 的 extra */}
      <Alert
        description="服务器返回了错误响应，请查看下方详细信息"
        extra={
          <Highlighter
            code={JSON.stringify(demoError, null, 2)}
            lang="json"
            showLanguage={false}
            variant="borderless"
          />
        }
        message="API 调用失败"
        type="error"
      />

      {/* extraDefaultExpand - 默认展开 */}
      <Alert
        extra={
          <Flexbox padding={8}>
            <Text fontSize={12} type={'warning'}>
              {`错误码: 500\n时间: ${new Date().toLocaleString()}\n服务器: api.example.com`}
            </Text>
          </Flexbox>
        }
        extraDefaultExpand
        message="服务器错误"
        type="warning"
      />

      {/* extraIsolate - 额外信息隔离显示 */}
      <Alert
        extra={
          <Alert message="这是额外的独立提示信息" showIcon={false} type="info" variant="filled" />
        }
        extraIsolate
        message="主要提示信息"
        type="success"
      />

      {/* 不同变体的 extra */}
      <Alert
        extra={
          <Highlighter
            code={`$ npm install @lobehub/chat\n✓ Installation complete!`}
            lang="bash"
            showLanguage={false}
            variant="borderless"
          />
        }
        message="安装成功"
        type="success"
        variant="outlined"
      />

      {/* borderless 变体的 extra */}
      <Alert
        extra={
          <Flexbox padding={8}>
            <Text fontSize={12} style={{ opacity: 0.8 }} type={'warning'}>
              此操作将会永久删除文件，请确认是否继续。删除后无法恢复。
            </Text>
          </Flexbox>
        }
        message="危险操作警告"
        type="warning"
        variant="borderless"
      />
    </Flexbox>
  );
};

export default ExtraDemo;
