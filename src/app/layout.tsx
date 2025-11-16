import "../styles/globals.css";
import Navbar from "../components/Navbar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>
        <Navbar />
        <main className="max-w-4xl mx-auto mt-8">{children}</main>
      </body>
    </html>
  );
}