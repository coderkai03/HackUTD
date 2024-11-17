import type { AppProps } from 'next/app';
import Head from 'next/head';
// import '@/styles/globals.css';

export default function Home({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#000000" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
