<div align="center"><a name="readme-top"></a>

[![][image-banner]][vercel-link]

<h1>Lobe Chat</h1>

現代風格的開源 ChatGPT/LLMs 使用介面/框架  
支持語音合成、多模態、可擴展的（[function call][docs-functionc-call]）插件系統  
一鍵**免費**部署私人的 OpenAI ChatGPT/Claude/Gemini/Groq/Ollama 聊天應用

[English](./README.md) · **繁體中文** · [簡體中文](./README.zh-CN.md) · [日本語](./README.ja-JP.md) · [官網][official-site] · [更新日誌][changelog] · [文檔][docs] · [部落格][blog] · [反饋問題][github-issues-link]

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

**分享 LobeChat 給你的好友**

[![][share-x-shield]][share-x-link]
[![][share-telegram-shield]][share-telegram-link]
[![][share-whatsapp-shield]][share-whatsapp-link]
[![][share-reddit-shield]][share-reddit-link]
[![][share-weibo-shield]][share-weibo-link]
[![][share-mastodon-shield]][share-mastodon-link]

<sup>探索私人生產力的未來，在個體崛起的時代中為你打造。</sup>

[![][github-trending-shield]][github-trending-url]
[![][github-hello-shield]][github-hello-url]

[![][image-overview]][vercel-link]

</div>

<details>
<summary><kbd>目錄樹</kbd></summary>

#### TOC

