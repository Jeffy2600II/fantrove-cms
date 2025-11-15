import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { useEffect } from 'react'

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // basic: set english default lang
    if (!localStorage.getItem('selectedLang')) localStorage.setItem('selectedLang', 'en');
  }, []);
  return <Component {...pageProps} />
}