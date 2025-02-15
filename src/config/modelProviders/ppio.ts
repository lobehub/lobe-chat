import { ModelProviderCard } from '@/types/llm';

const PPIO: ModelProviderCard = {
  chatModels: [
    {
      "contextWindowTokens": 64_000,
      "description": "DeepSeek R1是DeepSeek团队发布的最新开源模型，具备非常强悍的推理性能，尤其在数学、编程和推理任务上达到了与OpenAI的o1模型相当的水平。",
      "displayName": "DeepSeek: DeepSeek R1 (community)",
      "enabled": true,
      "id": "deepseek/deepseek-r1/community",
      "pricing": {
        "currency": "CNY",
        "input": 4,
        "output": 16
      }
    },
    {
      "contextWindowTokens": 64_000,
      "description": "DeepSeek-V3在推理速度方面实现了比之前模型的重大突破。在开源模型中排名第一，并可与全球最先进的闭源模型相媲美。DeepSeek-V3 采用了多头潜在注意力 （MLA） 和 DeepSeekMoE 架构，这些架构在 DeepSeek-V2 中得到了全面验证。此外，DeepSeek-V3 开创了一种用于负载均衡的辅助无损策略，并设定了多标记预测训练目标以获得更强的性能。",
      "displayName": "DeepSeek: DeepSeek V3 (community)",
      "enabled": true,
      "id": "deepseek/deepseek-v3/community",
      "pricing": {
        "currency": "CNY",
        "input": 1,
        "output": 2
      }
    },
    {
      "contextWindowTokens": 64_000,
      "description": "DeepSeek R1是DeepSeek团队发布的最新开源模型，具备非常强悍的推理性能，尤其在数学、编程和推理任务上达到了与OpenAI的o1模型相当的水平。",
      "displayName": "DeepSeek R1",
      "enabled": true,
      "id": "deepseek/deepseek-r1",
      "pricing": {
        "currency": "CNY",
        "input": 4,
        "output": 16
      }
    },
    {
      "contextWindowTokens": 64_000,
      "description": "DeepSeek-V3在推理速度方面实现了比之前模型的重大突破。在开源模型中排名第一，并可与全球最先进的闭源模型相媲美。DeepSeek-V3 采用了多头潜在注意力 （MLA） 和 DeepSeekMoE 架构，这些架构在 DeepSeek-V2 中得到了全面验证。此外，DeepSeek-V3 开创了一种用于负载均衡的辅助无损策略，并设定了多标记预测训练目标以获得更强的性能。",
      "displayName": "DeepSeek V3",
      "enabled": true,
      "id": "deepseek/deepseek-v3",
      "pricing": {
        "currency": "CNY",
        "input": 1,
        "output": 2
      }
    },
    {
      "contextWindowTokens": 32_000,
      "description": "DeepSeek R1 Distill Llama 70B是基于Llama3.3  70B的大型语言模型，该模型利用DeepSeek R1输出的微调，实现了与大型前沿模型相当的竞争性能。",
      "displayName": "DeepSeek R1 Distill Llama 70B",
      "enabled": true,
      "id": "deepseek/deepseek-r1-distill-llama-70b",
      "pricing": {
        "currency": "CNY",
        "input": 5.8,
        "output": 5.8
      }
    },
    {
      "contextWindowTokens": 64_000,
      "description": "DeepSeek R1 Distill Qwen 32B 是一种基于 Qwen 2.5 32B 的蒸馏大语言模型，通过使用 DeepSeek R1 的输出进行训练而得。该模型在多个基准测试中超越了 OpenAI 的 o1-mini，取得了密集模型（dense models）的最新技术领先成果（state-of-the-art）。以下是一些基准测试的结果：\nAIME 2024 pass@1: 72.6\nMATH-500 pass@1: 94.3\nCodeForces Rating: 1691\n该模型通过从 DeepSeek R1 的输出中进行微调，展现了与更大规模的前沿模型相当的竞争性能。",
      "displayName": "DeepSeek: DeepSeek R1 Distill Qwen 32B",
      "enabled": true,
      "id": "deepseek/deepseek-r1-distill-qwen-32b",
      "pricing": {
        "currency": "CNY",
        "input": 2.18,
        "output": 2.18
      }
    },
    {
      "contextWindowTokens": 64_000,
      "description": "DeepSeek R1 Distill Qwen 14B 是一种基于 Qwen 2.5 14B 的蒸馏大语言模型，通过使用 DeepSeek R1 的输出进行训练而得。该模型在多个基准测试中超越了 OpenAI 的 o1-mini，取得了密集模型（dense models）的最新技术领先成果（state-of-the-art）。以下是一些基准测试的结果：\nAIME 2024 pass@1: 69.7\nMATH-500 pass@1: 93.9\nCodeForces Rating: 1481\n该模型通过从 DeepSeek R1 的输出中进行微调，展现了与更大规模的前沿模型相当的竞争性能。",
      "displayName": "DeepSeek: DeepSeek R1 Distill Qwen 14B",
      "enabled": true,
      "id": "deepseek/deepseek-r1-distill-qwen-14b",
      "pricing": {
        "currency": "CNY",
        "input": 1,
        "output": 1
      }
    },
    {
      "contextWindowTokens": 32_000,
      "description": "DeepSeek R1 Distill Llama 8B 是一种基于 Llama-3.1-8B-Instruct 的蒸馏大语言模型，通过使用 DeepSeek R1 的输出进行训练而得。",
      "displayName": "DeepSeek: DeepSeek R1 Distill Llama 8B",
      "enabled": true,
      "id": "deepseek/deepseek-r1-distill-llama-8b",
      "pricing": {
        "currency": "CNY",
        "input": 0.3,
        "output": 0.3
      }
    },
    {
      "contextWindowTokens": 32_768,
      "description": "Qwen2.5-72B-Instruct 是阿里云发布的最新大语言模型系列之一。该 72B 模型在编码和数学等领域具有显著改进的能力。该模型还提供了多语言支持，覆盖超过 29 种语言，包括中文、英文等。模型在指令跟随、理解结构化数据以及生成结构化输出（尤其是 JSON）方面都有显著提升。",
      "displayName": "qwen/qwen-2.5-72b-instruct",
      "enabled": true,
      "id": "qwen/qwen-2.5-72b-instruct",
      "pricing": {
        "currency": "CNY",
        "input": 2.75,
        "output": 2.88
      }
    },
    {
      "contextWindowTokens": 32_768,
      "description": "Qwen2-VL 是 Qwen-VL 模型的最新迭代版本，在视觉理解基准测试中达到了最先进的性能，包括 MathVista、DocVQA、RealWorldQA 和 MTVQA 等。Qwen2-VL 能够理解超过 20 分钟的视频，用于高质量的基于视频的问答、对话和内容创作。它还具备复杂推理和决策能力，可以与移动设备、机器人等集成，基于视觉环境和文本指令进行自动操作。除了英语和中文，Qwen2-VL 现在还支持理解图像中不同语言的文本，包括大多数欧洲语言、日语、韩语、阿拉伯语和越南语等",
      "displayName": "qwen/qwen-2-vl-72b-instruct",
      "enabled": true,
      "id": "qwen/qwen-2-vl-72b-instruct",
      "pricing": {
        "currency": "CNY",
        "input": 4.5,
        "output": 4.5
      }
    },
    {
      "contextWindowTokens": 32_768,
      "description": "meta-llama/llama-3.2-3b-instruct",
      "displayName": "meta-llama/llama-3.2-3b-instruct",
      "enabled": true,
      "id": "meta-llama/llama-3.2-3b-instruct",
      "pricing": {
        "currency": "CNY",
        "input": 0.216,
        "output": 0.36
      }
    },
    {
      "contextWindowTokens": 32_000,
      "description": "Qwen2.5-32B-Instruct 是阿里云发布的最新大语言模型系列之一。该 32B 模型在编码和数学等领域具有显著改进的能力。该模型提供了多语言支持，覆盖超过 29 种语言，包括中文、英文等。模型在指令跟随、理解结构化数据以及生成结构化输出（尤其是 JSON）方面都有显著提升。",
      "displayName": "qwen/qwen2.5-32b-instruct",
      "enabled": true,
      "id": "qwen/qwen2.5-32b-instruct",
      "pricing": {
        "currency": "CNY",
        "input": 1.26,
        "output": 1.26
      }
    },
    {
      "contextWindowTokens": 14_336,
      "description": "Baichuan-13B 百川智能开发的包含 130 亿参数的开源可商用的大规模语言模型，在权威的中文和英文 benchmark 上均取得同尺寸最好的效果",
      "displayName": "baichuan/baichuan2-13b-chat",
      "enabled": true,
      "id": "baichuan/baichuan2-13b-chat",
      "pricing": {
        "currency": "CNY",
        "input": 1.75,
        "output": 1.75
      }
    },
    {
      "contextWindowTokens": 32_768,
      "description": "Meta最新一代的Llama 3.1模型系列，70B（700亿参数）的指令微调版本针对高质量对话场景进行了优化。在业界评估中，与领先的闭源模型相比，它展现出了强劲的性能。(仅针对企业实名认证通过主体开放）",
      "displayName": "meta-llama/llama-3.1-70b-instruct",
      "enabled": true,
      "id": "meta-llama/llama-3.1-70b-instruct",
      "pricing": {
        "currency": "CNY",
        "input": 2.45,
        "output": 2.82
      }
    },
    {
      "contextWindowTokens": 32_768,
      "description": "Meta最新一代的Llama 3.1模型系列，8B（80亿参数）的指令微调版本特别快速高效。在业界评估中，表现出强劲的性能，超越了很多领先的闭源模型。(仅针对企业实名认证通过主体开放）",
      "displayName": "meta-llama/llama-3.1-8b-instruct",
      "enabled": true,
      "id": "meta-llama/llama-3.1-8b-instruct",
      "pricing": {
        "currency": "CNY",
        "input": 0.4,
        "output": 0.4
      }
    },
    {
      "contextWindowTokens": 16_384,
      "description": "零一万物，最新开源微调模型，340亿参数，微调支持多种对话场景，高质量训练数据，对齐人类偏好。",
      "displayName": "01-ai/yi-1.5-34b-chat",
      "enabled": true,
      "id": "01-ai/yi-1.5-34b-chat",
      "pricing": {
        "currency": "CNY",
        "input": 1.1,
        "output": 1.1
      }
    },
    {
      "contextWindowTokens": 16_384,
      "description": "零一万物，最新开源微调模型，90亿参数，微调支持多种对话场景，高质量训练数据，对齐人类偏好。",
      "displayName": "01-ai/yi-1.5-9b-chat",
      "enabled": true,
      "id": "01-ai/yi-1.5-9b-chat",
      "pricing": {
        "currency": "CNY",
        "input": 0.4,
        "output": 0.4
      }
    },
    {
      "contextWindowTokens": 32_768,
      "description": "智谱AI发布的GLM-4系列最新一代预训练模型的开源版本。",
      "displayName": "thudm/glm-4-9b-chat",
      "enabled": true,
      "id": "thudm/glm-4-9b-chat",
      "pricing": {
        "currency": "CNY",
        "input": 0.5,
        "output": 0.5
      }
    },
    {
      "contextWindowTokens": 32_768,
      "description": "Qwen2是全新的Qwen大型语言模型系列。Qwen2 7B是一个基于transformer的模型，在语言理解、多语言能力、编程、数学和推理方面表现出色。",
      "displayName": "qwen/qwen-2-7b-instruct",
      "enabled": true,
      "id": "qwen/qwen-2-7b-instruct",
      "pricing": {
        "currency": "CNY",
        "input": 0.32,
        "output": 0.32
      }
    }
  ], // Will be updated with model list
  checkModel: 'deepseek/deepseek-r1-distill-qwen-32b',
  description: 'PPIO 派欧云提供稳定、高性价比的开源模型 API 服务，支持 DeepSeek 全系列、Llama、Qwen 等行业领先大模型。',
  disableBrowserRequest: true,
  id: 'ppio',
  modelList: { showModelFetcher: true },
  modelsUrl: 'https://ppinfra.com/llm-api?utm_source=github_lobe-chat&utm_medium=github_readme&utm_campaign=link',
  name: 'PPIO',
  settings: {
    disableBrowserRequest: true,
    sdkType: 'openai',
    showModelFetcher: true,
  },
  url: 'https://ppinfra.com/?utm_source=github_lobe-chat&utm_medium=github_readme&utm_campaign=link',
};

export default PPIO; 