- [👋🏻 開始使用 \& 交流](#-開始使用--交流)
- [✨ 特性一覽](#-特性一覽)
  - [`1` 文件上傳 / 知識庫](#1-文件上傳--知識庫)
  - [`2` 多模型服務商支持](#2-多模型服務商支持)
    - [已支持的模型服務商](#已支持的模型服務商)
  - [`3` 支持本地大型語言模型 (LLM)](#3-支持本地大型語言模型-llm)
  - [`4` 模型視覺識別 (Model Visual)](#4-模型視覺識別-model-visual)
  - [`5` TTS \& STT 語音轉化](#5-tts--stt-語音轉化)
  - [`6` Text to Image 文生圖](#6-text-to-image-文生圖)
  - [`7` 插件系統 (Tools Calling)](#7-插件系統-tools-calling)
  - [`8` 助手市集 (GPTs)](#8-助手市集-gpts)
  - [`9` 支持本地 / 遠程數據庫](#9-支持本地--遠程數據庫)
  - [`10` 支持多用戶管理](#10-支持多用戶管理)
  - [`11` 漸進式 Web 應用 (PWA)](#11-漸進式-web-應用-pwa)
  - [`12` 移動設備適配](#12-移動設備適配)
  - [`13` 自定義主題](#13-自定義主題)
  - [更多特性](#更多特性)
- [⚡️ 性能測試](#️-性能測試)
- [🛳 開箱即用](#-開箱即用)
  - [`A` 使用 Vercel、Zeabur 、Sealos 或 Alibaba Cloud 部署](#a-使用-vercelzeabur-sealos-或-alibaba-cloud-部署)
    - [Fork 之後](#fork-之後)
    - [保持更新](#保持更新)
  - [`B` 使用 Docker 部署](#b-使用-docker-部署)
  - [環境變量](#環境變量)
  - [獲取 OpenAI API Key](#獲取-openai-api-key)
    - [`A` 通過 OpenAI 官方渠道](#a-通過-openai-官方渠道)
    - [`B` 通過 OpenAI 第三方代理商](#b-通過-openai-第三方代理商)
- [📦 生態系統](#-生態系統)
- [🧩 插件體系](#-插件體系)
- [⌨️ 本地開發](#️-本地開發)
- [🤝 參與貢獻](#-參與貢獻)
- [❤ 社區贊助](#-社區贊助)
- [🔗 更多工具](#-更多工具)

####

<br/>

</details>

## 👋🏻 開始使用 & 交流

我們是一群充滿熱情的設計工程師，希望為 AIGC 提供現代化的設計組件和工具，並以開源的方式分享。
透過採用Bootstrapping 的方式，我們的目標是為開發人員和使用者提供一個更加開放、透明和使用者友好的產品生態系統。

LobeHub 旨在成為普通用戶與專業開發者測試 AI 助手的場所。LobeChat 目前正在積極開發中，有任何需求或者問題，歡迎提交 [issues][issues-link]

| [![][vercel-shield-badge]][vercel-link]   | 無需安裝或註冊！訪問我們的網站立刻體驗                                     |
| :---------------------------------------- | :--------------------------------------------------------------------------- |
| [![][discord-shield-badge]][discord-link] | 加入我們的 Discord 和開發者交流，和其他用戶們分享心得！ |

> \[!IMPORTANT]
>
> **收藏項目**，你將從 GitHub 上訂閱所有發佈通知～⭐️

[![][image-star]][github-stars-link]

<details><summary><kbd>收藏圖表</kbd></summary>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=lobehub%2Flobe-chat&theme=dark&type=Date">
    <img src="https://api.star-history.com/svg?repos=lobehub%2Flobe-chat&type=Date">
  </picture>
</details>

## ✨ 特性一覽

[![][image-feat-knowledgebase]][docs-feat-knowledgebase]

### `1` [文件上傳 / 知識庫][docs-feat-knowledgebase]

LobeChat 支持文件上傳與知識庫功能，你可以上傳文件、圖片、聲音、影片等多種類型的文件，以及創建知識庫，方便用戶管理和查找文件。同時在對話中使用文件和知識庫功能，實現更加豐富的對話體驗。

<https://github.com/user-attachments/assets/faa8cf67-e743-4590-8bf6-ebf6ccc34175>

> \[!TIP]
>
> 查閱 [📘 LobeChat 知識庫上線 —— 此刻起，跬步千里](https://lobehub.com/zh/blog/knowledge-base) 瞭解詳情。

<div align="right">

[![][back-to-top]](#readme-top)

</div>

[![][image-feat-privoder]][docs-feat-provider]

### `2` [多模型服務商支持][docs-feat-provider]

在 LobeChat 的不斷發展過程中，我們深刻意識到在提供 AI 會話服務時，模型服務商的多樣性對於滿足社區需求的重要性。因此，我們拓展了對多種模型服務商的支持，為用戶提供更豐富、多樣化的選擇。

通過這種方式，LobeChat 能夠更靈活地適應不同用戶的需求，同時也為開發者提供了更為廣泛的選擇空間。

#### 已支持的模型服務商

我們已經實現了對以下模型服務商的支持：

<!-- PROVIDER LIST -->

- **[OpenAI](https://lobechat.com/discover/provider/openai)**: OpenAI 是全球領先的人工智能研究機構，其開發的模型如 GPT 系列推動了自然語言處理的前沿。OpenAI 致力於通過創新和高效的 AI 解決方案改變多個行業。他們的產品具有顯著的性能和經濟性，廣泛用於研究、商業和創新應用。
- **[Ollama](https://lobechat.com/discover/provider/ollama)**: Ollama 提供的模型廣泛涵蓋代碼生成、數學運算、多語種處理和對話互動等領域，支持企業級和本地化部署的多樣化需求。
- **[Anthropic](https://lobechat.com/discover/provider/anthropic)**: Anthropic 是一家專注於人工智能研究和開發的公司，提供了一系列先進的語言模型，如 Claude 3.5 Sonnet、Claude 3 Sonnet、Claude 3 Opus 和 Claude 3 Haiku。這些模型在智能、速度和成本之間取得了理想的平衡，適用於從企業級工作負載到快速響應的各種應用場景。Claude 3.5 Sonnet 作為其最新模型，在多項評估中表現優異，同時保持了較高的性價比。
- **[Bedrock](https://lobechat.com/discover/provider/bedrock)**: Bedrock 是亞馬遜 AWS 提供的一項服務，專注於為企業提供先進的 AI 語言模型和視覺模型。其模型家族包括 Anthropic 的 Claude 系列、Meta 的 Llama 3.1 系列等，涵蓋從輕量級到高性能的多種選擇，支持文本生成、對話、圖像處理等多種任務，適用於不同規模和需求的企業應用。
- **[Google](https://lobechat.com/discover/provider/google)**: Google 的 Gemini 系列是其最先進、通用的 AI 模型，由 Google DeepMind 打造，專為多模態設計，支持文本、代碼、圖像、聲音和影片的無縫理解與處理。適用於從數據中心到移動設備的多種環境，極大提升了 AI 模型的效率與應用廣泛性。
- **[DeepSeek](https://lobechat.com/discover/provider/deepseek)**: DeepSeek 是一家專注於人工智能技術研究和應用的公司，其最新模型 DeepSeek-V3 多項評測成績超越 Qwen2.5-72B 和 Llama-3.1-405B 等開源模型，性能對齊領軍閉源模型 GPT-4o 與 Claude-3.5-Sonnet。
- **[HuggingFace](https://lobechat.com/discover/provider/huggingface)**: HuggingFace Inference API 提供了一種快速且免費的方式，讓您可以探索成千上萬種模型，適用於各種任務。無論您是在為新應用程序進行原型設計，還是在嘗試機器學習的功能，這個 API 都能讓您即時訪問多個領域的高性能模型。
- **[OpenRouter](https://lobechat.com/discover/provider/openrouter)**: OpenRouter 是一個提供多種前沿大模型接口的服務平台，支持 OpenAI、Anthropic、LLaMA 及更多，適合多樣化的開發和應用需求。用戶可根據自身需求靈活選擇最優的模型和價格，助力 AI 體驗的提升。
- **[Cloudflare Workers AI](https://lobechat.com/discover/provider/cloudflare)**: 在 Cloudflare 的全球網絡上運行由無服務器 GPU 驅動的機器學習模型。
- **[GitHub](https://lobechat.com/discover/provider/github)**: 通過 GitHub 模型，開發人員可以成為 AI 工程師，並使用行業領先的 AI 模型進行構建。

<details><summary><kbd>瀏覽更多供應商 (+26)</kbd></summary>

- **[Novita](https://lobechat.com/discover/provider/novita)**: Novita AI 是一個提供多種大語言模型與 AI 圖像生成的 API 服務的平台，靈活、可靠且具有成本效益。它支持 Llama3、Mistral 等最新的開源模型，並為生成式 AI 應用開發提供了全面、用戶友好且自動擴展的 API 解決方案，適合 AI 初創公司的快速發展。
- **[Together AI](https://lobechat.com/discover/provider/togetherai)**: Together AI 致力於通過創新的 AI 模型實現領先的性能，提供廣泛的自定義能力，包括快速擴展支持和直觀的部署流程，滿足企業的各種需求。
- **[Fireworks AI](https://lobechat.com/discover/provider/fireworksai)**: Fireworks AI 是一家領先的高級語言模型服務商，專注於功能調用和多模態處理。其最新模型 Firefunction V2 基於 Llama-3，優化用於函數調用、對話及指令跟隨。視覺語言模型 FireLLaVA-13B 支持圖像和文本混合輸入。其他 notable 模型包括 Llama 系列和 Mixtral 系列，提供高效的多語言指令跟隨與生成支持。
- **[Groq](https://lobechat.com/discover/provider/groq)**: Groq 的 LPU 推理引擎在最新的獨立大語言模型（LLM）基準測試中表現卓越，以其驚人的速度和效率重新定義了 AI 解決方案的標準。Groq 是一種即時推理速度的代表，在基於雲的部署中展現了良好的性能。
- **[Perplexity](https://lobechat.com/discover/provider/perplexity)**: Perplexity 是一家領先的對話生成模型提供商，提供多種先進的 Llama 3.1 模型，支持在線和離線應用，特別適用於複雜的自然語言處理任務。
- **[Mistral](https://lobechat.com/discover/provider/mistral)**: Mistral 提供先進的通用、專業和研究型模型，廣泛應用於複雜推理、多語言任務、代碼生成等領域，通過功能調用接口，用戶可以集成自定義功能，實現特定應用。
- **[Ai21Labs](https://lobechat.com/discover/provider/ai21)**: AI21 Labs 為企業構建基礎模型和人工智能系統，加速生成性人工智能在生產中的應用。
- **[Upstage](https://lobechat.com/discover/provider/upstage)**: Upstage 專注於為各種商業需求開發 AI 模型，包括 Solar LLM 和文檔 AI，旨在實現工作的人造通用智能（AGI）。通過 Chat API 創建簡單的對話代理，並支持功能調用、翻譯、嵌入以及特定領域應用。
- **[xAI](https://lobechat.com/discover/provider/xai)**: xAI 是一家致力於構建人工智能以加速人類科學發現的公司。我們的使命是推動我們對宇宙的共同理解。
- **[Qwen](https://lobechat.com/discover/provider/qwen)**: 通義千問是阿里雲自主研發的超大規模語言模型，具有強大的自然語言理解和生成能力。它可以回答各種問題、創作文字內容、表達觀點看法、撰寫代碼等，在多個領域發揮作用。
- **[Wenxin](https://lobechat.com/discover/provider/wenxin)**: 企業級一站式大模型與 AI 原生應用開發及服務平台，提供最全面易用的生成式人工智能模型開發、應用開發全流程工具鏈
- **[Hunyuan](https://lobechat.com/discover/provider/hunyuan)**: 由騰訊研發的大語言模型，具備強大的中文創作能力，複雜語境下的邏輯推理能力，以及可靠的任務執行能力
- **[Spark](https://lobechat.com/discover/provider/spark)**: 科大訊飛星火大模型提供多領域、多語言的強大 AI 能力，利用先進的自然語言處理技術，構建適用於智能硬件、智慧醫療、智慧金融等多種垂直場景的創新應用。
- **[ZhiPu](https://lobechat.com/discover/provider/zhipu)**: 智譜 AI 提供多模態與語言模型的開放平台，支持廣泛的 AI 應用場景，包括文本處理、圖像理解與編程輔助等。
- **[01.AI](https://lobechat.com/discover/provider/zeroone)**: 零一萬物致力於推動以人為本的 AI 2.0 技術革命，旨在通過大語言模型創造巨大的經濟和社會價值，並開創新的 AI 生態與商業模式。
- **[SenseNova](https://lobechat.com/discover/provider/sensenova)**: 商湯日日新，依託商湯大裝置的強大的基礎支撐，提供高效易用的全棧大模型服務。
- **[Stepfun](https://lobechat.com/discover/provider/stepfun)**: 階級星辰大模型具備行業領先的多模態及複雜推理能力，支持超長文本理解和強大的自主調度搜索引擎功能。
- **[Moonshot](https://lobechat.com/discover/provider/moonshot)**: Moonshot 是由北京月之暗面科技有限公司推出的開源平台，提供多種自然語言處理模型，應用領域廣泛，包括但不限於內容創作、學術研究、智能推薦、醫療診斷等，支持長文本處理和複雜生成任務。
- **[Baichuan](https://lobechat.com/discover/provider/baichuan)**: 百川智能是一家專注於人工智能大模型研發的公司，其模型在國內知識百科、長文本處理和生成創作等中文任務上表現卓越，超越了國外主流模型。百川智能還具備行業領先的多模態能力，在多項權威評測中表現優異。其模型包括 Baichuan 4、Baichuan 3 Turbo 和 Baichuan 3 Turbo 128k 等，分別針對不同應用場景進行優化，提供高性價比的解決方案。
- **[Minimax](https://lobechat.com/discover/provider/minimax)**: MiniMax 是 2021 年成立的通用人工智能科技公司，致力於與用戶共創智能。MiniMax 自主研發了不同模態的通用大模型，其中包括萬億參數的 MoE 文本大模型、語音大模型以及圖像大模型。並推出了海螺 AI 等應用。
- **[360 AI](https://lobechat.com/discover/provider/ai360)**: 360 AI 是 360 公司推出的 AI 模型和服務平台，提供多種先進的自然語言處理模型，包括 360GPT2 Pro、360GPT Pro、360GPT Turbo 和 360GPT Turbo Responsibility 8K。這些模型結合了大規模參數和多模態能力，廣泛應用於文本生成、語義理解、對話系統與代碼生成等領域。通過靈活的定價策略，360 AI 滿足多樣化用戶需求，支持開發者集成，推動智能化應用的革新和發展。
- **[Taichu](https://lobechat.com/discover/provider/taichu)**: 中科院自動化研究所和武漢人工智能研究院推出新一代多模態大模型，支持多輪問答、文本創作、圖像生成、3D 理解、信號分析等全面問答任務，擁有更強的認知、理解、創作能力，帶來全新互動體驗。
- **[InternLM](https://lobechat.com/discover/provider/internlm)**: 致力於大模型研究與開發工具鏈的開源組織。為所有 AI 開發者提供高效、易用的開源平台，讓最前沿的大模型與算法技術觸手可及
- **[SiliconCloud](https://lobechat.com/discover/provider/siliconcloud)**: SiliconCloud，基於優秀開源基礎模型的高性價比 GenAI 雲服務
- **[Higress](https://lobechat.com/discover/provider/higress)**: Higress 是一款雲原生 API 網關，在阿里內部為解決 Tengine reload 對長連接業務有損，以及 gRPC/Dubbo 負載均衡能力不足而誕生。
- **[Gitee AI](https://lobechat.com/discover/provider/giteeai)**: Gitee AI 的 Serverless API 為 AI 開發者提供開箱即用的大模型推理 API 服務。

</details>

> 📊 供應商總數: [<kbd>**36**</kbd>](https://lobechat.com/discover/providers)

 <!-- PROVIDER LIST -->

同時，我們也在計劃支持更多的模型服務商，以進一步豐富我們的服務商庫。如果你希望讓 LobeChat 支持你喜愛的服務商，歡迎加入我們的 [💬 社區討論](https://github.com/lobehub/lobe-chat/discussions/1284)。

<div align="right">

[![][back-to-top]](#readme-top)

</div>

[![][image-feat-local]][docs-feat-local]

### `3` [支持本地大型語言模型 (LLM)][docs-feat-local]

為了滿足特定用戶的需求，LobeChat 還基於 [Ollama](https://ollama.ai) 支持了本地模型的使用，讓用戶能夠更靈活地使用自己的或第三方的模型。

> \[!TIP]
>
> 查閱 [📘 在 LobeChat 中使用 Ollama][docs-usage-ollama] 獲得更多訊息

<div align="right">

[![][back-to-top]](#readme-top)

</div>

[![][image-feat-vision]][docs-feat-vision]

### `4` [模型視覺識別 (Model Visual)][docs-feat-vision]

LobeChat 已經支持 OpenAI 最新的 [`gpt-4-vision`](https://platform.openai.com/docs/guides/vision) 支持視覺識別的模型，這是一個具備視覺識別能力的多模態應用。
用戶可以輕鬆上傳圖片或者拖拽圖片到對話框中，助手將能夠識別圖片內容，並在此基礎上進行智能對話，構建更智能、更多元化的聊天場景。

這一特性打開了新的互動方式，使得交流不再局限於文字，而是可以涵蓋豐富的視覺元素。無論是日常使用中的圖片分享，還是在特定行業內的圖像解讀，助手都能提供出色的對話體驗。

<div align="right">

[![][back-to-top]](#readme-top)

</div>

[![][image-feat-tts]][docs-feat-tts]

### `5` [TTS & STT 語音轉化][docs-feat-tts]

LobeChat 支持文字轉語音（Text-to-Speech，TTS）和語音轉文字（Speech-to-Text，STT）技術，這使得我們的應用能夠將文本信息轉化為清晰的語音輸出，用戶可以像與真人交談一樣與我們的對話助手進行交流。
用戶可以從多種聲音中選擇，給助手搭配合適的音源。 同時，對於那些傾向於聽覺學習或者想要在忙碌中獲取信息的用戶來說，TTS 提供了一個極佳的解決方案。

在 LobeChat 中，我們精心挑選了一系列高品質的聲音選項 (OpenAI Audio, Microsoft Edge Speech)，以滿足不同地域和文化背景用戶的需求。用戶可以根據個人喜好或者特定場景來選擇合適的語音，從而獲得個性化的交流體驗。

<div align="right">

[![][back-to-top]](#readme-top)

</div>

[![][image-feat-t2i]][docs-feat-t2i]

### `6` [Text to Image 文生圖][docs-feat-t2i]

支持最新的文本到圖片生成技術，LobeChat 現在能夠讓用戶在與助手對話中直接調用文生圖工具進行創作。
通過利用 [`DALL-E 3`](https://openai.com/dall-e-3)、[`MidJourney`](https://www.midjourney.com/) 和 [`Pollinations`](https://pollinations.ai/) 等 AI 工具的能力， 助手們現在可以將你的想法轉化為圖像。
同時可以更私密和沈浸式地完成你的創作過程。

<div align="right">

[![][back-to-top]](#readme-top)

</div>

[![][image-feat-plugin]][docs-feat-plugin]

### `7` [插件系統 (Tools Calling)][docs-feat-plugin]

LobeChat 的插件生態系統是其核心功能的重要擴展，它極大地增強了 ChatGPT 的實用性和靈活性。

<video controls src="https://github.com/lobehub/lobe-chat/assets/28616219/f29475a3-f346-4196-a435-41a6373ab9e2" muted="false"></video>

通過利用插件，ChatGPT 能夠實現實時信息的獲取和處理，例如自動獲取最新新聞頭條，為用戶提供即時且相關的資訊。

此外，這些插件不僅局限於新聞聚合，還可以擴展到其他實用的功能，如快速檢索文檔、生成圖象、獲取電商平台數據，以及其他各式各樣的第三方服務。

> 通過文檔瞭解更多 [📘 插件使用][docs-usage-plugin]

<!-- PLUGIN LIST -->

| 最近新增                                                                                                               | 描述                                                                             |
| ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| [MintbaseSearch](https://lobechat.com/discover/plugin/mintbasesearch)<br/><sup>By **mintbase** on **2024-12-31**</sup> | 在 NEAR 協議上查找任何 NFT 數據。<br/>`加密貨幣` `nft`                           |
| [PortfolioMeta](https://lobechat.com/discover/plugin/StockData)<br/><sup>By **portfoliometa** on **2024-12-22**</sup>  | 分析股票並獲取全面的實時投資數據和分析。<br/>`股票`                              |
| [谷歌自定義搜索引擎](https://lobechat.com/discover/plugin/google-cse)<br/><sup>By **vsnthdev** on **2024-12-02**</sup> | 通過他們的官方自定義搜索引擎 API 搜索谷歌。<br/>`網絡` `搜索`                    |
| [Speak](https://lobechat.com/discover/plugin/speak)<br/><sup>By **speak** on **2024-12-02**</sup>                      | 使用 Speak，您的 AI 語言導師，學習如何用另一種語言說任何事情。<br/>`教育` `語言` |

> 📊 Total plugins: [<kbd>**48**</kbd>](https://lobechat.com/discover/plugins)

 <!-- PLUGIN LIST -->

<div align="right">

[![][back-to-top]](#readme-top)

</div>

[![][image-feat-agent]][docs-feat-agent]

### `8` [助手市集 (GPTs)][docs-feat-agent]

在 LobeChat 的助手市集中，創作者們可以發現一個充滿活力和創新的社區，它匯聚了眾多精心設計的助手，這些助手不僅在工作場景中發揮著重要作用，也在學習過程中提供了極大的便利。
我們的市集不僅是一個展示平台，更是一個協作的空間。在這裡，每個人都可以貢獻自己的智慧，分享個人開發的助手。

> \[!TIP]
>
> 通過 [🤖/🏪 提交助手][submit-agents-link] ，你可以輕鬆地將你的助手作品提交到我們的平台。我們特別強調的是，LobeChat 建立了一套精密的自動化國際化（i18n）工作流程， 它的強大之處在於能夠無縫地將你的助手轉化為多種語言版本。
> 這意味著，不論你的用戶使用何種語言，他們都能無障礙地體驗到你的助手。

> \[!IMPORTANT]
>
> 我歡迎所有用戶加入這個不斷成長的生態系統，共同參與到助手的迭代與優化中來。共同創造出更多有趣、實用且具有創新性的助手，進一步豐富助手的多樣性和實用性。

<!-- AGENT LIST -->

| 最近新增                                                                                                                                                                | 描述                                                                                      |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| [系統指令專家](https://lobechat.com/discover/assistant/instructer)<br/><sup>By **[yuyun2000](https://github.com/yuyun2000)** on **2024-12-04**</sup>                    | 擅長精煉與生成高效系統指令<br/>`系統指令` `寫作` `細節優化` `用戶需求`                    |
| [日語幫助記憶師](https://lobechat.com/discover/assistant/japan-language-helper)<br/><sup>By **[sharkbear212](https://github.com/sharkbear212)** on **2024-12-04**</sup> | 擅長日語五十音，平假名，片假名，單詞和短語解釋與記憶技巧<br/>`解釋` `記憶技巧` `日語教學` |
| [詩詞卡片設計師](https://lobechat.com/discover/assistant/poetry-card-designer)<br/><sup>By **[lianxin255](https://github.com/lianxin255)** on **2024-12-03**</sup>      | 擅長設計詩詞卡片，提升藝術感與吸引力<br/>`詩詞卡片設計` `卡片` `創意` `藝術表現`          |
| [日常醫生](https://lobechat.com/discover/assistant/yunchat-docter)<br/><sup>By **[yuyun2000](https://github.com/yuyun2000)** on **2024-11-30**</sup>                    | 擅長外科診療與個性化健康管理<br/>`全科醫學` `外科` `健康咨詢` `個性化治療` `醫學教育`     |

> 📊 助手總數: [<kbd>**453**</kbd> ](https://lobechat.com/discover/assistants)

 <!-- AGENT LIST -->

<div align="right">

[![][back-to-top]](#readme-top)

</div>

[![][image-feat-database]][docs-feat-database]

### `9` [支持本地 / 遠程數據庫][docs-feat-database]

LobeChat 支持同時使用服務端數據庫和本地數據庫。根據您的需求，您可以選擇合適的部署方案：

- 本地數據庫：適合希望對數據有更多掌控感和隱私保護的用戶。LobeChat 採用了 CRDT (Conflict-Free Replicated Data Type) 技術，實現了多端同步功能。這是一項實驗性功能，旨在提供無縫的數據同步體驗。
- 服務端數據庫：適合希望更便捷使用體驗的用戶。LobeChat 支持 PostgreSQL 作為服務端數據庫。關於如何配置服務端數據庫的詳細文檔，請前往 [配置服務端數據庫](https://lobehub.com/zh/docs/self-hosting/advanced/server-database)。

無論您選擇哪種數據庫，LobeChat 都能為您提供卓越的用戶體驗。

<div align="right">

[![][back-to-top]](#readme-top)

</div>

[![][image-feat-auth]][docs-feat-auth]

### `10` [支持多用戶管理][docs-feat-auth]

LobeChat 支持多用戶管理，提供了兩種主要的用戶認證和管理方案，以滿足不同需求：

- **next-auth**：LobeChat 集成了 `next-auth`，一個靈活且強大的身份驗證庫，支持多種身份驗證方式，包括 OAuth、郵件登錄、憑證登錄等。通過 `next-auth`，您可以輕鬆實現用戶的註冊、登錄、會話管理以及社交登錄等功能，確保用戶數據的安全性和隱私性。

- [**Clerk**](https://go.clerk.com/exgqLG0)：對於需要更高級用戶管理功能的用戶，LobeChat 還支持 `Clerk`，一個現代化的用戶管理平台。`Clerk` 提供了更豐富的功能，如多因素認證 (MFA)、白名單、用戶管理、登錄活動監控等。通過 `Clerk`，您可以獲得更高的安全性和靈活性，輕鬆應對生產級的用戶管理需求。

您可以根據自己的需求，選擇合適的用戶管理方案。

<div align="right">

[![][back-to-top]](#readme-top)

</div>

[![][image-feat-pwa]][docs-feat-pwa]

### `11` [漸進式 Web 應用 (PWA)][docs-feat-pwa]

我們深知在當今多設備環境下為用戶提供無縫體驗的重要性。為此，我們採用了漸進式 Web 應用 [PWA](https://support.google.com/chrome/answer/9658361) 技術，
這是一種能夠將網頁應用提升至接近原生應用體驗的現代 Web 技術。通過 PWA，LobeChat 能夠在桌面和移動設備上提供高度優化的用戶體驗，同時保持輕量級和高性能的特點。
在視覺和感覺上，我們也經過精心設計，以確保它的界面與原生應用無差別，提供流暢的動畫、響應式佈局和適配不同設備的屏幕分辨率。

> \[!NOTE]
>
> 若您未熟悉 PWA 的安裝過程，您可以按照以下步驟將 LobeChat 添加為您的桌面應用（也適用於移動設備）：
>
> - 在電腦上運行 Chrome 或 Edge 瀏覽器 .
> - 訪問 LobeChat 網頁 .
> - 在地址欄的右上角，單擊 <kbd>安裝</kbd> 圖標 .
> - 根據屏幕上的指示完成 PWA 的安裝 .

<div align="right">

[![][back-to-top]](#readme-top)

</div>

[![][image-feat-mobile]][docs-feat-mobile]

### `12` [移動設備適配][docs-feat-mobile]

針對移動設備進行了一系列的優化設計，以提升用戶的移動體驗。目前，我們正在對移動端的用戶體驗進行版本迭代，以實現更加流暢和直觀的交互。如果您有任何建議或想法，我們非常歡迎您通過 GitHub Issues 或者 Pull Requests 提供反饋。

<div align="right">

[![][back-to-top]](#readme-top)

</div>

[![][image-feat-theme]][docs-feat-theme]

### `13` [自定義主題][docs-feat-theme]

作為設計工程師出身，LobeChat 在界面設計上充分考慮用戶的個性化體驗，因此引入了靈活多變的主題模式，其中包括日間的亮色模式和夜間的深色模式。
除了主題模式的切換，還提供了一系列的顏色定制選項，允許用戶根據自己的喜好來調整應用的主題色彩。無論是想要沈穩的深藍，還是希望活潑的桃粉，或者是專業的灰白，用戶都能夠在 LobeChat 中找到匹配自己風格的顏色選擇。

> \[!TIP]
>
> 默認配置能夠智能地識別用戶系統的顏色模式，自動進行主題切換，以確保應用界面與操作系統保持一致的視覺體驗。對於喜歡手動調控細節的用戶，LobeChat 同樣提供了直觀的設置選項，針對聊天場景也提供了對話氣泡模式和文檔模式的選擇。

<div align="right">

[![][back-to-top]](#readme-top)

</div>

### 更多特性

除了上述功能特性以外，LobeChat 所具有的設計和技術能力將為你帶來更多使用保障：

- [x] 💎 **精緻 UI 設計**：經過精心設計的界面，具有優雅的外觀和流暢的交互效果，支持亮暗色主題，適配移動端。支持 PWA，提供更加接近原生應用的體驗。
- [x] 🗣️ **流暢的對話體驗**：流式響應帶來流暢的對話體驗，並且支持完整的 Markdown 渲染，包括代碼高亮、LaTex 公式、Mermaid 流程圖等。
- [x] 💨 **快速部署**：使用 Vercel 平台或者我們的 Docker 鏡像，只需點擊一鍵部署按鈕，即可在 1 分鐘內完成部署，無需複雜的配置過程。
- [x] 🔒 **隱私安全**：所有數據保存在用戶瀏覽器本地，保證用戶的隱私安全。
- [x] 🌐 **自定義域名**：如果用戶擁有自己的域名，可以將其綁定到平台上，方便在任何地方快速訪問對話助手。

> ✨ 隨著產品迭代持續更新，我們將會帶來更多更多令人激動的功能！

---

> \[!NOTE]
>
> 你可以在 Projects 中找到我們後續的 [Roadmap][github-project-link] 計劃

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## ⚡️ 性能測試

> \[!NOTE]
>
> 完整測試報告可見 [📘 Lighthouse 性能測試][docs-lighthouse]

|                    Desktop                    |                    Mobile                    |
| :-------------------------------------------: | :------------------------------------------: |
|               ![][chat-desktop]               |               ![][chat-mobile]               |
| [📑 Lighthouse 測試報告][chat-desktop-report] | [📑 Lighthouse 測試報告][chat-mobile-report] |

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🛳 開箱即用

LobeChat 提供了 Vercel 的 自托管版本 和 [Docker 鏡像][docker-release-link]，這使你可以在幾分鐘內構建自己的聊天機器人，無需任何基礎知識。

> \[!TIP]
>
> 完整教程請查閱 [📘 構建屬於自己的 Lobe Chat][docs-self-hosting]

### `A` 使用 Vercel、Zeabur 、Sealos 或 Alibaba Cloud 部署

如果想在 Vercel 、 Zeabur 或 阿里雲 上部署該服務，可以按照以下步驟進行操作：

- 準備好你的 [OpenAI API Key](https://platform.openai.com/account/api-keys) 。
- 點擊下方按鈕開始部署： 直接使用 GitHub 賬號登錄即可，記得在環境變量頁填入 `OPENAI_API_KEY` （必填） and `ACCESS_CODE`（推薦）；
- 部署完畢後，即可開始使用；
- 綁定自定義域名（可選）：Vercel 分配的域名 DNS 在某些區域被污染了，綁定自定義域名即可直連。目前 Zeabur 提供的域名還未被污染，大多數地區都可以直連。

<div align="center">

|            使用 Vercel 部署             |                      使用 Zeabur 部署                       |                      使用 Sealos 部署                       |                           使用 Alibaba Cloud 部署                            |
| :-------------------------------------: | :---------------------------------------------------------: | :---------------------------------------------------------: | :-----------------------------------------------------------------------: |
| [![][deploy-button-image]][deploy-link] | [![][deploy-on-zeabur-button-image]][deploy-on-zeabur-link] | [![][deploy-on-sealos-button-image]][deploy-on-sealos-link] | [![][deploy-on-alibaba-cloud-button-image]][deploy-on-alibaba-cloud-link] |

</div>

#### Fork 之後

在 Fork 後，請只保留 "upstream sync" Action 並在你 fork 的 GitHub Repo 中禁用其他 Action。

#### 保持更新

如果你根據 README 中的一鍵部署步驟部署了自己的項目，你可能會發現總是被提示 “有可用更新”。這是因為 Vercel 默認為你創建新項目而非 fork 本項目，這將導致無法準確檢測更新。

> \[!TIP]
>
> 我們建議按照 [📘 自動同步更新][docs-upstream-sync] 步驟重新部署。

<br/>

### `B` 使用 Docker 部署

[![][docker-release-shield]][docker-release-link]
[![][docker-size-shield]][docker-size-link]
[![][docker-pulls-shield]][docker-pulls-link]

我們提供了 Docker 鏡像，供你在自己的個人設備上部署 LobeChat 服務。使用以下命令即可使用一鍵啓動 LobeChat 服務：

```fish
$ docker run -d -p 3210:3210 \
  -e OPENAI_API_KEY=sk-xxxx \
  -e ACCESS_CODE=lobe66 \
  --name lobe-chat \
  lobehub/lobe-chat
```

> \[!TIP]
>
> 如果你需要通過代理使用 OpenAI 服務，你可以使用 `OPENAI_PROXY_URL` 環境變量來配置代理地址：

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
> 有關 Docker 部署的詳細說明，詳見 [📘 使用 Docker 部署][docs-docker]

<br/>

### 環境變量

本項目提供了一些額外的配置項，使用環境變量進行設置：

| 環境變量            | 類型 | 描述                                                                                                                          | 示例                                                                                                   |
| ------------------- | ---- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `OPENAI_API_KEY`    | 必選 | 這是你在 OpenAI 賬戶頁面申請的 API 密鑰                                                                                       | `sk-xxxxxx...xxxxxx`                                                                                   |
| `OPENAI_PROXY_URL`  | 可選 | 如果你手動配置了 OpenAI 接口代理，可以使用此配置項來覆蓋默認的 OpenAI API 請求基礎 URL                                        | `https://api.chatanywhere.cn` 或 `https://aihubmix.com/v1`<br/>默認值:<br/>`https://api.openai.com/v1` |
| `ACCESS_CODE`       | 可選 | 添加訪問此服務的密碼，你可以設置一個長密碼以防被爆破，該值用逗號分隔時為密碼數組                                              | `awCTe)re_r74` or `rtrt_ewee3@09!` or `code1,code2,code3`                                              |
| `OPENAI_MODEL_LIST` | 可選 | 用來控制模型列表，使用 `+` 增加一個模型，使用 `-` 來隱藏一個模型，使用 `模型名=展示名` 來自定義模型的展示名，用英文逗號隔開。 | `qwen-7b-chat,+glm-6b,-gpt-3.5-turbo`                                                                  |

> \[!NOTE]
>
> 完整環境變量可見 [📘 環境變量][docs-env-var]

<br/>

### 獲取 OpenAI API Key

API Key 是使用 LobeChat 進行大語言模型會話的必要信息，本節以 OpenAI 模型服務商為例，簡要介紹獲取 API Key 的方式。

#### `A` 通過 OpenAI 官方渠道

- 註冊一個 [OpenAI 賬戶](https://platform.openai.com/signup)，你需要使用國際手機號、非大陸郵箱進行註冊；
- 註冊完畢後，前往 [API Keys](https://platform.openai.com/api-keys) 頁面，點擊 `Create new secret key` 創建新的 API Key:

| 步驟 1：打開創建窗口                                                                                                                               | 步驟 2：創建 API Key                                                                                                                               | 步驟 3：獲取 API Key                                                                                                                               |
| -------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| <img src="https://github-production-user-asset-6210df.s3.amazonaws.com/28616219/296253192-ff2193dd-f125-4e58-82e8-91bc376c0d68.png" height="200"/> | <img src="https://github-production-user-asset-6210df.s3.amazonaws.com/28616219/296254170-803bacf0-4471-4171-ae79-0eab08d621d1.png" height="200"/> | <img src="https://github-production-user-asset-6210df.s3.amazonaws.com/28616219/296255167-f2745f2b-f083-4ba8-bc78-9b558e0002de.png" height="200"/> |

- 將此 API Key 填寫到 LobeChat 的 API Key 配置中，即可開始使用。

> \[!TIP]
>
> 賬戶註冊後，一般有 5 美元的免費額度，但有效期只有三個月。
> 如果你希望長期使用你的 API Key，你需要完成支付的信用卡綁定。由於 OpenAI 只支持外幣信用卡，因此你需要找到合適的支付渠道，此處不再詳細展開。

<br/>

#### `B` 通過 OpenAI 第三方代理商

如果你發現註冊 OpenAI 賬戶或者綁定外幣信用卡比較麻煩，可以考慮借助一些知名的 OpenAI 第三方代理商來獲取 API Key，這可以有效降低獲取 OpenAI API Key 的門檻。但與此同時，一旦使用三方服務，你可能也需要承擔潛在的風險，
請根據你自己的實際情況自行決策。以下是常見的第三方模型代理商列表，供你參考：

|                                                                                                                                                   | 服務商       | 特性說明                                                        | Proxy 代理地址            | 鏈接                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | --------------------------------------------------------------- | ------------------------- | ------------------------------- |
| <img src="https://github-production-user-asset-6210df.s3.amazonaws.com/17870709/296272721-c3ac0bf3-e433-4496-89c4-ebdc20689c17.jpg" width="48" /> | **AiHubMix** | 使用 OpenAI 企業接口，全站模型價格為官方 **86 折**（含 GPT-4 ） | `https://aihubmix.com/v1` | [獲取](https://lobe.li/XHnZIUP) |

> \[!WARNING]
>
> **免責申明**: 在此推薦的 OpenAI API Key 由第三方代理商提供，所以我們不對 API Key 的 **有效性** 和 **安全性** 負責，請你自行承擔購買和使用 API Key 的風險。

> \[!NOTE]
>
> 如果你是模型服務商，並認為自己的服務足夠穩定且價格實惠，歡迎聯繫我們，我們會在自行體驗和測試後酌情推薦。

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 📦 生態系統

| NPM                               | 倉庫                                    | 描述                                                                                     | 版本                                      |
| --------------------------------- | --------------------------------------- | ---------------------------------------------------------------------------------------- | ----------------------------------------- |
| [@lobehub/ui][lobe-ui-link]       | [lobehub/lobe-ui][lobe-ui-github]       | 構建 AIGC 網頁應用程序而設計的開源 UI 組件庫                                             | [![][lobe-ui-shield]][lobe-ui-link]       |
| [@lobehub/icons][lobe-icons-link] | [lobehub/lobe-icons][lobe-icons-github] | 主流 AI / LLM 模型和公司 SVG Logo 與 Icon 合集                                           | [![][lobe-icons-shield]][lobe-icons-link] |
| [@lobehub/tts][lobe-tts-link]     | [lobehub/lobe-tts][lobe-tts-github]     | AI TTS / STT 語音合成 / 識別 React Hooks 庫                                              | [![][lobe-tts-shield]][lobe-tts-link]     |
| [@lobehub/lint][lobe-lint-link]   | [lobehub/lobe-lint][lobe-lint-github]   | LobeHub 代碼樣式規範 ESlint，Stylelint，Commitlint，Prettier，Remark 和 Semantic Release | [![][lobe-lint-shield]][lobe-lint-link]   |

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🧩 插件體系

插件提供了擴展 LobeChat [Function Calling][docs-functionc-call] 能力的方法。可以用於引入新的 Function Calling，甚至是新的消息結果渲染方式。如果你對插件開發感興趣，請在 Wiki 中查閱我們的 [📘 插件開發指引][docs-plugin-dev] 。

- [lobe-chat-plugins][lobe-chat-plugins]：插件索引從該倉庫的 index.json 中獲取插件列表並顯示給用戶。
- [chat-plugin-template][chat-plugin-template]：插件開發模版，你可以通過項目模版快速新建插件項目。
- [@lobehub/chat-plugin-sdk][chat-plugin-sdk]：插件 SDK 可幫助您創建出色的 Lobe Chat 插件。
- [@lobehub/chat-plugins-gateway][chat-plugins-gateway]：插件網關是一個後端服務，作為 LobeChat 插件的網關。我們使用 Vercel 部署此服務。主要的 API POST /api/v1/runner 被部署為 Edge Function。

> \[!NOTE]
>
> 插件系統目前正在進行重大開發。您可以在以下 Issues 中瞭解更多信息:
>
> - [x] [**插件一期**](https://github.com/lobehub/lobe-chat/issues/73): 實現插件與主體分離，將插件拆分為獨立倉庫維護，並實現插件的動態加載
> - [x] [**插件二期**](https://github.com/lobehub/lobe-chat/issues/97): 插件的安全性與使用的穩定性，更加精准地呈現異常狀態，插件架構的可維護性與開發者友好
> - [x] [**插件三期**](https://github.com/lobehub/lobe-chat/issues/149)：更高階與完善的自定義能力，支持插件鑒權與示例

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## ⌨️ 本地開發

可以使用 GitHub Codespaces 進行在線開發：

[![][codespaces-shield]][codespaces-link]

或者使用以下命令進行本地開發：

```fish
$ git clone https://github.com/lobehub/lobe-chat.git
$ cd lobe-chat
$ pnpm install
$ pnpm run dev
```

如果你希望瞭解更多詳情，歡迎可以查閱我們的 [📘 開發指南][docs-dev-guide]

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🤝 參與貢獻

我們非常歡迎各種形式的貢獻。如果你對貢獻代碼感興趣，可以查看我們的 GitHub [Issues][github-issues-link] 和 [Projects][github-project-link]，大展身手，向我們展示你的奇思妙想。

> \[!TIP]
>
> 我們希望創建一個技術分享型社區，一個可以促進知識共享、想法交流，激發彼此鼓勵和協作的環境。
> 同時歡迎聯繫我們提供產品功能和使用體驗反饋，幫助我們將 LobeChat 建設得更好。
>
> **組織維護者:** [@arvinxx](https://github.com/arvinxx) [@canisminor1990](https://github.com/canisminor1990)

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

## ❤ 社區贊助

每一分支持都珍貴無比，匯聚成我們支持的璀璨銀河！你就像一顆划破夜空的流星，瞬間點亮我們前行的道路。感謝你對我們的信任 —— 你的支持筆就像星辰導航，一次又一次地為項目指明前進的光芒。

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

- **[🅰️ Lobe SD Theme][lobe-theme]:** Stable Diffusion WebUI 的現代主題，精緻的界面設計，高度可定制的 UI，以及提高效率的功能。
- **[⛵️ Lobe Midjourney WebUI][lobe-midjourney-webui]:** Midjourney WebUI, 能夠根據文本提示快速生成豐富多樣的圖像，激發創造力，增強對話交流。
- **[🌏 Lobe i18n][lobe-i18n]:** Lobe i18n 是一個由 ChatGPT 驅動的 i18n（國際化）翻譯過程的自動化工具。它支持自動分割大文件、增量更新，以及為 OpenAI 模型、API 代理和溫度提供定制選項的功能。
- **[💌 Lobe Commit][lobe-commit]:** Lobe Commit 是一個 CLI 工具，它利用 Langchain/ChatGPT 生成基於 Gitmoji 的提交消息。

<div align="right">

[![][back-to-top]](#readme-top)

</div>

---

<details><summary><h4>📝 許可證</h4></summary>

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
