<div align="center"><a name="readme-top"></a>

[![][image-banner]][vercel-link]

# Lobe Chat

オープンソースのモダンデザインChatGPT/LLMs UI/フレームワーク。<br/>
音声合成、マルチモーダル、拡張可能な（[function call][docs-functionc-call]）プラグインシステムをサポート。<br/>
プライベートなOpenAI ChatGPT/Claude/Gemini/Groq/Ollamaチャットアプリケーションをワンクリックで**無料**でデプロイ。

[English](./README.md) · [简体中文](./README.zh-CN.md) · **日本語** · [公式サイト][official-site] · [変更履歴](./CHANGELOG.md) · [ドキュメント][docs] · [ブログ][blog] · [フィードバック][github-issues-link]

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

**LobeChatリポジトリを共有**

[![][share-x-shield]][share-x-link]
[![][share-telegram-shield]][share-telegram-link]
[![][share-whatsapp-shield]][share-whatsapp-link]
[![][share-reddit-shield]][share-reddit-link]
[![][share-weibo-shield]][share-weibo-link]
[![][share-mastodon-shield]][share-mastodon-link]
[![][share-linkedin-shield]][share-linkedin-link]

<sup>新しい時代の思考と創造を先導します。あなたのために、スーパー個人のために作られました。</sup>

[![][github-trending-shield]][github-trending-url]

[![][image-overview]][vercel-link]

</div>

<details>
<summary><kbd>目次</kbd></summary>

#### TOC

