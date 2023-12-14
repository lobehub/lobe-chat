# Technical Development Getting Started Guide

Welcome to the LobeChat technical development getting started guide. LobeChat is an AI conversation application built on the Next.js framework, which integrates a series of technology stacks to achieve diverse functions and features. This guide will provide a detailed introduction to the main technical components of LobeChat and how to configure and use these technologies in your development environment.

#### TOC

- [Basic Technology Stack](#basic-technology-stack)
- [Folder Directory Structure](#folder-directory-structure)

## Basic Technology Stack

The core technology stack of LobeChat includes:

- **Framework**: We have chosen [Next.js](https://nextjs.org/), a powerful React framework that provides key features such as server-side rendering, routing framework, and Router Handler for our project.
- **Component Library**: We use [Ant Design (antd)](https://ant.design/) as the basic component library, and also introduce [lobe-ui](https://github.com/lobehub/lobe-ui) as our business component library.
- **State Management**: We have opted for [zustand](https://github.com/pmndrs/zustand), a lightweight and easy-to-use state management library.
- **Network Requests**: We use [swr](https://swr.vercel.app/), a React Hooks library for data fetching.
- **Routing**: For routing management, we directly use the solution provided by [Next.js](https://nextjs.org/) itself.
- **Internationalization**: We use [i18next](https://www.i18next.com/) to implement multi-language support for the application.
- **Styling**: We use [antd-style](https://github.com/ant-design/antd-style), a CSS-in-JS library that complements Ant Design.
- **Unit Testing**: We use [vitest](https://github.com/vitest-dev/vitest) for unit testing.

## Folder Directory Structure

The folder directory structure of LobeChat is as follows:

```bash
src
├── app        # Main logic of the application and code related to state management
├── components # Reusable UI components
├── config     # Application configuration files, including client-side environment variables and server-side environment variables
├── const      # Used to define constants, such as action types, route names, etc.
├── features   # Function modules related to business features, such as Agent settings, plugin development pop-ups, etc.
├── hooks      # Custom utility hooks reused throughout the application
├── layout     # Application layout components, such as navigation bars, sidebars, etc.
├── locales    # Language files for internationalization
├── services   # Encapsulated backend service interfaces, such as HTTP requests
├── store      # Zustand store for state management
├── types      # TypeScript type definition files
└── utils      # Common utility functions
```

For a detailed introduction to the directory structure, please refer to: [Folder Directory Structure](Folder-Structure.en-US.md)
