export interface SizeMapToken {
  /**
   * @nameZH 默认
   * @desc 默认尺寸
   * @default 16
   */
  size: number;
  /**
   * @nameZH LG
   * @default 24
   */
  sizeLG: number;
  /**
   * @nameZH MD
   * @default 20
   */
  sizeMD: number;
  /** Same as size by default, but could be larger in compact mode */
  sizeMS: number;
  /**
   * @nameZH SM
   * @default 12
   */
  sizeSM: number;
  /**
   * @nameZH XL
   * @default 32
   */
  sizeXL: number;
  /**
   * @nameZH XS
   * @default 8
   */
  sizeXS: number;
  /**
   * @nameZH XXL
   * @default 48
   */
  sizeXXL: number;
  /**
   * @nameZH XXS
   * @default 4
   */
  sizeXXS: number;
}

export interface HeightMapToken {
  /**
   * @nameZH 较高的组件高度
   * @nameEN LG component height
   * @desc 较高的组件高度
   * @descEN LG component height
   */
  controlHeightLG: number;

  /**
   * @nameZH 较小的组件高度
   * @nameEN SM component height
   * @desc 较小的组件高度
   * @descEN SM component height
   */
  controlHeightSM: number;

  // Control
  /** Only Used for control inside component like Multiple Select inner selection item */
  /**
   * @nameZH 更小的组件高度
   * @nameEN XS component height
   * @desc 更小的组件高度
   * @descEN XS component height
   */
  controlHeightXS: number;
}
