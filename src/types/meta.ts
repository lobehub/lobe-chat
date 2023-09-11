export interface MetaData {
  /**
   * 角色头像
   * @description 可选参数，如果不传则使用默认头像
   */
  avatar?: string;
  /**
   *  背景色
   * @description 可选参数，如果不传则使用默认背景色
   */
  backgroundColor?: string;
  description?: string;
  tags?: string[];
  /**
   * 名称
   * @description 可选参数，如果不传则使用默认名称
   */
  title?: string;
}

export interface BaseDataModel {
  createAt: number;
  id: string;
  meta: MetaData;
  updateAt: number;
}
