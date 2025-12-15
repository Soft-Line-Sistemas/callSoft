"use client";
import { Sidebar } from "../../src/components/layout/Sidebar";
import { Header } from "../../src/components/layout/Header";
import { StatCard } from "../../src/components/ui/StatCard";
import { Button } from "../../src/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../../src/components/ui/Card";
import { TrendingUp, Users, Clock, MessageCircle, Calendar, Download } from "lucide-react";

export default function ReportsPage() {
    // Mock stats
    const kpis = [
        {
            title: "Taxa de Resolução",
            value: "94%",
            icon: TrendingUp,
            trend: { value: 3, isPositive: true },
            variant: "primary" as const,
        },
        {
            title: "Clientes Atendidos",
            value: "2,345",
            icon: Users,
            trend: { value: 18, isPositive: true },
            variant: "secondary" as const,
        },
        {
            title: "Tempo Médio Resposta",
            value: "15min",
            icon: Clock,
            trend: { value: -12, isPositive: true },
            variant: "accent" as const,
        },
        {
            title: "Msgs WhatsApp/Dia",
            value: "456",
            icon: MessageCircle,
            trend: { value: 22, isPositive: true },
            variant: "primary" as const,
        },
    ];

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
                                <StatCard {...kpi} />
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
                                <div className="h-64 flex items-center justify-center">
                                    <div className="text-center text-slate-400">
                                        <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                        <p>Gráfico de linha será renderizado aqui</p>
                                        <p className="text-xs mt-1">(Integração com Recharts)</p>
                                    </div>
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
                                    <div className="space-y-4 w-full max-w-xs">
                                        {/* Mock bar chart */}
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-slate-300">Concluído</span>
                                                <span className="text-green-400">65%</span>
                                            </div>
                                            <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                                                <div className="h-full bg-green-500 rounded-full" style={{ width: "65%" }}></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-slate-300">Em Andamento</span>
                                                <span className="text-blue-400">25%</span>
                                            </div>
                                            <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                                                <div className="h-full bg-blue-500 rounded-full" style={{ width: "25%" }}></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-slate-300">Pendente</span>
                                                <span className="text-amber-400">10%</span>
                                            </div>
                                            <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                                                <div className="h-full bg-amber-500 rounded-full" style={{ width: "10%" }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* WhatsApp Metrics */}
                    <div className="grid gap-6 lg:grid-cols-3 animate-slide-up">
                        <Card variant="glass">
                            <CardHeader>
                                <CardTitle className="text-sm">Mensagens Enviadas</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 rounded-full bg-whatsapp/20 flex items-center justify-center">
                                        <MessageCircle className="h-7 w-7 text-whatsapp" />
                                    </div>
                                    <div>
                                        <p className="text-3xl font-bold text-white">3,456</p>
                                        <p className="text-sm text-green-400">+18% este mês</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card variant="glass">
                            <CardHeader>
                                <CardTitle className="text-sm">Taxa de Resposta</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 rounded-full bg-blue-500/20 flex items-center justify-center">
                                        <TrendingUp className="h-7 w-7 text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-3xl font-bold text-white">89%</p>
                                        <p className="text-sm text-green-400">+5% este mês</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card variant="glass">
                            <CardHeader>
                                <CardTitle className="text-sm">Tempo Médio</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 rounded-full bg-purple-500/20 flex items-center justify-center">
                                        <Clock className="h-7 w-7 text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="text-3xl font-bold text-white">15min</p>
                                        <p className="text-sm text-green-400">-12% este mês</p>
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
