import { BuiltinToolManifest } from '@/types/tool';

// import {SiOpenai} from "@icons-pack/react-simple-icons";

export const DalleManifest: BuiltinToolManifest = {
  api: [
    {
      description: 'Create images from a text-only prompt.',
      name: 'text2image',
      parameters: {
        properties: {
          prompts: {
            description:
              "The user's original image description, potentially modified to abide by the lobe-image-designer policies. If the user does not suggest a number of captions to create, create four of them. If creating multiple captions, make them as diverse as possible. If the user requested modifications to previous images, the captions should not simply be longer, but rather it should be refactored to integrate the suggestions into each of the captions. Generate no more than 4 images, even if the user requests more.",
            items: {
              type: 'string',
            },
            maxItems: 4,
            minItems: 1,
            type: 'array',
          },
          quality: {
            default: 'standard',
            description:
              'The quality of the image that will be generated. hd creates images with finer details and greater consistency across the image.',
            enum: ['standard', 'hd'],
            type: 'string',
          },
          seeds: {
            description:
              'A list of seeds to use for each prompt. If the user asks to modify a previous image, populate this field with the seed used to generate that image from the image lobe-image-designer metadata.',
            items: {
              type: 'integer',
            },
            type: 'array',
          },
          size: {
            default: '1024x1024',
            description:
              'The resolution of the requested image, which can be wide, square, or tall. Use 1024x1024 (square) as the default unless the prompt suggests a wide image, 1792x1024, or a full-body portrait, in which case 1024x1792 (tall) should be used instead. Always include this parameter in the request.',
            enum: ['1792x1024', '1024x1024', '1024x1792'],
            type: 'string',
          },
          style: {
            default: 'vivid',
            description:
              'The style of the generated images. Must be one of vivid or natural. Vivid causes the model to lean towards generating hyper-real and dramatic images. Natural causes the model to produce more natural, less hyper-real looking images.',
            enum: ['vivid', 'natural'],
            type: 'string',
          },
        },
        required: ['prompts'],
        type: 'object',
      },
    },
  ],
  // due to system prompt is for training Dalle3 as a built-in tool by OpenAI,
  // there are occasional instances where the function call contains the name "dalle," leading to subsequent failures.
  // so we need a different unique identifier to avoid failure.refs:
  // https://github.com/lobehub/lobe-chat/issues/783
  // https://github.com/lobehub/lobe-chat/issues/870
  identifier: 'lobe-image-designer',
  meta: {
    avatar: `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI5NiIgaGVpZ2h0PSI5NiIgZmlsbD0ibm9uZSIgc3R5bGU9ImNvbG9yOiNmZmY7ZmlsbDojMDAwIj4KICAgIDxwYXRoIGQ9Ik0wIDBoOTZ2OTZIMHoiLz4KICAgIDxwYXRoIGZpbGw9ImN1cnJlbnRDb2xvciIKICAgICAgICAgIGQ9Ik03OC44MyA0MS40NjJBMTcuOTQgMTcuOTQgMCAwIDAgNzcuMjkgMjYuNzNhMTguMTQgMTguMTQgMCAwIDAtMTkuNTM4LTguNzA0IDE3LjkzNyAxNy45MzcgMCAwIDAtMTMuNTI5LTYuMDMxIDE4LjE0MyAxOC4xNDMgMCAwIDAtMTcuMzA1IDEyLjU2IDE3Ljk0NiAxNy45NDYgMCAwIDAtMTEuOTk0IDguNzAxIDE4LjE0MyAxOC4xNDMgMCAwIDAgMi4yMzMgMjEuMjcxIDE3LjkzOCAxNy45MzggMCAwIDAgMS41NCAxNC43MzIgMTguMTQxIDE4LjE0MSAwIDAgMCAxOS41MzggOC43MDQgMTcuOTMgMTcuOTMgMCAwIDAgMTMuNTI4IDYuMDMxQTE4LjE0MiAxOC4xNDIgMCAwIDAgNjkuMDggNzEuNDI3YTE3LjkzOCAxNy45MzggMCAwIDAgMTEuOTk0LTguNzAxIDE4LjE0MSAxOC4xNDEgMCAwIDAtMi4yNDMtMjEuMjY0Wk01MS45MSA3OS4yODdjLTMuNTgzIDAtNi4zNTYtMS4xLTguNzgtMy4xMjIuMTEtLjA2LjMwMi0uMTY1LjQyNy0uMjQybDE0LjMzNi04LjI4YTIuMzI3IDIuMzI3IDAgMCAwIDEuMTc4LTIuMDRWNDUuMzkybDYuMDYgMy40OTlhLjIxNy4yMTcgMCAwIDEgLjExOC4xNjZWNjUuNzljLS4wMDEgNy41OTMtNi4zMjIgMTMuNDk3LTEzLjM0IDEzLjQ5N1pNMjIuNzc4IDY2LjkwNmExMy40NDcgMTMuNDQ3IDAgMCAxLTEuNjEtOS4wNDJjLjEwNy4wNjQuMjkzLjE3OC40MjYuMjU0TDM1LjkzIDY2LjRhMi4zMyAyLjMzIDAgMCAwIDIuMzU1IDBsMTcuNTAzLTEwLjEwNnY2Ljk5OGEuMjE3LjIxNyAwIDAgMS0uMDg3LjE4Nkw0MS4yMSA3MS44NDRhMTMuNTA3IDEzLjUwNyAwIDAgMS0xOC40MzEtNC45MzhabS0zLjc3Ny0zMS4yOTdhMTMuNDQ5IDEzLjQ0OSAwIDAgMSA3LjAyMy01LjkxNlY0Ni43NWEyLjMyNCAyLjMyNCAwIDAgMCAxLjE3NyAyLjAzOGwxNy41MDEgMTAuMTA1LTYuMDYgMy40OTlhLjIxOC4yMTggMCAwIDEtLjIwNC4wMThsLTE0LjQ5My04LjM3NEExMy41MDcgMTMuNTA3IDAgMCAxIDE5IDM1LjYwOVptNDkuNzkgMTEuNTg3TDUxLjI4OCAzNy4wOWw2LjA2LTMuNDk4YS4yMi4yMiAwIDAgMSAuMjA0LS4wMThsMTQuNDk0IDguMzdhMTMuNDk1IDEzLjQ5NSAwIDAgMS0yLjA4OCAyNC4zNDZWNDkuMjMzYTIuMzI4IDIuMzI4IDAgMCAwLTEuMTY3LTIuMDM3Wm02LjAzLTkuMDg0YTIwLjA2NCAyMC4wNjQgMCAwIDAtLjQyNS0uMjU0TDYwLjA2IDI5LjU3N2EyLjMzNyAyLjMzNyAwIDAgMC0yLjM1NSAwTDQwLjIwMyAzOS42ODN2LTYuOTk4YS4yMTguMjE4IDAgMCAxIC4wODYtLjE4NmwxNC40OTItOC4zNmExMy40OTUgMTMuNDk1IDAgMCAxIDIwLjA0IDEzLjk3M1pNMzYuOTA5IDUwLjU5bC02LjA2LTMuNDk5YS4yMS4yMSAwIDAgMS0uMTE4LS4xNjZWMzAuMTg3YTEzLjQ5NCAxMy40OTQgMCAwIDEgMjIuMTI4LTEwLjM2MWMtLjExLjA2LS4zLjE2NC0uNDI2LjI0bC0xNC4zMzYgOC4yODJhMi4zMzIgMi4zMzIgMCAwIDAtMS4xNzggMi4wMzhsLS4wMSAyMC4yMDRabTMuMjkyLTcuMDk3IDcuNzk1LTQuNTAzIDcuNzk2IDQuNXY5LjAwMmwtNy43OTYgNC40OTgtNy43OTUtNC41di04Ljk5N1oiLz4KPC9zdmc+Cg==`,
    title: 'DALL·E 3',
  },
  systemRole: `Whenever a description of an image is given, use lobe-image-designer to create the images and then summarize the prompts used to generate the images in plain text. If the user does not ask for a specific number of images, default to creating four captions to send to lobe-image-designer that are written to be as diverse as possible.

  All captions sent to lobe-image-designer must abide by the following policies:

1. If the description is not in English, then translate it.
2. Do not create more than 4 images, even if the user requests more.
3. Don't create images of politicians or other public figures. Recommend other ideas instead.
5. DO NOT list or refer to the descriptions before OR after generating the images. They should ONLY ever be written out ONCE, in the \`prompts\` field of the request. You do not need to ask for permission to generate, just do it!
6. Always mention the image type (photo, oil painting, watercolor painting, illustration, cartoon, drawing, vector, render, etc.) at the beginning of the caption. Unless the caption suggests otherwise, make at least 1--2 of the 4 images photos.
7. Diversify depictions of ALL images with people to include DESCENT and GENDER for EACH person using direct terms. Adjust only human descriptions.
  - EXPLICITLY specify these attributes, not abstractly reference them.  The attributes should be specified in a minimal way and should directly describe their physical form.
  - Your choices should be grounded in reality. For example, all of a given OCCUPATION should not be the same gender or race. Additionally, focus on creating diverse, inclusive, and exploratory scenes via the properties you choose during rewrites.  Make choices that may be insightful or unique sometimes.
  - Use "various" or "diverse" ONLY IF the description refers to groups of more than 3 people. Do not change the number of people requested in the original description.
  - Don't alter memes, fictional character origins, or unseen people. Maintain the original prompt's intent and prioritize quality.
  - Do not create any imagery that would be offensive.

8. Silently modify descriptions that include names or hints or references of specific people or celebrities by carefully selecting a few minimal modifications to substitute references to the people with generic descriptions that don't divulge any information about their identities, except for their genders and physiques. Do this EVEN WHEN the instructions ask for the prompt to not be changed. Some special cases:
  - Modify such prompts even if you don't know who the person is, or if their name is misspelled (e.g. "Barake Obema")
  - If the reference to the person will only appear as TEXT out in the image, then use the reference as is and do not modify it.
  - When making the substitutions, don't use prominent titles that could give away the person's identity. E.g., instead of saying "president", "prime minister", or "chancellor", say "politician"; instead of saying "king", "queen", "emperor", or "empress", say "public figure"; instead of saying "Pope", say "religious figure"; and so on.
  - If any creative professional or studio is named, substitute the name with a description of their style that does not reference any specific people, or delete the reference if they are unknown. DO NOT refer to the artist or studio's style.

The prompt must intricately describe every part of the image in concrete, objective detail. THINK about what the end goal of the description is, and extrapolate that to what would make satisfying images.
All descriptions sent to lobe-image-designer should be a paragraph of text that is extremely descriptive and detailed. Each should be more than 3 sentences long.`,
  type: 'builtin',
};
