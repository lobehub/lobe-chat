import { notFound } from 'next/navigation';

import { oidcEnv } from '@/envs/oidc';
import { OIDCService } from '@/server/services/oidc';

import ConsentClient from './Client';
import ConsentClientError from './ClientError';

const InteractionPage = async (props: { params: Promise<{ uid: string }> }) => {
  if (!oidcEnv.ENABLE_OIDC) return notFound();

  const params = await props.params;
  const uid = params.uid;

  try {
    const oidcService = await OIDCService.initialize();

    // 获取交互详情，传入请求和响应对象
    const details = await oidcService.getInteractionDetails(uid);

    // 支持 login 和 consent 类型的交互
    if (details.prompt.name !== 'consent' && details.prompt.name !== 'login') {
      return (
        <ConsentClientError
          error={{
            message: `不支持的交互类型: ${details.prompt.name}`,
            title: '不支持的交互类型',
          }}
        />
      );
    }

    // 获取客户端 ID 和授权范围
    const clientId = (details.params.client_id as string) || 'unknown';
    const scopes = (details.params.scope as string)?.split(' ') || [];

    const clientDetail = await oidcService.getClientMetadata(clientId);

    // 渲染客户端组件，无论是 login 还是 consent 类型
    return (
      <ConsentClient
        clientId={clientId}
        clientMetadata={{
          clientName: clientDetail?.client_name,
          logo: clientDetail?.logo_uri,
        }}
        redirectUri={details.params.redirect_uri as string}
        scopes={scopes}
        uid={params.uid}
      />
    );
  } catch (error) {
    console.error('Error handling OIDC interaction:', error);
    // 确保错误处理能正确显示
    const errorMessage = error instanceof Error ? error.message : '获取授权详情时发生未知错误';
    // 检查是否是 'interaction session not found' 错误，可以给用户更友好的提示
    if (errorMessage.includes('interaction session not found')) {
      return (
        <ConsentClientError
          error={{ message: '授权会话已过期或无效，请重新发起授权流程。', title: '授权会话无效' }}
        />
      );
    }

    return <ConsentClientError error={{ message: errorMessage, title: '发生错误' }} />;
  }
};

export default InteractionPage;
