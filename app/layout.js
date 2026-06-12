import "./globals.css";

export const metadata = {
  title: "ARCHYTER — We Build Playbooks",
  description:
    "Archyter turns bold ideas into architecture. Strategy, design, and engineering — built to last.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
