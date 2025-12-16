"use client";
import { Sidebar } from "../../src/components/layout/Sidebar";
import { Header } from "../../src/components/layout/Header";
import { StatCard, StatCardProps } from "../../src/components/ui/StatCard";
import { Button } from "../../src/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../../src/components/ui/Card";
import { TrendingUp, Users, Clock, MessageCircle, Calendar, Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api, TicketMetrics } from "../../src/lib/api";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Cell } from "recharts";

export default function ReportsPage() {
    const { data: metrics, isLoading } = useQuery<TicketMetrics>({
        queryKey: ["dashboard-metrics"], // Reuse same query key/fn if consistent
        queryFn: async () => {
            const res = await api.get("/api/v1/dashboard/metrics");
            return res.data;
        }
    });

    const kpis: StatCardProps[] = [
        {
            title: "Taxa de Resolução",
            value: metrics ? `${Math.round(metrics.taxas.taxaResolucao)}%` : "0%",
            icon: TrendingUp,
            trend: { value: 0, isPositive: true },
            variant: "glass-blue" as const,
        },
        {
            title: "Total de Tickets",
            value: metrics?.totais.total.toString() || "0",
            icon: Users, // Using Users icon as placeholder for Total Tickets if needed, or stick to context
            trend: { value: 0, isPositive: true },
            variant: "glass-purple" as const,
        },
        {
            title: "Tempo Médio Resolução",
            value: metrics?.tempos.tempoMedioResolucao ? `${Math.round(metrics.tempos.tempoMedioResolucao / 60)}min` : "0min",
            icon: Clock,
            trend: { value: 0, isPositive: true },
            variant: "glass-cyan" as const,
        },
        {
            title: "Cancelados",
            value: metrics?.totais.cancelados.toString() || "0",
            icon: MessageCircle, // Placeholder icon
            trend: { value: 0, isPositive: false },
            variant: "glass-orange" as const,
        },
    ];

    const lineData = metrics?.distribuicao.porDia.map(d => ({
        name: new Date(d.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
        tickets: d.total,
        resolvidos: d.resolvidos
    })) || [];

    const statusDistribution = metrics ? [
        { name: "Novos", value: metrics.totais.novos, color: "#f59e0b" },
        { name: "Abertos", value: metrics.totais.abertos, color: "#3b82f6" },
        { name: "Em Andamento", value: metrics.totais.emAndamento, color: "#8b5cf6" },
        { name: "Resolvidos", value: metrics.totais.resolvidos, color: "#22c55e" },
        { name: "Fechados", value: metrics.totais.fechados, color: "#64748b" }
    ] : [];

    return (
        <div className="min-h-screen">
            <Sidebar />
            <Header />

            <main className="ml-64 pt-16">
                <div className="p-8">
                    {/* Page Header */}
                    <div className="mb-8 flex items-center justify-between animate-slide-up">
                        <div>
                            <h1 className="text-3xl font-bold text-white">Relatórios</h1>
                            <p className="mt-2 text-slate-400">
                                Análises e métricas do sistema em tempo real
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline">
                                <Calendar className="h-4 w-4 mr-2" />
                                Último mês
                            </Button>
                            <Button variant="gradient">
                                <Download className="h-4 w-4 mr-2" />
                                Exportar
                            </Button>
                        </div>
                    </div>

                    {/* KPIs */}
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8 animate-slide-up">
                        {kpis.map((kpi, index) => (
                            <div
                                key={kpi.title}
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <StatCard
                                    title={kpi.title}
                                    value={kpi.value}
                                    icon={kpi.icon}
                                    trend={kpi.trend}
                                    variant={kpi.variant}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Charts Grid */}
                    <div className="grid gap-6 lg:grid-cols-2 mb-6">
                        {/* Tickets por Período */}
                        <Card variant="glass" className="animate-slide-up">
                            <CardHeader>
                                <CardTitle>Tickets por Período</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={lineData}>
                                            <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
                                            <XAxis dataKey="name" stroke="#94a3b8" />
                                            <YAxis stroke="#94a3b8" />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                                                    border: "1px solid rgba(255, 255, 255, 0.1)",
                                                    borderRadius: "8px",
                                                    color: "#fff"
                                                }}
                                            />
                                            <Line type="monotone" dataKey="tickets" name="Total" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                                            <Line type="monotone" dataKey="resolvidos" name="Resolvidos" stroke="#22c55e" strokeWidth={2} dot={false} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Distribuição por Status */}
                        <Card variant="glass" className="animate-slide-up" style={{ animationDelay: "100ms" }}>
                            <CardHeader>
                                <CardTitle>Distribuição por Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-64 flex items-center justify-center">
                                    <div className="w-full h-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={statusDistribution} layout="vertical">
                                                <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" horizontal={false} />
                                                <XAxis type="number" stroke="#94a3b8" />
                                                <YAxis dataKey="name" type="category" stroke="#94a3b8" width={100} />
                                                <Tooltip
                                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                                    contentStyle={{
                                                        backgroundColor: "rgba(15, 23, 42, 0.9)",
                                                        border: "1px solid rgba(255, 255, 255, 0.1)",
                                                        borderRadius: "8px",
                                                        color: "#fff"
                                                    }}
                                                />
                                                <Bar dataKey="value" name="Tickets" radius={[0, 4, 4, 0]}>
                                                    {statusDistribution.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Additional Metrics */}
                    <div className="grid gap-6 lg:grid-cols-3 animate-slide-up">
                        <Card variant="glass">
                            <CardHeader>
                                <CardTitle className="text-sm">Tempo Médio 1ª Resposta</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 rounded-full bg-blue-500/20 flex items-center justify-center">
                                        <Clock className="h-7 w-7 text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-3xl font-bold text-white">
                                            {metrics?.tempos.tempoMedioPrimeiraResposta ? `${Math.round(metrics.tempos.tempoMedioPrimeiraResposta / 60)}min` : "N/A"}
                                        </p>
                                        <p className="text-sm text-slate-400">Média do período</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card variant="glass">
                            <CardHeader>
                                <CardTitle className="text-sm">Taxa de Cancelamento</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 rounded-full bg-red-500/20 flex items-center justify-center">
                                        <TrendingUp className="h-7 w-7 text-red-400" />
                                    </div>
                                    <div>
                                        <p className="text-3xl font-bold text-white">
                                            {metrics ? `${Math.round(metrics.taxas.taxaCancelamento)}%` : "0%"}
                                        </p>
                                        <p className="text-sm text-slate-400">Total de tickets cancelados</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card variant="glass">
                            <CardHeader>
                                <CardTitle className="text-sm">Prioridade Urgente</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 rounded-full bg-orange-500/20 flex items-center justify-center">
                                        <MessageCircle className="h-7 w-7 text-orange-400" />
                                    </div>
                                    <div>
                                        <p className="text-3xl font-bold text-white">
                                            {metrics?.porPrioridade.URGENTE || 0}
                                        </p>
                                        <p className="text-sm text-slate-400">Tickets urgentes no período</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
