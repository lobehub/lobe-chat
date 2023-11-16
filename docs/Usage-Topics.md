# Topic Guide

#### TOC

- [Explanation of Agent and Topic Concepts](#explanation-of-agent-and-topic-concepts)
- [User Guide](#user-guide)

## Explanation of Agent and Topic Concepts

In the official ChatGPT app, there is only the concept of topics, as shown in the figure, the sidebar contains the user's historical conversation topic list.

> \[!NOTE]
>
> However, in our use, we actually find that this mode has many problems, such as the information indexing of historical conversations is too scattered, and when dealing with some repetitive tasks, it is difficult to have a stable entrance. For example, I hope there is a stable entrance to allow ChatGPT to help me translate documents. In this mode, I need to constantly create new topics and then set the translation Prompt I created before. When there are high-frequency tasks, this will be a very low-efficiency interaction form.

![](https://github-production-user-asset-6210df.s3.amazonaws.com/17870709/279602474-fe7cb3f3-8eb7-40d3-a69f-6615393bbd4e.png)

Therefore, in LobeChat, we introduced the concept of `Agent`. The agent is a complete functional module, and each agent has its own responsibilities and tasks. The agent can help you handle various tasks and provide professional advice and guidance.

At the same time, we index the topic into each agent. The advantage of this is that each agent has an independent topic list, you can choose the corresponding agent according to the current task, and quickly switch historical conversation records. This way is more in line with the user's use habits of common chat software, and improves the interaction efficiency.

![](https://github-production-user-asset-6210df.s3.amazonaws.com/17870709/279602489-89893e61-2791-4083-9b57-ed80884ad58b.png)

<br/>

## User Guide

![](https://github-production-user-asset-6210df.s3.amazonaws.com/17870709/279602496-fd72037a-735e-4cc2-aa56-2994bceaba81.png)

- **Save Topic:** During the chat, if you want to save the current context and start a new topic, you can click the save button next to the send button.
- **Topic List:** Clicking on the topic in the list can quickly switch historical conversation records and continue the conversation. You can also click the star icon <kbd>⭐️</kbd> to bookmark the topic to the top, or rename and delete the topic through the more button on the right.
