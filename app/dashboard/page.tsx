"use client";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { StatCard } from "@/components/ui/StatCard";
import { StatusPieChart } from "@/components/charts/StatusPieChart";
import { OpenTicketsKpi } from "@/components/ui/KpiCard";
import { Ticket as TicketIcon, MessageCircle, CheckCircle, Clock, Download, FileText, FileSpreadsheet } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api, TicketMetrics, TicketListResponse } from "@/lib/api";
import { useAuth } from "@/hooks/auth";
import { useMemo, useState, useRef, useEffect } from "react";
import { exportTicketMetricsToCSV, exportTicketMetricsToPDF } from "@/lib/exportTicketMetrics";

export default function DashboardPage() {
    const router = useRouter();
    const { data: authUser } = useAuth();
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const exportMenuRef = useRef<HTMLDivElement>(null);

    const { currentRange, previousRange } = useMemo(() => {
        const now = new Date();
        const currentFrom = new Date(now.getFullYear(), now.getMonth(), 1);
        const previousFrom = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const previousTo = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        return {
            currentRange: { from: currentFrom, to: now },
            previousRange: { from: previousFrom, to: previousTo },
        };
    }, []);

    const { data: metricsCurrent, isLoading: isLoadingMetrics } = useQuery<TicketMetrics>({
        queryKey: ["dashboard-metrics-current", currentRange.from.toISOString(), currentRange.to.toISOString()],
        queryFn: async () => {
            const res = await api.get("/api/v1/metrics/tickets", {
                params: {
                    from: currentRange.from.toISOString(),
                    to: currentRange.to.toISOString(),
                },
            });
            return res.data.data;
        }
    });

    const { data: metricsPrevious } = useQuery<TicketMetrics>({
        queryKey: ["dashboard-metrics-previous", previousRange.from.toISOString(), previousRange.to.toISOString()],
        queryFn: async () => {
            const res = await api.get("/api/v1/metrics/tickets", {
                params: {
                    from: previousRange.from.toISOString(),
                    to: previousRange.to.toISOString(),
                },
            });
            return res.data.data;
        }
    });

    const { data: recentTicketsData, isLoading: isLoadingTickets } = useQuery<TicketListResponse["data"]>({
        queryKey: ["recent-tickets"],
        queryFn: async () => {
            const res = await api.get("/api/v1/tickets", { params: { page: 1, pageSize: 5 } });
            return res.data.data;
        }
    });

    const statusCounts = metricsCurrent?.statusCounts;
    const previousStatusCounts = metricsPrevious?.statusCounts;
    const totalTickets = statusCounts ? Object.values(statusCounts).reduce((acc, value) => acc + value, 0) : 0;
    const novosTickets = statusCounts?.SOLICITADO ?? 0;
    const resolvidosTickets = statusCounts?.CONCLUIDO ?? 0;
    const emAbertoTickets = (statusCounts?.PENDENTE_ATENDIMENTO ?? 0) + (statusCounts?.EM_ATENDIMENTO ?? 0);
    const previousTotalTickets = previousStatusCounts
        ? Object.values(previousStatusCounts).reduce((acc, value) => acc + value, 0)
        : 0;
    const previousNovosTickets = previousStatusCounts?.SOLICITADO ?? 0;
    const previousResolvidosTickets = previousStatusCounts?.CONCLUIDO ?? 0;

    const computeTrend = (current: number | null | undefined, previous: number | null | undefined, inverse = false) => {
        const safeCurrent = current ?? 0;
        const safePrevious = previous ?? 0;
        const value =
            safePrevious === 0
                ? safeCurrent === 0
                    ? 0
                    : 100
                : ((safeCurrent - safePrevious) / safePrevious) * 100;
        return {
            value: Math.round(value),
            isPositive: inverse ? safeCurrent <= safePrevious : safeCurrent >= safePrevious,
        };
    };

    const stats = [
        {
            title: "Total de Tickets",
            value: totalTickets.toString(),
            icon: TicketIcon,
            trend: computeTrend(totalTickets, previousTotalTickets),
            variant: "glass-blue" as const,
        },
        {
            title: "Novos Tickets",
            value: novosTickets.toString(),
            icon: MessageCircle,
            trend: computeTrend(novosTickets, previousNovosTickets),
            variant: "glass-cyan" as const,
        },
        {
            title: "Tickets Resolvidos",
            value: resolvidosTickets.toString(),
            icon: CheckCircle,
            trend: computeTrend(resolvidosTickets, previousResolvidosTickets),
            variant: "glass-purple" as const,
        },
        {
            title: "Tempo Médio (Horas)",
            value: metricsCurrent?.averageTimeToFirstAttendanceMinutes != null ? Math.round(metricsCurrent.averageTimeToFirstAttendanceMinutes).toString() : "--",
            icon: Clock,
            trend: computeTrend(
                metricsCurrent?.averageTimeToFirstAttendanceMinutes ?? null,
                metricsPrevious?.averageTimeToFirstAttendanceMinutes ?? null,
                true
            ),
            variant: "glass-pink" as const,
        },
    ];

    const chamadosEmAberto = emAbertoTickets;

    const lineData = metricsCurrent?.volumeByDate.map(d => ({
        name: new Date(d.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
        value: d.total,
    })) || [];

    const pieData = metricsCurrent ? [
        { name: "Solicitado", value: metricsCurrent.statusCounts.SOLICITADO, color: "#f59e0b" },
        { name: "Pendente", value: metricsCurrent.statusCounts.PENDENTE_ATENDIMENTO, color: "#3b82f6" },
        { name: "Em Atendimento", value: metricsCurrent.statusCounts.EM_ATENDIMENTO, color: "#8b5cf6" },
        { name: "Concluído", value: metricsCurrent.statusCounts.CONCLUIDO, color: "#22c55e" },
        { name: "Cancelado", value: metricsCurrent.statusCounts.CANCELADO, color: "#ef4444" },
    ] : [];

    const recentTickets = recentTicketsData?.items || [];
    const tenantLabel = authUser?.tenantId ?? "CALLSOFT";

    function capitalizeFirstLetter(text: string) {
        if (!text) return text;
        return text.toUpperCase();
    }

    const tenantName = capitalizeFirstLetter(tenantLabel);

    // Close export menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
                setIsExportMenuOpen(false);
            }
        };

        if (isExportMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isExportMenuOpen]);

    const handleExport = (format: 'pdf' | 'csv') => {
        console.log('handleExport called with format:', format);
        console.log('metricsCurrent:', metricsCurrent);
        console.log('tenantName:', tenantName);

        setIsExporting(true);
        setIsExportMenuOpen(false);

        try {
            if (format === 'pdf') {
                exportTicketMetricsToPDF(metricsCurrent, tenantName);
            } else {
                exportTicketMetricsToCSV(metricsCurrent, tenantName);
            }
        } catch (error) {
            console.error('Error exporting:', error);
            alert('Erro ao exportar. Por favor, tente novamente.');
        } finally {
            setTimeout(() => setIsExporting(false), 500);
        }
    };

    return (
        <div className="min-h-screen">
            <Sidebar />
            <Header />

            <main className="ml-64 pt-16">
                <div className="p-8">
                    {/* Header Section matching reference */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 animate-slide-up gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                                <span className="w-2 h-8 bg-blue-500 rounded-full inline-block"></span>
                                {tenantName}
                            </h1>
                            <p className="mt-1 text-slate-400 text-sm ml-4">
                                Visão geral de métricas e performance
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-300 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-slate-400" />
                                <span>Hoje: {new Date().toLocaleDateString('pt-BR')}</span>
                            </div>
                            <div className="relative" ref={exportMenuRef}>
                                <button
                                    onClick={() => {
                                        console.log('Export button clicked, current state:', isExportMenuOpen);
                                        setIsExportMenuOpen(!isExportMenuOpen);
                                    }}
                                    disabled={isExporting}
                                    className="bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 text-slate-300 px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Download className="w-4 h-4" />
                                    {isExporting ? 'Exportando...' : 'Export (PDF, CSV)'}
                                </button>

                                {isExportMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
                                        <div className="py-1">
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    console.log('PDF button clicked');
                                                    handleExport('pdf');
                                                }}
                                                className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-700/50 flex items-center gap-2 transition-colors"
                                            >
                                                <FileText className="w-4 h-4" />
                                                Exportar como PDF
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    console.log('CSV button clicked');
                                                    handleExport('csv');
                                                }}
                                                className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-700/50 flex items-center gap-2 transition-colors"
                                            >
                                                <FileSpreadsheet className="w-4 h-4" />
                                                Exportar como CSV
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid gap-6 lg:grid-cols-5 mb-8 animate-slide-up">
                        <OpenTicketsKpi count={chamadosEmAberto} />
                        {stats.map((stat, index) => (
                            <div key={stat.title} className="h-full" style={{ animationDelay: `${(index + 1) * 100}ms` }}>
                                <StatCard
                                    title={stat.title}
                                    value={stat.value}
                                    icon={stat.icon}
                                    trend={stat.trend}
                                    variant={stat.variant}
                                />  
                            </div>
                        ))}
                    </div>

                    {/* Main Chart Section */}
                    <div className="grid gap-6 lg:grid-cols-3 mb-8 animate-slide-up">
                        <div className="lg:col-span-2">
                            <Card variant="glass" className="h-full border-0 bg-slate-900/40">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle>Tendência de Tickets (Últimos 30 dias)</CardTitle>
                                        <p className="text-sm text-slate-400 mt-1">Volume diário de aberturas</p>
                                    </div>
                                    {/* <select className="bg-slate-800 border-slate-700 text-xs rounded px-2 py-1 text-slate-400">
                                        <option>Automático</option>
                                        <option>Manual</option>
                                        <option>Híbrido</option>
                                        <option>Todos</option>
                                    </select> */}
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[350px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={lineData}>
                                                <defs>
                                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" vertical={false} />
                                                <XAxis 
                                                    dataKey="name" 
                                                    stroke="#64748b" 
                                                    tick={{fill: '#64748b', fontSize: 12}}
                                                    tickLine={false}
                                                    axisLine={false}
                                                    dy={10}
                                                />
                                                <YAxis 
                                                    stroke="#64748b" 
                                                    tick={{fill: '#64748b', fontSize: 12}}
                                                    tickLine={false}
                                                    axisLine={false}
                                                    dx={-10}
                                                />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: "rgba(15, 23, 42, 0.9)",
                                                        border: "1px solid rgba(255, 255, 255, 0.1)",
                                                        borderRadius: "8px",
                                                        color: "#fff",
                                                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                                                    }}
                                                    itemStyle={{ color: "#fff" }}
                                                    cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }}
                                                />
                                                <Line 
                                                    type="monotone" 
                                                    dataKey="value" 
                                                    stroke="#8b5cf6" 
                                                    strokeWidth={3}
                                                    dot={{ r: 4, fill: "#8b5cf6", strokeWidth: 2, stroke: "#fff" }}
                                                    activeDot={{ r: 6, fill: "#fff", stroke: "#8b5cf6" }}
                                                    fill="url(#colorValue)"
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Secondary Chart / Stats */}
                        <div className="lg:col-span-1 flex flex-col gap-6">
                            <Card variant="glass" className="flex-1 border-0 bg-slate-900/40">
                                <CardHeader>
                                    <CardTitle>Status dos Tickets</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[300px]">
                                        <StatusPieChart data={pieData} />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                    
                    {/* Recent Tickets Table */}
                    <Card variant="glass" className="mb-8 animate-slide-up border-0 bg-slate-900/40">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Últimos Tickets</CardTitle>
                                <p className="text-sm text-slate-400 mt-1">Acompanhe as solicitações mais recentes</p>
                            </div>
                            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                                Ver todos
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/5 text-left">
                                            <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Ticket ID</th>
                                            <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Empresa</th>
                                            <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Contato</th>
                                            <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                                            <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Prioridade</th>
                                            <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Criado</th>
                                            <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {isLoadingTickets ? (
                                            <tr>
                                                <td colSpan={7} className="p-8 text-center text-slate-400 text-sm">
                                                    <div className="flex justify-center items-center gap-2">
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                        Carregando...
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : recentTickets.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="p-8 text-center text-slate-400 text-sm">Nenhum ticket recente.</td>
                                            </tr>
                                        ) : (
                                            recentTickets.map((row) => (
                                            <tr key={row.id} className="hover:bg-white/5 transition-colors group">
                                                <td className="p-4 text-sm text-white font-medium">#{row.pedido}</td>
                                                <td className="p-4 text-sm text-slate-300 font-medium">{row.empresa ?? "--"}</td>
                                                <td className="p-4 text-sm text-slate-300">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-[10px] font-bold text-white">
                                                            {(row.contatoWpp ?? "W").substring(0, 2).toUpperCase()}
                                                        </div>
                                                        {row.contatoWpp}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-sm">
                                                    <Badge variant={
                                                        row.status === 'CONCLUIDO' ? 'success' :
                                                        row.status === 'SOLICITADO' ? 'warning' :
                                                        'info'
                                                    }>
                                                        {row.status.replace(/_/g, " ")}
                                                    </Badge>
                                                </td>
                                                <td className="p-4 text-sm">
                                                    <span className="text-slate-300 text-sm">{row.prioridade ?? "--"}</span>
                                                </td>
                                                <td className="p-4 text-sm text-slate-400">
                                                    {new Date(row.createdAt).toLocaleDateString('pt-BR')}
                                                </td>
                                                <td className="p-4 text-sm text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => router.push(`/tickets/${row.id}`)}
                                                    >
                                                        Detalhes
                                                    </Button>
                                                </td>
                                            </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
