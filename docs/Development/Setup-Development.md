# Environment Setup Guide

Welcome to the LobeChat development environment setup guide.

#### TOC

- [Online Development](#online-development)
- [Local Development](#local-development)
  - [Development Environment Requirements](#development-environment-requirements)
  - [Project Setup](#project-setup)

## Online Development

If you have access to GitHub Codespaces, you can click the button below to enter the online development environment with just one click:

[![][codespaces-shield]][codespaces-link]

## Local Development

Before starting development on LobeChat, you need to install and configure some necessary software and tools in your local environment. This document will guide you through these steps.

### Development Environment Requirements

First, you need to install the following software:

- Node.js: LobeChat is built on Node.js, so you need to install Node.js. We recommend installing the latest stable version.
- Yarn: We use Yarn as the preferred package manager. You can download and install it from the Yarn official website.
- PNPM: We use PNPM as an auxiliary package manager. You can download and install it from the PNPM official website.
- Git: We use Git for version control. You can download and install it from the Git official website.
- IDE: You can choose your preferred integrated development environment (IDE). We recommend using WebStorm, a powerful IDE particularly suitable for TypeScript development.

### Project Setup

After installing the above software, you can start setting up the LobeChat project.

1. **Get the code**: First, you need to clone the LobeChat codebase from GitHub. Run the following command in the terminal:

```bash
git clone https://github.com/lobehub/lobe-chat.git
```

2. **Install dependencies**: Then, navigate to the project directory and use Yarn to install the project's dependencies:

```bash
cd lobe-chat
yarn install
```

If you are using PNPM, you can execute:

```bash
cd lobe-chat
pnpm install
```

3. **Start the development server**: After installing the dependencies, you can start the development server:

```bash
yarn run dev
```

Now, you can open `http://localhost:3010` in your browser, and you should see the welcome page of LobeChat. This indicates that you have successfully set up the development environment.

![](https://github-production-user-asset-6210df.s3.amazonaws.com/28616219/274655364-414bc31e-8511-47a3-af17-209b530effc7.png)

During the development process, if you encounter any issues with environment setup or have any questions about LobeChat development, feel free to ask us at any time. We look forward to seeing your contributions!

[codespaces-link]: https://codespaces.new/lobehub/lobe-chat
[codespaces-shield]: https://github.com/codespaces/badge.svg
