import { isDesktop } from '@lobechat/const';

import { FileModel } from '@/database/models/file';
import { getServerDB } from '@/database/server';
import { FileService } from '@/server/services/file';

export const runtime = 'nodejs';

type Params = Promise<{ id: string }>;

/**
 * 文件代理服务
 * GET /f/:id
 *
 * 功能：
 * - 查询数据库获取文件记录
 * - 根据平台生成访问 URL（桌面 → 本地文件，网页 → S3 预签名 URL）
 * - 返回 302 重定向
 */
export const GET = async (_req: Request, segmentData: { params: Params }) => {
  try {
    const params = await segmentData.params;
    const { id } = params;

    // 获取数据库连接
    const db = await getServerDB();

    // 查询文件记录
    // 注意：这里使用 'system' 作为 userId，因为文件代理不需要用户权限验证
    // 如果未来需要权限控制，可以从 session 中获取真实的 userId
    const fileModel = new FileModel(db, 'system');
    const file = await fileModel.findById(id);

    if (!file) {
      return new Response('File not found', {
        status: 404,
      });
    }

    // 创建文件服务
    const fileService = new FileService(db, 'system');

    let redirectUrl: string;

    if (isDesktop) {
      // 桌面端：获取本地文件的 HTTP URL
      redirectUrl = await fileService.createPreSignedUrlForPreview(file.url);
    } else {
      // 网页端：生成 S3 预签名 URL（5分钟有效期）
      redirectUrl = await fileService.createPreSignedUrlForPreview(file.url, 300);
    }

    // 返回 302 重定向
    return Response.redirect(redirectUrl, 302);
  } catch (error) {
    console.error('File proxy error:', error);
    return new Response('Internal server error', {
      status: 500,
    });
  }
};
