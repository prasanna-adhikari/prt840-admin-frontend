// pages/_document.js
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="application-name" content="CDU Connect" />
        <meta name="description" content="CDU Connect admin page" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
