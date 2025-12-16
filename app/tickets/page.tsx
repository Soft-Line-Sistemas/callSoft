"use client";
import { Sidebar } from "../../src/components/layout/Sidebar";
import { Header } from "../../src/components/layout/Header";
import { Badge } from "../../src/components/ui/Badge";
import { Button } from "../../src/components/ui/button";
import { Input } from "../../src/components/ui/Input";
import { Search, Filter, Download, MessageCircle, Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api, Ticket } from "../../src/lib/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getUserFromToken } from "../../src/lib/auth";

export default function TicketsPage() {
    const router = useRouter();
    const user = getUserFromToken();
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [dateFrom, setDateFrom] = useState<string>("");
    const [dateTo, setDateTo] = useState<string>("");
    const [canal, setCanal] = useState<string>("");
    const [searchText, setSearchText] = useState<string>("");
    const [showNew, setShowNew] = useState<boolean>(false);
    const [newLoading, setNewLoading] = useState<boolean>(false);
    const [newContato, setNewContato] = useState<string>("");
    const [newSolicitacao, setNewSolicitacao] = useState<string>("");
    const [newCodEmp, setNewCodEmp] = useState<string>("");
    const { data, isLoading, refetch } = useQuery<{ tickets: any[] }>({
        queryKey: ["tickets"],
        queryFn: async () => {
            const res = await api.get("/tickets", {
                params: {
                    status: statusFilter || undefined,
                    dateFrom: dateFrom || undefined,
                    dateTo: dateTo || undefined,
                },
            });
            return { tickets: res.data as any[] };
        },
    });

    const getStatusBadge = (status: string) => {
        const variants = {
            concluido: "success",
            pendente: "warning",
            "em_andamento": "info",
        } as const;

        return variants[status as keyof typeof variants] || "default";
    };

    return (
        <div className="min-h-screen">
            <Sidebar />
            <Header />

            <main className="ml-64 pt-16">
                <div className="p-8">
                    {/* Page Header */}
                    <div className="mb-8 flex items-center justify-between animate-slide-up">
                        <div>
                            <h1 className="text-3xl font-bold text-white">Tickets</h1>
                            <p className="mt-2 text-slate-400">
                                Gerencie todos os pedidos e tickets do sistema
                            </p>
                        </div>
                        <Button variant="gradient" onClick={() => setShowNew(true)}>
                            + Novo Ticket
                        </Button>
                    </div>

                    {/* Filters */}
                    <div className="glass rounded-lg p-4 mb-6 animate-slide-up">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div className="md:col-span-2">
                                <Input
                                    type="search"
                                    placeholder="Buscar por pedido, cliente..."
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    leftIcon={<Search className="h-4 w-4" />}
                                />
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="rounded-lg bg-slate-dark border border-slate-700 px-3 py-2 text-sm text-slate-100"
                            >
                                <option value="">Status</option>
                                <option>Solicitado</option>
                                <option>Recebido</option>
                                <option>Em Cotação</option>
                                <option>Cotado</option>
                                <option>Faturado</option>
                                <option>Expedido</option>
                                <option>Cancelado</option>
                                <option>Indeferido</option>
                            </select>
                            <select
                                value={canal}
                                onChange={(e) => setCanal(e.target.value)}
                                className="rounded-lg bg-slate-dark border border-slate-700 px-3 py-2 text-sm text-slate-100"
                            >
                                <option value="">Canal</option>
                                <option value="WHATSAPP">WhatsApp</option>
                                <option value="EMAIL">E-mail</option>
                                <option value="WEB">Web</option>
                            </select>
                            <div className="flex gap-2">
                                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                            </div>
                        </div>
                        <div className="mt-4 flex gap-3">
                            <Button variant="outline" onClick={() => refetch()}>
                                <Filter className="h-4 w-4 mr-2" />
                                Aplicar
                            </Button>
                            <Button variant="outline">
                                <Download className="h-4 w-4 mr-2" />
                                Exportar
                            </Button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="glass rounded-lg overflow-hidden animate-slide-up">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b border-white/10">
                                    <tr>
                                        <th className="text-left p-4 text-sm font-semibold text-slate-300">
                                            Pedido
                                        </th>
                                        <th className="text-left p-4 text-sm font-semibold text-slate-300">
                                            Cliente
                                        </th>
                                        <th className="text-left p-4 text-sm font-semibold text-slate-300">
                                            Status
                                        </th>
                                        <th className="text-left p-4 text-sm font-semibold text-slate-300">
                                            Data
                                        </th>
                                        <th className="text-left p-4 text-sm font-semibold text-slate-300">
                                            Hora Proposta
                                        </th>
                                        <th className="text-left p-4 text-sm font-semibold text-slate-300">
                                            WhatsApp
                                        </th>
                                        <th className="text-left p-4 text-sm font-semibold text-slate-300">
                                            Ações
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={7} className="p-8 text-center text-slate-400">
                                                Carregando tickets...
                                            </td>
                                        </tr>
                                    ) : (data?.tickets ?? []).length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="p-8 text-center text-slate-400">
                                                Nenhum ticket encontrado
                                            </td>
                                        </tr>
                                    ) : (
                                        (data?.tickets ?? [])
                                            .filter((ticket) => {
                                                const matchesSearch =
                                                    !searchText ||
                                                    `${ticket.pedido}`.includes(searchText) ||
                                                    (ticket.contato || "").toLowerCase().includes(searchText.toLowerCase());
                                                const matchesCanal = !canal || (ticket.canalOrigem || "") === canal;
                                                return matchesSearch && matchesCanal;
                                            })
                                            .map((ticket) => (
                                            <tr
                                                key={ticket.pedido}
                                                className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                                onClick={() => router.push(`/tickets/${ticket.pedido}`)}
                                            >
                                                <td className="p-4 text-sm text-white font-medium">
                                                    #{ticket.pedido}
                                                </td>
                                                <td className="p-4 text-sm text-slate-300">
                                                    Cliente {ticket.pedido}
                                                </td>
                                                <td className="p-4">
                                                    <Badge variant={getStatusBadge(ticket.status)}>
                                                        {ticket.status.replace("_", " ")}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 text-sm text-slate-300">
                                                    {new Date(ticket.data).toLocaleDateString("pt-BR")}
                                                </td>
                                                <td className="p-4 text-sm text-slate-300">
                                                    {ticket.horaProposta || "-"}
                                                </td>
                                                <td className="p-4">
                                                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-whatsapp/10 hover:bg-whatsapp/20 border border-whatsapp/20 text-whatsapp transition-colors">
                                                        <MessageCircle className="h-4 w-4" />
                                                        <span className="text-xs font-medium">Chat</span>
                                                    </button>
                                                </td>
                                                <td className="p-4">
                                                    <Button variant="ghost" size="sm">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {data && (data.tickets ?? []).length > 0 && (
                            <div className="flex items-center justify-between p-4 border-t border-white/10">
                                <p className="text-sm text-slate-400">
                                    Mostrando {(data.tickets ?? []).length} tickets
                                </p>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm">
                                        Anterior
                                    </Button>
                                    <Button variant="outline" size="sm">
                                        Próxima
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            {showNew && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
                    <div className="glass rounded-xl w-full max-w-lg p-6">
                        <h3 className="text-xl font-semibold text-white mb-4">Novo Ticket</h3>
                        <div className="space-y-3">
                            <Input placeholder="Contato (WhatsApp ou e-mail)" value={newContato} onChange={(e) => setNewContato(e.target.value)} />
                            <Input placeholder="Solicitação" value={newSolicitacao} onChange={(e) => setNewSolicitacao(e.target.value)} />
                            <Input placeholder="Empresa (código opcional)" value={newCodEmp} onChange={(e) => setNewCodEmp(e.target.value)} />
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setShowNew(false)}>Cancelar</Button>
                            <Button
                                variant="gradient"
                                isLoading={newLoading}
                                onClick={async () => {
                                    setNewLoading(true);
                                    try {
                                        await api.post("/tickets", {
                                            contato: newContato || null,
                                            solicitacao: newSolicitacao,
                                            codEmp: newCodEmp ? Number(newCodEmp) : null
                                        });
                                        setShowNew(false);
                                        setNewContato("");
                                        setNewSolicitacao("");
                                        setNewCodEmp("");
                                        await refetch();
                                    } finally {
                                        setNewLoading(false);
                                    }
                                }}
                            >
                                Salvar
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
