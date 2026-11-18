
import "./globals.css";

export const metadata = {
  title: "KampusMart",
  description: "Marketplace modern untuk kebutuhan mahasiswa",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
