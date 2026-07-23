import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nido | Encuesta Sueño Bebés",
  description: "Encuesta anónima sobre sueño de bebés para familias.",
  icons: {
    icon: "/nido-icon.svg"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