- [👋🏻 はじめに & コミュニティに参加](#-はじめに--コミュニティに参加)
- [✨ 特徴](#-特徴)
  - [`1` マルチモデルサービスプロバイダーのサポート](#1-マルチモデルサービスプロバイダーのサポート)
  - [`2` ローカル大規模言語モデル (LLM) のサポート](#2-ローカル大規模言語モデル-llm-のサポート)
  - [`3` モデルの視覚認識](#3-モデルの視覚認識)
  - [`4` TTS & STT 音声会話](#4-tts--stt-音声会話)
  - [`5` テキストから画像生成](#5-テキストから画像生成)
  - [`6` プラグインシステム (Function Calling)](#6-プラグインシステム-function-calling)
  - [`7` エージェントマーケット (GPTs)](#7-エージェントマーケット-gpts)
  - [`8` ローカル / リモートデータベースのサポート](#8-ローカル--リモートデータベースのサポート)
  - [`9` マルチユーザ管理のサポート](#9-マルチユーザ管理のサポート)
  - [`10` プログレッシブウェブアプリ (PWA)](#10-プログレッシブウェブアプリ-pwa)
  - [`11` モバイルデバイスの適応](#11-モバイルデバイスの適応)
  - [`12` カスタムテーマ](#12-カスタムテーマ)
  - [`*` その他の特徴](#-その他の特徴)
- [⚡️ パフォーマンス](#️-パフォーマンス)
- [🛳 自己ホスティング](#-自己ホスティング)
  - [`A` Vercel、Zeabur、Sealosでのデプロイ](#a-vercelzeabursealosでのデプロイ)
  - [`B` Dockerでのデプロイ](#b-dockerでのデプロイ)
  - [環境変数](#環境変数)
- [📦 エコシステム](#-エコシステム)
- [🧩 プラグイン](#-プラグイン)
- [⌨️ ローカル開発](#️-ローカル開発)
- [🤝 貢献](#-貢献)
- [❤️ スポンサー](#️-スポンサー)
- [🔗 その他の製品](#-その他の製品)

####

<br/>

</details>

## 👋🏻 はじめに & コミュニティに参加

私たちは、AIGCのためのモダンデザインコンポーネントとツールを提供することを目指すデザインエンジニアのグループです。
ブートストラッピングアプローチを採用することで、開発者とユーザーに対してよりオープンで透明性のある、使いやすい製品エコシステムを提供することを目指しています。

ユーザーやプロの開発者にとって、LobeHubはあなたのAIエージェントの遊び場となるでしょう。LobeChatは現在アクティブに開発中であり、遭遇した[問題][issues-link]についてのフィードバックを歓迎します。

| [![][vercel-shield-badge]][vercel-link]   | インストールや登録は不要です！私たちのウェブサイトにアクセスして、直接体験してください。                           |
| :---------------------------------------- | :----------------------------------------------------------------------------------------------------------------- |
| [![][discord-shield-badge]][discord-link] | 私たちのDiscordコミュニティに参加しましょう！ここでは、LobeHubの開発者や他の熱心なユーザーとつながることができます。 |

> \[!IMPORTANT]
>
> **スターを付けてください**。GitHubからのすべてのリリース通知を遅延なく受け取ることができます\~ ⭐️

[![][image-star]][github-stars-link]

<details>
  <summary><kbd>スター履歴</kbd></summary>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=lobehub%2Flobe-chat&theme=dark&type=Date">
    <img width="100%" src="https://api.star-history.com/svg?repos=lobehub%2Flobe-chat&type=Date">
  </picture>
</details>

## ✨ 特徴

[![][image-feat-privoder]][docs-feat-provider]

### `1` [マルチモデルサービスプロバイダーのサポート][docs-feat-provider]

LobeChatの継続的な開発において、AI会話サービスを提供する際のモデルサービスプロバイダーの多様性がコミュニティのニーズを満たすために重要であることを深く理解しています。そのため、単一のモデルサービスプロバイダーに限定せず、複数のモデルサービスプロバイダーをサポートすることで、ユーザーにより多様で豊富な会話の選択肢を提供しています。

このようにして、LobeChatは異なるユーザーのニーズにより柔軟に対応し、開発者にも幅広い選択肢を提供します。

#### サポートされているモデルサービスプロバイダー

以下のモデルサービスプロバイダーをサポートしています：

- **AWS Bedrock**：AWS Bedrockサービスと統合され、**Claude / LLama2**などのモデルをサポートし、強力な自然言語処理能力を提供します。[詳細はこちら](https://aws.amazon.com/cn/bedrock)
- **Anthropic (Claude)**：Anthropicの**Claude**シリーズモデルにアクセスし、Claude 3およびClaude 2を含む、マルチモーダル機能と拡張コンテキストで業界の新しいベンチマークを設定します。[詳細はこちら](https://www.anthropic.com/claude)
- **Google AI (Gemini Pro, Gemini Vision)**：Googleの**Gemini**シリーズモデルにアクセスし、GeminiおよびGemini Proを含む、高度な言語理解と生成をサポートします。[詳細はこちら](https://deepmind.google/technologies/gemini/)
- **Groq**：GroqのAIモデルにアクセスし、メッセージシーケンスを効率的に処理し、応答を生成し、マルチターンの対話や単一のインタラクションタスクを実行できます。[詳細はこちら](https://groq.com/)
- **OpenRouter**：**Claude 3**、**Gemma**、**Mistral**、**Llama2**、**Cohere**などのモデルのルーティングをサポートし、インテリジェントなルーティング最適化をサポートし、使用効率を向上させ、オープンで柔軟です。[詳細はこちら](https://openrouter.ai/)
- **01.AI (Yi Model)**：01.AIモデルを統合し、推論速度が速いAPIシリーズを提供し、処理時間を短縮しながら優れたモデル性能を維持します。[詳細はこちら](https://01.ai/)
- **Together.ai**：Together Inference APIを通じて、100以上の主要なオープンソースのチャット、言語、画像、コード、および埋め込みモデルにアクセスできます。これらのモデルについては、使用した分だけ支払います。[詳細はこちら](https://www.together.ai/)
- **ChatGLM**：智谱の**ChatGLM**シリーズモデル（GLM-4/GLM-4-vision/GLM-3-turbo）を追加し、ユーザーにもう一つの効率的な会話モデルの選択肢を提供します。[詳細はこちら](https://www.zhipuai.cn/)
- **Moonshot AI (Dark Side of the Moon)**：中国の革新的なAIスタートアップであるMoonshotシリーズモデルと統合し、より深い会話理解を提供します。[詳細はこちら](https://www.moonshot.cn/)
- **Minimax**：Minimaxモデルを統合し、MoEモデル**abab6**を含む、より広範な選択肢を提供します。[詳細はこちら](https://www.minimaxi.com/)
- **DeepSeek**：中国の革新的なAIスタートアップであるDeepSeekシリーズモデルと統合し、性能と価格のバランスを取ったモデルを提供します。[詳細はこちら](https://www.deepseek.com/)
- **Qwen**：Qwenシリーズモデルを統合し、最新の**qwen-turbo**、**qwen-plus**、**qwen-max**を含む。[詳細はこちら](https://help.aliyun.com/zh/dashscope/developer-reference/model-introduction)
- **Novita AI**：**Llama**、**Mistral**、その他の主要なオープンソースモデルに最安値でアクセスできます。検閲されないロールプレイに参加し、創造的な議論を引き起こし、制限のないイノベーションを促進します。**使用した分だけ支払います。** [詳細はこちら](https://novita.ai/llm-api?utm_source=lobechat&utm_medium=ch&utm_campaign=api)

同時に、ReplicateやPerplexityなどのモデルサービスプロバイダーのサポートも計画しています。これにより、サービスプロバイダーのライブラリをさらに充実させることができます。LobeChatがあなたのお気に入りのサービスプロバイダーをサポートすることを希望する場合は、[コミュニティディスカッション](https://github.com/lobehub/lobe-chat/discussions/1284)に参加してください。

<div align="right">

[![][back-to-top]](#readme-top)

</div>

[![][image-feat-local]][docs-feat-local]

### `2` [ローカル大規模言語モデル (LLM) のサポート][docs-feat-local]

特定のユーザーのニーズに応えるために、LobeChatは[Ollama](https://ollama.ai)に基づいてローカルモデルの使用をサポートしており、ユーザーが自分自身またはサードパーティのモデルを柔軟に使用できるようにしています。

> \[!TIP]
>
> [📘 LobeChatでのOllamaの使用][docs-usage-ollama]について詳しくはこちらをご覧ください。

<div align="right">

[![][back-to-top]](#readme-top)

</div>

[![][image-feat-vision]][docs-feat-vision]

### `3` [モデルの視覚認識][docs-feat-vision]

LobeChatは、OpenAIの最新の視覚認識機能を備えた[`gpt-4-vision`](https://platform.openai.com/docs/guides/vision)モデルをサポートしています。
これは視覚を認識できるマルチモーダルインテリジェンスです。ユーザーは簡単に画像をアップロードしたり、画像をドラッグアンドドロップして対話ボックスに入れることができ、
エージェントは画像の内容を認識し、これに基づいてインテリジェントな会話を行い、よりスマートで多様なチャットシナリオを作成します。

この機能は、新しいインタラクティブな方法を提供し、コミュニケーションがテキストを超えて視覚要素を含むことを可能にします。
日常の使用での画像共有や特定の業界での画像解釈に関係なく、エージェントは優れた会話体験を提供します。

<div align="right">

[![][back-to-top]](#readme-top)

</div>

[![][image-feat-tts]][docs-feat-tts]

### `4` [TTS & STT 音声会話][docs-feat-tts]

LobeChatは、テキストから音声への変換（Text-to-Speech、TTS）および音声からテキストへの変換（Speech-to-Text、STT）技術をサポートしており、
テキストメッセージを明瞭な音声出力に変換し、ユーザーが実際の人と話しているかのように対話エージェントと対話できるようにします。
ユーザーは、エージェントに適した音声を選択することができます。

さらに、TTSは聴覚学習を好む人や忙しい中で情報を受け取りたい人にとって優れたソリューションを提供します。
LobeChatでは、異なる地域や文化的背景のユーザーのニーズに応えるために、さまざまな高品質の音声オプション（OpenAI Audio、Microsoft Edge Speech）を慎重に選択しました。
ユーザーは、個人の好みや特定のシナリオに応じて適切な音声を選択し、パーソナライズされたコミュニケーション体験を得ることができます。

<div align="right">

[![][back-to-top]](#readme-top)

</div>

[![][image-feat-t2i]][docs-feat-t2i]

### `5` [テキストから画像生成][docs-feat-t2i]

最新のテキストから画像生成技術をサポートし、LobeChatはユーザーがエージェントとの対話中に直接画像作成ツールを呼び出すことができるようになりました。
[`DALL-E 3`](https://openai.com/dall-e-3)、[`MidJourney`](https://www.midjourney.com/)、[`Pollinations`](https://pollinations.ai/)などのAIツールの能力を活用することで、
エージェントはあなたのアイデアを画像に変えることができます。

これにより、プライベートで没入感のある創造プロセスが可能になり、個人的な対話に視覚的なストーリーテリングをシームレスに統合することができます。

<div align="right">

[![][back-to-top]](#readme-top)

</div>

[![][image-feat-plugin]][docs-feat-plugin]

### `6` [プラグインシステム (Function Calling)][docs-feat-plugin]

LobeChatのプラグインエコシステムは、そのコア機能の重要な拡張であり、LobeChatアシスタントの実用性と柔軟性を大幅に向上させます。

<video controls src="https://github.com/lobehub/lobe-chat/assets/28616219/f29475a3-f346-4196-a435-41a6373ab9e2" muted="false"></video>

プラグインを利用することで、LobeChatアシスタントはリアルタイムの情報を取得して処理することができ、ウェブ情報を検索し、ユーザーに即時かつ関連性の高いニュースを提供することができます。

さらに、これらのプラグインはニュースの集約に限定されず、他の実用的な機能にも拡張できます。たとえば、ドキュメントの迅速な検索、画像の生成、Bilibili、Steamなどのさまざまなプラットフォームからのデータの取得、さまざまなサードパーティサービスとの連携などです。

> \[!TIP]
>
> [📘 プラグインの使用][docs-usage-plugin]について詳しくはこちらをご覧ください。

<!-- PLUGIN LIST -->

| 最近の提出                                                                                                          | 説明                                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| [ショッピングツール](https://chat-preview.lobehub.com/settings/agent)<br/><sup>By **shoppingtools** on **2024-07-19**</sup> | eBayとAliExpressで製品を検索し、eBayのイベントとクーポンを見つけます。プロンプトの例を取得します。<br/>`ショッピング` `e-bay` `ali-express` `クーポン` |
| [Savvy Trader AI](https://chat-preview.lobehub.com/settings/agent)<br/><sup>By **savvytrader** on **2024-06-27**</sup>  | リアルタイムの株式、暗号通貨、その他の投資データ。<br/>`株式` `分析`                                                                   |
| [ソーシャル検索](https://chat-preview.lobehub.com/settings/agent)<br/><sup>By **say-apps** on **2024-06-02**</sup>       | ソーシャル検索は、ツイート、ユーザー、フォロワー、画像、メディアなどへのアクセスを提供します。<br/>`ソーシャル` `ツイッター` `x` `検索`                |
| [スペース](https://chat-preview.lobehub.com/settings/agent)<br/><sup>By **automateyournetwork** on **2024-05-12**</sup>    | NASAを含む宇宙データ。<br/>`宇宙` `nasa`                                                                                             |

> 📊 合計プラグイン数: [<kbd>**52**</kbd>](https://github.com/lobehub/lobe-chat-plugins)

 <!-- PLUGIN LIST -->

<div align="right">

[![][back-to-top]](#readme-top)

</div>

[![][image-feat-agent]][docs-feat-agent]

### `7` [エージェントマーケット (GPTs)][docs-feat-agent]

LobeChatエージェントマーケットプレイスでは、クリエイターが多くの優れたエージェントを発見できる活気に満ちた革新的なコミュニティを提供しています。
これらのエージェントは、仕事のシナリオで重要な役割を果たすだけでなく、学習プロセスでも大いに便利です。
私たちのマーケットプレイスは、単なるショーケースプラットフォームではなく、協力の場でもあります。ここでは、誰もが自分の知恵を貢献し、開発したエージェントを共有できます。

> \[!TIP]
>
> [🤖/🏪 エージェントを提出][submit-agents-link]することで、簡単にエージェント作品をプラットフォームに提出できます。
> 重要なのは、LobeChatが高度な自動化国際化（i18n）ワークフローを確立しており、
> あなたのエージェントを複数の言語バージョンにシームレスに翻訳できることです。
> これにより、ユーザーがどの言語を話していても、エージェントを障害なく体験できます。

> \[!IMPORTANT]
>
> すべてのユーザーがこの成長するエコシステムに参加し、エージェントの反復と最適化に参加することを歓迎します。
> 一緒に、より面白く、実用的で革新的なエージェントを作成し、エージェントの多様性と実用性をさらに豊かにしましょう。

<!-- AGENT LIST -->

| 最近の提出                                                                                                                                                                                                 | 説明                                                                                                                                                                                                                                                                                                                                                                                                                     |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Cプログラム学習アシスタント](https://chat-preview.lobehub.com/market?agent=sichuan-university-941-c-programming-assistant)<br/><sup>By **[YBGuoYang](https://github.com/YBGuoYang)** on **2024-07-28**</sup> | Cプログラム設計の学習を支援します<br/>`941`                                                                                                                                                                                                                                                                                                                                                                                |
| [ブランドパイオニア](https://chat-preview.lobehub.com/market?agent=brand-pioneer)<br/><sup>By **[SaintFresh](https://github.com/SaintFresh)** on **2024-07-25**</sup>                                               | ブランド開発の専門家、思想リーダー、ブランド戦略のスーパー天才、ブランドビジョナリー。ブランドパイオニアは、革新の最前線の探検家であり、自分の分野の発明者です。市場を提供し、専門分野の画期的な進展を特徴とする未来の世界を想像させてください。<br/>`ビジネス` `ブランドパイオニア` `ブランド開発` `ビジネスアシスタント` `ブランドナラティブ` |
| [ネットワークセキュリティアシスタント](https://chat-preview.lobehub.com/market?agent=cybersecurity-copilot)<br/><sup>By **[huoji120](https://github.com/huoji120)** on **2024-07-23**</sup>                              | ログ、コード、逆コンパイルを分析し、問題を特定し、最適化の提案を提供するネットワークセキュリティの専門家アシスタント。<br/>`ネットワークセキュリティ` `トラフィック分析` `ログ分析` `コード逆コンパイル` `ctf`                                                                                                                                                                                                   |
| [BIDOSx2](https://chat-preview.lobehub.com/market?agent=bidosx-2-v-2)<br/><sup>By **[SaintFresh](https://github.com/SaintFresh)** on **2024-07-21**</sup>                                                      | 従来のAIを超越する高度なAI LLM。'BIDOS'は、'ブランドのアイデア、開発、運営、スケーリング'と'ビジネスインテリジェンス決定最適化システム'の両方を意味します。<br/>`ブランド開発` `aiアシスタント` `市場分析` `戦略計画` `ビジネス最適化` `ビジネスインテリジェンス`                                                                                                   |

> 📊 合計エージェント数: [<kbd>**307**</kbd> ](https://github.com/lobehub/lobe-chat-agents)

 <!-- AGENT LIST -->

<div align="right">

[![][back-to-top]](#readme-top)

</div>

[![][image-feat-database]][docs-feat-database]

### `8` [ローカル / リモートデータベースのサポート][docs-feat-database]

LobeChatは、サーバーサイドデータベースとローカルデータベースの両方の使用をサポートしています。ニーズに応じて、適切なデプロイメントソリューションを選択できます：

- **ローカルデータベース**：データとプライバシー保護に対するより多くの制御を希望するユーザーに適しています。LobeChatはCRDT（Conflict-Free Replicated Data Type）技術を使用してマルチデバイス同期を実現しています。これはシームレスなデータ同期体験を提供することを目的とした実験的な機能です。
- **サーバーサイドデータベース**：より便利なユーザー体験を希望するユーザーに適しています。LobeChatはPostgreSQLをサーバーサイドデータベースとしてサポートしています。サーバーサイドデータベースの設定方法についての詳細なドキュメントは、[サーバーサイドデータベースの設定](https://lobehub.com/docs/self-hosting/advanced/server-database)をご覧ください。

どのデータベースを選択しても、LobeChatは優れたユーザー体験を提供します。

<div align="right">

[![][back-to-top]](#readme-top)

</div>

[![][image-feat-auth]][docs-feat-auth]

### `9` [マルチユーザ管理のサポート][docs-feat-auth]

LobeChatはマルチユーザ管理をサポートし、異なるニーズに応じて2つの主要なユーザ認証および管理ソリューションを提供します：

- **next-auth**：LobeChatは、複数の認証方法（OAuth、メールログイン、資格情報ログインなど）をサポートする柔軟で強力な認証ライブラリである`next-auth`を統合しています。`next-auth`を使用すると、ユーザの登録、ログイン、セッション管理、ソーシャルログインなどの機能を簡単に実装し、ユーザデータのセキュリティとプライバシーを確保できます。

- **Clerk**：より高度なユーザ管理機能が必要なユーザ向けに、LobeChatは`Clerk`もサポートしています。`Clerk`は、現代的なユーザ管理プラットフォームであり、多要素認証（MFA）、ユーザプロファイル管理、ログイン活動の監視など、より豊富な機能を提供します。`Clerk`を使用すると、より高いセキュリティと柔軟性を得ることができ、複雑なユーザ管理ニーズに簡単に対応できます。

どのユーザ管理ソリューションを選択しても、LobeChatは優れたユーザー体験と強力な機能サポートを提供します。

<div align="right">

[![][back-to-top]](#readme-top)

</div>

[![][image-feat-pwa]][docs-feat-pwa]

### `10` [プログレッシブウェブアプリ (PWA)][docs-feat-pwa]

私たちは、今日のマルチデバイス環境でユーザーにシームレスな体験を提供することの重要性を深く理解しています。
そのため、プログレッシブウェブアプリケーション（[PWA](https://support.google.com/chrome/answer/9658361)）技術を採用しました。
これは、ウェブアプリケーションをネイティブアプリに近い体験に引き上げるモダンなウェブ技術です。

PWAを通じて、LobeChatはデスクトップとモバイルデバイスの両方で高度に最適化されたユーザー体験を提供しながら、その軽量で高性能な特性を維持します。
視覚的および感覚的には、インターフェースを慎重に設計し、ネイティブアプリと区別がつかないようにし、
スムーズなアニメーション、レスポンシブレイアウト、および異なるデバイスの画面解像度に適応するようにしています。

> \[!NOTE]
>
> PWAのインストールプロセスに慣れていない場合は、以下の手順に従ってLobeChatをデスクトップアプリケーション（モバイルデバイスにも適用）として追加できます：
>
> - コンピュータでChromeまたはEdgeブラウザを起動します。
> - LobeChatのウェブページにアクセスします。
> - アドレスバーの右上にある<kbd>インストール</kbd>アイコンをクリックします。
> - 画面の指示に従ってPWAのインストールを完了します。

<div align="right">

[![][back-to-top]](#readme-top)

</div>

[![][image-feat-mobile]][docs-feat-mobile]

### `11` [モバイルデバイスの適応][docs-feat-mobile]

モバイルデバイスのユーザー体験を向上させるために、一連の最適化設計を行いました。現在、モバイルユーザー体験のバージョンを繰り返し改善しています。ご意見やアイデアがある場合は、GitHub IssuesやPull Requestsを通じてフィードバックをお寄せください。

<div align="right">

[![][back-to-top]](#readme-top)

</div>

[![][image-feat-theme]][docs-feat-theme]

### `12` [カスタムテーマ][docs-feat-theme]

デザインエンジニアリング指向のアプリケーションとして、LobeChatはユーザーの個別体験を重視しており、
柔軟で多様なテーマモードを導入しています。日中のライトモードと夜間のダークモードを含みます。
テーマモードの切り替えに加えて、さまざまな色のカスタマイズオプションを提供し、ユーザーが自分の好みに応じてアプリケーションのテーマカラーを調整できるようにしています。
落ち着いたダークブルー、活気のあるピーチピンク、プロフェッショナルなグレーホワイトなど、LobeChatでは自分のスタイルに合った色の選択肢を見つけることができます。

> \[!TIP]
>
> デフォルトの設定は、ユーザーのシステムのカラーモードをインテリジェントに認識し、テーマを自動的に切り替えて、オペレーティングシステムと一貫した視覚体験を提供します。
> 詳細を手動で制御するのが好きなユーザーには、直感的な設定オプションと、会話シナリオに対してチャットバブルモードとドキュメントモードの選択肢を提供します。

<div align="right">

[![][back-to-top]](#readme-top)

</div>

### `*` その他の特徴

これらの特徴に加えて、LobeChatは基本的な技術基盤も優れています：

- [x] 💨 **迅速なデプロイ**：VercelプラットフォームまたはDockerイメージを使用して、ワンクリックでデプロイを行い、1分以内にプロセスを完了できます。複雑な設定は不要です。
- [x] 🌐 **カスタムドメイン**：ユーザーが独自のドメインを持っている場合、プラットフォームにバインドして、どこからでも対話エージェントに迅速にアクセスできます。
- [x] 🔒 **プライバシー保護**：すべてのデータはユーザーのブラウザにローカルに保存され、ユーザーのプライバシーを保護します。
- [x] 💎 **洗練されたUIデザイン**：慎重に設計されたインターフェースで、エレガントな外観とスムーズなインタラクションを提供します。ライトモードとダークモードをサポートし、モバイルフレンドリーです。PWAサポートにより、よりネイティブに近い体験を提供します。
- [x] 🗣️ **スムーズな会話体験**：流れるような応答により、スムーズな会話体験を提供します。Markdownレンダリングを完全にサポートし、コードのハイライト、LaTexの数式、Mermaidのフローチャートなどを含みます。

> ✨ LobeChatの進化に伴い、さらに多くの機能が追加されます。

---

> \[!NOTE]
>
> 今後の[ロードマップ][github-project-link]計画は、Projectsセクションで確認できます。

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## ⚡️ パフォーマンス

> \[!NOTE]
>
> 完全なレポートのリストは[📘 Lighthouseレポート][docs-lighthouse]で確認できます。

|                   デスクトップ                   |                   モバイル                   |
| :-----------------------------------------: | :----------------------------------------: |
|              ![][chat-desktop]              |              ![][chat-mobile]              |
| [📑 Lighthouseレポート][chat-desktop-report] | [📑 Lighthouseレポート][chat-mobile-report] |

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🛳 自己ホスティング

LobeChatは、Vercelと[Dockerイメージ][docker-release-link]を使用した自己ホスティングバージョンを提供しています。これにより、事前の知識がなくても数分で独自のチャットボットをデプロイできます。

> \[!TIP]
>
> [📘 独自のLobeChatを構築する][docs-self-hosting]について詳しくはこちらをご覧ください。

### `A` Vercel、Zeabur、Sealosでのデプロイ

このサービスをVercelまたはZeaburでデプロイしたい場合は、以下の手順に従ってください：

- [OpenAI API Key](https://platform.openai.com/account/api-keys)を準備します。
- 下のボタンをクリックしてデプロイを開始します：GitHubアカウントで直接ログインし、環境変数セクションに`OPENAI_API_KEY`（必須）と`ACCESS_CODE`（推奨）を入力します。
- デプロイが完了したら、使用を開始できます。
- カスタムドメインをバインド（オプション）：Vercelが割り当てたドメインのDNSは一部の地域で汚染されているため、カスタムドメインをバインドすることで直接接続できます。

<div align="center">

|           Vercelでデプロイ            |                     Zeaburでデプロイ                      |                     Sealosでデプロイ                      |
| :-------------------------------------: | :---------------------------------------------------------: | :---------------------------------------------------------: |
| [![][deploy-button-image]][deploy-link] | [![][deploy-on-zeabur-button-image]][deploy-on-zeabur-link] | [![][deploy-on-sealos-button-image]][deploy-on-sealos-link] |

</div>

#### フォーク後

フォーク後、リポジトリのアクションページで他のアクションを無効にし、アップストリーム同期アクションのみを保持します。

#### 更新を維持

READMEのワンクリックデプロイ手順に従って独自のプロジェクトをデプロイした場合、「更新が利用可能です」というプロンプトが常に表示されることがあります。これは、Vercelがデフォルトで新しいプロジェクトを作成し、フォークしないため、更新を正確に検出できないためです。

> \[!TIP]
>
> [📘 最新バージョンと自動同期][docs-upstream-sync]の手順に従って再デプロイすることをお勧めします。

<br/>

### `B` Dockerでのデプロイ

[![][docker-release-shield]][docker-release-link]
[![][docker-size-shield]][docker-size-link]
[![][docker-pulls-shield]][docker-pulls-link]

LobeChatサービスを独自のプライベートデバイスにデプロイするためのDockerイメージを提供しています。以下のコマンドを使用してLobeChatサービスを開始します：

```fish
$ docker run -d -p 3210:3210 \
  -e OPENAI_API_KEY=sk-xxxx \
  -e ACCESS_CODE=lobe66 \
  --name lobe-chat \
  lobehub/lobe-chat
```

> \[!TIP]
>
> OpenAIサービスをプロキシ経由で使用する必要がある場合は、`OPENAI_PROXY_URL`環境変数を使用してプロキシアドレスを設定できます：

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
> Dockerを使用したデプロイの詳細な手順については、[📘 Dockerデプロイガイド][docs-docker]を参照してください。

<br/>

### 環境変数

このプロジェクトは、環境変数で設定される追加の構成項目を提供します：

| 環境変数            | 必須 | 説明                                                                                                                                                               | 例                                                                                                              |
| -------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `OPENAI_API_KEY`     | はい      | これはOpenAIアカウントページで申請したAPIキーです                                                                                                                  | `sk-xxxxxx...xxxxxx`                                                                                                 |
| `OPENAI_PROXY_URL`   | いいえ       | OpenAIインターフェイスプロキシを手動で設定する場合、この設定項目を使って、デフォルトのOpenAI APIリクエストベースURLを上書きすることができます。                             | `https://api.chatanywhere.cn` または `https://aihubmix.com/v1` <br/>デフォルトの値は<br/>`https://api.openai.com/v1` |
| `ACCESS_CODE`        | いいえ       | このサービスにアクセスするためのパスワードを追加します。漏洩を避けるために長いパスワードを設定することができます。この値にカンマが含まれる場合は、パスワードの配列となります。                              | `awCTe)re_r74` または `rtrt_ewee3@09!` または `code1,code2,code3`                                                            |
| `OPENAI_MODEL_LIST`  | いいえ       | モデルリストをコントロールするために使用します。モデルを追加するには `+` を、モデルを非表示にするには `-` を、モデルの表示名をカンマ区切りでカスタマイズするには `model_name=display_name` を使用します。 | `qwen-7b-chat,+glm-6b,-gpt-3.5-turbo`                                                                                |

> \[!NOTE]
>
> 環境変数の完全なリストは [📘環境変数][docs-env-var] にあります

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 📦 エコシステム

| NPM                               | リポジトリ                              | 説明                                                                                           | バージョン                                   |
| --------------------------------- | --------------------------------------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| [@lobehub/ui][lobe-ui-link]       | [lobehub/lobe-ui][lobe-ui-github]       | AIGC ウェブアプリケーション構築専用のオープンソースUIコンポーネントライブラリ。                         | [![][lobe-ui-shield]][lobe-ui-link]       |
| [@lobehub/icons][lobe-icons-link] | [lobehub/lobe-icons][lobe-icons-github] | 人気の AI/LLM モデルブランドの SVG ロゴとアイコン集。                                            | [![][lobe-icons-shield]][lobe-icons-link] |
| [@lobehub/tts][lobe-tts-link]     | [lobehub/lobe-tts][lobe-tts-github]     | 高品質で信頼性の高い TTS/STT React Hooks ライブラリ                                                   | [![][lobe-tts-shield]][lobe-tts-link]     |
| [@lobehub/lint][lobe-lint-link]   | [lobehub/lobe-lint][lobe-lint-github]   | LobeHub の ESlint、Stylelint、Commitlint、Prettier、Remark、Semantic Release の設定。 | [![][lobe-lint-shield]][lobe-lint-link]   |

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🧩 プラグイン

プラグインは、LobeChatの[関数呼び出し][docs-functionc-call]機能を拡張する手段を提供します。プラグインを使用して、新しい関数呼び出しやメッセージ結果の新しいレンダリング方法を導入することができます。プラグイン開発に興味がある方は、Wikiの[📘プラグイン開発ガイド][docs-plugin-dev]を参照してください。

- [lobe-chat-plugins][lobe-chat-plugins]: これはLobeChatのプラグインインデックスです。このリポジトリからindex.jsonにアクセスし、LobeChatで利用可能なプラグインのリストをユーザに表示します。
- [chat-plugin-template][chat-plugin-template]: これはLobeChatプラグイン開発用のプラグインテンプレートです。
- [@lobehub/chat-plugin-sdk][chat-plugin-sdk]: LobeChatプラグインSDKは、Lobe Chat用の優れたチャットプラグインの作成を支援します。
- [@lobehub/chat-plugins-gateway][chat-plugins-gateway]: LobeChat Plugins Gatewayは、LobeChatプラグインのためのゲートウェイを提供するバックエンドサービスです。このサービスはVercelを使用してデプロイされます。プライマリAPIのPOST /api/v1/runnerはEdge Functionとしてデプロイされます。

> \[!NOTE]
>
> プラグインシステムは現在大規模な開発中です。詳しくは以下の issue をご覧ください:
>
> - [x] [**プラグインフェイズ 1**](https://github.com/lobehub/lobe-chat/issues/73): プラグインを本体から分離し、メンテナンスのためにプラグインを独立したリポジトリに分割し、プラグインの動的ロードを実現する。
> - [x] [**プラグインフェイズ 2**](https://github.com/lobehub/lobe-chat/issues/97): プラグイン使用の安全性と安定性、より正確な異常状態の提示、プラグインアーキテクチャの保守性、開発者フレンドリー。
> - [x] [**プラグインフェイズ 3**](https://github.com/lobehub/lobe-chat/issues/149): より高度で包括的なカスタマイズ機能、プラグイン認証のサポート、サンプル。

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## ⌨️ ローカル開発

GitHub Codespaces を使ってオンライン開発ができます:

[![][codespaces-shield]][codespaces-link]

Or clone it for local development:

```fish
$ git clone https://github.com/lobehub/lobe-chat.git
$ cd lobe-chat
$ pnpm install
$ pnpm dev
```

より詳しい情報をお知りになりたい方は、[📘開発ガイド][docs-dev-guide]をご覧ください。

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🤝 コントリビュート

どのようなタイプのコントリビュートも大歓迎です;コードを提供することに興味がある方は、GitHub の [Issues][github-issues-link] や [Projects][github-project-link] をチェックして、あなたの力をお貸しください。

> \[!TIP]
>
> 私たちは技術主導のフォーラムを創設し、知識の交流とアイデアの交換を促進することで、相互のインスピレーションと協力的なイノベーションを生み出すことを目指しています。
>
> LobeChat の改善にご協力ください。製品設計のフィードバックやユーザー体験に関するディスカッションを直接お寄せください。
>
> **プリンシパルメンテナー:** [@arvinxx](https://github.com/arvinxx) [@canisminor1990](https://github.com/canisminor1990)

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

## ❤️ スポンサー

あなたの一度きりの寄付が、私たちの銀河系で輝きを放ちます！皆様は流れ星であり、私たちの旅路に迅速かつ明るい影響を与えます。私たちを信じてくださり、ありがとうございます。皆様の寛大なお気持ちが、私たちの使命に向かって、一度に輝かしい閃光を放つよう導いてくださるのです。

<a href="https://opencollective.com/lobehub" target="_blank">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://github.com/lobehub/.github/blob/main/static/sponsor-dark.png?raw=true">
    <img  src="https://github.com/lobehub/.github/blob/main/static/sponsor-light.png?raw=true">
  </picture>
</a>

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🔗 その他の製品

- **[🅰️ Lobe SD Theme][lobe-theme]:** Stable Diffusion WebUI のためのモダンなテーマ、絶妙なインターフェースデザイン、高度にカスタマイズ可能なUI、効率を高める機能。
- **[⛵️ Lobe Midjourney WebUI][lobe-midjourney-webui]:** Midjourney の WebUI は、AI を活用しテキストプロンプトから豊富で多様な画像を素早く生成し、創造性を刺激して会話を盛り上げます。
- **[🌏 Lobe i18n][lobe-i18n] :** Lobe i18n は ChatGPT を利用した国際化翻訳プロセスの自動化ツールです。大きなファイルの自動分割、増分更新、OpenAIモデル、APIプロキシ、温度のカスタマイズオプションなどの機能をサポートしています。
- **[💌 Lobe Commit][lobe-commit]:** Lobe Commit は、Langchain/ChatGPT を活用して Gitmoji ベースのコミットメッセージを生成する CLI ツールです。

<div align="right">

[![][back-to-top]](#readme-top)

</div>

---

<details><summary><h4>📝 License</h4></summary>

[![][fossa-license-shield]][fossa-license-link]

</details>

Copyright © 2024 [LobeHub][profile-link]. <br />
This project is [Apache 2.0](./LICENSE) licensed.

<!-- LINK GROUP -->

[back-to-top]: https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square
[blog]: https://lobehub.com/blog
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
[docs]: https://lobehub.com/docs/usage/start
[docs-dev-guide]: https://github.com/lobehub/lobe-chat/wiki/index
[docs-docker]: https://lobehub.com/docs/self-hosting/platform/docker
[docs-env-var]: https://lobehub.com/docs/self-hosting/environment-variables
[docs-feat-agent]: https://lobehub.com/docs/usage/features/agent-market
[docs-feat-auth]: https://lobehub.com/docs/usage/features/auth
[docs-feat-database]: https://lobehub.com/docs/usage/features/database
[docs-feat-local]: https://lobehub.com/docs/usage/features/local-llm
[docs-feat-mobile]: https://lobehub.com/docs/usage/features/mobile
[docs-feat-plugin]: https://lobehub.com/docs/usage/features/plugin-system
[docs-feat-provider]: https://lobehub.com/docs/usage/features/multi-ai-providers
[docs-feat-pwa]: https://lobehub.com/docs/usage/features/pwa
[docs-feat-t2i]: https://lobehub.com/docs/usage/features/text-to-image
[docs-feat-theme]: https://lobehub.com/docs/usage/features/theme
[docs-feat-tts]: https://lobehub.com/docs/usage/features/tts
[docs-feat-vision]: https://lobehub.com/docs/usage/features/vision
[docs-functionc-call]: https://lobehub.com/blog/openai-function-call
[docs-lighthouse]: https://github.com/lobehub/lobe-chat/wiki/Lighthouse
[docs-plugin-dev]: https://lobehub.com/docs/usage/plugins/development
[docs-self-hosting]: https://lobehub.com/docs/self-hosting/start
[docs-upstream-sync]: https://lobehub.com/docs/self-hosting/advanced/upstream-sync
[docs-usage-ollama]: https://lobehub.com/docs/usage/providers/ollama
[docs-usage-plugin]: https://lobehub.com/docs/usage/plugins/basic
[fossa-license-link]: https://app.fossa.com/projects/git%2Bgithub.com%2Flobehub%2Flobe-chat
[fossa-license-shield]: https://app.fossa.com/api/projects/git%2Bgithub.com%2Flobehub%2Flobe-chat.svg?type=large
[github-action-release-link]: https://github.com/actions/workflows/lobehub/lobe-chat/release.yml
[github-action-release-shield]: https://img.shields.io/github/actions/workflow/status/lobehub/lobe-chat/release.yml?label=release&labelColor=black&logo=githubactions&logoColor=white&style=flat-square
[github-action-test-link]: https://github.com/actions/workflows/lobehub/lobe-chat/test.yml
[github-action-test-shield]: https://img.shields.io/github/actions/workflow/status/lobehub/lobe-chat/test.yml?label=test&labelColor=black&logo=githubactions&logoColor=white&style=flat-square
[github-contributors-link]: https://github.com/lobehub/lobe-chat/graphs/contributors
[github-contributors-shield]: https://img.shields.io/github/contributors/lobehub/lobe-chat?color=c4f042&labelColor=black&style=flat-square
[github-forks-link]: https://github.com/lobehub/lobe-chat/network/members
[github-forks-shield]: https://img.shields.io/github/forks/lobehub/lobe-chat?color=8ae8ff&labelColor=black&style=flat-square
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
[share-linkedin-link]: https://linkedin.com/feed
[share-linkedin-shield]: https://img.shields.io/badge/-share%20on%20linkedin-black?labelColor=black&logo=linkedin&logoColor=white&style=flat-square
[share-mastodon-link]: https://mastodon.social/share?text=Check%20this%20GitHub%20repository%20out%20%F0%9F%A4%AF%20LobeChat%20-%20An%20open-source,%20extensible%20(Function%20Calling),%20high-performance%20chatbot%20framework.%20It%20supports%20one-click%20free%20deployment%20of%20your%20private%20ChatGPT/LLM%20web%20application.%20https://github.com/lobehub/lobe-chat%20#chatbot%20#chatGPT%20#openAI
[share-mastodon-shield]: https://img.shields.io/badge/-share%20on%20mastodon-black?labelColor=black&logo=mastodon&logoColor=white&style=flat-square
[share-reddit-link]: https://www.reddit.com/submit?title=Check%20this%20GitHub%20repository%20out%20%F0%9F%A4%AF%20LobeChat%20-%20An%20open-source%2C%20extensible%20%28Function%20Calling%29%2C%20high-performance%20chatbot%20framework.%20It%20supports%20one-click%20free%20deployment%20of%20your%20private%20ChatGPT%2FLLM%20web%20application.%20%23chatbot%20%23chatGPT%20%23openAI&url=https%3A%2F%2Fgithub.com%2Flobehub%2Flobe-chat
[share-reddit-shield]: https://img.shields.io/badge/-share%20on%20reddit-black?labelColor=black&logo=reddit&logoColor=white&style=flat-square
[share-telegram-link]: https://t.me/share/url"?text=Check%20this%20GitHub%20repository%20out%20%F0%9F%A4%AF%20LobeChat%20-%20An%20open-source%2C%20extensible%20%28Function%20Calling%29%2C%20high-performance%20chatbot%20framework.%20It%20supports%20one-click%20free%20deployment%20of%20your%20private%20ChatGPT%2FLLM%20web%20application.%20%23chatbot%20%23chatGPT%20%23openAI&url=https%3A%2F%2Fgithub.com%2Flobehub%2Flobe-chat
[share-telegram-shield]: https://img.shields.io/badge/-share%20on%20telegram-black?labelColor=black&logo=telegram&logoColor=white&style=flat-square
[share-weibo-link]: http://service.weibo.com/share/share.php?sharesource=weibo&title=Check%20this%20GitHub%20repository%20out%20%F0%9F%A4%AF%20LobeChat%20-%20An%20open-source%2C%20extensible%20%28Function%20Calling%29%2C%20high-performance%20chatbot%20framework.%20It%20supports%20one-click%20free%20deployment%20of%20your%20private%20ChatGPT%2FLLM%20web%20application.%20%23chatbot%20%23chatGPT%20%23openAI&url=https%3A%2F%2Fgithub.com%2Flobehub%2Flobe-chat
[share-weibo-shield]: https://img.shields.io/badge/-share%20on%20weibo-black?labelColor=black&logo=sinaweibo&logoColor=white&style=flat-square
[share-whatsapp-link]: https://api.whatsapp.com/send?text=Check%20this%20GitHub%20repository%20out%20%F0%9F%A4%AF%20LobeChat%20-%20An%20open-source%2C%20extensible%20%28Function%20Calling%29%2C%20high-performance%20chatbot%20framework.%20It%20supports%20one-click%20free%20deployment%20of%20your%20private%20ChatGPT%2FLLM%20web%20application.%20https%3A%2F%2Fgithub.com%2Flobehub%2Flobe-chat%20%23chatbot%20%23chatGPT%20%23openAI
[share-whatsapp-shield]: https://img.shields.io/badge/-share%20on%20whatsapp-black?labelColor=black&logo=whatsapp&logoColor=white&style=flat-square
[share-x-link]: https://x.com/intent/tweet?hashtags=chatbot%2CchatGPT%2CopenAI&text=Check%20this%20GitHub%20repository%20out%20%F0%9F%A4%AF%20LobeChat%20-%20An%20open-source%2C%20extensible%20%28Function%20Calling%29%2C%20high-performance%20chatbot%20framework.%20It%20supports%20one-click%20free%20deployment%20of%20your%20private%20ChatGPT%2FLLM%20web%20application.&url=https%3A%2F%2Fgithub.com%2Flobehub%2Flobe-chat
[share-x-shield]: https://img.shields.io/badge/-share%20on%20x-black?labelColor=black&logo=x&logoColor=white&style=flat-square
[sponsor-link]: https://opencollective.com/lobehub 'Become ❤️ LobeHub Sponsor'
[sponsor-shield]: https://img.shields.io/badge/-Sponsor%20LobeHub-f04f88?logo=opencollective&logoColor=white&style=flat-square
[submit-agents-link]: https://github.com/lobehub/lobe-chat-agents
[submit-agents-shield]: https://img.shields.io/badge/🤖/🏪_submit_agent-%E2%86%92-c4f042?labelColor=black&style=for-the-badge
[submit-plugin-link]: https://github.com/lobehub/lobe-chat-plugins
[submit-plugin-shield]: https://img.shields.io/badge/🧩/🏪_submit_plugin-%E2%86%92-95f3d9?labelColor=black&style=for-the-badge
[vercel-link]: https://chat-preview.lobehub.com
[vercel-shield]: https://img.shields.io/badge/vercel-online-55b467?labelColor=black&logo=vercel&style=flat-square
[vercel-shield-badge]: https://img.shields.io/badge/TRY%20LOBECHAT-ONLINE-55b467?labelColor=black&logo=vercel&style=for-the-badge
