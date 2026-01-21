import "./globals.css";
import { ReactNode } from "react";
import dynamic from "next/dynamic";
import { MonitoringClient } from "@/components/monitoring/monitoring-client";

const Providers = dynamic(() => import("@/providers").then((m) => m.Providers), { ssr: false });

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <MonitoringClient />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
