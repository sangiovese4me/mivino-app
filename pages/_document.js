import { Html, Head, Main, NextScript } from 'next/document';
export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        {/* PWA meta tags */}
        <meta name="theme-color" content="#5c1a2e" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="MiVino" />

        {/* Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Icons */}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body>
        <Main />
        <NextScript />

        {/* Register service worker */}
        <script
          dangerouslySetInnerHTML={{
            __html: [
              'if ("serviceWorker" in navigator) {',
              '  window.addEventListener("load", function() {',
              '    navigator.serviceWorker.register("/sw.js").then(function(reg) {',
              '      console.log("MiVino SW registered:", reg.scope);',
              '    }).catch(function(err) {',
              '      console.log("MiVino SW registration failed:", err);',
              '    });',
              '  });',
              '}',
            ].join('\n'),
          }}
        />
      </body>
    </Html>
  );
}
