<div align="center"><a name="readme-top"></a>

[![][image-banner]][vercel-link]

<h1>Lobe Chat</h1>

现代化设计的开源 ChatGPT/LLMs 聊天应用与开发框架<br/>
支持语音合成、多模态、可扩展的（[function call][docs-functionc-call]）插件系统<br/>
一键**免费**拥有你自己的 ChatGPT/Gemini/Claude/Ollama 应用

[English](./README.md) · **简体中文** · [日本語](./README.ja-JP.md) · [官网][official-site] · [更新日志][changelog] · [文档][docs] · [博客][blog] · [反馈问题][github-issues-link]

<!-- SHIELD GROUP -->

[![][github-release-shield]][github-release-link]
[![][docker-release-shield]][docker-release-link]
[![][vercel-shield]][vercel-link]
[![][discord-shield]][discord-link]<br/>
[![][codecov-shield]][codecov-link]
[![][github-action-test-shield]][github-action-test-link]
[![][github-action-release-shield]][github-action-release-link]
[![][github-releasedate-shield]][github-releasedate-link]<br/>
[![][github-contributors-shield]][github-contributors-link]
[![][github-forks-shield]][github-forks-link]
[![][github-stars-shield]][github-stars-link]
[![][github-issues-shield]][github-issues-link]
[![][github-license-shield]][github-license-link]<br>
[![][sponsor-shield]][sponsor-link]

**分享 LobeChat 给你的好友**

[![][share-x-shield]][share-x-link]
[![][share-telegram-shield]][share-telegram-link]
[![][share-whatsapp-shield]][share-whatsapp-link]
[![][share-reddit-shield]][share-reddit-link]
[![][share-weibo-shield]][share-weibo-link]
[![][share-mastodon-shield]][share-mastodon-link]

<sup>探索私人生产力的未来。在个体崛起的时代中为你打造.</sup>

[![][github-trending-shield]][github-trending-url]
[![][github-hello-shield]][github-hello-url]

[![][image-overview]][vercel-link]

</div>

<details>
<summary><kbd>目录树</kbd></summary>

#### TOC

