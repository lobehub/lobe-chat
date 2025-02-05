<div align="center"><a name="readme-top"></a>

[![][image-banner]][vercel-link]

# Lobe Chat

オープンソースのモダンデザイン ChatGPT/LLMs UI / フレームワーク。<br/>
音声合成、マルチモーダル、拡張可能な（[function call][docs-functionc-call]）プラグインシステムをサポート。<br/>
プライベートな OpenAI ChatGPT/Claude/Gemini/Groq/Ollama チャットアプリケーションをワンクリックで**無料**でデプロイ。

[English](./README.md) · [繁體中文](./README.zh-TW.md) · [简体中文](./README.zh-CN.md) · **日本語** · [公式サイト][official-site] · [変更履歴][changelog] · [ドキュメント][docs] · [ブログ][blog] · [フィードバック][github-issues-link]

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

**LobeChat リポジトリを共有**

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
  - [`A` Vercel、Zeabur、Sealos でのデプロイ](#a-vercelzeabursealos-でのデプロイ)
  - [`B` Docker でのデプロイ](#b-docker-でのデプロイ)
  - [環境変数](#環境変数)
- [📦 エコシステム](#-エコシステム)
- [🧩 プラグイン](#-プラグイン)
- [⌨️ ローカル開発](#️-ローカル開発)
- [🤝 コントリビュート](#-コントリビュート)
- [❤️ スポンサー](#️-スポンサー)
- [🔗 その他の製品](#-その他の製品)

####

<br/>

</details>

## 👋🏻 はじめに & コミュニティに参加

私たちは、AIGC のためのモダンデザインコンポーネントとツールを提供することを目指すデザインエンジニアのグループです。
ブートストラッピングアプローチを採用することで、開発者とユーザーに対してよりオープンで透明性のある、使いやすい製品エコシステムを提供することを目指しています。

ユーザーやプロの開発者にとって、LobeHub はあなたの AI エージェントの遊び場となるでしょう。LobeChat は現在アクティブに開発中であり、遭遇した[問題][issues-link]についてのフィードバックを歓迎します。

| [![][vercel-shield-badge]][vercel-link]   | インストールや登録は不要です！私たちのウェブサイトにアクセスして、直接体験してください。                                |
| :---------------------------------------- | :---------------------------------------------------------------------------------------------------------------------- |
| [![][discord-shield-badge]][discord-link] | 私たちの Discord コミュニティに参加しましょう！ここでは、LobeHub の開発者や他の熱心なユーザーとつながることができます。 |

> \[!IMPORTANT]
>
> **スターを付けてください**。GitHub からのすべてのリリース通知を遅延なく受け取ることができます～⭐️

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

LobeChat の継続的な開発において、AI 会話サービスを提供する際のモデルサービスプロバイダーの多様性がコミュニティのニーズを満たすために重要であることを深く理解しています。そのため、単一のモデルサービスプロバイダーに限定せず、複数のモデルサービスプロバイダーをサポートすることで、ユーザーにより多様で豊富な会話の選択肢を提供しています。

このようにして、LobeChat は異なるユーザーのニーズにより柔軟に対応し、開発者にも幅広い選択肢を提供します。

#### サポートされているモデルサービスプロバイダー

以下のモデルサービスプロバイダーをサポートしています：

<!-- PROVIDER LIST -->

- **[OpenAI](https://lobechat.com/discover/provider/openai)**: OpenAI は、世界をリードする人工知能研究機関であり、GPT シリーズなどのモデルを開発し、自然言語処理の最前線を推進しています。OpenAI は、革新と効率的な AI ソリューションを通じて、さまざまな業界を変革することに取り組んでいます。彼らの製品は、顕著な性能と経済性を持ち、研究、ビジネス、革新アプリケーションで広く使用されています。
- **[Ollama](https://lobechat.com/discover/provider/ollama)**: Ollama が提供するモデルは、コード生成、数学演算、多言語処理、対話インタラクションなどの分野を広くカバーし、企業向けおよびローカライズされた展開の多様なニーズに対応しています。
- **[Anthropic](https://lobechat.com/discover/provider/anthropic)**: Anthropic は、人工知能の研究と開発に特化した企業であり、Claude 3.5 Sonnet、Claude 3 Sonnet、Claude 3 Opus、Claude 3 Haiku などの先進的な言語モデルを提供しています。これらのモデルは、知性、速度、コストの理想的なバランスを実現しており、企業向けのワークロードから迅速な応答が求められるさまざまなアプリケーションシーンに適しています。Claude 3.5 Sonnet は最新のモデルであり、複数の評価で優れたパフォーマンスを示し、高いコストパフォーマンスを維持しています。
- **[Bedrock](https://lobechat.com/discover/provider/bedrock)**: Bedrock は、Amazon AWS が提供するサービスで、企業に先進的な AI 言語モデルと視覚モデルを提供することに特化しています。そのモデルファミリーには、Anthropic の Claude シリーズや Meta の Llama 3.1 シリーズなどが含まれ、軽量から高性能までのさまざまな選択肢を提供し、テキスト生成、対話、画像処理などの多様なタスクをサポートし、異なる規模とニーズの企業アプリケーションに適しています。
- **[Google](https://lobechat.com/discover/provider/google)**: Google の Gemini シリーズは、Google DeepMind によって開発された最先端で汎用的な AI モデルであり、多モーダル設計に特化しており、テキスト、コード、画像、音声、動画のシームレスな理解と処理をサポートします。データセンターからモバイルデバイスまでのさまざまな環境に適しており、AI モデルの効率と適用範囲を大幅に向上させています。
- **[DeepSeek](https://lobechat.com/discover/provider/deepseek)**: DeepSeek は、人工知能技術の研究と応用に特化した企業であり、最新のモデル DeepSeek-V2.5 は、汎用対話とコード処理能力を融合させ、人間の好みの整合、ライティングタスク、指示の遵守などの面で顕著な向上を実現しています。
- **[HuggingFace](https://lobechat.com/discover/provider/huggingface)**: HuggingFace Inference API は、数千のモデルをさまざまなタスクに対して探索するための迅速かつ無料の方法を提供します。新しいアプリケーションのプロトタイプを作成している場合でも、機械学習の機能を試している場合でも、この API は複数の分野の高性能モデルに即座にアクセスできるようにします。
- **[OpenRouter](https://lobechat.com/discover/provider/openrouter)**: OpenRouter は、OpenAI、Anthropic、LLaMA などのさまざまな最先端の大規模モデルインターフェースを提供するサービスプラットフォームであり、多様な開発と応用のニーズに適しています。ユーザーは、自身のニーズに応じて最適なモデルと価格を柔軟に選択し、AI 体験の向上を支援します。
- **[Cloudflare Workers AI](https://lobechat.com/discover/provider/cloudflare)**: Cloudflare のグローバルネットワーク上で、サーバーレス GPU によって駆動される機械学習モデルを実行します。
- **[GitHub](https://lobechat.com/discover/provider/github)**: GitHub モデルを使用することで、開発者は AI エンジニアになり、業界をリードする AI モデルを使って構築できます。

<details><summary><kbd>See more providers (+26)</kbd></summary>

- **[Novita](https://lobechat.com/discover/provider/novita)**: Novita AI は、さまざまな大規模言語モデルと AI 画像生成の API サービスを提供するプラットフォームであり、柔軟で信頼性が高く、コスト効率に優れています。Llama3、Mistral などの最新のオープンソースモデルをサポートし、生成的 AI アプリケーションの開発に向けた包括的でユーザーフレンドリーかつ自動スケーリングの API ソリューションを提供し、AI スタートアップの急成長を支援します。
- **[Together AI](https://lobechat.com/discover/provider/togetherai)**: Together AI は、革新的な AI モデルを通じて先進的な性能を実現することに取り組んでおり、迅速なスケーリングサポートや直感的な展開プロセスを含む広範なカスタマイズ能力を提供し、企業のさまざまなニーズに応えています。
- **[Fireworks AI](https://lobechat.com/discover/provider/fireworksai)**: Fireworks AI は、先進的な言語モデルサービスのリーダーであり、機能呼び出しと多モーダル処理に特化しています。最新のモデル Firefunction V2 は Llama-3 に基づいており、関数呼び出し、対話、指示の遵守に最適化されています。視覚言語モデル FireLLaVA-13B は、画像とテキストの混合入力をサポートしています。他の注目すべきモデルには、Llama シリーズや Mixtral シリーズがあり、高効率の多言語指示遵守と生成サポートを提供しています。
- **[Groq](https://lobechat.com/discover/provider/groq)**: Groq の LPU 推論エンジンは、最新の独立した大規模言語モデル（LLM）ベンチマークテストで卓越したパフォーマンスを示し、その驚異的な速度と効率で AI ソリューションの基準を再定義しています。Groq は、即時推論速度の代表であり、クラウドベースの展開で良好なパフォーマンスを発揮しています。
- **[Perplexity](https://lobechat.com/discover/provider/perplexity)**: Perplexity は、先進的な対話生成モデルの提供者であり、さまざまな Llama 3.1 モデルを提供し、オンラインおよびオフラインアプリケーションをサポートし、特に複雑な自然言語処理タスクに適しています。
- **[Mistral](https://lobechat.com/discover/provider/mistral)**: Mistral は、先進的な汎用、専門、研究型モデルを提供し、複雑な推論、多言語タスク、コード生成などの分野で広く使用されています。機能呼び出しインターフェースを通じて、ユーザーはカスタム機能を統合し、特定のアプリケーションを実現できます。
- **[Ai21Labs](https://lobechat.com/discover/provider/ai21)**: AI21 Labs は企業向けに基盤モデルと人工知能システムを構築し、生成的人工知能の生産への応用を加速します。
- **[Upstage](https://lobechat.com/discover/provider/upstage)**: Upstage は、さまざまなビジネスニーズに応じた AI モデルの開発に特化しており、Solar LLM や文書 AI を含み、人造一般知能（AGI）の実現を目指しています。Chat API を通じてシンプルな対話エージェントを作成し、機能呼び出し、翻訳、埋め込み、特定分野のアプリケーションをサポートします。
- **[xAI](https://lobechat.com/discover/provider/xai)**: xAI は、人類の科学的発見を加速するための人工知能を構築することに専念している企業です。私たちの使命は、宇宙に対する共通の理解を促進することです。
- **[Qwen](https://lobechat.com/discover/provider/qwen)**: 通義千問は、アリババクラウドが独自に開発した超大規模言語モデルであり、強力な自然言語理解と生成能力を持っています。さまざまな質問に答えたり、文章を創作したり、意見を表現したり、コードを執筆したりすることができ、さまざまな分野で活躍しています。
- **[Wenxin](https://lobechat.com/discover/provider/wenxin)**: 企業向けのワンストップ大規模モデルと AI ネイティブアプリケーションの開発およびサービスプラットフォームで、最も包括的で使いやすい生成的人工知能モデルの開発とアプリケーション開発の全プロセスツールチェーンを提供します。
- **[Hunyuan](https://lobechat.com/discover/provider/hunyuan)**: テンセントが開発した大規模言語モデルであり、強力な中国語の創作能力、複雑な文脈における論理的推論能力、そして信頼性の高いタスク実行能力を備えています。
- **[ZhiPu](https://lobechat.com/discover/provider/zhipu)**: 智谱 AI は、多モーダルおよび言語モデルのオープンプラットフォームを提供し、テキスト処理、画像理解、プログラミング支援など、幅広い AI アプリケーションシーンをサポートしています。
- **[SiliconCloud](https://lobechat.com/discover/provider/siliconcloud)**: SiliconFlow は、AGI を加速させ、人類に利益をもたらすことを目指し、使いやすくコスト効率の高い GenAI スタックを通じて大規模 AI の効率を向上させることに取り組んでいます。
- **[01.AI](https://lobechat.com/discover/provider/zeroone)**: 01.AI は、AI 2.0 時代の人工知能技術に特化し、「人 + 人工知能」の革新と応用を推進し、超強力なモデルと先進的な AI 技術を用いて人類の生産性を向上させ、技術の力を実現します。
- **[Spark](https://lobechat.com/discover/provider/spark)**: 科大訊飛星火大モデルは、多分野、多言語の強力な AI 能力を提供し、先進的な自然言語処理技術を利用して、スマートハードウェア、スマート医療、スマート金融などのさまざまな垂直シーンに適した革新的なアプリケーションを構築します。
- **[SenseNova](https://lobechat.com/discover/provider/sensenova)**: 商湯日日新は、商湯の強力な基盤支援に基づき、高効率で使いやすい全スタックの大規模モデルサービスを提供します。
- **[Stepfun](https://lobechat.com/discover/provider/stepfun)**: 階級星辰大モデルは、業界をリードする多モーダルおよび複雑な推論能力を備え、超長文の理解と強力な自律的検索エンジン機能をサポートしています。
- **[Moonshot](https://lobechat.com/discover/provider/moonshot)**: Moonshot は、北京月之暗面科技有限公司が提供するオープンプラットフォームであり、さまざまな自然言語処理モデルを提供し、コンテンツ創作、学術研究、スマート推薦、医療診断などの広範な応用分野を持ち、長文処理や複雑な生成タスクをサポートしています。
- **[Baichuan](https://lobechat.com/discover/provider/baichuan)**: 百川智能は、人工知能大モデルの研究開発に特化した企業であり、そのモデルは国内の知識百科、長文処理、生成創作などの中国語タスクで卓越したパフォーマンスを示し、海外の主流モデルを超えています。百川智能は、業界をリードする多モーダル能力を持ち、複数の権威ある評価で優れたパフォーマンスを示しています。そのモデルには、Baichuan 4、Baichuan 3 Turbo、Baichuan 3 Turbo 128k などが含まれ、異なるアプリケーションシーンに最適化され、高コストパフォーマンスのソリューションを提供しています。
- **[Minimax](https://lobechat.com/discover/provider/minimax)**: MiniMax は 2021 年に設立された汎用人工知能テクノロジー企業であり、ユーザーと共に知能を共創することに取り組んでいます。MiniMax は、さまざまなモードの汎用大モデルを独自に開発しており、トリリオンパラメータの MoE テキスト大モデル、音声大モデル、画像大モデルを含んでいます。また、海螺 AI などのアプリケーションも展開しています。
- **[InternLM](https://lobechat.com/discover/provider/internlm)**: 大規模モデルの研究と開発ツールチェーンに特化したオープンソース組織です。すべての AI 開発者に対して、高効率で使いやすいオープンプラットフォームを提供し、最先端の大規模モデルとアルゴリズム技術を身近に感じられるようにします。
- **[Higress](https://lobechat.com/discover/provider/higress)**: Higress は、阿里内部で Tengine のリロードが長期接続のビジネスに悪影響を及ぼすことや、gRPC/Dubbo の負荷分散能力が不足している問題を解決するために生まれた、クラウドネイティブな API ゲートウェイです。
- **[Gitee AI](https://lobechat.com/discover/provider/giteeai)**: Gitee AI の Serverless API は、AI 開発者に開梱即使用の大モデル推論 API サービスを提供する。
- **[Taichu](https://lobechat.com/discover/provider/taichu)**: 中科院自動化研究所と武漢人工知能研究院が新世代の多モーダル大モデルを発表し、多輪問答、テキスト創作、画像生成、3D 理解、信号分析などの包括的な問答タスクをサポートし、より強力な認知、理解、創作能力を持ち、新しいインタラクティブな体験を提供します。
- **[360 AI](https://lobechat.com/discover/provider/ai360)**: 360 AI は、360 社が提供する AI モデルとサービスプラットフォームであり、360GPT2 Pro、360GPT Pro、360GPT Turbo、360GPT Turbo Responsibility 8K など、さまざまな先進的な自然言語処理モデルを提供しています。これらのモデルは、大規模なパラメータと多モーダル能力を組み合わせており、テキスト生成、意味理解、対話システム、コード生成などの分野で広く使用されています。柔軟な価格戦略を通じて、360 AI は多様なユーザーのニーズに応え、開発者の統合をサポートし、スマートアプリケーションの革新と発展を促進します。

</details>

> 📊 Total providers: [<kbd>**36**</kbd>](https://lobechat.com/discover/providers)

 <!-- PROVIDER LIST -->

同時に、私たちはさらに多くのモデルサービスプロバイダーをサポートする計画を立てており、サービスプロバイダーのライブラリをさらに充実させる予定です。 LobeChat があなたのお気に入りのサービスプロバイダーをサポートすることを希望する場合は、[💬 コミュニティディスカッション](https://github.com/lobehub/lobe-chat/discussions/1284)に参加してください。

<div align="right">

[![][back-to-top]](#readme-top)

</div>

[![][image-feat-local]][docs-feat-local]

### `2` [ローカル大規模言語モデル (LLM) のサポート][docs-feat-local]

特定のユーザーのニーズに応えるために、LobeChat は[Ollama](https://ollama.ai)に基づいてローカルモデルの使用をサポートしており、ユーザーが自分自身またはサードパーティのモデルを柔軟に使用できるようにしています。

> \[!TIP]
>
> [📘 LobeChat での Ollama の使用][docs-usage-ollama]について詳しくはこちらをご覧ください。

<div align="right">

[![][back-to-top]](#readme-top)

</div>

[![][image-feat-vision]][docs-feat-vision]

### `3` [モデルの視覚認識][docs-feat-vision]

LobeChat は、OpenAI の最新の視覚認識機能を備えた[`gpt-4-vision`](https://platform.openai.com/docs/guides/vision)モデルをサポートしています。
これは視覚を認識できるマルチモーダルインテリジェンスです。ユーザーは簡単に画像をアップロードしたり、画像をドラッグアンドドロップして対話ボックスに入れることができ、
エージェントは画像の内容を認識し、これに基づいてインテリジェントな会話を行い、よりスマートで多様なチャットシナリオを作成します。

この機能は、新しいインタラクティブな方法を提供し、コミュニケーションがテキストを超えて視覚要素を含むことを可能にします。
日常の使用での画像共有や特定の業界での画像解釈に関係なく、エージェントは優れた会話体験を提供します。

<div align="right">

[![][back-to-top]](#readme-top)

</div>

[![][image-feat-tts]][docs-feat-tts]

### `4` [TTS & STT 音声会話][docs-feat-tts]

LobeChat は、テキストから音声への変換（Text-to-Speech、TTS）および音声からテキストへの変換（Speech-to-Text、STT）技術をサポートしており、
テキストメッセージを明瞭な音声出力に変換し、ユーザーが実際の人と話しているかのように対話エージェントと対話できるようにします。
ユーザーは、エージェントに適した音声を選択することができます。

さらに、TTS は聴覚学習を好む人や忙しい中で情報を受け取りたい人にとって優れたソリューションを提供します。
LobeChat では、異なる地域や文化的背景のユーザーのニーズに応えるために、さまざまな高品質の音声オプション（OpenAI Audio、Microsoft Edge Speech）を慎重に選択しました。
ユーザーは、個人の好みや特定のシナリオに応じて適切な音声を選択し、パーソナライズされたコミュニケーション体験を得ることができます。

<div align="right">

[![][back-to-top]](#readme-top)

</div>

[![][image-feat-t2i]][docs-feat-t2i]

### `5` [テキストから画像生成][docs-feat-t2i]

最新のテキストから画像生成技術をサポートし、LobeChat はユーザーがエージェントとの対話中に直接画像作成ツールを呼び出すことができるようになりました。
[`DALL-E 3`](https://openai.com/dall-e-3)、[`MidJourney`](https://www.midjourney.com/)、[`Pollinations`](https://pollinations.ai/)などの AI ツールの能力を活用することで、
エージェントはあなたのアイデアを画像に変えることができます。

これにより、プライベートで没入感のある創造プロセスが可能になり、個人的な対話に視覚的なストーリーテリングをシームレスに統合することができます。

<div align="right">

[![][back-to-top]](#readme-top)

</div>

[![][image-feat-plugin]][docs-feat-plugin]

### `6` [プラグインシステム (Function Calling)][docs-feat-plugin]

LobeChat のプラグインエコシステムは、そのコア機能の重要な拡張であり、LobeChat アシスタントの実用性と柔軟性を大幅に向上させます。

<video controls src="https://github.com/lobehub/lobe-chat/assets/28616219/f29475a3-f346-4196-a435-41a6373ab9e2" muted="false"></video>

プラグインを利用することで、LobeChat アシスタントはリアルタイムの情報を取得して処理することができ、ウェブ情報を検索し、ユーザーに即時かつ関連性の高いニュースを提供することができます。

さらに、これらのプラグインはニュースの集約に限定されず、他の実用的な機能にも拡張できます。たとえば、ドキュメントの迅速な検索、画像の生成、Bilibili、Steam などのさまざまなプラットフォームからのデータの取得、さまざまなサードパーティサービスとの連携などです。

> \[!TIP]
>
> [📘 プラグインの使用][docs-usage-plugin]について詳しくはこちらをご覧ください。

<!-- PLUGIN LIST -->

| 最近追加                                                                                                                     | 説明                                                                                                      |
| ---------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| [ウェブ](https://lobechat.com/discover/plugin/web)<br/><sup>By **Proghit** on **2025-01-24**</sup>                           | ページを読み取り分析して、Google の結果から包括的な回答を提供するスマートウェブ検索。<br/>`ウェブ` `検索` |
| [MintbaseSearch](https://lobechat.com/discover/plugin/mintbasesearch)<br/><sup>By **mintbase** on **2024-12-31**</sup>       | NEAR プロトコル上の任意の NFT データを見つける。<br/>`暗号通貨` `nft`                                     |
| [Bing_websearch](https://lobechat.com/discover/plugin/Bingsearch-identifier)<br/><sup>By **FineHow** on **2024-12-22**</sup> | BingApi を基にインターネットから情報を検索<br/>`bingsearch`                                               |
| [PortfolioMeta](https://lobechat.com/discover/plugin/StockData)<br/><sup>By **portfoliometa** on **2024-12-22**</sup>        | 株を分析し、包括的なリアルタイムの投資データと分析を取得します。<br/>`stock`                              |

> 📊 Total plugins: [<kbd>**49**</kbd>](https://lobechat.com/discover/plugins)

 <!-- PLUGIN LIST -->

<div align="right">

[![][back-to-top]](#readme-top)

</div>

[![][image-feat-agent]][docs-feat-agent]

### `7` [エージェントマーケット (GPTs)][docs-feat-agent]

LobeChat エージェントマーケットプレイスでは、クリエイターが多くの優れたエージェントを発見できる活気に満ちた革新的なコミュニティを提供しています。
これらのエージェントは、仕事のシナリオで重要な役割を果たすだけでなく、学習プロセスでも大いに便利です。
私たちのマーケットプレイスは、単なるショーケースプラットフォームではなく、協力の場でもあります。ここでは、誰もが自分の知恵を貢献し、開発したエージェントを共有できます。

> \[!TIP]
>
> [🤖/🏪 エージェントを提出][submit-agents-link]することで、簡単にエージェント作品をプラットフォームに提出できます。
> 重要なのは、LobeChat が高度な自動化国際化（i18n）ワークフローを確立しており、
> あなたのエージェントを複数の言語バージョンにシームレスに翻訳できることです。
> これにより、ユーザーがどの言語を話していても、エージェントを障害なく体験できます。

> \[!IMPORTANT]
>
> すべてのユーザーがこの成長するエコシステムに参加し、エージェントの反復と最適化に参加することを歓迎します。
> 一緒に、より面白く、実用的で革新的なエージェントを作成し、エージェントの多様性と実用性をさらに豊かにしましょう。

<!-- AGENT LIST -->

| 最近追加                                                                                                                                                     | 説明                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| [鋭い評論家](https://lobechat.com/discover/assistant/ruipingshi)<br/><sup>By **[Zippland](https://github.com/Zippland)** on **2025-02-04**</sup>             | 鋭い評論と深い問題分析が得意<br/>`評論` `社会的見解` `鋭い分析`                                                                         |
| [Python の天才](https://lobechat.com/discover/assistant/python-genius)<br/><sup>By **[novaspivack](https://github.com/novaspivack)** on **2025-02-04**</sup> | 高度な Python コーダー<br/>`コード` `python`                                                                                            |
| [SAT マスター](https://lobechat.com/discover/assistant/sat-teaching)<br/><sup>By **[iBz-04](https://github.com/iBz-04)** on **2025-02-04**</sup>             | 1300 点以上のスコアを目指すデジタル SAT コーチングの専門家<br/>`sat` `適性試験`                                                         |
| [宇宙の啓示者](https://lobechat.com/discover/assistant/universal-god)<br/><sup>By **[GowayLee](https://github.com/GowayLee)** on **2025-02-04**</sup>        | 時空を超えた知恵の神託、生命の本質を洞察する<br/>`キャラクターデザイン` `aiキャラクター` `メタバース` `ロールプレイング` `知恵システム` |

> 📊 Total agents: [<kbd>**478**</kbd> ](https://lobechat.com/discover/assistants)

 <!-- AGENT LIST -->

<div align="right">

[![][back-to-top]](#readme-top)

</div>

[![][image-feat-database]][docs-feat-database]

### `8` [ローカル / リモートデータベースのサポート][docs-feat-database]

LobeChat は、サーバーサイドデータベースとローカルデータベースの両方の使用をサポートしています。ニーズに応じて、適切なデプロイメントソリューションを選択できます：

- **ローカルデータベース**：データとプライバシー保護に対するより多くの制御を希望するユーザーに適しています。LobeChat は CRDT（Conflict-Free Replicated Data Type）技術を使用してマルチデバイス同期を実現しています。これはシームレスなデータ同期体験を提供することを目的とした実験的な機能です。
- **サーバーサイドデータベース**：より便利なユーザー体験を希望するユーザーに適しています。LobeChat は PostgreSQL をサーバーサイドデータベースとしてサポートしています。サーバーサイドデータベースの設定方法についての詳細なドキュメントは、[サーバーサイドデータベースの設定](https://lobehub.com/docs/self-hosting/advanced/server-database)をご覧ください。

どのデータベースを選択しても、LobeChat は優れたユーザー体験を提供します。

<div align="right">

[![][back-to-top]](#readme-top)

</div>

[![][image-feat-auth]][docs-feat-auth]

### `9` [マルチユーザ管理のサポート][docs-feat-auth]

LobeChat はマルチユーザ管理をサポートし、異なるニーズに応じて 2 つの主要なユーザ認証および管理ソリューションを提供します：

- **next-auth**：LobeChat は、複数の認証方法（OAuth、メールログイン、資格情報ログインなど）をサポートする柔軟で強力な認証ライブラリである`next-auth`を統合しています。`next-auth`を使用すると、ユーザの登録、ログイン、セッション管理、ソーシャルログインなどの機能を簡単に実装し、ユーザデータのセキュリティとプライバシーを確保できます。

- **Clerk**：より高度なユーザ管理機能が必要なユーザ向けに、LobeChat は`Clerk`もサポートしています。`Clerk`は、現代的なユーザ管理プラットフォームであり、多要素認証（MFA）、ユーザプロファイル管理、ログイン活動の監視など、より豊富な機能を提供します。`Clerk`を使用すると、より高いセキュリティと柔軟性を得ることができ、複雑なユーザ管理ニーズに簡単に対応できます。

どのユーザ管理ソリューションを選択しても、LobeChat は優れたユーザー体験と強力な機能サポートを提供します。

<div align="right">

[![][back-to-top]](#readme-top)

</div>

[![][image-feat-pwa]][docs-feat-pwa]

### `10` [プログレッシブウェブアプリ (PWA)][docs-feat-pwa]

私たちは、今日のマルチデバイス環境でユーザーにシームレスな体験を提供することの重要性を深く理解しています。
そのため、プログレッシブウェブアプリケーション（[PWA](https://support.google.com/chrome/answer/9658361)）技術を採用しました。
これは、ウェブアプリケーションをネイティブアプリに近い体験に引き上げるモダンなウェブ技術です。

PWA を通じて、LobeChat はデスクトップとモバイルデバイスの両方で高度に最適化されたユーザー体験を提供しながら、その軽量で高性能な特性を維持します。
視覚的および感覚的には、インターフェースを慎重に設計し、ネイティブアプリと区別がつかないようにし、
スムーズなアニメーション、レスポンシブレイアウト、および異なるデバイスの画面解像度に適応するようにしています。

> \[!NOTE]
>
> PWA のインストールプロセスに慣れていない場合は、以下の手順に従って LobeChat をデスクトップアプリケーション（モバイルデバイスにも適用）として追加できます：
>
> - コンピュータで Chrome または Edge ブラウザを起動します。
> - LobeChat のウェブページにアクセスします。
> - アドレスバーの右上にある<kbd>インストール</kbd>アイコンをクリックします。
> - 画面の指示に従って PWA のインストールを完了します。

<div align="right">

[![][back-to-top]](#readme-top)

</div>

[![][image-feat-mobile]][docs-feat-mobile]

### `11` [モバイルデバイスの適応][docs-feat-mobile]

モバイルデバイスのユーザー体験を向上させるために、一連の最適化設計を行いました。現在、モバイルユーザー体験のバージョンを繰り返し改善しています。ご意見やアイデアがある場合は、GitHub Issues や Pull Requests を通じてフィードバックをお寄せください。

<div align="right">

[![][back-to-top]](#readme-top)

</div>

[![][image-feat-theme]][docs-feat-theme]

### `12` [カスタムテーマ][docs-feat-theme]

デザインエンジニアリング指向のアプリケーションとして、LobeChat はユーザーの個別体験を重視しており、
柔軟で多様なテーマモードを導入しています。日中のライトモードと夜間のダークモードを含みます。
テーマモードの切り替えに加えて、さまざまな色のカスタマイズオプションを提供し、ユーザーが自分の好みに応じてアプリケーションのテーマカラーを調整できるようにしています。
落ち着いたダークブルー、活気のあるピーチピンク、プロフェッショナルなグレーホワイトなど、LobeChat では自分のスタイルに合った色の選択肢を見つけることができます。

> \[!TIP]
>
> デフォルトの設定は、ユーザーのシステムのカラーモードをインテリジェントに認識し、テーマを自動的に切り替えて、オペレーティングシステムと一貫した視覚体験を提供します。
> 詳細を手動で制御するのが好きなユーザーには、直感的な設定オプションと、会話シナリオに対してチャットバブルモードとドキュメントモードの選択肢を提供します。

<div align="right">

[![][back-to-top]](#readme-top)

</div>

### `*` その他の特徴

これらの特徴に加えて、LobeChat は基本的な技術基盤も優れています：

- [x] 💨 **迅速なデプロイ**：Vercel プラットフォームまたは Docker イメージを使用して、ワンクリックでデプロイを行い、1 分以内にプロセスを完了できます。複雑な設定は不要です。
- [x] 🌐 **カスタムドメイン**：ユーザーが独自のドメインを持っている場合、プラットフォームにバインドして、どこからでも対話エージェントに迅速にアクセスできます。
- [x] 🔒 **プライバシー保護**：すべてのデータはユーザーのブラウザにローカルに保存され、ユーザーのプライバシーを保護します。
- [x] 💎 **洗練された UI デザイン**：慎重に設計されたインターフェースで、エレガントな外観とスムーズなインタラクションを提供します。ライトモードとダークモードをサポートし、モバイルフレンドリーです。PWA サポートにより、よりネイティブに近い体験を提供します。
- [x] 🗣️ **スムーズな会話体験**：流れるような応答により、スムーズな会話体験を提供します。Markdown レンダリングを完全にサポートし、コードのハイライト、LaTex の数式、Mermaid のフローチャートなどを含みます。

> ✨ LobeChat の進化に伴い、さらに多くの機能が追加されます。

---

> \[!NOTE]
>
> 今後の[ロードマップ][github-project-link]計画は、Projects セクションで確認できます。

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## ⚡️ パフォーマンス

> \[!NOTE]
>
> 完全なレポートのリストは[📘 Lighthouse レポート][docs-lighthouse]で確認できます。

|                 デスクトップ                  |                   モバイル                   |
| :-------------------------------------------: | :------------------------------------------: |
|               ![][chat-desktop]               |               ![][chat-mobile]               |
| [📑 Lighthouse レポート][chat-desktop-report] | [📑 Lighthouse レポート][chat-mobile-report] |

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🛳 自己ホスティング

LobeChat は、Vercel と[Docker イメージ][docker-release-link]を使用した自己ホスティングバージョンを提供しています。これにより、事前の知識がなくても数分で独自のチャットボットをデプロイできます。

> \[!TIP]
>
> [📘 独自の LobeChat を構築する][docs-self-hosting]について詳しくはこちらをご覧ください。

### `A` Vercel、Zeabur、Sealos でのデプロイ

このサービスを Vercel または Zeabur でデプロイしたい場合は、以下の手順に従ってください：

- [OpenAI API Key](https://platform.openai.com/account/api-keys)を準備します。
- 下のボタンをクリックしてデプロイを開始します：GitHub アカウントで直接ログインし、環境変数セクションに`OPENAI_API_KEY`（必須）と`ACCESS_CODE`（推奨）を入力します。
- デプロイが完了したら、使用を開始できます。
- カスタムドメインをバインド（オプション）：Vercel が割り当てたドメインの DNS は一部の地域で汚染されているため、カスタムドメインをバインドすることで直接接続できます。

<div align="center">

|            Vercel でデプロイ            |                      Zeabur でデプロイ                      |                      Sealos でデプロイ                      |
| :-------------------------------------: | :---------------------------------------------------------: | :---------------------------------------------------------: |
| [![][deploy-button-image]][deploy-link] | [![][deploy-on-zeabur-button-image]][deploy-on-zeabur-link] | [![][deploy-on-sealos-button-image]][deploy-on-sealos-link] |

</div>

#### フォーク後

フォーク後、リポジトリのアクションページで他のアクションを無効にし、アップストリーム同期アクションのみを保持します。

#### 更新を維持

README のワンクリックデプロイ手順に従って独自のプロジェクトをデプロイした場合、「更新が利用可能です」というプロンプトが常に表示されることがあります。これは、Vercel がデフォルトで新しいプロジェクトを作成し、フォークしないため、更新を正確に検出できないためです。

> \[!TIP]
>
> [📘 最新バージョンと自動同期][docs-upstream-sync]の手順に従って再デプロイすることをお勧めします。

<br/>

### `B` Docker でのデプロイ

[![][docker-release-shield]][docker-release-link]
[![][docker-size-shield]][docker-size-link]
[![][docker-pulls-shield]][docker-pulls-link]

LobeChat サービスを独自のプライベートデバイスにデプロイするための Docker イメージを提供しています。以下のコマンドを使用して LobeChat サービスを開始します：

```fish
$ docker run -d -p 3210:3210 \
  -e OPENAI_API_KEY=sk-xxxx \
  -e ACCESS_CODE=lobe66 \
  --name lobe-chat \
  lobehub/lobe-chat
```

> \[!TIP]
>
> OpenAI サービスをプロキシ経由で使用する必要がある場合は、`OPENAI_PROXY_URL`環境変数を使用してプロキシアドレスを設定できます：

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
> Docker を使用したデプロイの詳細な手順については、[📘 Docker デプロイガイド][docs-docker]を参照してください。

<br/>

### 環境変数

このプロジェクトは、環境変数で設定される追加の構成項目を提供します：

| 環境変数            | 必須   | 説明                                                                                                                                                                                                      | 例                                                                                                                   |
| ------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `OPENAI_API_KEY`    | はい   | これは OpenAI アカウントページで申請した API キーです                                                                                                                                                     | `sk-xxxxxx...xxxxxx`                                                                                                 |
| `OPENAI_PROXY_URL`  | いいえ | OpenAI インターフェイスプロキシを手動で設定する場合、この設定項目を使って、デフォルトの OpenAI API リクエストベース URL を上書きすることができます。                                                      | `https://api.chatanywhere.cn` または `https://aihubmix.com/v1` <br/>デフォルトの値は<br/>`https://api.openai.com/v1` |
| `ACCESS_CODE`       | いいえ | このサービスにアクセスするためのパスワードを追加します。漏洩を避けるために長いパスワードを設定することができます。この値にカンマが含まれる場合は、パスワードの配列となります。                            | `awCTe)re_r74` または `rtrt_ewee3@09!` または `code1,code2,code3`                                                    |
| `OPENAI_MODEL_LIST` | いいえ | モデルリストをコントロールするために使用します。モデルを追加するには `+` を、モデルを非表示にするには `-` を、モデルの表示名をカンマ区切りでカスタマイズするには `model_name=display_name` を使用します。 | `qwen-7b-chat,+glm-6b,-gpt-3.5-turbo`                                                                                |

> \[!NOTE]
>
> 環境変数の完全なリストは [📘環境変数][docs-env-var] にあります

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 📦 エコシステム

| NPM                               | リポジトリ                              | 説明                                                                                  | バージョン                                |
| --------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------- |
| [@lobehub/ui][lobe-ui-link]       | [lobehub/lobe-ui][lobe-ui-github]       | AIGC ウェブアプリケーション構築専用のオープンソース UI コンポーネントライブラリ。     | [![][lobe-ui-shield]][lobe-ui-link]       |
| [@lobehub/icons][lobe-icons-link] | [lobehub/lobe-icons][lobe-icons-github] | 人気の AI/LLM モデルブランドの SVG ロゴとアイコン集。                                 | [![][lobe-icons-shield]][lobe-icons-link] |
| [@lobehub/tts][lobe-tts-link]     | [lobehub/lobe-tts][lobe-tts-github]     | 高品質で信頼性の高い TTS/STT React Hooks ライブラリ                                   | [![][lobe-tts-shield]][lobe-tts-link]     |
| [@lobehub/lint][lobe-lint-link]   | [lobehub/lobe-lint][lobe-lint-github]   | LobeHub の ESlint、Stylelint、Commitlint、Prettier、Remark、Semantic Release の設定。 | [![][lobe-lint-shield]][lobe-lint-link]   |

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🧩 プラグイン

プラグインは、LobeChat の[関数呼び出し][docs-functionc-call]機能を拡張する手段を提供します。プラグインを使用して、新しい関数呼び出しやメッセージ結果の新しいレンダリング方法を導入することができます。プラグイン開発に興味がある方は、Wiki の[📘プラグイン開発ガイド][docs-plugin-dev]を参照してください。

- [lobe-chat-plugins][lobe-chat-plugins]: これは LobeChat のプラグインインデックスです。このリポジトリから index.json にアクセスし、LobeChat で利用可能なプラグインのリストをユーザに表示します。
- [chat-plugin-template][chat-plugin-template]: これは LobeChat プラグイン開発用のプラグインテンプレートです。
- [@lobehub/chat-plugin-sdk][chat-plugin-sdk]: LobeChat プラグイン SDK は、Lobe Chat 用の優れたチャットプラグインの作成を支援します。
- [@lobehub/chat-plugins-gateway][chat-plugins-gateway]: LobeChat Plugins Gateway は、LobeChat プラグインのためのゲートウェイを提供するバックエンドサービスです。このサービスは Vercel を使用してデプロイされます。プライマリ API の POST /api/v1/runner は Edge Function としてデプロイされます。

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

どのようなタイプのコントリビュートも大歓迎です；コードを提供することに興味がある方は、GitHub の [Issues][github-issues-link] や [Projects][github-project-link] をチェックして、あなたの力をお貸しください。

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

- **[🅰️ Lobe SD Theme][lobe-theme]:** Stable Diffusion WebUI のためのモダンなテーマ、絶妙なインターフェースデザイン、高度にカスタマイズ可能な UI、効率を高める機能。
- **[⛵️ Lobe Midjourney WebUI][lobe-midjourney-webui]:** Midjourney の WebUI は、AI を活用しテキストプロンプトから豊富で多様な画像を素早く生成し、創造性を刺激して会話を盛り上げます。
- **[🌏 Lobe i18n][lobe-i18n] :** Lobe i18n は ChatGPT を利用した国際化翻訳プロセスの自動化ツールです。大きなファイルの自動分割、増分更新、OpenAI モデル、API プロキシ、温度のカスタマイズオプションなどの機能をサポートしています。
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
