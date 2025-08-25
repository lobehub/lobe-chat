import { PromptBuilder } from '@saintno/comfyui-sdk';

import { AgentRuntimeErrorType } from '../../error';
import { AgentRuntimeError } from '../../utils/createError';
import { buildFluxDevWorkflow } from '../workflows/flux-dev';
import { buildFluxKontextWorkflow } from '../workflows/flux-kontext';
import { buildFluxKreaWorkflow } from '../workflows/flux-krea';
import { buildFluxSchnellWorkflow } from '../workflows/flux-schnell';

/**
 * Workflow type detection result interface / 工作流类型检测结果接口
 */
export interface WorkflowDetectionResult {
  /** Model architecture type / 模型架构类型 */
  architecture: 'FLUX' | 'SD1' | 'SDXL' | 'SD3' | 'unknown';
  /** Model category / 模型分类 */
  category?: 'model' | 'lora' | 'controlnet' | 'component';
  /** Whether this model is supported / 是否支持的模型 */
  isSupported: boolean;
  /** Variant type / 变体类型 */
  variant?: 'dev' | 'schnell' | 'kontext' | 'krea';
}

/**
 * Workflow builder function type / 工作流构建器函数类型
 */
export type WorkflowBuilderFunction = (
  modelFileName: string,
  params: Record<string, any>,
) => PromptBuilder<any, any, any>;

/**
 * ComfyUI 工作流路由器 / ComfyUI Workflow Router
 *
 * @description 负责将模型检测结果路由到相应的工作流构建器
 * Routes model detection results to appropriate workflow builders
 */
export class WorkflowRouter {
  /**
   * Exact supported model name mapping / 精确支持的模型名称映射
   */
  private static readonly EXACT_MODEL_BUILDERS: Record<string, WorkflowBuilderFunction> = {
    'flux-dev': buildFluxDevWorkflow,
    'flux-kontext-dev': buildFluxKontextWorkflow,
    'flux-krea-dev': buildFluxKreaWorkflow,
    'flux-schnell': buildFluxSchnellWorkflow,
  };

  /**
   * FLUX variant to builder mapping / FLUX 变体到构建器的映射
   */
  private static readonly VARIANT_BUILDERS: Record<string, WorkflowBuilderFunction> = {
    dev: buildFluxDevWorkflow,
    kontext: buildFluxKontextWorkflow,
    krea: buildFluxKreaWorkflow,
    schnell: buildFluxSchnellWorkflow,
  };

  /**
   * Route workflow construction / 路由工作流构建
   *
   * @param modelId Model ID / 模型ID
   * @param detectionResult Detection result / 检测结果
   * @param modelFileName Actual model file name / 实际模型文件名
   * @param params Generation parameters / 生成参数
   * @returns Built workflow / 构建的工作流
   * @throws {AgentRuntimeError} When routing fails / 当无法路由时
   */
  static routeWorkflow(
    modelId: string,
    detectionResult: WorkflowDetectionResult,
    modelFileName: string,
    params: Record<string, any> = {},
  ): PromptBuilder<any, any, any> {
    // Validate input parameters / 验证输入参数
    if (!modelId || !detectionResult) {
      throw AgentRuntimeError.createError(AgentRuntimeErrorType.ComfyUIWorkflowError, {
        message: 'Invalid parameters: modelId and detectionResult are required',
        modelId,
      });
    }

    // Check if supported / 检查是否支持
    if (!detectionResult.isSupported) {
      throw AgentRuntimeError.createError(AgentRuntimeErrorType.ComfyUIWorkflowError, {
        message: `Unsupported model architecture: ${detectionResult.architecture} for model ${modelId}`,
        modelId,
      });
    }

    // 1. First try exact model name matching / 首先尝试精确模型名称匹配
    const exactBuilder = this.EXACT_MODEL_BUILDERS[modelId];
    if (exactBuilder) {
      return exactBuilder(modelFileName, params);
    }

    // 2. Then try variant matching / 然后尝试变体匹配
    if (detectionResult.variant && this.VARIANT_BUILDERS[detectionResult.variant]) {
      const variantBuilder = this.VARIANT_BUILDERS[detectionResult.variant];
      return variantBuilder(modelFileName, params);
    }

    // 3. If all fail to match, throw error / 如果都无法匹配，抛出错误
    throw AgentRuntimeError.createError(AgentRuntimeErrorType.ComfyUIWorkflowError, {
      message:
        `No workflow builder found for model ${modelId} ` +
        `(architecture: ${detectionResult.architecture}, variant: ${detectionResult.variant || 'unknown'})`,
      modelId,
    });
  }

  /**
   * Get exactly supported model list / 获取精确支持的模型列表
   *
   * @returns List of supported model IDs / 支持的模型ID列表
   */
  static getExactlySupportedModels(): string[] {
    return Object.keys(this.EXACT_MODEL_BUILDERS);
  }

  /**
   * Get supported FLUX variant list / 获取支持的FLUX变体列表
   *
   * @returns List of supported variants / 支持的变体列表
   */
  static getSupportedFluxVariants(): string[] {
    return Object.keys(this.VARIANT_BUILDERS);
  }

  /**
   * Check if model has exact support / 检查模型是否有精确支持
   *
   * @param modelId Model ID / 模型ID
   * @returns Whether exactly supported / 是否精确支持
   */
  static hasExactSupport(modelId: string): boolean {
    return modelId in this.EXACT_MODEL_BUILDERS;
  }

  /**
   * Check if variant is supported / 检查变体是否支持
   *
   * @param variant FLUX variant / FLUX变体
   * @returns Whether this variant is supported / 是否支持该变体
   */
  static hasVariantSupport(variant: string): boolean {
    return variant in this.VARIANT_BUILDERS;
  }

  /**
   * Get routing statistics / 获取路由统计信息
   *
   * @returns Router statistics / 路由器统计信息
   */
  static getRoutingStats(): {
    exactModelsCount: number;
    supportedVariantsCount: number;
    totalBuilders: number;
  } {
    return {
      exactModelsCount: Object.keys(this.EXACT_MODEL_BUILDERS).length,
      supportedVariantsCount: Object.keys(this.VARIANT_BUILDERS).length,
      totalBuilders: new Set([
        ...Object.values(this.EXACT_MODEL_BUILDERS),
        ...Object.values(this.VARIANT_BUILDERS),
      ]).size,
    };
  }
}
