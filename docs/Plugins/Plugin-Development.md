# LobeChat Plugin Development

#### TOC

- [Plugin Composition](#plugin-composition)
- [Custom Plugin Workflow](#custom-plugin-workflow)
  - [**`1`** Create and Start a Plugin Project](#1-create-and-start-a-plugin-project)
  - [**`2`** Add the Local Plugin in LobeChat Role Settings](#2-add-the-local-plugin-in-lobechat-role-settings)
  - [**`3`** Test the Plugin Functionality in a Session](#3-test-the-plugin-functionality-in-a-session)
- [Local Plugin Development](#local-plugin-development)
  - [Manifest](#manifest)
  - [Project Structure](#project-structure)
  - [Server-side](#server-side)
  - [Plugin UI Interface](#plugin-ui-interface)
- [Plugin Deployment and Publication](#plugin-deployment-and-publication)
  - [Plugin Shield](#plugin-shield)
- [Link](#link)

## Plugin Composition

A LobeChat plugin consists of the following components:

1. **Plugin Index**: Used to display basic information about the plugin, including the plugin name, description, author, version, and a link to the plugin manifest. The official plugin index can be found at [lobe-chat-plugins](https://github.com/lobehub/lobe-chat-plugins). To submit a plugin to the official plugin marketplace, you need to submit a PR to this repository.
2. **Plugin Manifest**: Used to describe the functionality of the plugin, including the server-side description, frontend display information, and version number. For more details about the manifest, please refer to the [manifest][manifest-docs-url].
3. **Plugin Services**: Used to implement the server-side and frontend modules described in the manifest:

- **Server-side**: Implement the API capabilities described in the manifest.
- **Frontend UI** (optional): Implement the interface described in the manifest, which will be displayed in plugin messages to provide richer information display than plain text.

<br/>

## Custom Plugin Workflow

To integrate a plugin into LobeChat, you need to add and use a custom plugin in LobeChat. This section will guide you through the process.

### **`1`** Create and Start a Plugin Project

First, you need to create a plugin project locally. You can use the [lobe-chat-plugin-template][lobe-chat-plugin-template-url] template we have prepared:

```bash
$ git clone https://github.com/lobehub/chat-plugin-template.git
$ cd chat-plugin-template
$ npm i
$ npm run dev
```

When you see `ready started server on 0.0.0.0:3400, url: http://localhost:3400`, it means that the plugin service has been successfully started locally.

![](https://github-production-user-asset-6210df.s3.amazonaws.com/28616219/265259526-9ef25272-4312-429b-93bc-a95515727ed3.png)

### **`2`** Add the Local Plugin in LobeChat Role Settings

Next, go to LobeChat, create a new assistant, and go to its session settings page:

![](https://github-production-user-asset-6210df.s3.amazonaws.com/28616219/265259643-1a9cc34a-76f3-4ccf-928b-129654670efd.png)

Click the <kbd>Add</kbd> button on the right side of "Plugin List" to open the custom plugin add dialog:

![](https://github-production-user-asset-6210df.s3.amazonaws.com/28616219/265259748-2ef6a244-39bb-483c-b359-f156ffcbe1a4.png)

Enter `http://localhost:3400/manifest-dev.json` in the `Plugin Manifest URL` field, which is the URL of the locally started plugin manifest.

At this point, you should see that the identifier of the plugin has been automatically recognized as `chat-plugin-template`. Then fill in the remaining form fields (only the title is required) and click the <kbd>Save</kbd> button to complete the custom plugin addition.

![](https://github-production-user-asset-6210df.s3.amazonaws.com/28616219/265259964-59f4906d-ae2e-4ec0-8b43-db36871d0869.png)

After adding the plugin, you can see the newly added plugin in the plugin list. If you need to modify the plugin's configuration, you can click the <kbd>Settings</kbd> button to make changes.

![](https://github-production-user-asset-6210df.s3.amazonaws.com/28616219/265260093-a0363c74-0b5b-48dd-b103-2db6b4a8262e.png)

### **`3`** Test the Plugin Functionality in a Session

Next, we need to test the functionality of the custom plugin.

Click the <kbd>Back</kbd> button to go back to the session area, and then send a message to the assistant: "What should I wear?" The assistant will try to ask you about your gender and current mood.

![](https://github-production-user-asset-6210df.s3.amazonaws.com/28616219/265260291-f0aa0e7c-0ffb-486c-a834-08e73d49896f.png)

After answering, the assistant will make a plugin call to retrieve recommended clothing data based on your gender and mood from the server and push it to you. Finally, it will summarize the information in a text response.

![](https://github-production-user-asset-6210df.s3.amazonaws.com/28616219/265260461-c22ae797-2809-464b-96fc-d0c020f4807b.png)

After completing these steps, you have learned the basic process of adding and using a custom plugin in LobeChat.

<br/>

## Local Plugin Development

In the previous workflow, we have learned how to add and use a plugin. Now let's focus on the development process of custom plugins.

### Manifest

The manifest aggregates information about how the plugin's functionality is implemented. The core fields are `api` and `ui`, which describe the server-side API capabilities and the frontend rendering interface address of the plugin, respectively.

Taking the manifest in our template as an example:

```json
{
  "api": [
    {
      "url": "http://localhost:3400/api/clothes",
      "name": "recommendClothes",
      "description": "Recommend clothes based on the user's mood",
      "parameters": {
        "properties": {
          "mood": {
            "description": "The user's current mood, with optional values: happy, sad, anger, fear, surprise, disgust",
            "enums": ["happy", "sad", "anger", "fear", "surprise", "disgust"],
            "type": "string"
          },
          "gender": {
            "type": "string",
            "enum": ["man", "woman"],
            "description": "The gender of the user, which needs to be asked before knowing this information"
          }
        },
        "required": ["mood", "gender"],
        "type": "object"
      }
    }
  ],
  "gateway": "http://localhost:3400/api/gateway",
  "identifier": "chat-plugin-template",
  "ui": {
    "url": "http://localhost:3400",
    "height": 200
  },
  "version": "1"
}
```

In this manifest, the following parts are included:

1. `identifier`: This is the unique identifier of the plugin, used to distinguish different plugins. This field needs to be globally unique.
2. `api`: This is an array that contains all the API interface information provided by the plugin. Each interface includes the `url`, `name`, `description`, and `parameters` fields, all of which are required. The `description` and `parameters` fields will be sent to GPT as the `functions` parameter of the [Function Call](https://sspai.com/post/81986). The parameters need to comply with the [JSON Schema](https://json-schema.org/) specification. In this example, the API interface is named `recommendClothes`, which recommends clothes based on the user's mood and gender. The parameters of the interface include the user's mood and gender, both of which are required.
3. `ui`: This field contains information about the plugin's user interface, indicating where LobeChat loads the frontend interface of the plugin from. Since the plugin interface loading in LobeChat is implemented based on `iframe`, you can specify the height and width of the plugin interface as needed.
4. `gateway`: This field specifies the gateway for LobeChat to query API interfaces. The default plugin gateway in LobeChat is a cloud service, but for custom plugins, the requests need to be sent to the local service. Therefore, by specifying the gateway in the manifest, LobeChat will directly request this address and access the local plugin service. The gateway field does not need to be specified for plugins published online.
5. `version`: This is the version number of the plugin, which is currently not used.

In actual development, you can modify the plugin's manifest according to your needs to declare the functionality you want to implement. For a complete introduction to each field in the manifest, please refer to: [manifest][manifest-docs-url].

### Project Structure

The [lobe-chat-plugin-template][lobe-chat-plugin-template-url] template project uses Next.js as the development framework. Its core directory structure is as follows:

```
➜  chat-plugin-template
├── public
│   └── manifest-dev.json            # Manifest file
├── src
│   └── pages
│   │   ├── api                      # Next.js server-side folder
│   │   │   ├── clothes.ts           # Implementation of the recommendClothes interface
│   │   │   └── gateway.ts           # Local plugin proxy gateway
│   │   └── index.tsx                # Frontend display interface
```

Of course, using Next.js as the development framework in the template is just because we are familiar with Next.js and it is convenient for development. You can use any frontend framework and programming language you are familiar with as long as it can implement the functionality described in the manifest.

We also welcome contributions of plugin templates in more frameworks and languages.

### Server-side

The server-side only needs to implement the API interfaces described in the manifest. In the template, we use Vercel's [Edge Runtime](https://nextjs.org/docs/pages/api-reference/edge) as the server, which eliminates the need for operational maintenance.

#### API Implementation

For Edge Runtime, we provide the `createErrorResponse` method in `@lobehub/chat-plugin-sdk` to quickly return error responses. The currently provided error types can be found at: [PluginErrorType][plugin-error-type-url].

Here is an example of the clothes API implementation in the template:

```ts
export default async (req: Request) => {
  if (req.method !== 'POST') return createErrorResponse(PluginErrorType.MethodNotAllowed);

  const { gender, mood } = (await req.json()) as RequestData;

  const clothes = gender === 'man' ? manClothes : womanClothes;

  const result: ResponseData = {
    clothes: clothes[mood] || [],
    mood,
    today: Date.now(),
  };

  return new Response(JSON.stringify(result));
};
```

In this example, `manClothes` and `womanClothes` are hardcoded mock data. In actual scenarios, they can be replaced with database queries.

#### Gateway

Since the default plugin gateway in LobeChat is a cloud service (\</api/plugins>), which sends requests to the API addresses specified in the manifest to solve the cross-origin issue.

For custom plugins, the requests need to be sent to the local service. Therefore, by specifying the gateway in the manifest (<http://localhost:3400/api/gateway>), LobeChat will directly request this address. Then you only need to create a gateway implementation at this address.

```ts
import { createLobeChatPluginGateway } from '@lobehub/chat-plugins-gateway';

export const config = {
  runtime: 'edge',
};

export default async createLobeChatPluginGateway();
```

[`@lobehub/chat-plugins-gateway`](https://github.com/lobehub/chat-plugins-gateway) includes the implementation of the plugin gateway in LobeChat, which you can use to create a gateway. This allows LobeChat to access the local plugin service.

### Plugin UI Interface

For a plugin, the UI interface is optional. For example, the [Web Crawler](https://github.com/lobehub/chat-plugin-web-crawler) plugin does not provide a corresponding user interface.

![](https://github-production-user-asset-6210df.s3.amazonaws.com/28616219/265263241-0e765fdc-3463-4c36-a398-aef177a30df9.png)

If you want to display richer information in plugin messages or include some rich interactions, you can define a user interface for the plugin. For example, the following image shows the user interface of a search engine plugin.

![](https://github-production-user-asset-6210df.s3.amazonaws.com/28616219/265263427-9bdc03d5-aa61-4f62-a2ce-88683f3308d8.png)

#### Plugin UI Interface Implementation

LobeChat uses `iframe` + `postMessage` to load and communicate with plugin UI. Therefore, the implementation of the plugin UI is the same as normal web development. You can use any frontend framework and programming language you are familiar with.

![](https://github-production-user-asset-6210df.s3.amazonaws.com/28616219/265263653-4ea87abc-249a-49f3-a241-7ed93ddb1ddf.png)

In our template, we use React + Next.js + antd as the frontend framework. You can find the implementation of the user interface in `src/pages/index.tsx`.

Regarding plugin communication, we provide related methods in [`@lobehub/chat-plugin-sdk`](https://github.com/lobehub/chat-plugin-sdk) to simplify the communication between the plugin and LobeChat. You can use the `fetchPluginMessage` method to actively retrieve the data of the current message from LobeChat. For a detailed description of this method, please refer to: [fetchPluginMessage][fetch-plugin-message-url].

```tsx
import { fetchPluginMessage } from '@lobehub/chat-plugin-sdk';
import { memo, useEffect, useState } from 'react';

import { ResponseData } from '@/type';

const Render = memo(() => {
  const [data, setData] = useState<ResponseData>();

  useEffect(() => {
    // Retrieve the current plugin message from LobeChat
    fetchPluginMessage().then((e: ResponseData) => {
      setData(e);
    });
  }, []);

  return <>...</>;
});

export default Render;
```

<br/>

## Plugin Deployment and Publication

After completing the plugin development, you can deploy the plugin using your preferred method. For example, you can use Vercel or package it as a Docker image for publication.

If you want more people to use your plugin, you are welcome to submit it for review in the plugin marketplace.

[![][submit-plugin-shield]][submit-plugin-url]

### Plugin Shield

[![lobe-chat-plugin](https://img.shields.io/badge/%F0%9F%A4%AF%20%26%20%F0%9F%A7%A9%20LobeHub-Plugin-95f3d9?labelColor=black&style=flat-square)](https://github.com/lobehub/lobe-chat-plugins)

```markdown
[![lobe-chat-plugin](https://img.shields.io/badge/%F0%9F%A4%AF%20%26%20%F0%9F%A7%A9%20LobeHub-Plugin-95f3d9?labelColor=black&style=flat-square)](https://github.com/lobehub/lobe-chat-plugins)
```

<br/>

## Link

- **📘 Pluging SDK Docs**: <https://chat-plugin-sdk.lobehub.com>
- **🚀 chat-plugin-template**: <https://github.com/lobehub/chat-plugin-template>
- **🧩 chat-plugin-sdk**: <https://github.com/lobehub/chat-plugin-sdk>
- **🚪 chat-plugin-sdk**: <https://github.com/lobehub/chat-plugins-gateway>
- **🏪 lobe-chat-plugins**: <https://github.com/lobehub/lobe-chat-plugins>

<!-- LINK GROUP -->

[fetch-plugin-message-url]: https://github.com/lobehub/chat-plugin-template
[lobe-chat-plugin-template-url]: https://github.com/lobehub/chat-plugin-template
[manifest-docs-url]: https://chat-plugin-sdk.lobehub.com/guides/plugin-manifest
[plugin-error-type-url]: https://github.com/lobehub/chat-plugin-template
[submit-plugin-shield]: https://img.shields.io/badge/🧩/🏪_submit_plugin-%E2%86%92-95f3d9?labelColor=black&style=for-the-badge
[submit-plugin-url]: https://github.com/lobehub/lobe-chat-plugins
