"use client";
import { Sidebar } from "../../../src/components/layout/Sidebar";
import { Header } from "../../../src/components/layout/Header";
import { Card, CardHeader, CardTitle, CardContent } from "../../../src/components/ui/Card";
import { Button } from "../../../src/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { api, Ticket } from "../../../src/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Input } from "../../../src/components/ui/Input";

export default function WhatsAppContatosPage() {
  const router = useRouter();
  const [qrText, setQrText] = useState<string>("");
  const [qrLoaded, setQrLoaded] = useState<boolean>(false);
  useEffect(() => {
    (async () => {
      try {
        const r = await api.get("/whatsapp/qr");
        const t = r.data?.qr ?? r.data?.qrCode ?? r.data;
        if (typeof t === "string" && t.length > 0) {
          setQrText(t);
          setQrLoaded(true);
        }
      } catch {
        setQrLoaded(false);
      }
    })();
  }, []);
  const { data, isLoading } = useQuery<{ tickets: Ticket[] }>({
    queryKey: ["whatsapp-contatos"],
    queryFn: async () => {
      const res = await api.get("/tickets");
      return { tickets: res.data as Ticket[] };
    }
  });
  const tickets = (data?.tickets ?? []).filter((t: any) => t.canalOrigem === "WHATSAPP" || !!(t as any).contato);

  const openWhatsApp = (phone: string) => {
    const digits = (phone || "").replace(/\D/g, "");
    const withCountry = digits.startsWith("55") ? digits : `55${digits}`;
    window.open(`https://wa.me/${withCountry}`, "_blank");
  };

  return (
    <div className="min-h-screen pt-12">
      <Sidebar />
      <Header />
      <main className="ml-64 pt-16 p-8">
        <div className="grid gap-6 lg:grid-cols-2 mb-6">
          <Card variant="glass">
            <CardHeader>
              <CardTitle>Conexão WhatsApp</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center">
                  {qrText ? (
                    <img
                      alt="QR Code WhatsApp"
                      className="w-48 h-48 rounded-lg"
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrText)}`}
                    />
                  ) : (
                    <span className="text-slate-500 text-sm">Sem QR</span>
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <p className="text-slate-300 text-sm">
                    Escaneie o QR code para conectar o WhatsApp ao sistema.
                  </p>
                  {!qrLoaded && (
                    <>
                      <p className="text-slate-400 text-xs">
                        Se o backend ainda não fornece o QR, cole abaixo o código recebido:
                      </p>
                      <Input
                        placeholder="Cole aqui o texto do QR (provisório)"
                        value={qrText}
                        onChange={(e) => setQrText(e.target.value)}
                      />
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <Card variant="glass">
          <CardHeader>
            <CardTitle>Contatos do WhatsApp</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-white/10">
                  <tr>
                    <th className="text-left p-4 text-sm font-semibold text-slate-300">Número</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-300">E-mail</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-300">Ticket</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-300">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan={4} className="p-8 text-center text-slate-400">Carregando...</td></tr>
                  ) : tickets.length === 0 ? (
                    <tr><td colSpan={4} className="p-8 text-center text-slate-400">Nenhum contato encontrado</td></tr>
                  ) : (
                    tickets.map((t: any) => (
                      <tr key={t.pedido} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-4 text-sm text-white">
                          <button className="text-whatsapp underline" onClick={() => openWhatsApp((t as any).contato || "")}>
                            {(t as any).contato || "-"}
                          </button>
                        </td>
                        <td className="p-4 text-sm text-slate-300">{(t as any).email || "-"}</td>
                        <td className="p-4 text-sm">
                          <button className="text-purple-400 underline" onClick={() => router.push(`/tickets/${t.pedido}`)}>
                            #{t.pedido}
                          </button>
                        </td>
                        <td className="p-4">
                          <Button variant="outline" onClick={() => openWhatsApp((t as any).contato || "")}>Abrir WhatsApp</Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
