import "./globals.css";
import { ReactNode } from "react";
import dynamic from "next/dynamic";
const Providers = dynamic(() => import("../src/providers").then((m) => m.Providers), { ssr: false });

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
