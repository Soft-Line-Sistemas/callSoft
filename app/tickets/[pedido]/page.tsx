"use client";
import { Sidebar } from "../../../src/components/layout/Sidebar";
import { Header } from "../../../src/components/layout/Header";
import { Card, CardHeader, CardTitle, CardContent } from "../../../src/components/ui/Card";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../../src/lib/api";

export default function TicketDetailPage({ params }: { params: { pedido: string } }) {
  const pedido = Number(params.pedido);
  const { data, isLoading } = useQuery({
    queryKey: ["ticket-detail", pedido],
    queryFn: async () => {
      const res = await api.get(`/tickets/${pedido}`);
      return res.data;
    }
  });

  return (
    <div className="min-h-screen">
      <Sidebar />
      <Header />
      <main className="ml-64 pt-16 p-8">
        <Card variant="glass">
          <CardHeader>
            <CardTitle>Ticket #{pedido}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-slate-400">Carregando...</p>
            ) : !data ? (
              <p className="text-slate-400">Ticket não encontrado</p>
            ) : (
              <div className="space-y-3">
                <p className="text-slate-300">Status: <span className="text-white">{data.status}</span></p>
                <p className="text-slate-300">Data: <span className="text-white">{new Date(data.data).toLocaleString("pt-BR")}</span></p>
                <p className="text-slate-300">Hora Proposta: <span className="text-white">{data.horaProposta ?? "-"}</span></p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
