<div align="center"><a name="readme-top"></a>

\[!\[]\[image-banner]]\[vercel-link]

# Lobe Chat

Một giao diện người dùng/Framework ChatGPT/LLM mã nguồn mở, thiết kế hiện đại.<br/>
Hỗ trợ tổng hợp giọng nói, đa phương thức và hệ thống plugin mở rộng (\[function call]\[docs-functionc-call]).<br/>
Triển khai ứng dụng trò chuyện OpenAI ChatGPT/Claude/Gemini/Groq/Ollama riêng tư **MIỄN PHÍ** chỉ với một cú nhấp chuột.

[English](./README.md) · [简体中文](./README.zh-CN.md) · [日本語](./README.ja-JP.md) · **Tiếng Việt** · \[Trang chủ]\[official-site] · [Nhật ký thay đổi][changelog] · \[Tài liệu]\[docs] · [Blog][blog] · \[Phản hồi]\[github-issues-link]

<!-- SHIELD GROUP -->

\[!\[]\[github-release-shield]]\[github-release-link]
\[!\[]\[docker-release-shield]]\[docker-release-link]
\[!\[]\[vercel-shield]]\[vercel-link]
\[!\[]\[discord-shield]]\[discord-link]<br/>
[![][codecov-shield]][codecov-link]
\[!\[]\[github-action-test-shield]]\[github-action-test-link]
\[!\[]\[github-action-release-shield]]\[github-action-release-link]
\[!\[]\[github-releasedate-shield]]\[github-releasedate-link]<br/>
\[!\[]\[github-contributors-shield]]\[github-contributors-link]
\[!\[]\[github-forks-shield]]\[github-forks-link]
\[!\[]\[github-stars-shield]]\[github-stars-link]
\[!\[]\[github-issues-shield]]\[github-issues-link]
\[!\[]\[github-license-shield]]\[github-license-link]<br>
\[!\[]\[sponsor-shield]]\[sponsor-link]

**Chia sẻ kho lưu trữ LobeChat**

\[!\[]\[share-x-shield]]\[share-x-link]
\[!\[]\[share-telegram-shield]]\[share-telegram-link]
\[!\[]\[share-whatsapp-shield]]\[share-whatsapp-link]
\[!\[]\[share-reddit-shield]]\[share-reddit-link]
\[!\[]\[share-weibo-shield]]\[share-weibo-link]
\[!\[]\[share-mastodon-shield]]\[share-mastodon-link]
\[!\[]\[share-linkedin-shield]]\[share-linkedin-link]

<sup> Tiên phong trong kỷ nguyên mới của tư duy và sáng tạo. Được xây dựng dành cho bạn, Cá nhân Siêu việt.</sup>

\[!\[]\[github-trending-shield]]\[github-trending-url]

\[!\[]\[image-overview]]\[vercel-link]

</div>

<details>
<summary><kbd>Mục lục</kbd></summary>

#### TOC