- [👋🏻 开始使用 & 交流](#-开始使用--交流)
- [✨ 特性一览](#-特性一览)
  - [`1` 文件上传 / 知识库](#1-文件上传--知识库)
  - [`2` 多模型服务商支持](#2-多模型服务商支持)
  - [`3` 支持本地大语言模型 (LLM)](#3-支持本地大语言模型-llm)
  - [`4` 模型视觉识别 (Model Visual)](#4-模型视觉识别-model-visual)
  - [`5` TTS & STT 语音会话](#5-tts--stt-语音会话)
  - [`6` Text to Image 文生图](#6-text-to-image-文生图)
  - [`7` 插件系统 (Tools Calling)](#7-插件系统-tools-calling)
  - [`8` 助手市场 (GPTs)](#8-助手市场-gpts)
  - [`9` 支持本地 / 远程数据库](#9-支持本地--远程数据库)
  - [`10` 支持多用户管理](#10-支持多用户管理)
  - [`11` 渐进式 Web 应用 (PWA)](#11-渐进式-web-应用-pwa)
  - [`12` 移动设备适配](#12-移动设备适配)
  - [`13` 自定义主题](#13-自定义主题)
  - [更多特性](#更多特性)
- [⚡️ 性能测试](#️-性能测试)
- [🛳 开箱即用](#-开箱即用)
  - [`A` 使用 Vercel、Zeabur 、Sealos 或 阿里云计算巢 部署](#a-使用-vercelzeabur-sealos-或-阿里云计算巢-部署)
  - [`B` 使用 Docker 部署](#b-使用-docker-部署)
  - [环境变量](#环境变量)
  - [获取 OpenAI API Key](#获取-openai-api-key)
- [📦 生态系统](#-生态系统)
- [🧩 插件体系](#-插件体系)
- [⌨️ 本地开发](#️-本地开发)
- [🤝 参与贡献](#-参与贡献)
- [❤ 社区赞助](#-社区赞助)
- [🔗 更多工具](#-更多工具)

####

<br/>

</details>

## 👋🏻 开始使用 & 交流

我们是一群充满热情的设计工程师，希望为 AIGC 提供现代化的设计组件和工具，并以开源的方式分享。
同时通过 Bootstrapping 的方式，我们希望能够为开发者和用户提供一个更加开放、更加透明友好的产品生态。

不论普通用户与专业开发者，LobeHub 旨在成为所有人的 AI Agent 实验场。LobeChat 目前正在积极开发中，有任何需求或者问题，欢迎提交 [issues][issues-link]

| [![][vercel-shield-badge]][vercel-link]   | 无需安装或注册！访问我们的网站，快速体验                                     |
| :---------------------------------------- | :--------------------------------------------------------------------------- |
| [![][discord-shield-badge]][discord-link] | 加入我们的 Discord 社区！这是你可以与开发者和其他 LobeHub 热衷用户交流的地方 |

> \[!IMPORTANT]
>
> **收藏项目**，你将从 GitHub 上无延迟地接收所有发布通知～⭐️

[![][image-star]][github-stars-link]

<details><summary><kbd>Star History</kbd></summary>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=lobehub%2Flobe-chat&theme=dark&type=Date">
    <img src="https://api.star-history.com/svg?repos=lobehub%2Flobe-chat&type=Date">
  </picture>
</details>

## ✨ 特性一览

[![][image-feat-knowledgebase]][docs-feat-knowledgebase]

### `1` [文件上传 / 知识库][docs-feat-knowledgebase]

LobeChat 支持文件上传与知识库功能，你可以上传文件、图片、音频、视频等多种类型的文件，以及创建知识库，方便用户管理和查找文件。同时在对话中使用文件和知识库功能，实现更加丰富的对话体验。

<https://github.com/user-attachments/assets/faa8cf67-e743-4590-8bf6-ebf6ccc34175>

> \[!TIP]
>
> 查阅 [📘 LobeChat 知识库上线 —— 此刻起，跬步千里](https://lobehub.com/zh/blog/knowledge-base) 了解详情。

<div align="right">

[![][back-to-top]](#readme-top)

</div>

[![][image-feat-privoder]][docs-feat-provider]

### `2` [多模型服务商支持][docs-feat-provider]

在 LobeChat 的不断发展过程中，我们深刻理解到在提供 AI 会话服务时模型服务商的多样性对于满足社区需求的重要性。因此，我们不再局限于单一的模型服务商，而是拓展了对多种模型服务商的支持，以便为用户提供更为丰富和多样化的会话选择。

通过这种方式，LobeChat 能够更灵活地适应不同用户的需求，同时也为开发者提供了更为广泛的选择空间。

#### 已支持的模型服务商

我们已经实现了对以下模型服务商的支持：

<!-- PROVIDER LIST -->

- **[OpenAI](https://lobechat.com/discover/provider/openai)**: OpenAI 是全球领先的人工智能研究机构，其开发的模型如 GPT 系列推动了自然语言处理的前沿。OpenAI 致力于通过创新和高效的 AI 解决方案改变多个行业。他们的产品具有显著的性能和经济性，广泛用于研究、商业和创新应用。
- **[Ollama](https://lobechat.com/discover/provider/ollama)**: Ollama 提供的模型广泛涵盖代码生成、数学运算、多语种处理和对话互动等领域，支持企业级和本地化部署的多样化需求。
- **[Anthropic](https://lobechat.com/discover/provider/anthropic)**: Anthropic 是一家专注于人工智能研究和开发的公司，提供了一系列先进的语言模型，如 Claude 3.5 Sonnet、Claude 3 Sonnet、Claude 3 Opus 和 Claude 3 Haiku。这些模型在智能、速度和成本之间取得了理想的平衡，适用于从企业级工作负载到快速响应的各种应用场景。Claude 3.5 Sonnet 作为其最新模型，在多项评估中表现优异，同时保持了较高的性价比。
- **[Bedrock](https://lobechat.com/discover/provider/bedrock)**: Bedrock 是亚马逊 AWS 提供的一项服务，专注于为企业提供先进的 AI 语言模型和视觉模型。其模型家族包括 Anthropic 的 Claude 系列、Meta 的 Llama 3.1 系列等，涵盖从轻量级到高性能的多种选择，支持文本生成、对话、图像处理等多种任务，适用于不同规模和需求的企业应用。
- **[Google](https://lobechat.com/discover/provider/google)**: Google 的 Gemini 系列是其最先进、通用的 AI 模型，由 Google DeepMind 打造，专为多模态设计，支持文本、代码、图像、音频和视频的无缝理解与处理。适用于从数据中心到移动设备的多种环境，极大提升了 AI 模型的效率与应用广泛性。
- **[DeepSeek](https://lobechat.com/discover/provider/deepseek)**: DeepSeek 是一家专注于人工智能技术研究和应用的公司，其最新模型 DeepSeek-V2.5 融合了通用对话和代码处理能力，并在人类偏好对齐、写作任务和指令跟随等方面实现了显著提升。
- **[HuggingFace](https://lobechat.com/discover/provider/huggingface)**: HuggingFace Inference API 提供了一种快速且免费的方式，让您可以探索成千上万种模型，适用于各种任务。无论您是在为新应用程序进行原型设计，还是在尝试机器学习的功能，这个 API 都能让您即时访问多个领域的高性能模型。
- **[OpenRouter](https://lobechat.com/discover/provider/openrouter)**: OpenRouter 是一个提供多种前沿大模型接口的服务平台，支持 OpenAI、Anthropic、LLaMA 及更多，适合多样化的开发和应用需求。用户可根据自身需求灵活选择最优的模型和价格，助力 AI 体验的提升。
- **[Cloudflare Workers AI](https://lobechat.com/discover/provider/cloudflare)**: 在 Cloudflare 的全球网络上运行由无服务器 GPU 驱动的机器学习模型。
- **[GitHub](https://lobechat.com/discover/provider/github)**: 通过 GitHub 模型，开发人员可以成为 AI 工程师，并使用行业领先的 AI 模型进行构建。

<details><summary><kbd>See more providers (+26)</kbd></summary>

- **[Novita](https://lobechat.com/discover/provider/novita)**: Novita AI 是一个提供多种大语言模型与 AI 图像生成的 API 服务的平台，灵活、可靠且具有成本效益。它支持 Llama3、Mistral 等最新的开源模型，并为生成式 AI 应用开发提供了全面、用户友好且自动扩展的 API 解决方案，适合 AI 初创公司的快速发展。
- **[Together AI](https://lobechat.com/discover/provider/togetherai)**: Together AI 致力于通过创新的 AI 模型实现领先的性能，提供广泛的自定义能力，包括快速扩展支持和直观的部署流程，满足企业的各种需求。
- **[Fireworks AI](https://lobechat.com/discover/provider/fireworksai)**: Fireworks AI 是一家领先的高级语言模型服务商，专注于功能调用和多模态处理。其最新模型 Firefunction V2 基于 Llama-3，优化用于函数调用、对话及指令跟随。视觉语言模型 FireLLaVA-13B 支持图像和文本混合输入。其他 notable 模型包括 Llama 系列和 Mixtral 系列，提供高效的多语言指令跟随与生成支持。
- **[Groq](https://lobechat.com/discover/provider/groq)**: Groq 的 LPU 推理引擎在最新的独立大语言模型（LLM）基准测试中表现卓越，以其惊人的速度和效率重新定义了 AI 解决方案的标准。Groq 是一种即时推理速度的代表，在基于云的部署中展现了良好的性能。
- **[Perplexity](https://lobechat.com/discover/provider/perplexity)**: Perplexity 是一家领先的对话生成模型提供商，提供多种先进的 Llama 3.1 模型，支持在线和离线应用，特别适用于复杂的自然语言处理任务。
- **[Mistral](https://lobechat.com/discover/provider/mistral)**: Mistral 提供先进的通用、专业和研究型模型，广泛应用于复杂推理、多语言任务、代码生成等领域，通过功能调用接口，用户可以集成自定义功能，实现特定应用。
- **[Ai21Labs](https://lobechat.com/discover/provider/ai21)**: AI21 Labs 为企业构建基础模型和人工智能系统，加速生成性人工智能在生产中的应用。
- **[Upstage](https://lobechat.com/discover/provider/upstage)**: Upstage 专注于为各种商业需求开发 AI 模型，包括 Solar LLM 和文档 AI，旨在实现工作的人造通用智能（AGI）。通过 Chat API 创建简单的对话代理，并支持功能调用、翻译、嵌入以及特定领域应用。
- **[xAI](https://lobechat.com/discover/provider/xai)**: xAI 是一家致力于构建人工智能以加速人类科学发现的公司。我们的使命是推动我们对宇宙的共同理解。
- **[Qwen](https://lobechat.com/discover/provider/qwen)**: 通义千问是阿里云自主研发的超大规模语言模型，具有强大的自然语言理解和生成能力。它可以回答各种问题、创作文字内容、表达观点看法、撰写代码等，在多个领域发挥作用。
- **[Wenxin](https://lobechat.com/discover/provider/wenxin)**: 企业级一站式大模型与 AI 原生应用开发及服务平台，提供最全面易用的生成式人工智能模型开发、应用开发全流程工具链
- **[Hunyuan](https://lobechat.com/discover/provider/hunyuan)**: 由腾讯研发的大语言模型，具备强大的中文创作能力，复杂语境下的逻辑推理能力，以及可靠的任务执行能力
- **[Spark](https://lobechat.com/discover/provider/spark)**: 科大讯飞星火大模型提供多领域、多语言的强大 AI 能力，利用先进的自然语言处理技术，构建适用于智能硬件、智慧医疗、智慧金融等多种垂直场景的创新应用。
- **[ZhiPu](https://lobechat.com/discover/provider/zhipu)**: 智谱 AI 提供多模态与语言模型的开放平台，支持广泛的 AI 应用场景，包括文本处理、图像理解与编程辅助等。
- **[01.AI](https://lobechat.com/discover/provider/zeroone)**: 零一万物致力于推动以人为本的 AI 2.0 技术革命，旨在通过大语言模型创造巨大的经济和社会价值，并开创新的 AI 生态与商业模式。
- **[SenseNova](https://lobechat.com/discover/provider/sensenova)**: 商汤日日新，依托商汤大装置的强大的基础支撑，提供高效易用的全栈大模型服务。
- **[Stepfun](https://lobechat.com/discover/provider/stepfun)**: 阶级星辰大模型具备行业领先的多模态及复杂推理能力，支持超长文本理解和强大的自主调度搜索引擎功能。
- **[Moonshot](https://lobechat.com/discover/provider/moonshot)**: Moonshot 是由北京月之暗面科技有限公司推出的开源平台，提供多种自然语言处理模型，应用领域广泛，包括但不限于内容创作、学术研究、智能推荐、医疗诊断等，支持长文本处理和复杂生成任务。
- **[Baichuan](https://lobechat.com/discover/provider/baichuan)**: 百川智能是一家专注于人工智能大模型研发的公司，其模型在国内知识百科、长文本处理和生成创作等中文任务上表现卓越，超越了国外主流模型。百川智能还具备行业领先的多模态能力，在多项权威评测中表现优异。其模型包括 Baichuan 4、Baichuan 3 Turbo 和 Baichuan 3 Turbo 128k 等，分别针对不同应用场景进行优化，提供高性价比的解决方案。
- **[Minimax](https://lobechat.com/discover/provider/minimax)**: MiniMax 是 2021 年成立的通用人工智能科技公司，致力于与用户共创智能。MiniMax 自主研发了不同模态的通用大模型，其中包括万亿参数的 MoE 文本大模型、语音大模型以及图像大模型。并推出了海螺 AI 等应用。
- **[360 AI](https://lobechat.com/discover/provider/ai360)**: 360 AI 是 360 公司推出的 AI 模型和服务平台，提供多种先进的自然语言处理模型，包括 360GPT2 Pro、360GPT Pro、360GPT Turbo 和 360GPT Turbo Responsibility 8K。这些模型结合了大规模参数和多模态能力，广泛应用于文本生成、语义理解、对话系统与代码生成等领域。通过灵活的定价策略，360 AI 满足多样化用户需求，支持开发者集成，推动智能化应用的革新和发展。
- **[Taichu](https://lobechat.com/discover/provider/taichu)**: 中科院自动化研究所和武汉人工智能研究院推出新一代多模态大模型，支持多轮问答、文本创作、图像生成、3D 理解、信号分析等全面问答任务，拥有更强的认知、理解、创作能力，带来全新互动体验。
- **[InternLM](https://lobechat.com/discover/provider/internlm)**: 致力于大模型研究与开发工具链的开源组织。为所有 AI 开发者提供高效、易用的开源平台，让最前沿的大模型与算法技术触手可及
- **[SiliconCloud](https://lobechat.com/discover/provider/siliconcloud)**: SiliconCloud，基于优秀开源基础模型的高性价比 GenAI 云服务
- **[Higress](https://lobechat.com/discover/provider/higress)**: Higress 是一款云原生 API 网关，在阿里内部为解决 Tengine reload 对长连接业务有损，以及 gRPC/Dubbo 负载均衡能力不足而诞生。
- **[Gitee AI](https://lobechat.com/discover/provider/giteeai)**: Gitee AI 的 Serverless API 为 AI 开发者提供开箱即用的大模型推理 API 服务。

</details>

> 📊 Total providers: [<kbd>**36**</kbd>](https://lobechat.com/discover/providers)

 <!-- PROVIDER LIST -->

同时，我们也在计划支持更多的模型服务商，以进一步丰富我们的服务商库。如果你希望让 LobeChat 支持你喜爱的服务商，欢迎加入我们的 [💬 社区讨论](https://github.com/lobehub/lobe-chat/discussions/1284)。

<div align="right">

[![][back-to-top]](#readme-top)

</div>

[![][image-feat-local]][docs-feat-local]

### `3` [支持本地大语言模型 (LLM)][docs-feat-local]

为了满足特定用户的需求，LobeChat 还基于 [Ollama](https://ollama.ai) 支持了本地模型的使用，让用户能够更灵活地使用自己的或第三方的模型。

> \[!TIP]
>
> 查阅 [📘 在 LobeChat 中使用 Ollama][docs-usage-ollama] 获得更多信息

<div align="right">

[![][back-to-top]](#readme-top)

</div>

[![][image-feat-vision]][docs-feat-vision]

### `4` [模型视觉识别 (Model Visual)][docs-feat-vision]

LobeChat 已经支持 OpenAI 最新的 [`gpt-4-vision`](https://platform.openai.com/docs/guides/vision) 支持视觉识别的模型，这是一个具备视觉识别能力的多模态应用。
用户可以轻松上传图片或者拖拽图片到对话框中，助手将能够识别图片内容，并在此基础上进行智能对话，构建更智能、更多元化的聊天场景。

这一特性打开了新的互动方式，使得交流不再局限于文字，而是可以涵盖丰富的视觉元素。无论是日常使用中的图片分享，还是在特定行业内的图像解读，助手都能提供出色的对话体验。

<div align="right">

[![][back-to-top]](#readme-top)

</div>

[![][image-feat-tts]][docs-feat-tts]

### `5` [TTS & STT 语音会话][docs-feat-tts]

LobeChat 支持文字转语音（Text-to-Speech，TTS）和语音转文字（Speech-to-Text，STT）技术，这使得我们的应用能够将文本信息转化为清晰的语音输出，用户可以像与真人交谈一样与我们的对话助手进行交流。
用户可以从多种声音中选择，给助手搭配合适的音源。 同时，对于那些倾向于听觉学习或者想要在忙碌中获取信息的用户来说，TTS 提供了一个极佳的解决方案。

在 LobeChat 中，我们精心挑选了一系列高品质的声音选项 (OpenAI Audio, Microsoft Edge Speech)，以满足不同地域和文化背景用户的需求。用户可以根据个人喜好或者特定场景来选择合适的语音，从而获得个性化的交流体验。

<div align="right">

[![][back-to-top]](#readme-top)

</div>

[![][image-feat-t2i]][docs-feat-t2i]

### `6` [Text to Image 文生图][docs-feat-t2i]

支持最新的文本到图片生成技术，LobeChat 现在能够让用户在与助手对话中直接调用文生图工具进行创作。
通过利用 [`DALL-E 3`](https://openai.com/dall-e-3)、[`MidJourney`](https://www.midjourney.com/) 和 [`Pollinations`](https://pollinations.ai/) 等 AI 工具的能力， 助手们现在可以将你的想法转化为图像。
同时可以更私密和沉浸式地完成你的创作过程。

<div align="right">

[![][back-to-top]](#readme-top)

</div>

[![][image-feat-plugin]][docs-feat-plugin]

### `7` [插件系统 (Tools Calling)][docs-feat-plugin]

LobeChat 的插件生态系统是其核心功能的重要扩展，它极大地增强了 ChatGPT 的实用性和灵活性。

<video controls src="https://github.com/lobehub/lobe-chat/assets/28616219/f29475a3-f346-4196-a435-41a6373ab9e2" muted="false"></video>

通过利用插件，ChatGPT 能够实现实时信息的获取和处理，例如自动获取最新新闻头条，为用户提供即时且相关的资讯。

此外，这些插件不仅局限于新闻聚合，还可以扩展到其他实用的功能，如快速检索文档、生成图象、获取电商平台数据，以及其他各式各样的第三方服务。

> 通过文档了解更多 [📘 插件使用][docs-usage-plugin]

<!-- PLUGIN LIST -->

| 最近新增                                                                                                                     | 描述                                                                                                               |
| ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| [谷歌自定义搜索引擎](https://lobechat.com/discover/plugin/google-cse)<br/><sup>By **vsnthdev** on **2024-12-02**</sup>       | 通过他们的官方自定义搜索引擎 API 搜索谷歌。<br/>`网络` `搜索`                                                      |
| [Speak](https://lobechat.com/discover/plugin/speak)<br/><sup>By **speak** on **2024-12-02**</sup>                            | 使用 Speak，您的 AI 语言导师，学习如何用另一种语言说任何事情。<br/>`教育` `语言`                                   |
| [通义万象图像生成器](https://lobechat.com/discover/plugin/alps-tongyi-image)<br/><sup>By **YoungTx** on **2024-08-09**</sup> | 此插件使用阿里巴巴的通义万象模型根据文本提示生成图像。<br/>`图像` `通义` `万象`                                    |
| [购物工具](https://lobechat.com/discover/plugin/ShoppingTools)<br/><sup>By **shoppingtools** on **2024-07-19**</sup>         | 在 eBay 和 AliExpress 上搜索产品，查找 eBay 活动和优惠券。获取快速示例。<br/>`购物` `e-bay` `ali-express` `优惠券` |

> 📊 Total plugins: [<kbd>**48**</kbd>](https://lobechat.com/discover/plugins)

 <!-- PLUGIN LIST -->

<div align="right">

[![][back-to-top]](#readme-top)

</div>

[![][image-feat-agent]][docs-feat-agent]

### `8` [助手市场 (GPTs)][docs-feat-agent]

在 LobeChat 的助手市场中，创作者们可以发现一个充满活力和创新的社区，它汇聚了众多精心设计的助手，这些助手不仅在工作场景中发挥着重要作用，也在学习过程中提供了极大的便利。
我们的市场不仅是一个展示平台，更是一个协作的空间。在这里，每个人都可以贡献自己的智慧，分享个人开发的助手。

> \[!TIP]
>
> 通过 [🤖/🏪 提交助手][submit-agents-link] ，你可以轻松地将你的助手作品提交到我们的平台。我们特别强调的是，LobeChat 建立了一套精密的自动化国际化（i18n）工作流程， 它的强大之处在于能够无缝地将你的助手转化为多种语言版本。
> 这意味着，不论你的用户使用何种语言，他们都能无障碍地体验到你的助手。

> \[!IMPORTANT]
>
> 我欢迎所有用户加入这个不断成长的生态系统，共同参与到助手的迭代与优化中来。共同创造出更多有趣、实用且具有创新性的助手，进一步丰富助手的多样性和实用性。

<!-- AGENT LIST -->

| 最近新增                                                                                                                                                                | 描述                                                                                      |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| [系统指令专家](https://lobechat.com/discover/assistant/instructer)<br/><sup>By **[yuyun2000](https://github.com/yuyun2000)** on **2024-12-04**</sup>                    | 擅长精炼与生成高效系统指令<br/>`系统指令` `写作` `细节优化` `用户需求`                    |
| [日语帮助记忆师](https://lobechat.com/discover/assistant/japan-language-helper)<br/><sup>By **[sharkbear212](https://github.com/sharkbear212)** on **2024-12-04**</sup> | 擅长日语五十音，平假名，片假名，单词和短语解释与记忆技巧<br/>`解释` `记忆技巧` `日语教学` |
| [诗词卡片设计师](https://lobechat.com/discover/assistant/poetry-card-designer)<br/><sup>By **[lianxin255](https://github.com/lianxin255)** on **2024-12-03**</sup>      | 擅长设计诗词卡片，提升艺术感与吸引力<br/>`诗词卡片设计` `卡片` `创意` `艺术表现`          |
| [日常医生](https://lobechat.com/discover/assistant/yunchat-docter)<br/><sup>By **[yuyun2000](https://github.com/yuyun2000)** on **2024-11-30**</sup>                    | 擅长外科诊疗与个性化健康管理<br/>`全科医学` `外科` `健康咨询` `个性化治疗` `医学教育`     |

> 📊 Total agents: [<kbd>**453**</kbd> ](https://lobechat.com/discover/assistants)

 <!-- AGENT LIST -->

<div align="right">

[![][back-to-top]](#readme-top)

</div>

[![][image-feat-database]][docs-feat-database]

### `9` [支持本地 / 远程数据库][docs-feat-database]

LobeChat 支持同时使用服务端数据库和本地数据库。根据您的需求，您可以选择合适的部署方案：

- 本地数据库：适合希望对数据有更多掌控感和隐私保护的用户。LobeChat 采用了 CRDT (Conflict-Free Replicated Data Type) 技术，实现了多端同步功能。这是一项实验性功能，旨在提供无缝的数据同步体验。
- 服务端数据库：适合希望更便捷使用体验的用户。LobeChat 支持 PostgreSQL 作为服务端数据库。关于如何配置服务端数据库的详细文档，请前往 [配置服务端数据库](https://lobehub.com/zh/docs/self-hosting/advanced/server-database)。

无论您选择哪种数据库，LobeChat 都能为您提供卓越的用户体验。

<div align="right">

[![][back-to-top]](#readme-top)

</div>

[![][image-feat-auth]][docs-feat-auth]

### `10` [支持多用户管理][docs-feat-auth]

LobeChat 支持多用户管理，提供了两种主要的用户认证和管理方案，以满足不同需求：

- **next-auth**：LobeChat 集成了 `next-auth`，一个灵活且强大的身份验证库，支持多种身份验证方式，包括 OAuth、邮件登录、凭证登录等。通过 `next-auth`，您可以轻松实现用户的注册、登录、会话管理以及社交登录等功能，确保用户数据的安全性和隐私性。

- [**Clerk**](https://go.clerk.com/exgqLG0)：对于需要更高级用户管理功能的用户，LobeChat 还支持 `Clerk`，一个现代化的用户管理平台。`Clerk` 提供了更丰富的功能，如多因素认证 (MFA)、白名单、用户管理、登录活动监控等。通过 `Clerk`，您可以获得更高的安全性和灵活性，轻松应对生产级的用户管理需求。

您可以根据自己的需求，选择合适的用户管理方案。

<div align="right">

[![][back-to-top]](#readme-top)

</div>

[![][image-feat-pwa]][docs-feat-pwa]

### `11` [渐进式 Web 应用 (PWA)][docs-feat-pwa]

我们深知在当今多设备环境下为用户提供无缝体验的重要性。为此，我们采用了渐进式 Web 应用 [PWA](https://support.google.com/chrome/answer/9658361) 技术，
这是一种能够将网页应用提升至接近原生应用体验的现代 Web 技术。通过 PWA，LobeChat 能够在桌面和移动设备上提供高度优化的用户体验，同时保持轻量级和高性能的特点。
在视觉和感觉上，我们也经过精心设计，以确保它的界面与原生应用无差别，提供流畅的动画、响应式布局和适配不同设备的屏幕分辨率。

> \[!NOTE]
>
> 若您未熟悉 PWA 的安装过程，您可以按照以下步骤将 LobeChat 添加为您的桌面应用（也适用于移动设备）：
>
> - 在电脑上运行 Chrome 或 Edge 浏览器 .
> - 访问 LobeChat 网页 .
> - 在地址栏的右上角，单击 <kbd>安装</kbd> 图标 .
> - 根据屏幕上的指示完成 PWA 的安装 .

<div align="right">

[![][back-to-top]](#readme-top)

</div>

[![][image-feat-mobile]][docs-feat-mobile]

### `12` [移动设备适配][docs-feat-mobile]

针对移动设备进行了一系列的优化设计，以提升用户的移动体验。目前，我们正在对移动端的用户体验进行版本迭代，以实现更加流畅和直观的交互。如果您有任何建议或想法，我们非常欢迎您通过 GitHub Issues 或者 Pull Requests 提供反馈。

<div align="right">

[![][back-to-top]](#readme-top)

</div>

[![][image-feat-theme]][docs-feat-theme]

### `13` [自定义主题][docs-feat-theme]

作为设计工程师出身，LobeChat 在界面设计上充分考虑用户的个性化体验，因此引入了灵活多变的主题模式，其中包括日间的亮色模式和夜间的深色模式。
除了主题模式的切换，还提供了一系列的颜色定制选项，允许用户根据自己的喜好来调整应用的主题色彩。无论是想要沉稳的深蓝，还是希望活泼的桃粉，或者是专业的灰白，用户都能够在 LobeChat 中找到匹配自己风格的颜色选择。

> \[!TIP]
>
> 默认配置能够智能地识别用户系统的颜色模式，自动进行主题切换，以确保应用界面与操作系统保持一致的视觉体验。对于喜欢手动调控细节的用户，LobeChat 同样提供了直观的设置选项，针对聊天场景也提供了对话气泡模式和文档模式的选择。

<div align="right">

[![][back-to-top]](#readme-top)

</div>

### 更多特性

除了上述功能特性以外，LobeChat 所具有的设计和技术能力将为你带来更多使用保障：

- [x] 💎 **精致 UI 设计**：经过精心设计的界面，具有优雅的外观和流畅的交互效果，支持亮暗色主题，适配移动端。支持 PWA，提供更加接近原生应用的体验。
- [x] 🗣️ **流畅的对话体验**：流式响应带来流畅的对话体验，并且支持完整的 Markdown 渲染，包括代码高亮、LaTex 公式、Mermaid 流程图等。
- [x] 💨 **快速部署**：使用 Vercel 平台或者我们的 Docker 镜像，只需点击一键部署按钮，即可在 1 分钟内完成部署，无需复杂的配置过程。
- [x] 🔒 **隐私安全**：所有数据保存在用户浏览器本地，保证用户的隐私安全。
- [x] 🌐 **自定义域名**：如果用户拥有自己的域名，可以将其绑定到平台上，方便在任何地方快速访问对话助手。

> ✨ 随着产品迭代持续更新，我们将会带来更多更多令人激动的功能！

---

> \[!NOTE]
>
> 你可以在 Projects 中找到我们后续的 [Roadmap][github-project-link] 计划

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## ⚡️ 性能测试

> \[!NOTE]
>
> 完整测试报告可见 [📘 Lighthouse 性能测试][docs-lighthouse]

|                    Desktop                    |                    Mobile                    |
| :-------------------------------------------: | :------------------------------------------: |
|               ![][chat-desktop]               |               ![][chat-mobile]               |
| [📑 Lighthouse 测试报告][chat-desktop-report] | [📑 Lighthouse 测试报告][chat-mobile-report] |

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🛳 开箱即用

LobeChat 提供了 Vercel 的 自托管版本 和 [Docker 镜像][docker-release-link]，这使你可以在几分钟内构建自己的聊天机器人，无需任何基础知识。

> \[!TIP]
>
> 完整教程请查阅 [📘 构建属于自己的 Lobe Chat][docs-self-hosting]

### `A` 使用 Vercel、Zeabur 、Sealos 或 阿里云计算巢 部署

如果想在 Vercel 、 Zeabur 或 阿里云 上部署该服务，可以按照以下步骤进行操作：

- 准备好你的 [OpenAI API Key](https://platform.openai.com/account/api-keys) 。
- 点击下方按钮开始部署： 直接使用 GitHub 账号登录即可，记得在环境变量页填入 `OPENAI_API_KEY` （必填） and `ACCESS_CODE`（推荐）；
- 部署完毕后，即可开始使用；
- 绑定自定义域名（可选）：Vercel 分配的域名 DNS 在某些区域被污染了，绑定自定义域名即可直连。目前 Zeabur 提供的域名还未被污染，大多数地区都可以直连。

<div align="center">

|            使用 Vercel 部署             |                      使用 Zeabur 部署                       |                      使用 Sealos 部署                       |                           使用阿里云计算巢部署                            |
| :-------------------------------------: | :---------------------------------------------------------: | :---------------------------------------------------------: | :-----------------------------------------------------------------------: |
| [![][deploy-button-image]][deploy-link] | [![][deploy-on-zeabur-button-image]][deploy-on-zeabur-link] | [![][deploy-on-sealos-button-image]][deploy-on-sealos-link] | [![][deploy-on-alibaba-cloud-button-image]][deploy-on-alibaba-cloud-link] |

</div>

#### Fork 之后

在 Fork 后，请只保留 "upstream sync" Action 并在你 fork 的 GitHub Repo 中禁用其他 Action。

#### 保持更新

如果你根据 README 中的一键部署步骤部署了自己的项目，你可能会发现总是被提示 “有可用更新”。这是因为 Vercel 默认为你创建新项目而非 fork 本项目，这将导致无法准确检测更新。

> \[!TIP]
>
> 我们建议按照 [📘 自动同步更新][docs-upstream-sync] 步骤重新部署。

<br/>

### `B` 使用 Docker 部署

[![][docker-release-shield]][docker-release-link]
[![][docker-size-shield]][docker-size-link]
[![][docker-pulls-shield]][docker-pulls-link]

我们提供了 Docker 镜像，供你在自己的私有设备上部署 LobeChat 服务。使用以下命令即可使用一键启动 LobeChat 服务：

```fish
$ docker run -d -p 3210:3210 \
  -e OPENAI_API_KEY=sk-xxxx \
  -e ACCESS_CODE=lobe66 \
  --name lobe-chat \
  lobehub/lobe-chat
```

> \[!TIP]
>
> 如果你需要通过代理使用 OpenAI 服务，你可以使用 `OPENAI_PROXY_URL` 环境变量来配置代理地址：

```fish
$ docker run -d -p 3210:3210 \
  -e OPENAI_API_KEY=sk-xxxx \
  -e OPENAI_PROXY_URL=https://api-proxy.com/v1 \
  -e ACCESS_CODE=lobe66 \
  --name lobe-chat \
  lobehub/lobe-chat
```

> \[!NOTE]
>
> 有关 Docker 部署的详细说明，详见 [📘 使用 Docker 部署][docs-docker]

<br/>

### 环境变量

本项目提供了一些额外的配置项，使用环境变量进行设置：

| 环境变量            | 类型 | 描述                                                                                                                          | 示例                                                                                                   |
| ------------------- | ---- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `OPENAI_API_KEY`    | 必选 | 这是你在 OpenAI 账户页面申请的 API 密钥                                                                                       | `sk-xxxxxx...xxxxxx`                                                                                   |
| `OPENAI_PROXY_URL`  | 可选 | 如果你手动配置了 OpenAI 接口代理，可以使用此配置项来覆盖默认的 OpenAI API 请求基础 URL                                        | `https://api.chatanywhere.cn` 或 `https://aihubmix.com/v1`<br/>默认值:<br/>`https://api.openai.com/v1` |
| `ACCESS_CODE`       | 可选 | 添加访问此服务的密码，你可以设置一个长密码以防被爆破，该值用逗号分隔时为密码数组                                              | `awCTe)re_r74` or `rtrt_ewee3@09!` or `code1,code2,code3`                                              |
| `OPENAI_MODEL_LIST` | 可选 | 用来控制模型列表，使用 `+` 增加一个模型，使用 `-` 来隐藏一个模型，使用 `模型名=展示名` 来自定义模型的展示名，用英文逗号隔开。 | `qwen-7b-chat,+glm-6b,-gpt-3.5-turbo`                                                                  |

> \[!NOTE]
>
> 完整环境变量可见 [📘 环境变量][docs-env-var]

<br/>

### 获取 OpenAI API Key

API Key 是使用 LobeChat 进行大语言模型会话的必要信息，本节以 OpenAI 模型服务商为例，简要介绍获取 API Key 的方式。

#### `A` 通过 OpenAI 官方渠道

- 注册一个 [OpenAI 账户](https://platform.openai.com/signup)，你需要使用国际手机号、非大陆邮箱进行注册；
- 注册完毕后，前往 [API Keys](https://platform.openai.com/api-keys) 页面，点击 `Create new secret key` 创建新的 API Key:

| 步骤 1：打开创建窗口                                                                                                                               | 步骤 2：创建 API Key                                                                                                                               | 步骤 3：获取 API Key                                                                                                                               |
| -------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| <img src="https://github-production-user-asset-6210df.s3.amazonaws.com/28616219/296253192-ff2193dd-f125-4e58-82e8-91bc376c0d68.png" height="200"/> | <img src="https://github-production-user-asset-6210df.s3.amazonaws.com/28616219/296254170-803bacf0-4471-4171-ae79-0eab08d621d1.png" height="200"/> | <img src="https://github-production-user-asset-6210df.s3.amazonaws.com/28616219/296255167-f2745f2b-f083-4ba8-bc78-9b558e0002de.png" height="200"/> |

- 将此 API Key 填写到 LobeChat 的 API Key 配置中，即可开始使用。

> \[!TIP]
>
> 账户注册后，一般有 5 美元的免费额度，但有效期只有三个月。
> 如果你希望长期使用你的 API Key，你需要完成支付的信用卡绑定。由于 OpenAI 只支持外币信用卡，因此你需要找到合适的支付渠道，此处不再详细展开。

<br/>

#### `B` 通过 OpenAI 第三方代理商

如果你发现注册 OpenAI 账户或者绑定外币信用卡比较麻烦，可以考虑借助一些知名的 OpenAI 第三方代理商来获取 API Key，这可以有效降低获取 OpenAI API Key 的门槛。但与此同时，一旦使用三方服务，你可能也需要承担潜在的风险，
请根据你自己的实际情况自行决策。以下是常见的第三方模型代理商列表，供你参考：

|                                                                                                                                                   | 服务商       | 特性说明                                                        | Proxy 代理地址            | 链接                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | --------------------------------------------------------------- | ------------------------- | ------------------------------- |
| <img src="https://github-production-user-asset-6210df.s3.amazonaws.com/17870709/296272721-c3ac0bf3-e433-4496-89c4-ebdc20689c17.jpg" width="48" /> | **AiHubMix** | 使用 OpenAI 企业接口，全站模型价格为官方 **86 折**（含 GPT-4 ） | `https://aihubmix.com/v1` | [获取](https://lobe.li/XHnZIUP) |

> \[!WARNING]
>
> **免责申明**: 在此推荐的 OpenAI API Key 由第三方代理商提供，所以我们不对 API Key 的 **有效性** 和 **安全性** 负责，请你自行承担购买和使用 API Key 的风险。

> \[!NOTE]
>
> 如果你是模型服务商，并认为自己的服务足够稳定且价格实惠，欢迎联系我们，我们会在自行体验和测试后酌情推荐。

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 📦 生态系统

| NPM                               | 仓库                                    | 描述                                                                                     | 版本                                      |
| --------------------------------- | --------------------------------------- | ---------------------------------------------------------------------------------------- | ----------------------------------------- |
| [@lobehub/ui][lobe-ui-link]       | [lobehub/lobe-ui][lobe-ui-github]       | 构建 AIGC 网页应用程序而设计的开源 UI 组件库                                             | [![][lobe-ui-shield]][lobe-ui-link]       |
| [@lobehub/icons][lobe-icons-link] | [lobehub/lobe-icons][lobe-icons-github] | 主流 AI / LLM 模型和公司 SVG Logo 与 Icon 合集                                           | [![][lobe-icons-shield]][lobe-icons-link] |
| [@lobehub/tts][lobe-tts-link]     | [lobehub/lobe-tts][lobe-tts-github]     | AI TTS / STT 语音合成 / 识别 React Hooks 库                                              | [![][lobe-tts-shield]][lobe-tts-link]     |
| [@lobehub/lint][lobe-lint-link]   | [lobehub/lobe-lint][lobe-lint-github]   | LobeHub 代码样式规范 ESlint，Stylelint，Commitlint，Prettier，Remark 和 Semantic Release | [![][lobe-lint-shield]][lobe-lint-link]   |

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🧩 插件体系

插件提供了扩展 LobeChat [Function Calling][docs-functionc-call] 能力的方法。可以用于引入新的 Function Calling，甚至是新的消息结果渲染方式。如果你对插件开发感兴趣，请在 Wiki 中查阅我们的 [📘 插件开发指引][docs-plugin-dev] 。

- [lobe-chat-plugins][lobe-chat-plugins]：插件索引从该仓库的 index.json 中获取插件列表并显示给用户。
- [chat-plugin-template][chat-plugin-template]：插件开发模版，你可以通过项目模版快速新建插件项目。
- [@lobehub/chat-plugin-sdk][chat-plugin-sdk]：插件 SDK 可帮助您创建出色的 Lobe Chat 插件。
- [@lobehub/chat-plugins-gateway][chat-plugins-gateway]：插件网关是一个后端服务，作为 LobeChat 插件的网关。我们使用 Vercel 部署此服务。主要的 API POST /api/v1/runner 被部署为 Edge Function。

> \[!NOTE]
>
> 插件系统目前正在进行重大开发。您可以在以下 Issues 中了解更多信息:
>
> - [x] [**插件一期**](https://github.com/lobehub/lobe-chat/issues/73): 实现插件与主体分离，将插件拆分为独立仓库维护，并实现插件的动态加载
> - [x] [**插件二期**](https://github.com/lobehub/lobe-chat/issues/97): 插件的安全性与使用的稳定性，更加精准地呈现异常状态，插件架构的可维护性与开发者友好
> - [x] [**插件三期**](https://github.com/lobehub/lobe-chat/issues/149)：更高阶与完善的自定义能力，支持插件鉴权与示例

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## ⌨️ 本地开发

可以使用 GitHub Codespaces 进行在线开发：

[![][codespaces-shield]][codespaces-link]

或者使用以下命令进行本地开发：

```fish
$ git clone https://github.com/lobehub/lobe-chat.git
$ cd lobe-chat
$ pnpm install
$ pnpm run dev
```

如果你希望了解更多详情，欢迎可以查阅我们的 [📘 开发指南][docs-dev-guide]

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🤝 参与贡献

我们非常欢迎各种形式的贡献。如果你对贡献代码感兴趣，可以查看我们的 GitHub [Issues][github-issues-link] 和 [Projects][github-project-link]，大展身手，向我们展示你的奇思妙想。

> \[!TIP]
>
> 我们希望创建一个技术分享型社区，一个可以促进知识共享、想法交流，激发彼此鼓励和协作的环境。
> 同时欢迎联系我们提供产品功能和使用体验反馈，帮助我们将 LobeChat 建设得更好。
>
> **组织维护者:** [@arvinxx](https://github.com/arvinxx) [@canisminor1990](https://github.com/canisminor1990)

[![][pr-welcome-shield]][pr-welcome-link]
[![][submit-agents-shield]][submit-agents-link]
[![][submit-plugin-shield]][submit-plugin-link]

<a href="https://github.com/lobehub/lobe-chat/graphs/contributors" target="_blank">
  <table>
    <tr>
      <th colspan="2">
        <br><img src="https://contrib.rocks/image?repo=lobehub/lobe-chat"><br><br>
      </th>
    </tr>
    <tr>
      <td>
        <picture>
          <source media="(prefers-color-scheme: dark)" srcset="https://next.ossinsight.io/widgets/official/compose-org-active-contributors/thumbnail.png?activity=active&period=past_28_days&owner_id=131470832&repo_ids=643445235&image_size=2x3&color_scheme=dark">
          <img src="https://next.ossinsight.io/widgets/official/compose-org-active-contributors/thumbnail.png?activity=active&period=past_28_days&owner_id=131470832&repo_ids=643445235&image_size=2x3&color_scheme=light">
        </picture>
      </td>
      <td rowspan="2">
        <picture>
          <source media="(prefers-color-scheme: dark)" srcset="https://next.ossinsight.io/widgets/official/compose-org-participants-growth/thumbnail.png?activity=active&period=past_28_days&owner_id=131470832&repo_ids=643445235&image_size=4x7&color_scheme=dark">
          <img src="https://next.ossinsight.io/widgets/official/compose-org-participants-growth/thumbnail.png?activity=active&period=past_28_days&owner_id=131470832&repo_ids=643445235&image_size=4x7&color_scheme=light">
        </picture>
      </td>
    </tr>
    <tr>
      <td>
        <picture>
          <source media="(prefers-color-scheme: dark)" srcset="https://next.ossinsight.io/widgets/official/compose-org-active-contributors/thumbnail.png?activity=new&period=past_28_days&owner_id=131470832&repo_ids=643445235&image_size=2x3&color_scheme=dark">
          <img src="https://next.ossinsight.io/widgets/official/compose-org-active-contributors/thumbnail.png?activity=new&period=past_28_days&owner_id=131470832&repo_ids=643445235&image_size=2x3&color_scheme=light">
        </picture>
      </td>
    </tr>
  </table>
</a>

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## ❤ 社区赞助

每一分支持都珍贵无比，汇聚成我们支持的璀璨银河！你就像一颗划破夜空的流星，瞬间点亮我们前行的道路。感谢你对我们的信任 —— 你的支持笔就像星辰导航，一次又一次地为项目指明前进的光芒。

<a href="https://opencollective.com/lobehub" target="_blank">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://github.com/lobehub/.github/blob/main/static/sponsor-dark.png?raw=true">
    <img  src="https://github.com/lobehub/.github/blob/main/static/sponsor-light.png?raw=true">
  </picture>
</a>

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🔗 更多工具

- **[🅰️ Lobe SD Theme][lobe-theme]:** Stable Diffusion WebUI 的现代主题，精致的界面设计，高度可定制的 UI，以及提高效率的功能。
- **[⛵️ Lobe Midjourney WebUI][lobe-midjourney-webui]:** Midjourney WebUI, 能够根据文本提示快速生成丰富多样的图像，激发创造力，增强对话交流。
- **[🌏 Lobe i18n][lobe-i18n]:** Lobe i18n 是一个由 ChatGPT 驱动的 i18n（国际化）翻译过程的自动化工具。它支持自动分割大文件、增量更新，以及为 OpenAI 模型、API 代理和温度提供定制选项的功能。
- **[💌 Lobe Commit][lobe-commit]:** Lobe Commit 是一个 CLI 工具，它利用 Langchain/ChatGPT 生成基于 Gitmoji 的提交消息。

<div align="right">

[![][back-to-top]](#readme-top)

</div>

---

<details><summary><h4>📝 License</h4></summary>

[![][fossa-license-shield]][fossa-license-link]

</details>

Copyright © 2023 [LobeHub][profile-link]. <br />
This project is [Apache 2.0](./LICENSE) licensed.

<!-- LINK GROUP -->

[back-to-top]: https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square
[blog]: https://lobehub.com/zh/blog
[changelog]: https://lobehub.com/changelog
[chat-desktop]: https://raw.githubusercontent.com/lobehub/lobe-chat/lighthouse/lighthouse/chat/desktop/pagespeed.svg
[chat-desktop-report]: https://lobehub.github.io/lobe-chat/lighthouse/chat/desktop/chat_preview_lobehub_com_chat.html
[chat-mobile]: https://raw.githubusercontent.com/lobehub/lobe-chat/lighthouse/lighthouse/chat/mobile/pagespeed.svg
[chat-mobile-report]: https://lobehub.github.io/lobe-chat/lighthouse/chat/mobile/chat_preview_lobehub_com_chat.html
[chat-plugin-sdk]: https://github.com/lobehub/chat-plugin-sdk
[chat-plugin-template]: https://github.com/lobehub/chat-plugin-template
[chat-plugins-gateway]: https://github.com/lobehub/chat-plugins-gateway
[codecov-link]: https://codecov.io/gh/lobehub/lobe-chat
[codecov-shield]: https://img.shields.io/codecov/c/github/lobehub/lobe-chat?labelColor=black&style=flat-square&logo=codecov&logoColor=white
[codespaces-link]: https://codespaces.new/lobehub/lobe-chat
[codespaces-shield]: https://github.com/codespaces/badge.svg
[deploy-button-image]: https://vercel.com/button
[deploy-link]: https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Flobehub%2Flobe-chat&env=OPENAI_API_KEY,ACCESS_CODE&envDescription=Find%20your%20OpenAI%20API%20Key%20by%20click%20the%20right%20Learn%20More%20button.%20%7C%20Access%20Code%20can%20protect%20your%20website&envLink=https%3A%2F%2Fplatform.openai.com%2Faccount%2Fapi-keys&project-name=lobe-chat&repository-name=lobe-chat
[deploy-on-alibaba-cloud-button-image]: https://service-info-public.oss-cn-hangzhou.aliyuncs.com/computenest-en.svg
[deploy-on-alibaba-cloud-link]: https://computenest.console.aliyun.com/service/instance/create/default?type=user&ServiceName=LobeChat%E7%A4%BE%E5%8C%BA%E7%89%88
[deploy-on-sealos-button-image]: https://raw.githubusercontent.com/labring-actions/templates/main/Deploy-on-Sealos.svg
[deploy-on-sealos-link]: https://cloud.sealos.io/?openapp=system-template%3FtemplateName%3Dlobe-chat
[deploy-on-zeabur-button-image]: https://zeabur.com/button.svg
[deploy-on-zeabur-link]: https://zeabur.com/templates/VZGGTI
[discord-link]: https://discord.gg/AYFPHvv2jT
[discord-shield]: https://img.shields.io/discord/1127171173982154893?color=5865F2&label=discord&labelColor=black&logo=discord&logoColor=white&style=flat-square
[discord-shield-badge]: https://img.shields.io/discord/1127171173982154893?color=5865F2&label=discord&labelColor=black&logo=discord&logoColor=white&style=for-the-badge
[docker-pulls-link]: https://hub.docker.com/r/lobehub/lobe-chat
[docker-pulls-shield]: https://img.shields.io/docker/pulls/lobehub/lobe-chat?color=45cc11&labelColor=black&style=flat-square
[docker-release-link]: https://hub.docker.com/r/lobehub/lobe-chat
[docker-release-shield]: https://img.shields.io/docker/v/lobehub/lobe-chat?color=369eff&label=docker&labelColor=black&logo=docker&logoColor=white&style=flat-square
[docker-size-link]: https://hub.docker.com/r/lobehub/lobe-chat
[docker-size-shield]: https://img.shields.io/docker/image-size/lobehub/lobe-chat?color=369eff&labelColor=black&style=flat-square
[docs]: https://lobehub.com/zh/docs/usage/start
[docs-dev-guide]: https://github.com/lobehub/lobe-chat/wiki/index
[docs-docker]: https://lobehub.com/docs/self-hosting/platform/docker
[docs-env-var]: https://lobehub.com/docs/self-hosting/environment-variables
[docs-feat-agent]: https://lobehub.com/docs/usage/features/agent-market
[docs-feat-auth]: https://lobehub.com/docs/usage/features/auth
[docs-feat-database]: https://lobehub.com/docs/usage/features/database
[docs-feat-knowledgebase]: https://lobehub.com/blog/knowledge-base
[docs-feat-local]: https://lobehub.com/docs/usage/features/local-llm
[docs-feat-mobile]: https://lobehub.com/docs/usage/features/mobile
[docs-feat-plugin]: https://lobehub.com/docs/usage/features/plugin-system
[docs-feat-provider]: https://lobehub.com/docs/usage/features/multi-ai-providers
[docs-feat-pwa]: https://lobehub.com/docs/usage/features/pwa
[docs-feat-t2i]: https://lobehub.com/docs/usage/features/text-to-image
[docs-feat-theme]: https://lobehub.com/docs/usage/features/theme
[docs-feat-tts]: https://lobehub.com/docs/usage/features/tts
[docs-feat-vision]: https://lobehub.com/docs/usage/features/vision
[docs-functionc-call]: https://lobehub.com/zh/blog/openai-function-call
[docs-lighthouse]: https://github.com/lobehub/lobe-chat/wiki/Lighthouse.zh-CN
[docs-plugin-dev]: https://lobehub.com/docs/usage/plugins/development
[docs-self-hosting]: https://lobehub.com/docs/self-hosting/start
[docs-upstream-sync]: https://lobehub.com/docs/self-hosting/advanced/upstream-sync
[docs-usage-ollama]: https://lobehub.com/docs/usage/providers/ollama
[docs-usage-plugin]: https://lobehub.com/docs/usage/plugins/basic
[fossa-license-link]: https://app.fossa.com/projects/git%2Bgithub.com%2Flobehub%2Flobe-chat
[fossa-license-shield]: https://app.fossa.com/api/projects/git%2Bgithub.com%2Flobehub%2Flobe-chat.svg?type=large
[github-action-release-link]: https://github.com/lobehub/lobe-chat/actions/workflows/release.yml
[github-action-release-shield]: https://img.shields.io/github/actions/workflow/status/lobehub/lobe-chat/release.yml?label=release&labelColor=black&logo=githubactions&logoColor=white&style=flat-square
[github-action-test-link]: https://github.com/lobehub/lobe-chat/actions/workflows/test.yml
[github-action-test-shield]: https://img.shields.io/github/actions/workflow/status/lobehub/lobe-chat/test.yml?label=test&labelColor=black&logo=githubactions&logoColor=white&style=flat-square
[github-contributors-link]: https://github.com/lobehub/lobe-chat/graphs/contributors
[github-contributors-shield]: https://img.shields.io/github/contributors/lobehub/lobe-chat?color=c4f042&labelColor=black&style=flat-square
[github-forks-link]: https://github.com/lobehub/lobe-chat/network/members
[github-forks-shield]: https://img.shields.io/github/forks/lobehub/lobe-chat?color=8ae8ff&labelColor=black&style=flat-square
[github-hello-shield]: https://abroad.hellogithub.com/v1/widgets/recommend.svg?rid=39701baf5a734cb894ec812248a5655a&claim_uid=HxYvFN34htJzGCD&theme=dark&theme=neutral&theme=dark&theme=neutral
[github-hello-url]: https://hellogithub.com/repository/39701baf5a734cb894ec812248a5655a
[github-issues-link]: https://github.com/lobehub/lobe-chat/issues
[github-issues-shield]: https://img.shields.io/github/issues/lobehub/lobe-chat?color=ff80eb&labelColor=black&style=flat-square
[github-license-link]: https://github.com/lobehub/lobe-chat/blob/main/LICENSE
[github-license-shield]: https://img.shields.io/badge/license-apache%202.0-white?labelColor=black&style=flat-square
[github-project-link]: https://github.com/lobehub/lobe-chat/projects
[github-release-link]: https://github.com/lobehub/lobe-chat/releases
[github-release-shield]: https://img.shields.io/github/v/release/lobehub/lobe-chat?color=369eff&labelColor=black&logo=github&style=flat-square
[github-releasedate-link]: https://github.com/lobehub/lobe-chat/releases
[github-releasedate-shield]: https://img.shields.io/github/release-date/lobehub/lobe-chat?labelColor=black&style=flat-square
[github-stars-link]: https://github.com/lobehub/lobe-chat/network/stargazers
[github-stars-shield]: https://img.shields.io/github/stars/lobehub/lobe-chat?color=ffcb47&labelColor=black&style=flat-square
[github-trending-shield]: https://trendshift.io/api/badge/repositories/2256
[github-trending-url]: https://trendshift.io/repositories/2256
[image-banner]: https://github.com/lobehub/lobe-chat/assets/28616219/9f155dff-4737-429f-9cad-a70a1a860c5f
[image-feat-agent]: https://github-production-user-asset-6210df.s3.amazonaws.com/17870709/268670869-f1ffbf66-42b6-42cf-a937-9ce1f8328514.png
[image-feat-auth]: https://github.com/lobehub/lobe-chat/assets/17870709/8ce70e15-40df-451e-b700-66090fe5b8c2
[image-feat-database]: https://github.com/lobehub/lobe-chat/assets/17870709/c27a0234-a4e9-40e5-8bcb-42d5ce7e40f9
[image-feat-knowledgebase]: https://github.com/user-attachments/assets/77e58e1c-c82f-4341-b159-f4eeede9967f
[image-feat-local]: https://github.com/lobehub/lobe-chat/assets/28616219/ca9a21bc-ea6c-4c90-bf4a-fa53b4fb2b5c
[image-feat-mobile]: https://gw.alipayobjects.com/zos/kitchen/R441AuFS4W/mobile.webp
[image-feat-plugin]: https://github-production-user-asset-6210df.s3.amazonaws.com/17870709/268670883-33c43a5c-a512-467e-855c-fa299548cce5.png
[image-feat-privoder]: https://github.com/lobehub/lobe-chat/assets/28616219/b164bc54-8ba2-4c1e-b2f2-f4d7f7e7a551
[image-feat-pwa]: https://gw.alipayobjects.com/zos/kitchen/69x6bllkX3/pwa.webp
[image-feat-t2i]: https://github-production-user-asset-6210df.s3.amazonaws.com/17870709/297746445-0ff762b9-aa08-4337-afb7-12f932b6efbb.png
[image-feat-theme]: https://gw.alipayobjects.com/zos/kitchen/pvus1lo%26Z7/darkmode.webp
[image-feat-tts]: https://github-production-user-asset-6210df.s3.amazonaws.com/17870709/284072124-c9853d8d-f1b5-44a8-a305-45ebc0f6d19a.png
[image-feat-vision]: https://github-production-user-asset-6210df.s3.amazonaws.com/17870709/284072129-382bdf30-e3d6-4411-b5a0-249710b8ba08.png
[image-overview]: https://github.com/lobehub/lobe-chat/assets/17870709/56b95d48-f573-41cd-8b38-387bf88bc4bf
[image-star]: https://github.com/lobehub/lobe-chat/assets/17870709/cb06b748-513f-47c2-8740-d876858d7855
[issues-link]: https://img.shields.io/github/issues/lobehub/lobe-chat.svg?style=flat
[lobe-chat-plugins]: https://github.com/lobehub/lobe-chat-plugins
[lobe-commit]: https://github.com/lobehub/lobe-commit/tree/master/packages/lobe-commit
[lobe-i18n]: https://github.com/lobehub/lobe-commit/tree/master/packages/lobe-i18n
[lobe-icons-github]: https://github.com/lobehub/lobe-icons
[lobe-icons-link]: https://www.npmjs.com/package/@lobehub/icons
[lobe-icons-shield]: https://img.shields.io/npm/v/@lobehub/icons?color=369eff&labelColor=black&logo=npm&logoColor=white&style=flat-square
[lobe-lint-github]: https://github.com/lobehub/lobe-lint
[lobe-lint-link]: https://www.npmjs.com/package/@lobehub/lint
[lobe-lint-shield]: https://img.shields.io/npm/v/@lobehub/lint?color=369eff&labelColor=black&logo=npm&logoColor=white&style=flat-square
[lobe-midjourney-webui]: https://github.com/lobehub/lobe-midjourney-webui
[lobe-theme]: https://github.com/lobehub/sd-webui-lobe-theme
[lobe-tts-github]: https://github.com/lobehub/lobe-tts
[lobe-tts-link]: https://www.npmjs.com/package/@lobehub/tts
[lobe-tts-shield]: https://img.shields.io/npm/v/@lobehub/tts?color=369eff&labelColor=black&logo=npm&logoColor=white&style=flat-square
[lobe-ui-github]: https://github.com/lobehub/lobe-ui
[lobe-ui-link]: https://www.npmjs.com/package/@lobehub/ui
[lobe-ui-shield]: https://img.shields.io/npm/v/@lobehub/ui?color=369eff&labelColor=black&logo=npm&logoColor=white&style=flat-square
[official-site]: https://lobehub.com
[pr-welcome-link]: https://github.com/lobehub/lobe-chat/pulls
[pr-welcome-shield]: https://img.shields.io/badge/🤯_pr_welcome-%E2%86%92-ffcb47?labelColor=black&style=for-the-badge
[profile-link]: https://github.com/lobehub
[share-mastodon-link]: https://mastodon.social/share?text=Check%20this%20GitHub%20repository%20out%20%F0%9F%A4%AF%20LobeChat%20-%20An%20open-source,%20extensible%20(Function%20Calling),%20high-performance%20chatbot%20framework.%20It%20supports%20one-click%20free%20deployment%20of%20your%20private%20ChatGPT/LLM%20web%20application.%20https://github.com/lobehub/lobe-chat%20#chatbot%20#chatGPT%20#openAI
[share-mastodon-shield]: https://img.shields.io/badge/-share%20on%20mastodon-black?labelColor=black&logo=mastodon&logoColor=white&style=flat-square
[share-reddit-link]: https://www.reddit.com/submit?title=%E6%8E%A8%E8%8D%90%E4%B8%80%E4%B8%AA%20GitHub%20%E5%BC%80%E6%BA%90%E9%A1%B9%E7%9B%AE%20%F0%9F%A4%AF%20LobeChat%20-%20%E5%BC%80%E6%BA%90%E7%9A%84%E3%80%81%E5%8F%AF%E6%89%A9%E5%B1%95%E7%9A%84%EF%BC%88Function%20Calling%EF%BC%89%E9%AB%98%E6%80%A7%E8%83%BD%E8%81%8A%E5%A4%A9%E6%9C%BA%E5%99%A8%E4%BA%BA%E6%A1%86%E6%9E%B6%E3%80%82%0A%E5%AE%83%E6%94%AF%E6%8C%81%E4%B8%80%E9%94%AE%E5%85%8D%E8%B4%B9%E9%83%A8%E7%BD%B2%E7%A7%81%E4%BA%BA%20ChatGPT%2FLLM%20%E7%BD%91%E9%A1%B5%E5%BA%94%E7%94%A8%E7%A8%8B%E5%BA%8F%20%23chatbot%20%23chatGPT%20%23openAI&url=https%3A%2F%2Fgithub.com%2Flobehub%2Flobe-chat
[share-reddit-shield]: https://img.shields.io/badge/-share%20on%20reddit-black?labelColor=black&logo=reddit&logoColor=white&style=flat-square
[share-telegram-link]: https://t.me/share/url"?text=%E6%8E%A8%E8%8D%90%E4%B8%80%E4%B8%AA%20GitHub%20%E5%BC%80%E6%BA%90%E9%A1%B9%E7%9B%AE%20%F0%9F%A4%AF%20LobeChat%20-%20%E5%BC%80%E6%BA%90%E7%9A%84%E3%80%81%E5%8F%AF%E6%89%A9%E5%B1%95%E7%9A%84%EF%BC%88Function%20Calling%EF%BC%89%E9%AB%98%E6%80%A7%E8%83%BD%E8%81%8A%E5%A4%A9%E6%9C%BA%E5%99%A8%E4%BA%BA%E6%A1%86%E6%9E%B6%E3%80%82%0A%E5%AE%83%E6%94%AF%E6%8C%81%E4%B8%80%E9%94%AE%E5%85%8D%E8%B4%B9%E9%83%A8%E7%BD%B2%E7%A7%81%E4%BA%BA%20ChatGPT%2FLLM%20%E7%BD%91%E9%A1%B5%E5%BA%94%E7%94%A8%E7%A8%8B%E5%BA%8F%20%23chatbot%20%23chatGPT%20%23openAI&url=https%3A%2F%2Fgithub.com%2Flobehub%2Flobe-chat
[share-telegram-shield]: https://img.shields.io/badge/-share%20on%20telegram-black?labelColor=black&logo=telegram&logoColor=white&style=flat-square
[share-weibo-link]: http://service.weibo.com/share/share.php?sharesource=weibo&title=%E6%8E%A8%E8%8D%90%E4%B8%80%E4%B8%AA%20GitHub%20%E5%BC%80%E6%BA%90%E9%A1%B9%E7%9B%AE%20%F0%9F%A4%AF%20LobeChat%20-%20%E5%BC%80%E6%BA%90%E7%9A%84%E3%80%81%E5%8F%AF%E6%89%A9%E5%B1%95%E7%9A%84%EF%BC%88Function%20Calling%EF%BC%89%E9%AB%98%E6%80%A7%E8%83%BD%E8%81%8A%E5%A4%A9%E6%9C%BA%E5%99%A8%E4%BA%BA%E6%A1%86%E6%9E%B6%E3%80%82%0A%E5%AE%83%E6%94%AF%E6%8C%81%E4%B8%80%E9%94%AE%E5%85%8D%E8%B4%B9%E9%83%A8%E7%BD%B2%E7%A7%81%E4%BA%BA%20ChatGPT%2FLLM%20%E7%BD%91%E9%A1%B5%E5%BA%94%E7%94%A8%E7%A8%8B%E5%BA%8F%20%23chatbot%20%23chatGPT%20%23openAI&url=https%3A%2F%2Fgithub.com%2Flobehub%2Flobe-chat
[share-weibo-shield]: https://img.shields.io/badge/-share%20on%20weibo-black?labelColor=black&logo=sinaweibo&logoColor=white&style=flat-square
[share-whatsapp-link]: https://api.whatsapp.com/send?text=%E6%8E%A8%E8%8D%90%E4%B8%80%E4%B8%AA%20GitHub%20%E5%BC%80%E6%BA%90%E9%A1%B9%E7%9B%AE%20%F0%9F%A4%AF%20LobeChat%20-%20%E5%BC%80%E6%BA%90%E7%9A%84%E3%80%81%E5%8F%AF%E6%89%A9%E5%B1%95%E7%9A%84%EF%BC%88Function%20Calling%EF%BC%89%E9%AB%98%E6%80%A7%E8%83%BD%E8%81%8A%E5%A4%A9%E6%9C%BA%E5%99%A8%E4%BA%BA%E6%A1%86%E6%9E%B6%E3%80%82%0A%E5%AE%83%E6%94%AF%E6%8C%81%E4%B8%80%E9%94%AE%E5%85%8D%E8%B4%B9%E9%83%A8%E7%BD%B2%E7%A7%81%E4%BA%BA%20ChatGPT%2FLLM%20%E7%BD%91%E9%A1%B5%E5%BA%94%E7%94%A8%E7%A8%8B%E5%BA%8F%20https%3A%2F%2Fgithub.com%2Flobehub%2Flobe-chat%20%23chatbot%20%23chatGPT%20%23openAI
[share-whatsapp-shield]: https://img.shields.io/badge/-share%20on%20whatsapp-black?labelColor=black&logo=whatsapp&logoColor=white&style=flat-square
[share-x-link]: https://x.com/intent/tweet?hashtags=chatbot%2CchatGPT%2CopenAI&text=%E6%8E%A8%E8%8D%90%E4%B8%80%E4%B8%AA%20GitHub%20%E5%BC%80%E6%BA%90%E9%A1%B9%E7%9B%AE%20%F0%9F%A4%AF%20LobeChat%20-%20%E5%BC%80%E6%BA%90%E7%9A%84%E3%80%81%E5%8F%AF%E6%89%A9%E5%B1%95%E7%9A%84%EF%BC%88Function%20Calling%EF%BC%89%E9%AB%98%E6%80%A7%E8%83%BD%E8%81%8A%E5%A4%A9%E6%9C%BA%E5%99%A8%E4%BA%BA%E6%A1%86%E6%9E%B6%E3%80%82%0A%E5%AE%83%E6%94%AF%E6%8C%81%E4%B8%80%E9%94%AE%E5%85%8D%E8%B4%B9%E9%83%A8%E7%BD%B2%E7%A7%81%E4%BA%BA%20ChatGPT%2FLLM%20%E7%BD%91%E9%A1%B5%E5%BA%94%E7%94%A8%E7%A8%8B%E5%BA%8F&url=https%3A%2F%2Fgithub.com%2Flobehub%2Flobe-chat
[share-x-shield]: https://img.shields.io/badge/-share%20on%20x-black?labelColor=black&logo=x&logoColor=white&style=flat-square
[sponsor-link]: https://opencollective.com/lobehub 'Become ❤ LobeHub Sponsor'
[sponsor-shield]: https://img.shields.io/badge/-Sponsor%20LobeHub-f04f88?logo=opencollective&logoColor=white&style=flat-square
[submit-agents-link]: https://github.com/lobehub/lobe-chat-agents
[submit-agents-shield]: https://img.shields.io/badge/🤖/🏪_submit_agent-%E2%86%92-c4f042?labelColor=black&style=for-the-badge
[submit-plugin-link]: https://github.com/lobehub/lobe-chat-plugins
[submit-plugin-shield]: https://img.shields.io/badge/🧩/🏪_submit_plugin-%E2%86%92-95f3d9?labelColor=black&style=for-the-badge
[vercel-link]: https://chat-preview.lobehub.com
[vercel-shield]: https://img.shields.io/badge/vercel-online-55b467?labelColor=black&logo=vercel&style=flat-square
[vercel-shield-badge]: https://img.shields.io/badge/TRY%20LOBECHAT-ONLINE-55b467?labelColor=black&logo=vercel&style=for-the-badge
