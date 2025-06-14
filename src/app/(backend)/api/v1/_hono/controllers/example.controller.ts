import { Context } from 'hono';

import { BaseController } from '../common/base.controller';

export class ExampleController extends BaseController {
  async handleGetExample(c: Context) {
    return this.success(c, { message: 'Hello, world!' });
  }
}
