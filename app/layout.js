import '../styles/globals.css';
import '../styles/responsive.css';
import '../styles/components.css';

export const metadata = {
  title: 'Fantrove Platform',
  description: 'Unified file management platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body>
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}