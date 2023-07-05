import { StyleProvider, extractStaticStyle } from 'antd-style';
import Document, { DocumentContext, Head, Html, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  static async getInitialProps(context: DocumentContext) {
    const page = await context.renderPage({
      enhanceApp: (App) => (props) =>
        (
          <StyleProvider cache={extractStaticStyle.cache}>
            <App {...props} />
          </StyleProvider>
        ),
    });

    const styles = extractStaticStyle(page.html).map((item) => item.style);

    const initialProps = await Document.getInitialProps(context);

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
    return (
      <Html lang="en">
        <Head></Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
