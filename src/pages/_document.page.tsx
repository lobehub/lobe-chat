import { StyleProvider, extractStaticStyle } from 'antd-style';
import Document, { DocumentContext, Head, Html, Main, NextScript } from 'next/document';

import i18nextConfig from '../../next-i18next.config.js';

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const page = await ctx.renderPage({
      enhanceApp: (App) => (props) =>
        (
          <StyleProvider cache={extractStaticStyle.cache}>
            <App {...props} />
          </StyleProvider>
        ),
    });

    const styles = extractStaticStyle(page.html).map((item) => item.style);

    const initialProps = await Document.getInitialProps(ctx);

    return {
      ...initialProps,
      styles: (
        <>
          {initialProps.styles}
          {styles}
        </>
      ),
    };
  }

  render() {
    const currentLocale = this.props.__NEXT_DATA__.locale ?? i18nextConfig.i18n.defaultLocale;
    return (
      <Html lang={currentLocale}>
        <Head>
          <link
            href="https://npm.elemecdn.com/@lobehub/assets-favicons/assets/apple-touch-icon.png"
            rel="apple-touch-icon"
            sizes="180x180"
          />
          <link
            href="https://npm.elemecdn.com/@lobehub/assets-favicons/assets/favicon-32x32.png"
            rel="icon"
            sizes="32x32"
            type="image/png"
          />
          <link
            href="https://npm.elemecdn.com/@lobehub/assets-favicons/assets/favicon-16x16.png"
            rel="icon"
            sizes="16x16"
            type="image/png"
          />
          <link
            color="#000000"
            href="https://npm.elemecdn.com/@lobehub/assets-favicons/assets/safari-pinned-tab.svg"
            rel="mask-icon"
          />
          <meta content="LobeHub" name="apple-mobile-web-app-title" />
          <meta content="LobeHub" name="application-name" />
          <meta content="#000000" name="msapplication-TileColor" />
          <meta content="#000000" name="theme-color" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
