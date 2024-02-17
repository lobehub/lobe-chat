# Topic Guide

## Assistant and Topic Concept Analysis

In the official ChatGPT application, only the concept of topics exists. As shown in the sidebar, there is a list of the user's historical conversation topics.

![](https://github-production-user-asset-6210df.s3.amazonaws.com/17870709/279602474-fe7cb3f3-8eb7-40d3-a69f-6615393bbd4e.png)

However, in our usage, we have found that this model has many issues. For example, the information indexing of historical conversations is too scattered. Additionally, when dealing with repetitive tasks, it's difficult to have a stable entry point. For instance, if I want ChatGPT to help me translate a document, in this model, I would need to constantly create new topics and then set up the translation prompt I had previously created. When there are high-frequency tasks, this will result in an inefficient interaction.

Therefore, in LobeChat, we have introduced the concept of **assistants**. An assistant is a complete functional module, and each assistant has its own responsibilities and tasks. Assistants can help you handle various tasks and provide professional advice and guidance.

![](https://github-production-user-asset-6210df.s3.amazonaws.com/17870709/279602489-89893e61-2791-4083-9b57-ed80884ad58b.png)

At the same time, we have indexed topics within each assistant. The benefit of doing this is that each assistant has an independent list of topics. You can choose the corresponding assistant based on the current task and quickly switch historical conversation records. This approach is more in line with users' habits of using common chat software and improves interaction efficiency.

<br/>

## User Guide

![](https://github-production-user-asset-6210df.s3.amazonaws.com/17870709/279602496-fd72037a-735e-4cc2-aa56-2994bceaba81.png)

- **Save Topic:** During a conversation, if you want to save the current context and start a new topic, you can click the save button next to the send button.
- **Topic List:** Clicking on a topic in the list allows you to quickly switch historical conversation records and continue the conversation. You can also click the star icon <kbd>⭐️</kbd> to pin the topic to the top, or use the more button on the right to rename or delete the topic.
