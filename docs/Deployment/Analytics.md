# Data Statistics

To better analyze the usage of LobeChat users, we have integrated several free/open-source data statistics services in LobeChat for collecting user usage data, which you can enable as needed.

#### TOC

- [Vercel Analytics](#vercel-analytics)
- [🚧 Posthog](#-posthog)

## Vercel Analytics

[Vercel Analytics](https://vercel.com/analytics) is a data analysis service launched by Vercel, which can help you collect website visit information, including traffic, sources, and devices used for access.

We have integrated Vercel Analytics into the code, and you can enable it by setting the environment variable `NEXT_PUBLIC_ANALYTICS_VERCEL=1`, and then open the Analytics tab in the Vercel deployment project to view your application's visit information.

Vercel Analytics provides 2500 free Web Analytics Events per month (which can be understood as PV), which is generally sufficient for personal deployment and self-use products.

If you need detailed instructions on using Vercel Analytics, please refer to [Vercel Web Analytics Quick Start](https://vercel.com/docs/analytics/quickstart).

## 🚧 Posthog
