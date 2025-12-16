"use client";
import { Sidebar } from "../../src/components/layout/Sidebar";
import { Header } from "../../src/components/layout/Header";
import { StatCard } from "../../src/components/ui/StatCard";
import { StatusPieChart } from "../../src/components/charts/StatusPieChart";
import { OpenTicketsKpi } from "../../src/components/ui/KpiCard";
import { Ticket, MessageCircle, CheckCircle, Clock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../src/components/ui/Card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function DashboardPage() {
    const stats = [
        {
            title: "Total de Tickets",
            value: "5,240",
            icon: Ticket,
            trend: { value: 12, isPositive: true },
            variant: "primary" as const,
        },
        {
            title: "Mensagens WhatsApp",
            value: "32,500",
            icon: MessageCircle,
            trend: { value: 8, isPositive: true },
            variant: "secondary" as const,
        },
        {
            title: "Tickets Concluídos",
            value: "4,980",
            icon: CheckCircle,
            trend: { value: 15, isPositive: true },
            variant: "accent" as const,
        },
        {
            title: "Tempo Médio",
            value: "12m 30s",
            icon: Clock,
            trend: { value: -5, isPositive: false },
            variant: "primary" as const,
        },
    ];
    const chamadosEmAberto = 145;
    const lineData = [
        { name: "Oct 1", value: 520 }, { name: "Oct 5", value: 610 }, { name: "Oct 10", value: 700 },
        { name: "Oct 15", value: 680 }, { name: "Oct 20", value: 820 }, { name: "Oct 25", value: 910 },
        { name: "Nov 1", value: 980 }, { name: "Nov 5", value: 1020 }, { name: "Nov 10", value: 1100 },
        { name: "Nov 15", value: 1250 }, { name: "Nov 20", value: 1320 }, { name: "Nov 30", value: 1500 }
    ];
    const pieData = [
        { name: "Solicitado", value: 45, color: "#8b5cf6" },
        { name: "Recebido", value: 20, color: "#06b6d4" },
        { name: "Em Cotação", value: 15, color: "#f59e0b" },
        { name: "Cotado", value: 10, color: "#22c55e" },
        { name: "Cancelado", value: 5, color: "#ef4444" }
    ];

    return (
        <div className="min-h-screen">
            <Sidebar />
            <Header />

            <main className="ml-64 pt-16">
                <div className="p-8">
                    <div className="mb-8 animate-slide-up">
                        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                        <p className="mt-2 text-slate-400">
                            Bem-vindo ao CALLSOFT - Gestão de Tickets e WhatsApp
                        </p>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-4 mb-8 animate-slide-up">
                        <OpenTicketsKpi count={chamadosEmAberto} />
                        {stats.map((stat, index) => (
                            <div key={stat.title} style={{ animationDelay: `${(index + 1) * 100}ms` }}>
                                <StatCard {...stat} />
                            </div>
                        ))}
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2 mb-8 animate-slide-up">
                        <Card variant="glass">
                            <CardHeader>
                                <CardTitle>Ticket Volume (Últimos 30 dias)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[280px]">
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
                                            <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                        <StatusPieChart data={pieData} />
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2 animate-slide-up">
                        <div className="glass rounded-lg p-6">
                            <h2 className="text-xl font-semibold text-white mb-4">
                                Atividade Recente
                            </h2>
                            <div className="space-y-3">
                                {[
                                    { id: 1239, text: "Novo ticket criado", time: "há 5 min" },
                                    { id: 1238, text: "Status atualizado para Em Atendimento", time: "há 12 min" },
                                    { id: 1237, text: "Mensagem recebida via WhatsApp", time: "há 30 min" }
                                ].map((i) => (
                                    <div key={i.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-white">#{i.id}</p>
                                            <p className="text-xs text-slate-400 mt-1">{i.text}</p>
                                        </div>
                                        <span className="text-xs text-slate-400">{i.time}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="glass rounded-lg p-6">
                            <h2 className="text-xl font-semibold text-white mb-4">
                                Últimos Tickets
                            </h2>
                            <div className="space-y-3">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="border-b border-white/10">
                                            <tr>
                                                <th className="text-left p-4 text-sm font-semibold text-slate-300">Ticket ID</th>
                                                <th className="text-left p-4 text-sm font-semibold text-slate-300">Assunto</th>
                                                <th className="text-left p-4 text-sm font-semibold text-slate-300">Solicitante</th>
                                                <th className="text-left p-4 text-sm font-semibold text-slate-300">Status</th>
                                                <th className="text-left p-4 text-sm font-semibold text-slate-300">Prioridade</th>
                                                <th className="text-left p-4 text-sm font-semibold text-slate-300">Criado</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[
                                                { id: 1235, assunto: "Login Issue", solicitante: "Emily Davis", status: "Pendente", prioridade: "Alta", criado: "10:30 AM" },
                                                { id: 1237, assunto: "Billing Question", solicitante: "Michael Brown", status: "Aberto", prioridade: "Média", criado: "11:15 AM" },
                                                { id: 1238, assunto: "Feature Request - Dark Mode", solicitante: "Chris Wilson", status: "Em Atendimento", prioridade: "Baixa", criado: "Ontem" },
                                                { id: 1239, assunto: "Integration Error", solicitante: "Jessica Lee", status: "Aberto", prioridade: "Alta", criado: "Ontem" }
                                            ].map((row) => (
                                                <tr key={row.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                    <td className="p-4 text-sm text-white font-medium">#{row.id}</td>
                                                    <td className="p-4 text-sm text-slate-300">{row.assunto}</td>
                                                    <td className="p-4 text-sm text-slate-300">{row.solicitante}</td>
                                                    <td className="p-4 text-sm">
                                                        <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">{row.status}</span>
                                                    </td>
                                                    <td className="p-4 text-sm">
                                                        <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-pink-500/10 text-pink-400 border border-pink-500/20">{row.prioridade}</span>
                                                    </td>
                                                    <td className="p-4 text-sm text-slate-300">{row.criado}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