- [👋🏻 Bắt đầu & Tham gia cộng đồng của chúng tôi](#-bắt-đầu--tham-gia-cộng-đồng-của-chúng-tôi)
- [✨ Tính năng](#-tính-năng)
  - [`1` \[Tải lên tệp/Cơ sở kiến thức\]\[docs-feat-knowledgebase\]](#1-tải-lên-tệpcơ-sở-kiến-thứcdocs-feat-knowledgebase)
  - [`2` \[Hỗ trợ nhiều nhà cung cấp dịch vụ mô hình\]\[docs-feat-provider\]](#2-hỗ-trợ-nhiều-nhà-cung-cấp-dịch-vụ-mô-hìnhdocs-feat-provider)
  - [`3` \[Hỗ trợ Mô hình Ngôn ngữ Lớn (LLM) cục bộ\]\[docs-feat-local\]](#3-hỗ-trợ-mô-hình-ngôn-ngữ-lớn-llm-cục-bộdocs-feat-local)
  - [`4` \[Nhận dạng hình ảnh mô hình\]\[docs-feat-vision\]](#4-nhận-dạng-hình-ảnh-mô-hìnhdocs-feat-vision)
  - [`5` \[Trò chuyện bằng giọng nói TTS & STT\]\[docs-feat-tts\]](#5-trò-chuyện-bằng-giọng-nói-tts--sttdocs-feat-tts)
  - [`6` \[Tạo hình ảnh từ văn bản\]\[docs-feat-t2i\]](#6-tạo-hình-ảnh-từ-văn-bảndocs-feat-t2i)
  - [`7` \[Hệ thống plugin (Function Calling)\]\[docs-feat-plugin\]](#7-hệ-thống-plugin-function-callingdocs-feat-plugin)
  - [`8` \[Thị trường Agent (GPTs)\]\[docs-feat-agent\]](#8-thị-trường-agent-gptsdocs-feat-agent)
  - [`9` \[Hỗ trợ Cơ sở dữ liệu cục bộ / Từ xa\]\[docs-feat-database\]](#9-hỗ-trợ-cơ-sở-dữ-liệu-cục-bộ--từ-xadocs-feat-database)
  - [`10` \[Hỗ trợ Quản lý nhiều người dùng\]\[docs-feat-auth\]](#10-hỗ-trợ-quản-lý-nhiều-người-dùngdocs-feat-auth)
  - [`11` \[Ứng dụng web tiến bộ (PWA)\]\[docs-feat-pwa\]](#11-ứng-dụng-web-tiến-bộ-pwadocs-feat-pwa)
  - [`12` \[Thích ứng với thiết bị di động\]\[docs-feat-mobile\]](#12-thích-ứng-với-thiết-bị-di-độngdocs-feat-mobile)
  - [`13` \[Chủ đề tùy chỉnh\]\[docs-feat-theme\]](#13-chủ-đề-tùy-chỉnhdocs-feat-theme)
  - [`*` Còn gì nữa](#-còn-gì-nữa)
- [⚡️ Hiệu suất](#️-hiệu-suất)
- [🛳 Lưu trữ tự động](#-lưu-trữ-tự-động)
  - [`A` Triển khai với Vercel, Zeabur, Sealos hoặc Alibaba Cloud](#a-triển-khai-với-vercel-zeabur-sealos-hoặc-alibaba-cloud)
  - [`B` Triển khai với Docker](#b-triển-khai-với-docker)
  - [Biến môi trường](#biến-môi-trường)
- [📦 Hệ sinh thái](#-hệ-sinh-thái)
- [🧩 Plugin](#-plugin)
- [⌨️ Phát triển cục bộ](#️-phát-triển-cục-bộ)
- [🤝 Đóng góp](#-đóng-góp)
- [❤️ Tài trợ](#️-tài-trợ)
- [🔗 Sản phẩm khác](#-sản-phẩm-khác)

####

<br/>

</details>

## 👋🏻 Bắt đầu & Tham gia cộng đồng của chúng tôi

Chúng tôi là một nhóm các kỹ sư thiết kế e/acc, hy vọng cung cấp các thành phần và công cụ thiết kế hiện đại cho AIGC.
Bằng cách áp dụng phương pháp Bootstrapping, chúng tôi mong muốn cung cấp cho các nhà phát triển và người dùng một hệ sinh thái sản phẩm cởi mở, minh bạch và thân thiện với người dùng hơn.

Cho dù là người dùng hay nhà phát triển chuyên nghiệp, LobeHub sẽ là sân chơi AI Agent của bạn. Xin lưu ý rằng LobeChat hiện đang được phát triển tích cực và mọi phản hồi đều được hoan nghênh cho bất kỳ \[vấn đề]\[issues-link] nào gặp phải.

| \[!\[]\[vercel-shield-badge]]\[vercel-link]   | Không cần cài đặt hoặc đăng ký! Truy cập trang web của chúng tôi để trải nghiệm trực tiếp.                                                      |
| :-------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------- |
| \[!\[]\[discord-shield-badge]]\[discord-link] | Tham gia cộng đồng Discord của chúng tôi! Đây là nơi bạn có thể kết nối với các nhà phát triển và những người dùng nhiệt tình khác của LobeHub. |

> \[!IMPORTANT]
>
> **Đánh dấu sao cho chúng tôi**, Bạn sẽ nhận được tất cả các thông báo phát hành từ GitHub mà không có bất kỳ sự chậm trễ nào \~ ⭐️

\[!\[]\[image-star]]\[github-stars-link]

<details>
  <summary><kbd>Lịch sử đánh dấu sao</kbd></summary>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=lobehub%2Flobe-chat&theme=dark&type=Date">
    <img width="100%" src="https://api.star-history.com/svg?repos=lobehub%2Flobe-chat&type=Date">
  </picture>
</details>

## ✨ Tính năng

\[!\[]\[image-feat-knowledgebase]]\[docs-feat-knowledgebase]

### `1` \[Tải lên tệp/Cơ sở kiến thức]\[docs-feat-knowledgebase]

LobeChat hỗ trợ tải lên tệp và chức năng cơ sở kiến thức. Bạn có thể tải lên các loại tệp khác nhau bao gồm tài liệu, hình ảnh, âm thanh và video, cũng như tạo cơ sở kiến thức, giúp người dùng thuận tiện trong việc quản lý và tìm kiếm tệp. Ngoài ra, bạn có thể sử dụng các tệp và tính năng cơ sở kiến thức trong các cuộc trò chuyện, cho phép trải nghiệm đối thoại phong phú hơn.

<https://github.com/user-attachments/assets/faa8cf67-e743-4590-8bf6-ebf6ccc34175>

> \[!TIP]
>
> Tìm hiểu thêm trên [📘 Cơ sở kiến thức LobeChat ra mắt — Từ giờ trở đi, mọi bước đều có giá trị](https://lobehub.com/blog/knowledge-base)

<div align="right">

[![][back-to-top]](#readme-top)

</div>

\[!\[]\[image-feat-privoder]]\[docs-feat-provider]

### `2` \[Hỗ trợ nhiều nhà cung cấp dịch vụ mô hình]\[docs-feat-provider]

Trong quá trình phát triển liên tục của LobeChat, chúng tôi hiểu sâu sắc tầm quan trọng của sự đa dạng trong các nhà cung cấp dịch vụ mô hình để đáp ứng nhu cầu của cộng đồng khi cung cấp dịch vụ trò chuyện AI. Do đó, chúng tôi đã mở rộng hỗ trợ của mình cho nhiều nhà cung cấp dịch vụ mô hình, thay vì bị giới hạn ở một nhà cung cấp duy nhất, để cung cấp cho người dùng nhiều lựa chọn trò chuyện đa dạng và phong phú hơn.

Bằng cách này, LobeChat có thể thích ứng linh hoạt hơn với nhu cầu của những người dùng khác nhau, đồng thời cung cấp cho các nhà phát triển nhiều lựa chọn hơn.

#### Nhà cung cấp dịch vụ mô hình được hỗ trợ

Chúng tôi đã triển khai hỗ trợ cho các nhà cung cấp dịch vụ mô hình sau:

<!-- PROVIDER LIST -->

- **[OpenAI](https://lobechat.com/discover/provider/openai)**: OpenAI là một tổ chức nghiên cứu trí tuệ nhân tạo hàng đầu thế giới, với các mô hình như sê-ri GPT thúc đẩy các biên giới của xử lý ngôn ngữ tự nhiên. OpenAI cam kết chuyển đổi nhiều ngành công nghiệp thông qua các giải pháp AI sáng tạo và hiệu quả. Sản phẩm của họ chứng minh hiệu suất và hiệu quả chi phí đáng kể, được sử dụng rộng rãi trong nghiên cứu, kinh doanh và các ứng dụng sáng tạo.

- **[Ollama](https://lobechat.com/discover/provider/ollama)**: Ollama cung cấp các mô hình bao gồm nhiều lĩnh vực, bao gồm tạo mã, toán học, xử lý đa ngôn ngữ và tương tác đàm thoại, đáp ứng nhu cầu triển khai đa dạng ở cấp độ doanh nghiệp và địa phương.

- **[Anthropic](https://lobechat.com/discover/provider/anthropic)**: Anthropic là một công ty tập trung vào nghiên cứu và phát triển AI, cung cấp một loạt các mô hình ngôn ngữ tiên tiến như Claude 3.5 Sonnet, Claude 3 Sonnet, Claude 3 Opus và Claude 3 Haiku. Các mô hình này đạt được sự cân bằng lý tưởng giữa trí thông minh, tốc độ và chi phí, phù hợp với các ứng dụng khác nhau từ khối lượng công việc của doanh nghiệp đến các tình huống phản hồi nhanh. Claude 3.5 Sonnet, là mô hình mới nhất của họ, đã xuất sắc trong nhiều đánh giá trong khi vẫn duy trì tỷ lệ hiệu suất chi phí cao.

- **[Bedrock](https://lobechat.com/discover/provider/bedrock)**: Bedrock là một dịch vụ được cung cấp bởi Amazon AWS, tập trung vào việc cung cấp các mô hình ngôn ngữ và hình ảnh AI tiên tiến cho các doanh nghiệp. Họ mô hình của nó bao gồm sê-ri Claude của Anthropic, sê-ri Llama 3.1 của Meta, v.v., cung cấp một loạt các tùy chọn từ nhẹ đến hiệu suất cao, hỗ trợ các nhiệm vụ như tạo văn bản, đàm thoại và xử lý hình ảnh cho các doanh nghiệp có quy mô và nhu cầu khác nhau.

- **[Google](https://lobechat.com/discover/provider/google)**: Sê-ri Gemini của Google đại diện cho các mô hình AI tiên tiến và linh hoạt nhất của họ, được phát triển bởi Google DeepMind, được thiết kế cho các khả năng đa phương thức, hỗ trợ hiểu và xử lý liền mạch văn bản, mã, hình ảnh, âm thanh và video. Phù hợp với nhiều môi trường khác nhau từ trung tâm dữ liệu đến thiết bị di động, nó giúp tăng đáng kể hiệu quả và khả năng ứng dụng của các mô hình AI.

- **[DeepSeek](https://lobechat.com/discover/provider/deepseek)**: DeepSeek là một công ty tập trung vào nghiên cứu và ứng dụng công nghệ AI, với mô hình mới nhất DeepSeek-V2.5 tích hợp khả năng đối thoại chung và xử lý mã, đạt được những cải tiến đáng kể về sự liên kết sở thích của con người, nhiệm vụ viết và tuân theo hướng dẫn.

- **[HuggingFace](https://lobechat.com/discover/provider/huggingface)**: API suy luận HuggingFace cung cấp một cách nhanh chóng và miễn phí để bạn khám phá hàng nghìn mô hình cho các nhiệm vụ khác nhau. Cho dù bạn đang tạo mẫu cho một ứng dụng mới hay thử nghiệm các khả năng của máy học, API này đều cho phép bạn truy cập ngay vào các mô hình hiệu suất cao trên nhiều miền.

- **[OpenRouter](https://lobechat.com/discover/provider/openrouter)**: OpenRouter là một nền tảng dịch vụ cung cấp quyền truy cập vào nhiều giao diện mô hình lớn tiên tiến, hỗ trợ OpenAI, Anthropic, LLaMA, v.v., phù hợp với nhu cầu phát triển và ứng dụng đa dạng. Người dùng có thể linh hoạt chọn mô hình và giá cả tối ưu dựa trên yêu cầu của họ, nâng cao trải nghiệm AI.

- **[Cloudflare Workers AI](https://lobechat.com/discover/provider/cloudflare)**: Chạy các mô hình học máy chạy trên GPU không máy chủ trên mạng toàn cầu của Cloudflare.

- **[GitHub](https://lobechat.com/discover/provider/github)**: Với GitHub Models, các nhà phát triển có thể trở thành kỹ sư AI và tận dụng các mô hình AI hàng đầu trong ngành.

<details><summary><kbd>Xem thêm nhà cung cấp (+26)</kbd></summary>

- **[Novita](https://lobechat.com/discover/provider/novita)**: Novita AI là một nền tảng cung cấp nhiều mô hình ngôn ngữ lớn và dịch vụ API tạo ảnh AI, linh hoạt, đáng tin cậy và hiệu quả về chi phí. Nó hỗ trợ các mô hình nguồn mở mới nhất như Llama3 và Mistral, cung cấp giải pháp API toàn diện, thân thiện với người dùng và tự động mở rộng cho phát triển ứng dụng AI tạo sinh, phù hợp với sự phát triển nhanh chóng của các công ty khởi nghiệp AI.

- **[Together AI](https://lobechat.com/discover/provider/togetherai)**: Together AI được thiết kế để đạt được hiệu suất hàng đầu thông qua các mô hình AI sáng tạo, cung cấp khả năng tùy chỉnh mở rộng, bao gồm hỗ trợ mở rộng nhanh chóng và quy trình triển khai trực quan để đáp ứng các nhu cầu khác nhau của doanh nghiệp.

- **[Fireworks AI](https://lobechat.com/discover/provider/fireworksai)**: Fireworks AI là nhà cung cấp dịch vụ mô hình ngôn ngữ tiên tiến hàng đầu, tập trung vào việc gọi hàm và xử lý đa phương thức. Mô hình mới nhất của họ, Firefunction V2, dựa trên Llama-3, được tối ưu hóa để gọi hàm, đàm thoại và tuân theo hướng dẫn. Mô hình ngôn ngữ hình ảnh FireLLaVA-13B hỗ trợ đầu vào hỗn hợp hình ảnh và văn bản. Các mô hình đáng chú ý khác bao gồm sê-ri Llama và sê-ri Mixtral, cung cấp hỗ trợ tuân theo và tạo hướng dẫn đa ngôn ngữ hiệu quả.

- **[Groq](https://lobechat.com/discover/provider/groq)**: Công cụ suy luận LPU của Groq đã vượt trội trong các điểm chuẩn mô hình ngôn ngữ lớn (LLM) độc lập mới nhất, xác định lại các tiêu chuẩn cho các giải pháp AI với tốc độ và hiệu quả đáng kể. Groq đại diện cho tốc độ suy luận tức thì, thể hiện hiệu suất mạnh mẽ trong triển khai dựa trên đám mây.

- **[Perplexity](https://lobechat.com/discover/provider/perplexity)**: Perplexity là nhà cung cấp hàng đầu các mô hình tạo đàm thoại, cung cấp nhiều mô hình Llama 3.1 tiên tiến hỗ trợ cả ứng dụng trực tuyến và ngoại tuyến, đặc biệt phù hợp với các nhiệm vụ xử lý ngôn ngữ tự nhiên phức tạp.

- **[Mistral](https://lobechat.com/discover/provider/mistral)**: Mistral cung cấp các mô hình chung, chuyên biệt và nghiên cứu tiên tiến được sử dụng rộng rãi trong lập luận phức tạp, nhiệm vụ đa ngôn ngữ, tạo mã, v.v. Thông qua giao diện gọi hàm, người dùng có thể tích hợp các chức năng tùy chỉnh cho các ứng dụng cụ thể.

- **[Ai21Labs](https://lobechat.com/discover/provider/ai21)**: AI21 Labs xây dựng các mô hình nền tảng và hệ thống AI cho doanh nghiệp, đẩy nhanh việc ứng dụng AI tạo sinh trong sản xuất.

- **[Upstage](https://lobechat.com/discover/provider/upstage)**: Upstage tập trung vào việc phát triển các mô hình AI cho nhiều nhu cầu kinh doanh khác nhau, bao gồm Solar LLM và AI tài liệu, nhằm mục đích đạt được trí tuệ nhân tạo tổng quát (AGI) cho công việc. Nó cho phép tạo các tác nhân đàm thoại đơn giản thông qua Chat API và hỗ trợ gọi hàm, dịch thuật, nhúng và ứng dụng dành riêng cho miền.

- **[xAI](https://lobechat.com/discover/provider/xai)**: xAI là một công ty chuyên xây dựng trí tuệ nhân tạo để đẩy nhanh khám phá khoa học của con người. Nhiệm vụ của chúng tôi là nâng cao hiểu biết chung của chúng ta về vũ trụ.

- **[Qwen](https://lobechat.com/discover/provider/qwen)**: Tongyi Qianwen là một mô hình ngôn ngữ quy mô lớn được phát triển độc lập bởi Alibaba Cloud, có khả năng hiểu và tạo ngôn ngữ tự nhiên mạnh mẽ. Nó có thể trả lời các câu hỏi khác nhau, tạo nội dung bằng văn bản, bày tỏ ý kiến và viết mã, đóng một vai trò trong nhiều lĩnh vực.

- **[Wenxin](https://lobechat.com/discover/provider/wenxin)**: Một nền tảng một cửa ở cấp doanh nghiệp để phát triển và cung cấp dịch vụ mô hình lớn và ứng dụng AI-native, cung cấp chuỗi công cụ toàn diện và thân thiện với người dùng nhất cho toàn bộ quá trình phát triển mô hình trí tuệ nhân tạo tạo sinh và phát triển ứng dụng.

- **[Hunyuan](https://lobechat.com/discover/provider/hunyuan)**: Mô hình ngôn ngữ lớn được phát triển bởi Tencent, được trang bị khả năng sáng tạo tiếng Trung mạnh mẽ, khả năng lập luận logic trong ngữ cảnh phức tạp và kỹ năng thực hiện nhiệm vụ đáng tin cậy.

- **[Spark](https://lobechat.com/discover/provider/spark)**: Mô hình Spark của iFlytek cung cấp khả năng AI mạnh mẽ trên nhiều miền và ngôn ngữ, sử dụng công nghệ xử lý ngôn ngữ tự nhiên tiên tiến để xây dựng các ứng dụng sáng tạo phù hợp với phần cứng thông minh, chăm sóc sức khoẻ thông minh, tài chính thông minh và các tình huống dọc khác.

- **[ZhiPu](https://lobechat.com/discover/provider/zhipu)**: Zhipu AI cung cấp một nền tảng mở cho các mô hình đa phương thức và ngôn ngữ, hỗ trợ nhiều tình huống ứng dụng AI, bao gồm xử lý văn bản, hiểu hình ảnh và hỗ trợ lập trình.

- **[01.AI](https://lobechat.com/discover/provider/zeroone)**: 01.AI tập trung vào các công nghệ kỷ nguyên AI 2.0, tích cực thúc đẩy sự đổi mới và ứng dụng 'con người + trí tuệ nhân tạo', sử dụng các mô hình mạnh mẽ và công nghệ AI tiên tiến để nâng cao năng suất của con người và đạt được trao quyền công nghệ.

- **[SenseNova](https://lobechat.com/discover/provider/sensenova)**: SenseNova, được hỗ trợ bởi cơ sở hạ tầng mạnh mẽ của SenseTime, cung cấp các dịch vụ mô hình lớn toàn diện, hiệu quả và thân thiện với người dùng.

- **[Stepfun](https://lobechat.com/discover/provider/stepfun)**: Mô hình lớn của StepFun sở hữu khả năng đa phương thức và lập luận phức tạp hàng đầu trong ngành, hỗ trợ hiểu văn bản siêu dài và các chức năng công cụ tìm kiếm lập lịch tự động mạnh mẽ.

- **[Moonshot](https://lobechat.com/discover/provider/moonshot)**: Moonshot là một nền tảng mã nguồn mở được ra mắt bởi Beijing Dark Side Technology Co., Ltd., cung cấp nhiều mô hình xử lý ngôn ngữ tự nhiên với nhiều ứng dụng, bao gồm nhưng không giới hạn ở tạo nội dung, nghiên cứu học thuật, đề xuất thông minh và chẩn đoán y tế, hỗ trợ xử lý văn bản dài và các nhiệm vụ tạo phức tạp.

- **[Baichuan](https://lobechat.com/discover/provider/baichuan)**: Baichuan Intelligence là một công ty tập trung vào nghiên cứu và phát triển các mô hình AI lớn, với các mô hình của họ vượt trội trong bách khoa toàn thư kiến thức trong nước, xử lý văn bản dài và các nhiệm vụ tạo sinh bằng tiếng Trung, vượt qua các mô hình nước ngoài chính thống. Baichuan Intelligence cũng sở hữu khả năng đa phương thức hàng đầu trong ngành, hoạt động xuất sắc trong nhiều đánh giá có thẩm quyền. Các mô hình của họ bao gồm Baichuan 4, Baichuan 3 Turbo và Baichuan 3 Turbo 128k, mỗi mô hình được tối ưu hóa cho các tình huống ứng dụng khác nhau, cung cấp các giải pháp hiệu quả về chi phí.

- **[Minimax](https://lobechat.com/discover/provider/minimax)**: MiniMax là một công ty công nghệ trí tuệ nhân tạo tổng quát được thành lập vào năm 2021, chuyên tạo ra trí thông minh chung với người dùng. MiniMax đã phát triển độc lập các mô hình lớn chung của các phương thức khác nhau, bao gồm các mô hình văn bản MoE tham số nghìn tỷ, mô hình giọng nói và mô hình hình ảnh, và đã ra mắt các ứng dụng như Conch AI.

- **[360 AI](https://lobechat.com/discover/provider/ai360)**: 360 AI là một nền tảng mô hình và dịch vụ AI được ra mắt bởi 360 Company, cung cấp nhiều mô hình xử lý ngôn ngữ tự nhiên tiên tiến, bao gồm 360GPT2 Pro, 360GPT Pro, 360GPT Turbo và 360GPT Turbo Responsibility 8K. Các mô hình này kết hợp các tham số quy mô lớn và khả năng đa phương thức, được áp dụng rộng rãi trong tạo văn bản, hiểu ngữ nghĩa, hệ thống đối thoại và tạo mã. Với các chiến lược định giá linh hoạt, 360 AI đáp ứng nhu cầu đa dạng của người dùng, hỗ trợ tích hợp nhà phát triển và thúc đẩy sự đổi mới và phát triển của các ứng dụng thông minh.

- **[Taichu](https://lobechat.com/discover/provider/taichu)**: Viện Tự động hóa, Học viện Khoa học Trung Quốc và Viện Nghiên cứu Trí tuệ Nhân tạo Vũ Hán đã ra mắt một thế hệ mô hình lớn đa phương thức mới, hỗ trợ các nhiệm vụ hỏi đáp toàn diện như hỏi đáp nhiều lượt, tạo văn bản, tạo hình ảnh, hiểu 3D và phân tích tín hiệu, với khả năng nhận thức, hiểu và sáng tạo mạnh mẽ hơn, mang đến trải nghiệm tương tác mới.

- **[InternLM](https://lobechat.com/discover/provider/internlm)**: Một tổ chức mã nguồn mở chuyên nghiên cứu và phát triển các chuỗi công cụ mô hình lớn. Nó cung cấp một nền tảng mã nguồn mở hiệu quả và thân thiện với người dùng cho tất cả các nhà phát triển AI, giúp các mô hình lớn và công nghệ thuật toán tiên tiến nhất dễ dàng tiếp cận.

- **[SiliconCloud](https://lobechat.com/discover/provider/siliconcloud)**: SiliconFlow chuyên đẩy nhanh AGI vì lợi ích của nhân loại, nâng cao hiệu quả AI quy mô lớn thông qua ngăn xếp GenAI dễ sử dụng và hiệu quả về chi phí.

- **[Higress](https://lobechat.com/discover/provider/higress)**: Higress là một cổng API đám mây gốc được phát triển nội bộ tại Alibaba để giải quyết các vấn đề về tải lại Tengine ảnh hưởng đến các kết nối tồn tại lâu và khả năng cân bằng tải không đủ cho gRPC/Dubbo.

- **[Gitee AI](https://lobechat.com/discover/provider/giteeai)**: API không máy chủ của Gitee AI cung cấp cho các nhà phát triển AI dịch vụ API suy luận mô hình lớn ngay lập tức.

</details>

> 📊 Tổng số nhà cung cấp: [<kbd>**36**</kbd>](https://lobechat.com/discover/providers)

<!-- PROVIDER LIST -->

Đồng thời, chúng tôi cũng đang lên kế hoạch hỗ trợ thêm nhiều nhà cung cấp dịch vụ mô hình. Nếu bạn muốn LobeChat hỗ trợ nhà cung cấp dịch vụ yêu thích của mình, vui lòng tham gia [💬 thảo luận cộng đồng](https://github.com/lobehub/lobe-chat/discussions/1284) của chúng tôi.

<div align="right">

[![][back-to-top]](#readme-top)

</div>

\[!\[]\[image-feat-local]]\[docs-feat-local]

### `3` \[Hỗ trợ Mô hình Ngôn ngữ Lớn (LLM) cục bộ]\[docs-feat-local]

Để đáp ứng nhu cầu cụ thể của người dùng, LobeChat cũng hỗ trợ sử dụng các mô hình cục bộ dựa trên [Ollama](https://ollama.ai), cho phép người dùng linh hoạt sử dụng mô hình của riêng họ hoặc của bên thứ ba.

> \[!TIP]
>
> Tìm hiểu thêm về \[📘 Sử dụng Ollama trong LobeChat]\[docs-usage-ollama] bằng cách xem qua.

<div align="right">

[![][back-to-top]](#readme-top)

</div>

\[!\[]\[image-feat-vision]]\[docs-feat-vision]

### `4` \[Nhận dạng hình ảnh mô hình]\[docs-feat-vision]

LobeChat hiện hỗ trợ mô hình [`gpt-4-vision`](https://platform.openai.com/docs/guides/vision) mới nhất của OpenAI với khả năng nhận dạng hình ảnh,
một trí tuệ đa phương thức có thể cảm nhận hình ảnh. Người dùng có thể dễ dàng tải lên hoặc kéo và thả hình ảnh vào hộp thoại,
và agent sẽ có thể nhận ra nội dung của hình ảnh và tham gia vào cuộc trò chuyện thông minh dựa trên điều này,
tạo ra các tình huống trò chuyện thông minh hơn và đa dạng hơn.

Tính năng này mở ra các phương thức tương tác mới, cho phép giao tiếp vượt ra ngoài văn bản và bao gồm nhiều yếu tố hình ảnh.
Cho dù đó là chia sẻ hình ảnh sử dụng hàng ngày hay diễn giải hình ảnh trong các ngành cụ thể, agent đều cung cấp trải nghiệm đàm thoại xuất sắc.

<div align="right">

[![][back-to-top]](#readme-top)

</div>

\[!\[]\[image-feat-tts]]\[docs-feat-tts]

### `5` \[Trò chuyện bằng giọng nói TTS & STT]\[docs-feat-tts]

LobeChat hỗ trợ công nghệ chuyển văn bản thành giọng nói (TTS) và chuyển giọng nói thành văn bản (STT), cho phép ứng dụng của chúng tôi chuyển đổi tin nhắn văn bản thành đầu ra giọng nói rõ ràng,
cho phép người dùng tương tác với agent đàm thoại của chúng tôi như thể họ đang nói chuyện với một người thật. Người dùng có thể chọn từ nhiều giọng nói khác nhau để ghép nối với agent.

Hơn nữa, TTS cung cấp một giải pháp tuyệt vời cho những người thích học bằng thính giác hoặc muốn nhận thông tin trong khi bận rộn.
Trong LobeChat, chúng tôi đã lựa chọn tỉ mỉ một loạt các tùy chọn giọng nói chất lượng cao (OpenAI Audio, Microsoft Edge Speech) để đáp ứng nhu cầu của người dùng từ các khu vực và nền văn hóa khác nhau.
Người dùng có thể chọn giọng nói phù hợp với sở thích cá nhân hoặc tình huống cụ thể của họ, tạo ra trải nghiệm giao tiếp được cá nhân hóa.

<div align="right">

[![][back-to-top]](#readme-top)

</div>

\[!\[]\[image-feat-t2i]]\[docs-feat-t2i]

### `6` \[Tạo hình ảnh từ văn bản]\[docs-feat-t2i]

Với sự hỗ trợ của công nghệ tạo hình ảnh từ văn bản mới nhất, LobeChat hiện cho phép người dùng gọi các công cụ tạo hình ảnh trực tiếp trong các cuộc trò chuyện với agent. Bằng cách tận dụng khả năng của các công cụ AI như [`DALL-E 3`](https://openai.com/dall-e-3), [`MidJourney`](https://www.midjourney.com/), và [`Pollinations`](https://pollinations.ai/), các agent hiện được trang bị để biến ý tưởng của bạn thành hình ảnh.

Điều này cho phép quá trình sáng tạo riêng tư và đắm chìm hơn, cho phép tích hợp liền mạch cách kể chuyện bằng hình ảnh vào cuộc đối thoại cá nhân của bạn với agent.

<div align="right">

[![][back-to-top]](#readme-top)

</div>

\[!\[]\[image-feat-plugin]]\[docs-feat-plugin]

### `7` \[Hệ thống plugin (Function Calling)]\[docs-feat-plugin]

Hệ sinh thái plugin của LobeChat là một phần mở rộng quan trọng của chức năng cốt lõi của nó, giúp nâng cao đáng kể tính thiết thực và linh hoạt của trợ lý LobeChat.

<video controls src="https://github.com/lobehub/lobe-chat/assets/28616219/f29475a3-f346-4196-a435-41a6373ab9e2" muted="false"></video>

Bằng cách sử dụng plugin, trợ lý LobeChat có thể lấy và xử lý thông tin thời gian thực, chẳng hạn như tìm kiếm thông tin web và cung cấp cho người dùng tin tức tức thì và có liên quan.

Ngoài ra, các plugin này không giới hạn ở tổng hợp tin tức mà còn có thể mở rộng sang các chức năng thực tế khác, chẳng hạn như tìm kiếm nhanh tài liệu, tạo hình ảnh, lấy dữ liệu từ các nền tảng khác nhau như Bilibili, Steam và tương tác với các dịch vụ bên thứ ba khác nhau.

> \[!TIP]
>
> Tìm hiểu thêm về \[📘 Sử dụng plugin]\[docs-usage-plugin] bằng cách xem qua.

<!-- PLUGIN LIST -->

\| Gửi gần đây | Mô tả |
\| ------------------------------------------------------------------------------------------------------\`\`\`markdown
\---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
\| [PortfolioMeta](https://lobechat.com/discover/plugin/StockData)<br/><sup>Bởi **portfoliometa** vào **2024-12-22**</sup> | Phân tích cổ phiếu và nhận dữ liệu đầu tư và phân tích toàn diện theo thời gian thực.<br/>`cổ phiếu` |
\| [Google CSE](https://lobechat.com/discover/plugin/google-cse)<br/><sup>Bởi **vsnthdev** vào **2024-12-02**</sup> | Tìm kiếm Google thông qua API CSE chính thức của họ.<br/>`web` `tìm kiếm` |
\| [Speak](https://lobechat.com/discover/plugin/speak)<br/><sup>Bởi **speak** vào **2024-12-02**</sup> | Tìm hiểu cách nói bất cứ điều gì bằng một ngôn ngữ khác với Speak, gia sư ngôn ngữ hỗ trợ AI của bạn.<br/>`giáo dục` `ngôn ngữ` |
\| [Trình tạo hình ảnh Tongyi wanxiang](https://lobechat.com/discover/plugin/alps-tongyi-image)<br/><sup>Bởi **YoungTx** vào **2024-08-09**</sup> | Plugin này sử dụng mô hình Tongyi Wanxiang của Alibaba để tạo hình ảnh dựa trên lời nhắc văn bản.<br/>`hình ảnh` `tongyi` `wanxiang` |

> 📊 Tổng số plugin: [<kbd>**48**</kbd>](https://lobechat.com/discover/plugins)

 <!-- PLUGIN LIST -->

<div align="right">

[![][back-to-top]](#readme-top)

</div>

\[!\[]\[image-feat-agent]]\[docs-feat-agent]

### `8` \[Thị trường Agent (GPTs)]\[docs-feat-agent]

Tại LobeChat Agent Marketplace, người sáng tạo có thể khám phá một cộng đồng sôi động và sáng tạo, nơi tập hợp vô số agent được thiết kế tốt,
không chỉ đóng vai trò quan trọng trong các tình huống công việc mà còn mang lại sự tiện lợi tuyệt vời trong quá trình học tập.
Thị trường của chúng tôi không chỉ là một nền tảng trưng bày mà còn là một không gian hợp tác. Tại đây, mọi người đều có thể đóng góp trí tuệ của mình và chia sẻ các agent mà họ đã phát triển.

> \[!TIP]
>
> Bằng cách \[🤖/🏪 Gửi Agent]\[submit-agents-link], bạn có thể dễ dàng gửi các tác phẩm agent của mình lên nền tảng của chúng tôi.
> Điều quan trọng là, LobeChat đã thiết lập quy trình làm việc quốc tế hóa (i18n) tự động tinh vi,
> có khả năng dịch liền mạch agent của bạn sang nhiều phiên bản ngôn ngữ.
> Điều này có nghĩa là bất kể người dùng của bạn nói ngôn ngữ nào, họ đều có thể trải nghiệm agent của bạn mà không gặp rào cản.

> \[!IMPORTANT]
>
> Chúng tôi hoan nghênh tất cả người dùng tham gia hệ sinh thái đang phát triển này và tham gia vào quá trình lặp lại và tối ưu hóa agent.
> Cùng nhau, chúng ta có thể tạo ra nhiều agent thú vị, thiết thực và sáng tạo hơn, làm phong phú thêm sự đa dạng và tính thiết thực của các dịch vụ agent.

<!-- AGENT LIST -->

| Gửi gần đây                                                                                                                                                                            | Mô tả                                                                                                                                                |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Chuyên gia hướng dẫn hệ thống](https://lobechat.com/discover/assistant/instructer)<br/><sup>Bởi **[yuyun2000](https://github.com/yuyun2000)** vào **2024-12-04**</sup>                | Có kỹ năng tinh chỉnh và tạo hướng dẫn hệ thống hiệu quả<br/>`hướng dẫn hệ thống` `viết` `tối ưu hóa chi tiết` `nhu cầu người dùng`                  |
| [Trợ giúp ghi nhớ tiếng Nhật](https://lobechat.com/discover/assistant/japan-language-helper)<br/><sup>Bởi **[sharkbear212](https://github.com/sharkbear212)** vào **2024-12-04**</sup> | Chuyên về Hiragana, Katakana, từ vựng tiếng Nhật và kỹ thuật ghi nhớ để giải thích và cụm từ<br/>`giải thích` `kỹ thuật ghi nhớ` `dạy tiếng Nhật`    |
| [Nhà thiết kế thiệp thơ](https://lobechat.com/discover/assistant/poetry-card-designer)<br/><sup>Bởi **[lianxin255](https://github.com/lianxin255)** vào **2024-12-03**</sup>           | Có kỹ năng thiết kế thiệp thơ để nâng cao tính nghệ thuật và sự hấp dẫn<br/>`thiết kế thiệp thơ` `thiệp` `sáng tạo` `biểu hiện nghệ thuật`           |
| [Bác sĩ hàng ngày](https://lobechat.com/discover/assistant/yunchat-docter)<br/><sup>Bởi **[yuyun2000](https://github.com/yuyun2000)** vào **2024-11-30**</sup>                         | Chuyên về chẩn đoán phẫu thuật và quản lý sức khỏe cá nhân<br/>`y học đa khoa` `phẫu thuật` `tư vấn sức khỏe` `điều trị cá nhân hóa` `giáo dục y tế` |

> 📊 Tổng số agent: [<kbd>**453**</kbd> ](https://lobechat.com/discover/assistants)

 <!-- AGENT LIST -->

<div align="right">

[![][back-to-top]](#readme-top)

</div>

\[!\[]\[image-feat-database]]\[docs-feat-database]

### `9` \[Hỗ trợ Cơ sở dữ liệu cục bộ / Từ xa]\[docs-feat-database]

LobeChat hỗ trợ sử dụng cả cơ sở dữ liệu phía máy chủ và cục bộ. Tùy thuộc vào nhu cầu của bạn, bạn có thể chọn giải pháp triển khai phù hợp:

- **Cơ sở dữ liệu cục bộ**: phù hợp với những người dùng muốn kiểm soát nhiều hơn đối với dữ liệu và bảo vệ quyền riêng tư của họ. LobeChat sử dụng công nghệ CRDT (Conflict-Free Replicated Data Type) để đạt được đồng bộ hóa đa thiết bị. Đây là một tính năng thử nghiệm nhằm mục đích cung cấp trải nghiệm đồng bộ hóa dữ liệu liền mạch.
- **Cơ sở dữ liệu phía máy chủ**: phù hợp với những người dùng muốn trải nghiệm người dùng thuận tiện hơn. LobeChat hỗ trợ PostgreSQL làm cơ sở dữ liệu phía máy chủ. Để biết tài liệu chi tiết về cách định cấu hình cơ sở dữ liệu phía máy chủ, vui lòng truy cập [Định cấu hình cơ sở dữ liệu phía máy chủ](https://lobehub.com/docs/self-hosting/advanced/server-database).

Bất kể bạn chọn cơ sở dữ liệu nào, LobeChat đều có thể cung cấp cho bạn trải nghiệm người dùng tuyệt vời.

<div align="right">

[![][back-to-top]](#readme-top)

</div>

\[!\[]\[image-feat-auth]]\[docs-feat-auth]

### `10` \[Hỗ trợ Quản lý nhiều người dùng]\[docs-feat-auth]

LobeChat hỗ trợ quản lý nhiều người dùng và cung cấp hai giải pháp quản lý và xác thực người dùng chính để đáp ứng các nhu cầu khác nhau:

- **next-auth**: LobeChat tích hợp `next-auth`, một thư viện xác minh danh tính linh hoạt và mạnh mẽ hỗ trợ nhiều phương thức xác thực, bao gồm OAuth, đăng nhập bằng email, đăng nhập bằng chứng chỉ, v.v. Với `next-auth`, bạn có thể dễ dàng triển khai đăng ký người dùng, đăng nhập, quản lý phiên, đăng nhập mạng xã hội và các chức năng khác để đảm bảo an ninh và quyền riêng tư của dữ liệu người dùng.

- [**Clerk**](https://go.clerk.com/exgqLG0): Đối với những người dùng cần các tính năng quản lý người dùng nâng cao hơn, LobeChat cũng hỗ trợ `Clerk`, một nền tảng quản lý người dùng hiện đại. `Clerk` cung cấp các chức năng phong phú hơn, chẳng hạn như xác thực đa yếu tố (MFA), quản lý hồ sơ người dùng, giám sát hoạt động đăng nhập, v.v. Với `Clerk`, bạn có thể có được bảo mật và linh hoạt cao hơn, đồng thời dễ dàng đối phó với các nhu cầu quản lý người dùng phức tạp.

Bất kể bạn chọn giải pháp quản lý người dùng nào, LobeChat đều có thể cung cấp cho bạn trải nghiệm người dùng tuyệt vời và hỗ trợ chức năng mạnh mẽ.

<div align="right">

[![][back-to-top]](#readme-top)

</div>

\[!\[]\[image-feat-pwa]]\[docs-feat-pwa]

### `11` \[Ứng dụng web tiến bộ (PWA)]\[docs-feat-pwa]

Chúng tôi hiểu sâu sắc tầm quan trọng của việc cung cấp trải nghiệm liền mạch cho người dùng trong môi trường đa thiết bị ngày nay.
Do đó, chúng tôi đã áp dụng công nghệ Ứng dụng web tiến bộ ([PWA](https://support.google.com/chrome/answer/9658361)),
một công nghệ web hiện đại nâng cao các ứng dụng web lên trải nghiệm gần giống với ứng dụng native.

Thông qua PWA, LobeChat có thể cung cấp trải nghiệm người dùng được tối ưu hóa cao trên cả máy tính để bàn và thiết bị di động trong khi vẫn duy trì các đặc điểm nhẹ và hiệu suất cao.
Về mặt hình ảnh và cảm nhận, chúng tôi cũng đã thiết kế tỉ mỉ giao diện để đảm bảo nó không thể phân biệt được với các ứng dụng native,
cung cấp hoạt ảnh mượt mà, bố cục đáp ứng và thích ứng với độ phân giải màn hình của các thiết bị khác nhau.

> \[!NOTE]
>
> Nếu bạn không quen với quy trình cài đặt PWA, bạn có thể thêm LobeChat làm ứng dụng máy tính để bàn của mình (cũng áp dụng cho thiết bị di động) bằng cách làm theo các bước sau:
>
> - Khởi chạy trình duyệt Chrome hoặc Edge trên máy tính của bạn.
> - Truy cập trang web LobeChat.
> - Ở góc trên bên phải của thanh địa chỉ, nhấp vào biểu tượng <kbd>Cài đặt</kbd>.
> - Làm theo hướng dẫn trên màn hình để hoàn tất Cài đặt PWA.

<div align="right">

[![][back-to-top]](#readme-top)

</div>

\[!\[]\[image-feat-mobile]]\[docs-feat-mobile]

### `12` \[Thích ứng với thiết bị di động]\[docs-feat-mobile]

Chúng tôi đã thực hiện một loạt thiết kế tối ưu hóa cho thiết bị di động để nâng cao trải nghiệm di động của người dùng. Hiện tại, chúng tôi đang lặp lại trải nghiệm người dùng di động để đạt được các tương tác mượt mà và trực quan hơn. Nếu bạn có bất kỳ đề xuất hoặc ý tưởng nào, chúng tôi hoan nghênh bạn cung cấp phản hồi thông qua GitHub Issues hoặc Pull Requests.

<div align="right">

[![][back-to-top]](#readme-top)

</div>

\[!\[]\[image-feat-theme]]\[docs-feat-theme]

### `13` \[Chủ đề tùy chỉnh]\[docs-feat-theme]

Là một ứng dụng hướng đến thiết kế kỹ thuật, LobeChat rất coi trọng trải nghiệm cá nhân hóa của người dùng,
do đó giới thiệu các chế độ chủ đề linh hoạt và đa dạng, bao gồm chế độ sáng cho ban ngày và chế độ tối cho ban đêm.
Ngoài việc chuyển đổi chế độ chủ đề, một loạt các tùy chọn tùy chỉnh màu sắc cho phép người dùng điều chỉnh màu sắc chủ đề của ứng dụng theo sở thích của họ.
Cho dù đó là mong muốn có màu xanh lam đậm trầm lắng, màu hồng đào sống động hay màu xám trắng chuyên nghiệp, người dùng đều có thể tìm thấy phong cách lựa chọn màu sắc của mình trong LobeChat.

> \[!TIP]
>
> Cấu hình mặc định có thể nhận dạng thông minh chế độ màu hệ thống của người dùng và tự động chuyển đổi chủ đề để đảm bảo trải nghiệm hình ảnh nhất quán với hệ điều hành.
> Đối với những người dùng thích kiểm soát chi tiết theo cách thủ công, LobeChat cũng cung cấp các tùy chọn cài đặt trực quan và lựa chọn giữa chế độ bong bóng trò chuyện và chế độ tài liệu cho các tình huống trò chuyện.

<div align="right">

[![][back-to-top]](#readme-top)

</div>

### `*` Còn gì nữa

Bên cạnh những tính năng này, LobeChat còn có kỹ thuật cơ bản tốt hơn nhiều:

- [x] 💨 **Triển khai nhanh**: Sử dụng nền tảng Vercel hoặc hình ảnh docker, bạn có thể triển khai chỉ với một cú nhấp chuột và hoàn tất quy trình trong vòng 1 phút mà không cần bất kỳ cấu hình phức tạp nào.
- [x] 🌐 **Tên miền tùy chỉnh**: Nếu người dùng có tên miền riêng, họ có thể liên kết tên miền đó với nền tảng để truy cập nhanh vào agent đối thoại từ bất kỳ đâu.
- [x] 🔒 **Bảo vệ quyền riêng tư**: Tất cả dữ liệu được lưu trữ cục bộ trong trình duyệt của người dùng, đảm bảo quyền riêng tư của người dùng.
- [x] 💎 **Thiết kế giao diện người dùng tinh tế**: Với giao diện được thiết kế cẩn thận, nó mang lại vẻ ngoài tao nhã và tương tác mượt mà. Nó hỗ trợ chủ đề sáng và tối và thân thiện với thiết bị di động. Hỗ trợ PWA cung cấp trải nghiệm giống như native hơn.
- [x] 🗣️ **Trải nghiệm trò chuyện mượt mà**: Phản hồi trôi chảy đảm bảo trải nghiệm trò chuyện mượt mà. Nó hỗ trợ đầy đủ kết xuất Markdown, bao gồm tô sáng cú pháp, công thức LaTex, biểu đồ Mermaid, v.v.

> ✨ nhiều tính năng hơn sẽ được thêm vào khi LobeChat phát triển.

---

> \[!NOTE]
>
> Bạn có thể tìm thấy các kế hoạch \[Lộ trình]\[github-project-link] sắp tới của chúng tôi trong phần Dự án.

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## ⚡️ Hiệu suất

> \[!NOTE]
>
> Danh sách đầy đủ các báo cáo có thể được tìm thấy trong \[📘 Báo cáo Lighthouse]\[docs-lighthouse]

|               Máy tính để bàn                |                   Di động                   |
| :------------------------------------------: | :-----------------------------------------: |
|              ![][chat-desktop]               |              ![][chat-mobile]               |
| [📑 Báo cáo Lighthouse][chat-desktop-report] | [📑 Báo cáo Lighthouse][chat-mobile-report] |

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🛳 Lưu trữ tự động

LobeChat cung cấp Phiên bản tự lưu trữ với Vercel, Alibaba Cloud và \[Docker Image]\[docker-release-link]. Điều này cho phép bạn triển khai chatbot của riêng mình trong vòng vài phút mà không cần bất kỳ kiến thức nào trước đó.

> \[!TIP]
>
> Tìm hiểu thêm về \[📘 Xây dựng LobeChat của riêng bạn]\[docs-self-hosting] bằng cách xem qua.

### `A` Triển khai với Vercel, Zeabur, Sealos hoặc Alibaba Cloud

"Nếu bạn muốn tự triển khai dịch vụ này trên Vercel, Zeabur hoặc Alibaba Cloud, bạn có thể làm theo các bước sau:

- Chuẩn bị [Khóa API OpenAI](https://platform.openai.com/account/api-keys) của bạn.
- Nhấp vào nút bên dưới để bắt đầu triển khai: Đăng nhập trực tiếp bằng tài khoản GitHub của bạn và nhớ điền `OPENAI_API_KEY`(bắt buộc) và `ACCESS_CODE` (khuyến nghị) trên phần biến môi trường.
- Sau khi triển khai, bạn có thể bắt đầu sử dụng nó.
- Liên kết một tên miền tùy chỉnh (tùy chọn): DNS của tên miền được gán bởi Vercel bị ô nhiễm ở một số khu vực; liên kết một tên miền tùy chỉnh có thể kết nối trực tiếp.

<div align="center">

|          Triển khai với Vercel          |                      Triển khai với Zeabur                      |                      Triển khai với Sealos                      |                       Triển khai với RepoCloud                        |                       Triển khai với Alibaba Cloud                        |
| :-------------------------------------: | :-------------------------------------------------------------: | :-------------------------------------------------------------: | :-------------------------------------------------------------------: | :-----------------------------------------------------------------------: |
| [![][deploy-button-image]][deploy-link] | \[!\[]\[deploy-on-zeabur-button-image]]\[deploy-on-zeabur-link] | \[!\[]\[deploy-on-sealos-button-image]]\[deploy-on-sealos-link] | \[!\[]\[deploy-on-repocloud-button-image]]\[deploy-on-repocloud-link] | [![][deploy-on-alibaba-cloud-button-image]][deploy-on-alibaba-cloud-link] |

</div>

#### Sau khi Fork

Sau khi fork, chỉ giữ lại hành động đồng bộ hóa ngược dòng và vô hiệu hóa các hành động khác trong kho lưu trữ của bạn trên GitHub.

#### Cập nhật

Nếu bạn đã triển khai dự án của riêng mình theo các bước triển khai một cú nhấp chuột trong README, bạn có thể gặp phải thông báo liên tục cho biết "có bản cập nhật". Điều này là do Vercel mặc định tạo một dự án mới thay vì fork dự án này, dẫn đến việc không thể phát hiện bản cập nhật một cách chính xác.

> \[!TIP]
>
> Chúng tôi khuyên bạn nên triển khai lại bằng cách sử dụng các bước sau, \[📘 Tự động đồng bộ hóa với Mới nhất]\[docs-upstream-sync]

<br/>

### `B` Triển khai với Docker

\[!\[]\[docker-release-shield]]\[docker-release-link]
\[!\[]\[docker-size-shield]]\[docker-size-link]
\[!\[]\[docker-pulls-shield]]\[docker-pulls-link]

Chúng tôi cung cấp hình ảnh Docker để triển khai dịch vụ LobeChat trên thiết bị riêng tư của bạn. Sử dụng lệnh sau để khởi động dịch vụ LobeChat:

```fish
$ docker run -d -p 3210:3210 \
  -e OPENAI_API_KEY=sk-xxxx \
  -e ACCESS_CODE=lobe66 \
  --name lobe-chat \
  lobehub/lobe-chat
```

> \[!TIP]
>
> Nếu bạn cần sử dụng dịch vụ OpenAI thông qua proxy, bạn có thể định cấu hình địa chỉ proxy bằng biến môi trường `OPENAI_PROXY_URL`:

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
> Để biết hướng dẫn chi tiết về triển khai với Docker, vui lòng tham khảo \[📘 Hướng dẫn triển khai Docker]\[docs-docker]

<br/>

### Biến môi trường

Dự án này cung cấp một số mục cấu hình bổ sung được đặt với các biến môi trường:

| Biến môi trường     | Bắt buộc | Mô tả                                                                                                                                                                                         | Ví dụ                                                                                                                 |
| ------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `OPENAI_API_KEY`    | Có       | Đây là khóa API bạn áp dụng trên trang tài khoản OpenAI                                                                                                                                       | `sk-xxxxxx...xxxxxx`                                                                                                  |
| `OPENAI_PROXY_URL`  | Không    | Nếu bạn định cấu hình thủ công proxy giao diện OpenAI, bạn có thể sử dụng mục cấu hình này để ghi đè URL cơ sở yêu cầu API OpenAI mặc định                                                    | `https://api.chatanywhere.cn` hoặc `https://aihubmix.com/v1` <br/>Giá trị mặc định là<br/>`https://api.openai.com/v1` |
| `ACCESS_CODE`       | Không    | Thêm mật khẩu để truy cập dịch vụ này; bạn có thể đặt mật khẩu dài để tránh bị rò rỉ. Nếu giá trị này chứa dấu phẩy, thì đó là một mảng mật khẩu.                                             | `awCTe)re_r74` hoặc `rtrt_ewee3@09!` hoặc `code1,code2,code3`                                                         |
| `OPENAI_MODEL_LIST` | Không    | Được sử dụng để kiểm soát danh sách mô hình. Sử dụng `+` để thêm mô hình, `-` để ẩn mô hình và `model_name=display_name` để tùy chỉnh tên hiển thị của mô hình, được phân tách bằng dấu phẩy. | `qwen-7b-chat,+glm-6b,-gpt-3.5-turbo`                                                                                 |

> \[!NOTE]
>
> Danh sách đầy đủ các biến môi trường có thể được tìm thấy trong \[📘 Biến môi trường]\[docs-env-var]

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 📦 Hệ sinh thái

| NPM                                 | Kho lưu trữ                               | Mô tả                                                                                              | Phiên bản                                     |
| ----------------------------------- | ----------------------------------------- | -------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| \[@lobehub/ui]\[lobe-ui-link]       | \[lobehub/lobe-ui]\[lobe-ui-github]       | Thư viện thành phần giao diện người dùng mã nguồn mở dành riêng để xây dựng các ứng dụng web AIGC. | \[!\[]\[lobe-ui-shield]]\[lobe-ui-link]       |
| \[@lobehub/icons]\[lobe-icons-link] | \[lobehub/lobe-icons]\[lobe-icons-github] | Bộ sưu tập Logo và Biểu tượng SVG Thương hiệu Mô hình AI / LLM Phổ biến.                           | \[!\[]\[lobe-icons-shield]]\[lobe-icons-link] |
| \[@lobehub/tts]\[lobe-tts-link]     | \[lobehub/lobe-tts]\[lobe-tts-github]     | Thư viện React Hooks TTS/STT chất lượng cao & đáng tin cậy                                         | \[!\[]\[lobe-tts-shield]]\[lobe-tts-link]     |
| \[@lobehub/lint]\[lobe-lint-link]   | \[lobehub/lobe-lint]\[lobe-lint-github]   | Cấu hình cho ESlint, Stylelint, Commitlint, Prettier, Remark và Semantic Release cho LobeHub.      | \[!\[]\[lobe-lint-shield]]\[lobe-lint-link]   |

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🧩 Plugin

Plugin cung cấp phương tiện để mở rộng khả năng \[Function Calling]\[docs-functionc-call] của LobeChat. Chúng có thể được sử dụng để giới thiệu các lệnh gọi hàm mới và thậm chí các cách mới để hiển thị kết quả tin nhắn. Nếu bạn quan tâm đến việc phát triển plugin, vui lòng tham khảo \[📘 Hướng dẫn phát triển plugin]\[docs-plugin-dev] của chúng tôi trong Wiki.

- \[lobe-chat-plugins]\[lobe-chat-plugins]: Đây là chỉ mục plugin cho LobeChat. Nó truy cập index.json từ kho lưu trữ này để hiển thị danh sách các plugin có sẵn cho LobeChat cho người dùng.
- [chat-plugin-template][chat-plugin-template]: Đây là mẫu plugin để phát triển plugin LobeChat.
- [@lobehub/chat-plugin-sdk][chat-plugin-sdk]: SDK Plugin LobeChat hỗ trợ bạn tạo các plugin trò chuyện đặc biệt cho Lobe Chat.
- [@lobehub/chat-plugins-gateway][chat-plugins-gateway]: LobeChat Plugins Gateway là một dịch vụ phụ trợ cung cấp cổng cho các plugin LobeChat. Chúng tôi triển khai dịch vụ này bằng Vercel. API POST /api/v1/runner chính được triển khai dưới dạng Hàm Edge.

> \[!NOTE]
>
> Hệ thống plugin hiện đang được phát triển chính. Bạn có thể tìm hiểu thêm trong các vấn đề sau:
>
> - [x] [**Giai đoạn 1 của Plugin**](https://github.com/lobehub/lobe-chat/issues/73): Triển khai tách plugin khỏi phần thân chính, chia plugin thành một kho lưu trữ độc lập để bảo trì và nhận ra việc tải plugin động.

- [x] [**Giai đoạn 2 của Plugin**](https://github.com/lobehub/lobe-chat/issues/97): Bảo mật và ổn định của việc sử dụng plugin, trình bày chính xác hơn các trạng thái bất thường, khả năng bảo trì của kiến trúc plugin và thân thiện với nhà phát triển.
- [x] [**Giai đoạn 3 của Plugin**](https://github.com/lobehub/lobe-chat/issues/149): Khả năng tùy chỉnh ở cấp độ cao hơn và toàn diện hơn, hỗ trợ xác thực plugin và các ví dụ.

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## ⌨️ Phát triển cục bộ

Bạn có thể sử dụng GitHub Codespaces để phát triển trực tuyến:

[![][codespaces-shield]][codespaces-link]

Hoặc nhân bản nó để phát triển cục bộ:

```fish
$ git clone https://github.com/lobehub/lobe-chat.git
$ cd lobe-chat
$ pnpm install
$ pnpm dev
```

Nếu bạn muốn tìm hiểu thêm chi tiết, vui lòng xem \[📘 Hướng dẫn phát triển]\[docs-dev-guide] của chúng tôi.

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🤝 Đóng góp

Mọi đóng góp đều được hoan nghênh; nếu bạn quan tâm đến việc đóng góp mã, vui lòng xem \[Vấn đề]\[github-issues-link] và \[Dự án]\[github-project-link] trên GitHub của chúng tôi để bắt đầu thể hiện khả năng của bạn.

> \[!TIP]
>
> Chúng tôi đang tạo ra một diễn đàn dựa trên công nghệ, thúc đẩy sự tương tác kiến thức và trao đổi ý tưởng có thể dẫn đến cảm hứng lẫn nhau và đổi mới hợp tác.
>
> Giúp chúng tôi làm cho LobeChat tốt hơn. Chào mừng bạn cung cấp phản hồi về thiết kế sản phẩm, thảo luận về trải nghiệm người dùng trực tiếp cho chúng tôi.
>
> **Người bảo trì chính:** [@arvinxx](https://github.com/arvinxx) [@canisminor1990](https://github.com/canisminor1990)

\[!\[]\[pr-welcome-shield]]\[pr-welcome-link]
\[!\[]\[submit-agents-shield]]\[submit-agents-link]
\[!\[]\[submit-plugin-shield]]\[submit-plugin-link]

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

## ❤️ Tài trợ

Mọi khoản đóng góp nhỏ đều có giá trị và khoản đóng góp một lần của bạn sẽ tỏa sáng trong dải ngân hà hỗ trợ của chúng tôi! Bạn là một ngôi sao băng, tạo ra tác động nhanh chóng và tươi sáng trên hành trình của chúng tôi. Cảm ơn bạn đã tin tưởng vào chúng tôi – sự hào phóng của bạn hướng dẫn chúng tôi hướng tới sứ mệnh của mình, từng tia sáng rực rỡ một.

<a href="https://opencollective.com/lobehub" target="_blank">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://github.com/lobehub/.github/blob/main/static/sponsor-dark.png?raw=true">
    <img  src="https://github.com/lobehub/.github/blob/main/static/sponsor-light.png?raw=true">
  </picture>
</a>

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🔗 Sản phẩm khác

- **\[🅰️ Lobe SD Theme]\[lobe-theme]:** Giao diện hiện đại cho Stable Diffusion WebUI, thiết kế giao diện tinh tế, giao diện người dùng tùy chỉnh cao và các tính năng tăng cường hiệu quả.
- **\[⛵️ Lobe Midjourney WebUI]\[lobe-midjourney-webui]:** Giao diện WebUI dành cho Midjourney, tận dụng AI để nhanh chóng tạo ra một loạt hình ảnh phong phú và đa dạng từ lời nhắc văn bản, khơi dậy sự sáng tạo và nâng cao các cuộc trò chuyện.
- **\[🌏 Lobe i18n]\[lobe-i18n] :** Lobe i18n là một công cụ tự động hóa cho quá trình dịch i18n (quốc tế hóa), được hỗ trợ bởi ChatGPT. Nó hỗ trợ các tính năng như tự động chia nhỏ các tệp lớn, cập nhật gia tăng và các tùy chọn tùy chỉnh cho mô hình OpenAI, proxy API và nhiệt độ.
- **\[💌 Lobe Commit]\[lobe-commit]:** Lobe Commit là một công cụ CLI tận dụng Langchain/ChatGPT để tạo thông điệp cam kết dựa trên Gitmoji.

<div align="right">

[![][back-to-top]](#readme-top)

</div>

---

<details><summary><h4>📝 License</h4></summary>

\[!\[]\[fossa-license-shield]]\[fossa-license-link]

</details>

Copyright © 2024 \[LobeHub]\[profile-link]. <br />
Dự án này được cấp phép [Apache 2.0](./LICENSE).

<!-- LINKS START HERE -->

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
[deploy-on-alibaba-cloud-button-image]: https://service-info-public.oss-cn-hangzhou.aliyuncs.com/computenest-en.svg
[deploy-on-alibaba-cloud-link]: https://computenest.console.aliyun.com/service/instance/create/default?type=user&ServiceName=LobeChat%E7%A4%BE%E5%8C%BA%E7%89%88
