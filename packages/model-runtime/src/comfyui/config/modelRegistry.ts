/**
 * FLUX Model Registry - Linus-style simple design
 * Eliminate over-engineering, simple Record object ordered by priority
 */

export interface ModelConfig {
  modelFamily: 'FLUX' | 'SD1' | 'SDXL' | 'SD3';
  priority: number;
  recommendedDtype: 'default' | 'fp8_e4m3fn' | 'fp8_e4m3fn_fast' | 'fp8_e5m2';
  variant: 'dev' | 'schnell' | 'kontext' | 'krea' | 'fill' | 'redux';
}

// ===================================================================
// Simple direct Record object - strict P1→P2→P3 order per validation table
// ===================================================================

/* eslint-disable sort-keys-fix/sort-keys-fix */
export const MODEL_REGISTRY: Record<string, ModelConfig> = {
  // === Priority 1: Official Models (4 models) ===
  'flux1-dev.safetensors': {
    priority: 1,
    variant: 'dev',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'flux1-schnell.safetensors': {
    priority: 1,
    variant: 'schnell',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'flux1-kontext-dev.safetensors': {
    priority: 1,
    variant: 'kontext',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'flux1-krea-dev.safetensors': {
    priority: 1,
    variant: 'krea',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },

  // === Priority 2: Enterprise Optimized Models (106 models) ===

  // 2.1 Enterprise Lightweight Models
  'flux.1-lite-8B.safetensors': {
    priority: 2,
    variant: 'dev',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'flux.1-lite-8B-alpha.safetensors': {
    priority: 2,
    variant: 'dev',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'flux-mini.safetensors': {
    priority: 2,
    variant: 'dev',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'FLUX_Mini_3_2B.safetensors': {
    priority: 2,
    variant: 'dev',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'flux_shakker_labs_union_pro-fp8_e4m3fn.safetensors': {
    priority: 2,
    variant: 'dev',
    modelFamily: 'FLUX',
    recommendedDtype: 'fp8_e4m3fn',
  },

  // 2.2 GGUF Series - FLUX.1-dev (11 models)
  'flux1-dev-F16.gguf': {
    priority: 2,
    variant: 'dev',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'flux1-dev-Q8_0.gguf': {
    priority: 2,
    variant: 'dev',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'flux1-dev-Q6_K.gguf': {
    priority: 2,
    variant: 'dev',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'flux1-dev-Q5_K_M.gguf': {
    priority: 2,
    variant: 'dev',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'flux1-dev-Q5_K_S.gguf': {
    priority: 2,
    variant: 'dev',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'flux1-dev-Q4_K_M.gguf': {
    priority: 2,
    variant: 'dev',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'flux1-dev-Q4_K_S.gguf': {
    priority: 2,
    variant: 'dev',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'flux1-dev-Q4_0.gguf': {
    priority: 2,
    variant: 'dev',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'flux1-dev-Q3_K_M.gguf': {
    priority: 2,
    variant: 'dev',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'flux1-dev-Q3_K_S.gguf': {
    priority: 2,
    variant: 'dev',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'flux1-dev-Q2_K.gguf': {
    priority: 2,
    variant: 'dev',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },

  // 2.3 GGUF Series - FLUX.1-schnell (11 models)
  'flux1-schnell-F16.gguf': {
    priority: 2,
    variant: 'schnell',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'flux1-schnell-Q8_0.gguf': {
    priority: 2,
    variant: 'schnell',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'flux1-schnell-Q6_K.gguf': {
    priority: 2,
    variant: 'schnell',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'flux1-schnell-Q5_K_M.gguf': {
    priority: 2,
    variant: 'schnell',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'flux1-schnell-Q5_K_S.gguf': {
    priority: 2,
    variant: 'schnell',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'flux1-schnell-Q4_K_M.gguf': {
    priority: 2,
    variant: 'schnell',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'flux1-schnell-Q4_K_S.gguf': {
    priority: 2,
    variant: 'schnell',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'flux1-schnell-Q4_0.gguf': {
    priority: 2,
    variant: 'schnell',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'flux1-schnell-Q3_K_M.gguf': {
    priority: 2,
    variant: 'schnell',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'flux1-schnell-Q3_K_S.gguf': {
    priority: 2,
    variant: 'schnell',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'flux1-schnell-Q2_K.gguf': {
    priority: 2,
    variant: 'schnell',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },

  // 2.4 GGUF Series - FLUX.1-kontext (11 models)
  'flux1-kontext-dev-F16.gguf': {
    priority: 2,
    variant: 'kontext',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'flux1-kontext-dev-Q8_0.gguf': {
    priority: 2,
    variant: 'kontext',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'flux1-kontext-dev-Q6_K.gguf': {
    priority: 2,
    variant: 'kontext',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'flux1-kontext-dev-Q5_K_M.gguf': {
    priority: 2,
    variant: 'kontext',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'flux1-kontext-dev-Q5_K_S.gguf': {
    priority: 2,
    variant: 'kontext',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'flux1-kontext-dev-Q4_K_M.gguf': {
    priority: 2,
    variant: 'kontext',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'flux1-kontext-dev-Q4_K_S.gguf': {
    priority: 2,
    variant: 'kontext',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'flux1-kontext-dev-Q4_0.gguf': {
    priority: 2,
    variant: 'kontext',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'flux1-kontext-dev-Q3_K_M.gguf': {
    priority: 2,
    variant: 'kontext',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'flux1-kontext-dev-Q3_K_S.gguf': {
    priority: 2,
    variant: 'kontext',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'flux1-kontext-dev-Q2_K.gguf': {
    priority: 2,
    variant: 'kontext',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },

  // 2.5 GGUF Series - FLUX.1-krea (11 models)
  'flux1-krea-dev-F16.gguf': {
    priority: 2,
    variant: 'krea',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'flux1-krea-dev-Q8_0.gguf': {
    priority: 2,
    variant: 'krea',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'flux1-krea-dev-Q6_K.gguf': {
    priority: 2,
    variant: 'krea',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'flux1-krea-dev-Q5_K_M.gguf': {
    priority: 2,
    variant: 'krea',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'flux1-krea-dev-Q5_K_S.gguf': {
    priority: 2,
    variant: 'krea',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'flux1-krea-dev-Q4_K_M.gguf': {
    priority: 2,
    variant: 'krea',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'flux1-krea-dev-Q4_K_S.gguf': {
    priority: 2,
    variant: 'krea',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'flux1-krea-dev-Q4_0.gguf': {
    priority: 2,
    variant: 'krea',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'flux1-krea-dev-Q3_K_M.gguf': {
    priority: 2,
    variant: 'krea',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'flux1-krea-dev-Q3_K_S.gguf': {
    priority: 2,
    variant: 'krea',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'flux1-krea-dev-Q2_K.gguf': {
    priority: 2,
    variant: 'krea',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },

  // 2.6 FP8 Series - dev variant (9 models)
  'flux1-dev-fp8-e4m3fn.safetensors': {
    priority: 2,
    variant: 'dev',
    modelFamily: 'FLUX',
    recommendedDtype: 'fp8_e4m3fn',
  },
  'flux1-dev-fp8-e5m2.safetensors': {
    priority: 2,
    variant: 'dev',
    modelFamily: 'FLUX',
    recommendedDtype: 'fp8_e5m2',
  },

  // 2.7 FP8 Series - schnell variant (3 models)
  'flux1-schnell-fp8-e4m3fn.safetensors': {
    priority: 2,
    variant: 'schnell',
    modelFamily: 'FLUX',
    recommendedDtype: 'fp8_e4m3fn',
  },
  'flux1-schnell-fp8-e5m2.safetensors': {
    priority: 2,
    variant: 'schnell',
    modelFamily: 'FLUX',
    recommendedDtype: 'fp8_e5m2',
  },

  // 2.8 FP8 Series - kontext variant (2 models)
  'flux1-kontext-dev-fp8-e4m3fn.safetensors': {
    priority: 2,
    variant: 'kontext',
    modelFamily: 'FLUX',
    recommendedDtype: 'fp8_e4m3fn',
  },
  'flux1-kontext-dev-fp8-e5m2.safetensors': {
    priority: 2,
    variant: 'kontext',
    modelFamily: 'FLUX',
    recommendedDtype: 'fp8_e5m2',
  },

  // 2.9 FP8 Series - krea variant (1 model)
  'flux1-krea-dev-fp8-e4m3fn.safetensors': {
    priority: 2,
    variant: 'krea',
    modelFamily: 'FLUX',
    recommendedDtype: 'fp8_e4m3fn',
  },

  // 2.10 NF4 Quantization Series (7 models)
  'flux1-dev-bnb-nf4.safetensors': {
    priority: 2,
    variant: 'dev',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'flux1-dev-bnb-nf4-v2.safetensors': {
    priority: 2,
    variant: 'dev',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'flux1-schnell-bnb-nf4.safetensors': {
    priority: 2,
    variant: 'schnell',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'flux1-kontext-dev-bnb-nf4.safetensors': {
    priority: 2,
    variant: 'kontext',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'flux1-krea-dev-bnb-nf4.safetensors': {
    priority: 2,
    variant: 'krea',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },

  // 2.11 Technical Experimental Models - SVDQuant Series
  'flux1-dev-svdquant-w4a4.safetensors': {
    priority: 2,
    variant: 'dev',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'flux1-schnell-svdquant-w4a4.safetensors': {
    priority: 2,
    variant: 'schnell',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },

  // 2.12 Technical Experimental Models - TorchAO Series
  'flux1-dev-torchao-int8.safetensors': {
    priority: 2,
    variant: 'dev',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'flux1-dev-torchao-int4.safetensors': {
    priority: 2,
    variant: 'dev',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'flux1-schnell-torchao-int8.safetensors': {
    priority: 2,
    variant: 'schnell',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },

  // 2.13 Technical Experimental Models - optimum-quanto Series
  'flux1-dev-quanto-qfloat8.safetensors': {
    priority: 2,
    variant: 'dev',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'flux1-schnell-quanto-qfloat8.safetensors': {
    priority: 2,
    variant: 'schnell',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },

  // 2.14 Technical Experimental Models - MFLUX Series (Apple Silicon Optimized)
  'flux1-dev-mflux-q4.safetensors': {
    priority: 2,
    variant: 'dev',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'flux1-schnell-mflux-q4.safetensors': {
    priority: 2,
    variant: 'schnell',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },

  // === Priority 3: Community Fine-tuned Models (48 models) ===

  // 3.1 Jib Mix Flux系列
  'Jib_Mix_Flux_v8_schnell.safetensors': {
    priority: 3,
    variant: 'schnell',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'Jib_mix_Flux_V11_Krea_b_00001_.safetensors': {
    priority: 3,
    variant: 'dev',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'jibMixFlux_v8.q4_0.gguf': {
    priority: 3,
    variant: 'dev',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },

  // 3.2 Real Dream FLUX系列
  'real_dream_flux_v1.safetensors': {
    priority: 3,
    variant: 'dev',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'real_dream_flux_beta.safetensors': {
    priority: 3,
    variant: 'dev',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'real_dream_flux_release.safetensors': {
    priority: 3,
    variant: 'dev',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'realDream_flux1V1.safetensors': {
    priority: 3,
    variant: 'dev',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'realDream_flux1V1_schnell.safetensors': {
    priority: 3,
    variant: 'schnell',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },

  // 3.3 Vision Realistic FLUX系列
  'vision_realistic_flux_dev_v2.safetensors': {
    priority: 3,
    variant: 'dev',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'vision_realistic_flux_dev_fp8_no_clip_v2.safetensors': {
    priority: 3,
    variant: 'dev',
    modelFamily: 'FLUX',
    recommendedDtype: 'fp8_e4m3fn',
  },
  'vision_realistic_flux_v2_fp8.safetensors': {
    priority: 3,
    variant: 'dev',
    modelFamily: 'FLUX',
    recommendedDtype: 'fp8_e4m3fn',
  },
  'vision_realistic_flux_v2_dev.safetensors': {
    priority: 3,
    variant: 'dev',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'vision_realistic_flux_shakker.safetensors': {
    priority: 3,
    variant: 'dev',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },

  // 3.4 Flux Fusion系列
  'flux_fusion_v2_4steps.safetensors': {
    priority: 3,
    variant: 'dev',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'flux_fusion_ds_merge.safetensors': {
    priority: 3,
    variant: 'dev',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'flux_fusion_v2_tensorart.safetensors': {
    priority: 3,
    variant: 'dev',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },

  // 3.5 PixelWave FLUX系列
  'PixelWave_FLUX.1-dev_03.safetensors': {
    priority: 3,
    variant: 'dev',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'PixelWave_FLUX.1-schnell_04.safetensors': {
    priority: 3,
    variant: 'schnell',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },

  // 3.6 Fux Capacity系列
  'Fux_Capacity_NSFW_v3.safetensors': {
    priority: 3,
    variant: 'dev',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'FuxCapacity2.1-Q8_0.gguf': {
    priority: 3,
    variant: 'dev',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'FuxCapacity3.0_FP8.safetensors': {
    priority: 3,
    variant: 'dev',
    modelFamily: 'FLUX',
    recommendedDtype: 'fp8_e4m3fn',
  },
  'FuxCapacity3.1_FP16.safetensors': {
    priority: 3,
    variant: 'dev',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },

  // 3.7 Fluxmania系列
  'FluxMania_Kreamania_v1.safetensors': {
    priority: 3,
    variant: 'dev',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'Fluxmania_IV_fp8.safetensors': {
    priority: 3,
    variant: 'dev',
    modelFamily: 'FLUX',
    recommendedDtype: 'fp8_e4m3fn',
  },
  'Fluxmania_V6I.safetensors': {
    priority: 3,
    variant: 'dev',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'Fluxmania_V6I_fp16.safetensors': {
    priority: 3,
    variant: 'dev',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },

  // 3.8 Fluxed Up系列
  'Fluxed_Up_NSFW_v2.safetensors': {
    priority: 3,
    variant: 'dev',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },

  // 3.9 企业级LiblibAI模型
  'flux.1-ultra-realphoto-v2.safetensors': {
    priority: 3,
    variant: 'dev',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'f.1-dev-schnell-8steps-fp8.safetensors': {
    priority: 3,
    variant: 'dev',
    modelFamily: 'FLUX',
    recommendedDtype: 'fp8_e4m3fn',
  },
  'flux-muchen-asian.safetensors': {
    priority: 3,
    variant: 'dev',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'moyou-film-flux.safetensors': {
    priority: 3,
    variant: 'dev',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'firefly-fantasy-flux.safetensors': {
    priority: 3,
    variant: 'dev',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'flux-yanling-anime.safetensors': {
    priority: 3,
    variant: 'dev',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },

  // 3.10 Legacy Models for Compatibility
  'Acorn_Spinning_FLUX_photorealism.safetensors': {
    priority: 3,
    variant: 'dev',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'CreArt_Hyper_Flux_Dev_8steps.safetensors': {
    priority: 3,
    variant: 'dev',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'Flux_Unchained_SCG_mixed.safetensors': {
    priority: 3,
    variant: 'dev',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'RealFlux_1.0b_Dev_Transformer.safetensors': {
    priority: 3,
    variant: 'dev',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'RealFlux_1.0b_Schnell.safetensors': {
    priority: 3,
    variant: 'schnell',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'UltraReal_FineTune_v4.safetensors': {
    priority: 3,
    variant: 'dev',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'UltraRealistic_FineTune_Project_v4.safetensors': {
    priority: 3,
    variant: 'dev',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'XPlus_2(GGUF_Q4).gguf': {
    priority: 3,
    variant: 'dev',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'XPlus_2(GGUF_Q6).gguf': {
    priority: 3,
    variant: 'dev',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'XPlus_2(GGUF_Q8).gguf': {
    priority: 3,
    variant: 'dev',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'educational-flux-simplified.safetensors': {
    priority: 3,
    variant: 'dev',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'flux-depth-fp16.safetensors': {
    priority: 3,
    variant: 'kontext',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'flux-fill-object-removal.safetensors': {
    priority: 3,
    variant: 'kontext',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'flux-medical-environment-lora.safetensors': {
    priority: 3,
    variant: 'kontext',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'flux-schnell-dev-merged-fp8.safetensors': {
    priority: 3,
    variant: 'schnell',
    modelFamily: 'FLUX',
    recommendedDtype: 'fp8_e4m3fn',
  },
  'schnellMODE_FLUX_S_v5_1.safetensors': {
    priority: 3,
    variant: 'schnell',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
  'NF4_BnB_FLUX_dev_optimized.safetensors': {
    priority: 3,
    variant: 'dev',
    modelFamily: 'FLUX',
    recommendedDtype: 'default',
  },
};

// ===================================================================
// Universal Query Interface - One Function Rules All
// ===================================================================

/**
 * Get models by variant, sorted by priority
 */
export function getModelsByVariant(variant: ModelConfig['variant']): string[] {
  const matchingModels: Array<{ fileName: string; priority: number }> = [];

  for (const [fileName, config] of Object.entries(MODEL_REGISTRY)) {
    if (config.variant === variant) {
      matchingModels.push({ fileName, priority: config.priority });
    }
  }

  // Sort by priority (lower number = higher priority)
  return matchingModels.sort((a, b) => a.priority - b.priority).map((item) => item.fileName);
}

/**
 * Get single model config
 */
export function getModelConfig(
  modelName: string,
  options?: {
    caseInsensitive?: boolean;
    modelFamily?: ModelConfig['modelFamily'];
    priority?: number;
    recommendedDtype?: ModelConfig['recommendedDtype'];
    variant?: ModelConfig['variant'];
  },
): ModelConfig | undefined {
  // Direct lookup - KISS principle
  let config = MODEL_REGISTRY[modelName];

  // If not found and case-insensitive search requested, try case-insensitive lookup
  if (!config && options?.caseInsensitive) {
    const lowerModelName = modelName.toLowerCase();
    for (const [registryName, registryConfig] of Object.entries(MODEL_REGISTRY)) {
      if (registryName.toLowerCase() === lowerModelName) {
        config = registryConfig;
        break;
      }
    }
  }

  if (!config) return undefined;

  // No filters - return the config
  if (!options) return config;

  // Check filters (excluding caseInsensitive which is not a model property filter)
  const matches =
    (!options.variant || config.variant === options.variant) &&
    (!options.priority || config.priority === options.priority) &&
    (!options.modelFamily || config.modelFamily === options.modelFamily) &&
    (!options.recommendedDtype || config.recommendedDtype === options.recommendedDtype);

  return matches ? config : undefined;
}

/**
 * Get all model names from the registry
 * @returns Array of all model filenames
 */
export function getAllModelNames(): string[] {
  return Object.keys(MODEL_REGISTRY);
}
