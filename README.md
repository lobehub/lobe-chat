<div align="center"><a name="readme-top"></a>

# Lobe Chat

An open-source, modern-design ChatGPT/LLMs UI/Framework.<br/>
Supports speech-synthesis, multi-modal, and extensible () plugin system.<br/>
One-click **FREE** deployment of your private OpenAI ChatGPT/Claude/Gemini/Groq/Ollama chat application.

**English** · [简体中文](./README.zh-CN.md) · [日本語](./README.ja-JP.md) ·  ·  ·  ·  ·

<!-- SHIELD GROUP -->

<br/>

<br/>

<br>

**Share LobeChat Repository**

<sup>Pioneering the new age of thinking and creating. Built for you, the Super Individual.</sup>

</div>

<details>
<summary><kbd>Table of contents</kbd></summary>

#### TOC

- [👋🏻 Getting Started & Join Our Community](#-getting-started--join-our-community)
- [✨ Features](#-features)
  - [`1` File Upload/Knowledge Base](#1-file-uploadknowledge-base)
  - [`2` Multi-Model Service Provider Support](#2-multi-model-service-provider-support)
  - [`3` Local Large Language Model (LLM) Support](#3-local-large-language-model-llm-support)
  - [`4` Model Visual Recognition](#4-model-visual-recognition)
  - [`5` TTS & STT Voice Conversation](#5-tts--stt-voice-conversation)
  - [`6` Text to Image Generation](#6-text-to-image-generation)
  - [`7` Plugin System (Function Calling)](#7-plugin-system-function-calling)
  - [`8` Agent Market (GPTs)](#8-agent-market-gpts)
  - [`9` Support Local / Remote Database](#9-support-local--remote-database)
  - [`10` Support Multi-User Management](#10-support-multi-user-management)
  - [`11` Progressive Web App (PWA)](#11-progressive-web-app-pwa)
  - [`12` Mobile Device Adaptation](#12-mobile-device-adaptation)
  - [`13` Custom Themes](#13-custom-themes)
  - [`*` What's more](#-whats-more)
- [⚡️ Performance](#️-performance)
- [🛳 Self Hosting](#-self-hosting)
  - [`A` Deploying with Vercel, Zeabur , Sealos or Alibaba Cloud](#a-deploying-with-vercel-zeabur--sealos-or-alibaba-cloud)
  - [`B` Deploying with Docker](#b-deploying-with-docker)
  - [Environment Variable](#environment-variable)
- [📦 Ecosystem](#-ecosystem)
- [🧩 Plugins](#-plugins)
- [⌨️ Local Development](#️-local-development)
- [🤝 Contributing](#-contributing)
- [❤️ Sponsor](#️-sponsor)
- [🔗 More Products](#-more-products)

####

<br/>

</details>

## 👋🏻 Getting Started & Join Our Community

We are a group of e/acc design-engineers, hoping to provide modern design components and tools for AIGC.
By adopting the Bootstrapping approach, we aim to provide developers and users with a more open, transparent, and user-friendly product ecosystem.

Whether for users or professional developers, LobeHub will be your AI Agent playground. Please be aware that LobeChat is currently under active development, and feedback is welcome for any  encountered.

| No installation or registration necessary! Visit our website to experience it firsthand.                           |
| ------------------------------------------------------------------------------------------------------------------ |
| Join our Discord community! This is where you can connect with developers and other enthusiastic users of LobeHub. |

> \[!IMPORTANT\]
> \*\***Star Us**, You will receive all release notifications from GitHub without any delay \~ ⭐️

<details>
  <summary><kbd>Star History</kbd></summary>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=lobehub%2Flobe-chat&theme=dark&type=Date">
    <img width="100%" src="https://api.star-history.com/svg?repos=lobehub%2Flobe-chat&type=Date">
  </picture>
</details>

## ✨ Features

### `1`

LobeChat supports file upload and knowledge base functionality. You can upload various types of files including documents, images, audio, and video, as well as create knowledge bases, making it convenient for users to manage and search for files. Additionally, you can utilize files and knowledge base features during conversations, enabling a richer dialogue experience.

<https://github.com/user-attachments/assets/faa8cf67-e743-4590-8bf6-ebf6ccc34175>

> \[!TIP]
>
> Learn more on [📘 LobeChat Knowledge Base Launch — From Now On, Every Step Counts](https://lobehub.com/blog/knowledge-base)

<div align="right">

</div>

### `2`

In the continuous development of LobeChat, we deeply understand the importance of diversity in model service providers for meeting the needs of the community when providing AI conversation services. Therefore, we have expanded our support to multiple model service providers, rather than being limited to a single one, in order to offer users a more diverse and rich selection of conversations.

In this way, LobeChat can more flexibly adapt to the needs of different users, while also providing developers with a wider range of choices.

#### Supported Model Service Providers

We have implemented support for the following model service providers:

<!-- PROVIDER LIST -->

- **[OpenAI](https://lobechat.com/discover/provider/openai)**: OpenAI is a global leader in artificial intelligence research, with models like the GPT series pushing the frontiers of natural language processing. OpenAI is committed to transforming multiple industries through innovative and efficient AI solutions. Their products demonstrate significant performance and cost-effectiveness, widely used in research, business, and innovative applications.
- **[Ollama](https://lobechat.com/discover/provider/ollama)**: Ollama provides models that cover a wide range of fields, including code generation, mathematical operations, multilingual processing, and conversational interaction, catering to diverse enterprise-level and localized deployment needs.
- **[Anthropic](https://lobechat.com/discover/provider/anthropic)**: Anthropic is a company focused on AI research and development, offering a range of advanced language models such as Claude 3.5 Sonnet, Claude 3 Sonnet, Claude 3 Opus, and Claude 3 Haiku. These models achieve an ideal balance between intelligence, speed, and cost, suitable for various applications from enterprise workloads to rapid-response scenarios. Claude 3.5 Sonnet, as their latest model, has excelled in multiple evaluations while maintaining a high cost-performance ratio.
- **[Bedrock](https://lobechat.com/discover/provider/bedrock)**: Bedrock is a service provided by Amazon AWS, focusing on delivering advanced AI language and visual models for enterprises. Its model family includes Anthropic's Claude series, Meta's Llama 3.1 series, and more, offering a range of options from lightweight to high-performance, supporting tasks such as text generation, conversation, and image processing for businesses of varying scales and needs.
- **[Google](https://lobechat.com/discover/provider/google)**: Google's Gemini series represents its most advanced, versatile AI models, developed by Google DeepMind, designed for multimodal capabilities, supporting seamless understanding and processing of text, code, images, audio, and video. Suitable for various environments from data centers to mobile devices, it significantly enhances the efficiency and applicability of AI models.
- **[DeepSeek](https://lobechat.com/discover/provider/deepseek)**: DeepSeek is a company focused on AI technology research and application, with its latest model DeepSeek-V2.5 integrating general dialogue and code processing capabilities, achieving significant improvements in human preference alignment, writing tasks, and instruction following.
- **[HuggingFace](https://lobechat.com/discover/provider/huggingface)**: The HuggingFace Inference API provides a fast and free way for you to explore thousands of models for various tasks. Whether you are prototyping for a new application or experimenting with the capabilities of machine learning, this API gives you instant access to high-performance models across multiple domains.
- **[OpenRouter](https://lobechat.com/discover/provider/openrouter)**: OpenRouter is a service platform providing access to various cutting-edge large model interfaces, supporting OpenAI, Anthropic, LLaMA, and more, suitable for diverse development and application needs. Users can flexibly choose the optimal model and pricing based on their requirements, enhancing the AI experience.
- **[Cloudflare Workers AI](https://lobechat.com/discover/provider/cloudflare)**: Run serverless GPU-powered machine learning models on Cloudflare's global network.
- **[GitHub](https://lobechat.com/discover/provider/github)**: With GitHub Models, developers can become AI engineers and leverage the industry's leading AI models.

<details><summary><kbd>See more providers (+26)</kbd></summary>

- **[Novita](https://lobechat.com/discover/provider/novita)**: Novita AI is a platform providing a variety of large language models and AI image generation API services, flexible, reliable, and cost-effective. It supports the latest open-source models like Llama3 and Mistral, offering a comprehensive, user-friendly, and auto-scaling API solution for generative AI application development, suitable for the rapid growth of AI startups.
- **[Together AI](https://lobechat.com/discover/provider/togetherai)**: Together AI is dedicated to achieving leading performance through innovative AI models, offering extensive customization capabilities, including rapid scaling support and intuitive deployment processes to meet various enterprise needs.
- **[Fireworks AI](https://lobechat.com/discover/provider/fireworksai)**: Fireworks AI is a leading provider of advanced language model services, focusing on functional calling and multimodal processing. Its latest model, Firefunction V2, is based on Llama-3, optimized for function calling, conversation, and instruction following. The visual language model FireLLaVA-13B supports mixed input of images and text. Other notable models include the Llama series and Mixtral series, providing efficient multilingual instruction following and generation support.
- **[Groq](https://lobechat.com/discover/provider/groq)**: Groq's LPU inference engine has excelled in the latest independent large language model (LLM) benchmarks, redefining the standards for AI solutions with its remarkable speed and efficiency. Groq represents instant inference speed, demonstrating strong performance in cloud-based deployments.
- **[Perplexity](https://lobechat.com/discover/provider/perplexity)**: Perplexity is a leading provider of conversational generation models, offering various advanced Llama 3.1 models that support both online and offline applications, particularly suited for complex natural language processing tasks.
- **[Mistral](https://lobechat.com/discover/provider/mistral)**: Mistral provides advanced general, specialized, and research models widely used in complex reasoning, multilingual tasks, and code generation. Through functional calling interfaces, users can integrate custom functionalities for specific applications.
- **[Ai21Labs](https://lobechat.com/discover/provider/ai21)**: AI21 Labs builds foundational models and AI systems for enterprises, accelerating the application of generative AI in production.
- **[Upstage](https://lobechat.com/discover/provider/upstage)**: Upstage focuses on developing AI models for various business needs, including Solar LLM and document AI, aiming to achieve artificial general intelligence (AGI) for work. It allows for the creation of simple conversational agents through Chat API and supports functional calling, translation, embedding, and domain-specific applications.
- **[xAI](https://lobechat.com/discover/provider/xai)**: xAI is a company dedicated to building artificial intelligence to accelerate human scientific discovery. Our mission is to advance our collective understanding of the universe.
- **[Qwen](https://lobechat.com/discover/provider/qwen)**: Tongyi Qianwen is a large-scale language model independently developed by Alibaba Cloud, featuring strong natural language understanding and generation capabilities. It can answer various questions, create written content, express opinions, and write code, playing a role in multiple fields.
- **[Wenxin](https://lobechat.com/discover/provider/wenxin)**: An enterprise-level one-stop platform for large model and AI-native application development and services, providing the most comprehensive and user-friendly toolchain for the entire process of generative artificial intelligence model development and application development.
- **[Hunyuan](https://lobechat.com/discover/provider/hunyuan)**: A large language model developed by Tencent, equipped with powerful Chinese creative capabilities, logical reasoning abilities in complex contexts, and reliable task execution skills.
- **[Spark](https://lobechat.com/discover/provider/spark)**: iFlytek's Spark model provides powerful AI capabilities across multiple domains and languages, utilizing advanced natural language processing technology to build innovative applications suitable for smart hardware, smart healthcare, smart finance, and other vertical scenarios.
- **[ZhiPu](https://lobechat.com/discover/provider/zhipu)**: Zhipu AI offers an open platform for multimodal and language models, supporting a wide range of AI application scenarios, including text processing, image understanding, and programming assistance.
- **[01.AI](https://lobechat.com/discover/provider/zeroone)**: 01.AI focuses on AI 2.0 era technologies, vigorously promoting the innovation and application of 'human + artificial intelligence', using powerful models and advanced AI technologies to enhance human productivity and achieve technological empowerment.
- **[SenseNova](https://lobechat.com/discover/provider/sensenova)**: SenseNova, backed by SenseTime's robust infrastructure, offers efficient and user-friendly full-stack large model services.
- **[Stepfun](https://lobechat.com/discover/provider/stepfun)**: StepFun's large model possesses industry-leading multimodal and complex reasoning capabilities, supporting ultra-long text understanding and powerful autonomous scheduling search engine functions.
- **[Moonshot](https://lobechat.com/discover/provider/moonshot)**: Moonshot is an open-source platform launched by Beijing Dark Side Technology Co., Ltd., providing various natural language processing models with a wide range of applications, including but not limited to content creation, academic research, intelligent recommendations, and medical diagnosis, supporting long text processing and complex generation tasks.
- **[Baichuan](https://lobechat.com/discover/provider/baichuan)**: Baichuan Intelligence is a company focused on the research and development of large AI models, with its models excelling in domestic knowledge encyclopedias, long text processing, and generative creation tasks in Chinese, surpassing mainstream foreign models. Baichuan Intelligence also possesses industry-leading multimodal capabilities, performing excellently in multiple authoritative evaluations. Its models include Baichuan 4, Baichuan 3 Turbo, and Baichuan 3 Turbo 128k, each optimized for different application scenarios, providing cost-effective solutions.
- **[Minimax](https://lobechat.com/discover/provider/minimax)**: MiniMax is a general artificial intelligence technology company established in 2021, dedicated to co-creating intelligence with users. MiniMax has independently developed general large models of different modalities, including trillion-parameter MoE text models, voice models, and image models, and has launched applications such as Conch AI.
- **[360 AI](https://lobechat.com/discover/provider/ai360)**: 360 AI is an AI model and service platform launched by 360 Company, offering various advanced natural language processing models, including 360GPT2 Pro, 360GPT Pro, 360GPT Turbo, and 360GPT Turbo Responsibility 8K. These models combine large-scale parameters and multimodal capabilities, widely applied in text generation, semantic understanding, dialogue systems, and code generation. With flexible pricing strategies, 360 AI meets diverse user needs, supports developer integration, and promotes the innovation and development of intelligent applications.
- **[Taichu](https://lobechat.com/discover/provider/taichu)**: The Institute of Automation, Chinese Academy of Sciences, and Wuhan Artificial Intelligence Research Institute have launched a new generation of multimodal large models, supporting comprehensive question-answering tasks such as multi-turn Q\&A, text creation, image generation, 3D understanding, and signal analysis, with stronger cognitive, understanding, and creative abilities, providing a new interactive experience.
- **[InternLM](https://lobechat.com/discover/provider/internlm)**: An open-source organization dedicated to the research and development of large model toolchains. It provides an efficient and user-friendly open-source platform for all AI developers, making cutting-edge large models and algorithm technologies easily accessible.
- **[SiliconCloud](https://lobechat.com/discover/provider/siliconcloud)**: SiliconFlow is dedicated to accelerating AGI for the benefit of humanity, enhancing large-scale AI efficiency through an easy-to-use and cost-effective GenAI stack.
- **[Higress](https://lobechat.com/discover/provider/higress)**: Higress is a cloud-native API gateway that was developed internally at Alibaba to address the issues of Tengine reload affecting long-lived connections and the insufficient load balancing capabilities for gRPC/Dubbo.
- **[Gitee AI](https://lobechat.com/discover/provider/giteeai)**: Gitee AI's Serverless API provides AI developers with an out of the box large model inference API service.

</details>

> 📊 Total providers: <kbd>[**36**](https://lobechat.com/discover/providers)</kbd>

 <!-- PROVIDER LIST -->

At the same time, we are also planning to support more model service providers. If you would like LobeChat to support your favorite service provider, feel free to join our [💬 community discussion](https://github.com/lobehub/lobe-chat/discussions/1284).

<div align="right">

</div>

### `3`

To meet the specific needs of users, LobeChat also supports the use of local models based on [Ollama](https://ollama.ai), allowing users to flexibly use their own or third-party models.

> \[!TIP\]
>
> Learn more about  by checking it out.

<div align="right">

</div>

### `4`

LobeChat now supports OpenAI's latest [`gpt-4-vision`](https://platform.openai.com/docs/guides/vision) model with visual recognition capabilities,
a multimodal intelligence that can perceive visuals. Users can easily upload or drag and drop images into the dialogue box,
and the agent will be able to recognize the content of the images and engage in intelligent conversation based on this,
creating smarter and more diversified chat scenarios.

This feature opens up new interactive methods, allowing communication to transcend text and include a wealth of visual elements.
Whether it's sharing images in daily use or interpreting images within specific industries, the agent provides an outstanding conversational experience.

<div align="right">

</div>

### `5`

LobeChat supports Text-to-Speech (TTS) and Speech-to-Text (STT) technologies, enabling our application to convert text messages into clear voice outputs,
allowing users to interact with our conversational agent as if they were talking to a real person. Users can choose from a variety of voices to pair with the agent.

Moreover, TTS offers an excellent solution for those who prefer auditory learning or desire to receive information while busy.
In LobeChat, we have meticulously selected a range of high-quality voice options (OpenAI Audio, Microsoft Edge Speech) to meet the needs of users from different regions and cultural backgrounds.
Users can choose the voice that suits their personal preferences or specific scenarios, resulting in a personalized communication experience.

<div align="right">

</div>

### `6`

With support for the latest text-to-image generation technology, LobeChat now allows users to invoke image creation tools directly within conversations with the agent. By leveraging the capabilities of AI tools such as [`DALL-E 3`](https://openai.com/dall-e-3), [`MidJourney`](https://www.midjourney.com/), and [`Pollinations`](https://pollinations.ai/), the agents are now equipped to transform your ideas into images.

This enables a more private and immersive creative process, allowing for the seamless integration of visual storytelling into your personal dialogue with the agent.

<div align="right">

</div>

### `7`

The plugin ecosystem of LobeChat is an important extension of its core functionality, greatly enhancing the practicality and flexibility of the LobeChat assistant.

By utilizing plugins, LobeChat assistants can obtain and process real-time information, such as searching for web information and providing users with instant and relevant news.

In addition, these plugins are not limited to news aggregation, but can also extend to other practical functions, such as quickly searching documents, generating images, obtaining data from various platforms like Bilibili, Steam, and interacting with various third-party services.

> \[!TIP\]
>
> Learn more about  by checking it out.

<!-- PLUGIN LIST -->

| Recent Submits                                                                                                                            | Description                                                                                                                |
| ----------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| [PortfolioMeta](https://lobechat.com/discover/plugin/StockData)<br/><sup>By **portfoliometa** on **2024-12-22**</sup>                     | Analyze stocks and get comprehensive real-time investment data and analytics.<br/>`stock`                                  |
| [Google CSE](https://lobechat.com/discover/plugin/google-cse)<br/><sup>By **vsnthdev** on **2024-12-02**</sup>                            | Searches Google through their official CSE API.<br/>`web` `search`                                                         |
| [Speak](https://lobechat.com/discover/plugin/speak)<br/><sup>By **speak** on **2024-12-02**</sup>                                         | Learn how to say anything in another language with Speak, your AI-powered language tutor.<br/>`education` `language`       |
| [Tongyi wanxiang Image Generator](https://lobechat.com/discover/plugin/alps-tongyi-image)<br/><sup>By **YoungTx** on **2024-08-09**</sup> | This plugin uses Alibaba's Tongyi Wanxiang model to generate images based on text prompts.<br/>`image` `tongyi` `wanxiang` |

> 📊 Total plugins: <kbd>[**48**](https://lobechat.com/discover/plugins)</kbd>

 <!-- PLUGIN LIST -->

<div align="right">

</div>

### `8`

In LobeChat Agent Marketplace, creators can discover a vibrant and innovative community that brings together a multitude of well-designed agents,
which not only play an important role in work scenarios but also offer great convenience in learning processes.
Our marketplace is not just a showcase platform but also a collaborative space. Here, everyone can contribute their wisdom and share the agents they have developed.

> \[!TIP\]
>
> By , you can easily submit your agent creations to our platform.
> Importantly, LobeChat has established a sophisticated automated internationalization (i18n) workflow,
> capable of seamlessly translating your agent into multiple language versions.
> This means that no matter what language your users speak, they can experience your agent without barriers.

> \[!IMPORTANT]
>
> We welcome all users to join this growing ecosystem and participate in the iteration and optimization of agents.
> Together, we can create more interesting, practical, and innovative agents, further enriching the diversity and practicality of the agent offerings.

<!-- AGENT LIST -->

| Recent Submits                                                                                                                                                                  | Description                                                                                                                                                              |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [System Instruction Expert](https://lobechat.com/discover/assistant/instructer)<br/><sup>By **[yuyun2000](https://github.com/yuyun2000)** on **2024-12-04**</sup>               | Skilled in refining and generating efficient system instructions<br/>`system-instructions` `writing` `detail-optimization` `user-needs`                                  |
| [Japanese Memory Helper](https://lobechat.com/discover/assistant/japan-language-helper)<br/><sup>By **[sharkbear212](https://github.com/sharkbear212)** on **2024-12-04**</sup> | Specializes in Japanese Hiragana, Katakana, vocabulary, and memory techniques for explanations and phrases<br/>`explanation` `memory-techniques` `japanese-teaching`     |
| [Poetry Card Designer](https://lobechat.com/discover/assistant/poetry-card-designer)<br/><sup>By **[lianxin255](https://github.com/lianxin255)** on **2024-12-03**</sup>        | Skilled in designing poetry cards to enhance artistic sense and appeal<br/>`poetry-card-design` `card` `creativity` `artistic-expression`                                |
| [Daily Doctor](https://lobechat.com/discover/assistant/yunchat-docter)<br/><sup>By **[yuyun2000](https://github.com/yuyun2000)** on **2024-11-30**</sup>                        | Specializes in surgical diagnosis and personalized health management<br/>`general-medicine` `surgery` `health-consultation` `personalized-treatment` `medical-education` |

> 📊 Total agents: <kbd>[**453**](https://lobechat.com/discover/assistants)</kbd>[ ](https://lobechat.com/discover/assistants)

 <!-- AGENT LIST -->

<div align="right">

</div>

### `9`

LobeChat supports the use of both server-side and local databases. Depending on your needs, you can choose the appropriate deployment solution:

- **Local database**: suitable for users who want more control over their data and privacy protection. LobeChat uses CRDT (Conflict-Free Replicated Data Type) technology to achieve multi-device synchronization. This is an experimental feature aimed at providing a seamless data synchronization experience.
- **Server-side database**: suitable for users who want a more convenient user experience. LobeChat supports PostgreSQL as a server-side database. For detailed documentation on how to configure the server-side database, please visit [Configure Server-side Database](https://lobehub.com/docs/self-hosting/advanced/server-database).

Regardless of which database you choose, LobeChat can provide you with an excellent user experience.

<div align="right">

</div>

### `10`

LobeChat supports multi-user management and provides two main user authentication and management solutions to meet different needs:

- **next-auth**: LobeChat integrates `next-auth`, a flexible and powerful identity verification library that supports multiple authentication methods, including OAuth, email login, credential login, etc. With `next-auth`, you can easily implement user registration, login, session management, social login, and other functions to ensure the security and privacy of user data.

- [**Clerk**](https://go.clerk.com/exgqLG0): For users who need more advanced user management features, LobeChat also supports `Clerk`, a modern user management platform. `Clerk` provides richer functions, such as multi-factor authentication (MFA), user profile management, login activity monitoring, etc. With `Clerk`, you can get higher security and flexibility, and easily cope with complex user management needs.

Regardless of which user management solution you choose, LobeChat can provide you with an excellent user experience and powerful functional support.

<div align="right">

</div>

### `11`

We deeply understand the importance of providing a seamless experience for users in today's multi-device environment.
Therefore, we have adopted Progressive Web Application ([PWA](https://support.google.com/chrome/answer/9658361)) technology,
a modern web technology that elevates web applications to an experience close to that of native apps.

Through PWA, LobeChat can offer a highly optimized user experience on both desktop and mobile devices while maintaining its lightweight and high-performance characteristics.
Visually and in terms of feel, we have also meticulously designed the interface to ensure it is indistinguishable from native apps,
providing smooth animations, responsive layouts, and adapting to different device screen resolutions.

> \[!NOTE]
>
> If you are unfamiliar with the installation process of PWA, you can add LobeChat as your desktop application (also applicable to mobile devices) by following these steps:
>
> - Launch the Chrome or Edge browser on your computer.
> - Visit the LobeChat webpage.
> - In the upper right corner of the address bar, click on the <kbd>Install</kbd> icon.
> - Follow the instructions on the screen to complete the PWA Installation.

<div align="right">

</div>

### `12`

We have carried out a series of optimization designs for mobile devices to enhance the user's mobile experience. Currently, we are iterating on the mobile user experience to achieve smoother and more intuitive interactions. If you have any suggestions or ideas, we welcome you to provide feedback through GitHub Issues or Pull Requests.

<div align="right">

</div>

### `13`

As a design-engineering-oriented application, LobeChat places great emphasis on users' personalized experiences,
hence introducing flexible and diverse theme modes, including a light mode for daytime and a dark mode for nighttime.
Beyond switching theme modes, a range of color customization options allow users to adjust the application's theme colors according to their preferences.
Whether it's a desire for a sober dark blue, a lively peach pink, or a professional gray-white, users can find their style of color choices in LobeChat.

> \[!TIP]
>
> The default configuration can intelligently recognize the user's system color mode and automatically switch themes to ensure a consistent visual experience with the operating system.
> For users who like to manually control details, LobeChat also offers intuitive setting options and a choice between chat bubble mode and document mode for conversation scenarios.

<div align="right">

</div>

### `*` What's more

Beside these features, LobeChat also have much better basic technique underground:

- [x] 💨 **Quick Deployment**: Using the Vercel platform or docker image, you can deploy with just one click and complete the process within 1 minute without any complex configuration.
- [x] 🌐 **Custom Domain**: If users have their own domain, they can bind it to the platform for quick access to the dialogue agent from anywhere.
- [x] 🔒 **Privacy Protection**: All data is stored locally in the user's browser, ensuring user privacy.
- [x] 💎 **Exquisite UI Design**: With a carefully designed interface, it offers an elegant appearance and smooth interaction. It supports light and dark themes and is mobile-friendly. PWA support provides a more native-like experience.
- [x] 🗣️ **Smooth Conversation Experience**: Fluid responses ensure a smooth conversation experience. It fully supports Markdown rendering, including code highlighting, LaTex formulas, Mermaid flowcharts, and more.

> ✨ more features will be added when LobeChat evolve.

---

> \[!NOTE\]
>
> You can find our upcoming  plans in the Projects section.

<div align="right">

</div>

## ⚡️ Performance

> \[!NOTE\]
>
> The complete list of reports can be found in the

|     |     | Desktop | Mobile |
| --- | --- | ------- | ------ |
|     |     |         |        |
|     |     |         |        |


<div align="right">

</div>

## 🛳 Self Hosting

LobeChat provides Self-Hosted Version with Vercel, Alibaba Cloud, and . This allows you to deploy your own chatbot within a few minutes without any prior knowledge.

> \[!TIP\]
>
> Learn more about  by checking it out.

### `A` Deploying with Vercel, Zeabur , Sealos or Alibaba Cloud

"If you want to deploy this service yourself on Vercel, Zeabur or Alibaba Cloud, you can follow these steps:

- Prepare your [OpenAI API Key](https://platform.openai.com/account/api-keys).
- Click the button below to start deployment: Log in directly with your GitHub account, and remember to fill in the `OPENAI_API_KEY`(required) and `ACCESS_CODE` (recommended) on the environment variable section.
- After deployment, you can start using it.
- Bind a custom domain (optional): The DNS of the domain assigned by Vercel is polluted in some areas; binding a custom domain can connect directly.

<div align="center">

|     |     |     |     |     | Deploy with Vercel | Deploy with Zeabur | Deploy with Sealos | Deploy with RepoCloud | Deploy with Alibaba Cloud |
| --- | --- | --- | --- | --- | ------------------ | ------------------ | ------------------ | --------------------- | ------------------------- |
|     |     |     |     |     |                    |                    |                    |                       |                           |


</div>

#### After Fork

After fork, only retain the upstream sync action and disable other actions in your repository on GitHub.

#### Keep Updated

If you have deployed your own project following the one-click deployment steps in the README, you might encounter constant prompts indicating "updates available." This is because Vercel defaults to creating a new project instead of forking this one, resulting in an inability to detect updates accurately.

> \[!TIP\]
>
> We suggest you redeploy using the following steps,

<br/>

### `B` Deploying with Docker

We provide a Docker image for deploying the LobeChat service on your own private device. Use the following command to start the LobeChat service:

```fish
$ docker run -d -p 3210:3210 \
  -e OPENAI_API_KEY=sk-xxxx \
  -e ACCESS_CODE=lobe66 \
  --name lobe-chat \
  lobehub/lobe-chat
```

> \[!TIP]
>
> If you need to use the OpenAI service through a proxy, you can configure the proxy address using the `OPENAI_PROXY_URL` environment variable:

```fish
$ docker run -d -p 3210:3210 \
  -e OPENAI_API_KEY=sk-xxxx \
  -e OPENAI_PROXY_URL=https://api-proxy.com/v1 \
  -e ACCESS_CODE=lobe66 \
  --name lobe-chat \
  lobehub/lobe-chat
```

> \[!NOTE\]
>
> For detailed instructions on deploying with Docker, please refer to the

<br/>

### Environment Variable

This project provides some additional configuration items set with environment variables:

| Environment Variable | Required | Description                                                                                                                                                               | Example                                                                                                              |
| -------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `OPENAI_API_KEY`     | Yes      | This is the API key you apply on the OpenAI account page                                                                                                                  | `sk-xxxxxx...xxxxxx`                                                                                                 |
| `OPENAI_PROXY_URL`   | No       | If you manually configure the OpenAI interface proxy, you can use this configuration item to override the default OpenAI API request base URL                             | `https://api.chatanywhere.cn` or `https://aihubmix.com/v1` <br/>The default value is<br/>`https://api.openai.com/v1` |
| `ACCESS_CODE`        | No       | Add a password to access this service; you can set a long password to avoid leaking. If this value contains a comma, it is a password array.                              | `awCTe)re_r74` or `rtrt_ewee3@09!` or `code1,code2,code3`                                                            |
| `OPENAI_MODEL_LIST`  | No       | Used to control the model list. Use `+` to add a model, `-` to hide a model, and `model_name=display_name` to customize the display name of a model, separated by commas. | `qwen-7b-chat,+glm-6b,-gpt-3.5-turbo`                                                                                |

> \[!NOTE\]
>
> The complete list of environment variables can be found in the

<div align="right">

</div>

## 📦 Ecosystem

|                                                                                                       |     |     | NPM | Repository | Description | Version |
| ----------------------------------------------------------------------------------------------------- | --- | --- | --- | ---------- | ----------- | ------- |
| Open-source UI component library dedicated to building AIGC web applications.                         |     |     |     |            |             |         |
| Popular AI / LLM Model Brand SVG Logo and Icon Collection.                                            |     |     |     |            |             |         |
| High-quality & reliable TTS/STT React Hooks library                                                   |     |     |     |            |             |         |
| Configurations for ESlint, Stylelint, Commitlint, Prettier, Remark, and Semantic Release for LobeHub. |     |     |     |            |             |         |


<div align="right">

</div>

## 🧩 Plugins

Plugins provide a means to extend the  capabilities of LobeChat. They can be used to introduce new function calls and even new ways to render message results. If you are interested in plugin development, please refer to our  in the Wiki.

- [lobe-chat-plugins][lobe-chat-plugins]: This is the plugin index for LobeChat. It accesses index.json from this repository to display a list of available plugins for LobeChat to the user.
- [chat-plugin-template][chat-plugin-template]: This is the plugin template for LobeChat plugin development.
- [@lobehub/chat-plugin-sdk][chat-plugin-sdk]: The LobeChat Plugin SDK assists you in creating exceptional chat plugins for Lobe Chat.
- [@lobehub/chat-plugins-gateway][chat-plugins-gateway]: The LobeChat Plugins Gateway is a backend service that provides a gateway for LobeChat plugins. We deploy this service using Vercel. The primary API POST /api/v1/runner is deployed as an Edge Function.

> \[!NOTE]
>
> The plugin system is currently undergoing major development. You can learn more in the following issues:
>
> - [x] [**Plugin Phase 1**](https://github.com/lobehub/lobe-chat/issues/73): Implement separation of the plugin from the main body, split the plugin into an independent repository for maintenance, and realize dynamic loading of the plugin.
> - [x] [**Plugin Phase 2**](https://github.com/lobehub/lobe-chat/issues/97): The security and stability of the plugin's use, more accurately presenting abnormal states, the maintainability of the plugin architecture, and developer-friendly.
> - [x] [**Plugin Phase 3**](https://github.com/lobehub/lobe-chat/issues/149): Higher-level and more comprehensive customization capabilities, support for plugin authentication, and examples.

<div align="right">

</div>

## ⌨️ Local Development

You can use GitHub Codespaces for online development:

Or clone it for local development:

```fish
$ git clone https://github.com/lobehub/lobe-chat.git
$ cd lobe-chat
$ pnpm install
$ pnpm dev
```

If you would like to learn more details, please feel free to look at our .

<div align="right">

</div>

## 🤝 Contributing

Contributions of all types are more than welcome; if you are interested in contributing code, feel free to check out our GitHub  and  to get stuck in to show us what you’re made of.

> \[!TIP\]
>
> We are creating a technology-driven forum, fostering knowledge interaction and the exchange of ideas that may culminate in mutual inspiration and collaborative innovation.
>
> Help us make LobeChat better. Welcome to provide product design feedback, user experience discussions directly to us.
> \*\***Principal Maintainers:** [@arvinxx](https://github.com/arvinxx) [@canisminor1990](https://github.com/canisminor1990)

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

</div>

## ❤️ Sponsor

Every bit counts and your one-time donation sparkles in our galaxy of support! You're a shooting star, making a swift and bright impact on our journey. Thank you for believing in us – your generosity guides us toward our mission, one brilliant flash at a time.

<a href="https://opencollective.com/lobehub" target="_blank">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://github.com/lobehub/.github/blob/main/static/sponsor-dark.png?raw=true">
    <img  src="https://github.com/lobehub/.github/blob/main/static/sponsor-light.png?raw=true">
  </picture>
</a>

<div align="right">

</div>

## 🔗 More Products

- **:** Modern theme for Stable Diffusion WebUI, exquisite interface design, highly customizable UI, and efficiency-boosting features.
- **:** WebUI for Midjourney, leverages AI to quickly generate a wide array of rich and diverse images from text prompts, sparking creativity and enhancing conversations.
- **:** Lobe i18n is an automation tool for the i18n (internationalization) translation process, powered by ChatGPT. It supports features such as automatic splitting of large files, incremental updates, and customization options for the OpenAI model, API proxy, and temperature.
- **:** Lobe Commit is a CLI tool that leverages Langchain/ChatGPT to generate Gitmoji-based commit messages.

<div align="right">

</div>

---

<details><summary><h4>📝 License</h4></summary>

</details>

Copyright © 2024 . <br />
This project is [Apache 2.0](./LICENSE) licensed.

<!-- LINK GROUP -->