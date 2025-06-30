import { Context } from 'hono';

import { BaseController } from '../common/base.controller';
import { MessageTranslateService } from '../services/message-translate.service';
import { MessageTranslateTriggerRequest } from '../types/message-translate.type';

export class MessageTranslateController extends BaseController {
  /**
   * 获取指定消息的翻译信息
   * GET /api/v1/message_translates/:messageId
   * Param: { messageId: string }
   */
  async handleGetTranslateByMessage(c: Context) {
    try {
      const userId = this.getUserId(c)!;
      const { messageId } = this.getParams<{ messageId: string }>(c);

      const db = await this.getDatabase();
      const translateService = new MessageTranslateService(db, userId);
      const translate = await translateService.getTranslateByMessageId(messageId);

      return this.success(c, translate, '获取翻译信息成功');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * 翻译指定消息
   * POST /api/v1/message_translates/:messageId
   * Body: { from?: string, to: string }
   */
  async handleTranslateMessage(c: Context) {
    try {
      const userId = this.getUserId(c)!;
      const translateData = (await this.getBody<MessageTranslateTriggerRequest>(c))!;

      const db = await this.getDatabase();
      const translateService = new MessageTranslateService(db, userId);
      const result = await translateService.translateMessage(translateData);

      return this.success(c, result, '翻译消息成功');
    } catch (error) {
      return this.handleError(c, error);
    }
  }
}
