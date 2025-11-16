import '../styles/globals.css';
import Navigation from '../components/Navigation';

function MyApp({ Component, pageProps }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      <main className="container mx-auto py-8">
        <Component {...pageProps} />
      </main>
    </div>
  );
}

export default MyApp;