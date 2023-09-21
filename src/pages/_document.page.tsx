import { StyleProvider, extractStaticStyle } from 'antd-style';
import Document, { DocumentContext, Html, Main } from 'next/document';

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const page = await ctx.renderPage({
      enhanceApp: (App) => (props) => (
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
    return (
      <Html>
        <body>
          <Main />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
