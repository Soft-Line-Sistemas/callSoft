"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { StatCard, type StatCardProps } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Calendar, Download, TrendingUp, Users, Clock, FileText, FileSpreadsheet } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api, type TicketMetrics } from "@/lib/api";
import { useState, useRef, useEffect } from "react";
import { exportTicketMetricsToCSV, exportTicketMetricsToPDF } from "@/lib/exportTicketMetrics";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from "recharts";

export default function ReportsPage() {
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  const { data: metrics, isLoading } = useQuery<TicketMetrics>({
    queryKey: ["ticket-metrics"],
    queryFn: async () => {
      const res = await api.get("/api/v1/metrics/tickets");
      return res.data.data;
    },
  });

  const statusCounts = metrics?.statusCounts;
  const totalTickets = statusCounts ? Object.values(statusCounts).reduce((acc, value) => acc + value, 0) : 0;
  const cancelados = statusCounts?.CANCELADO ?? 0;
  const concluidos = statusCounts?.CONCLUIDO ?? 0;
  const taxaCancelamento = totalTickets ? Math.round((cancelados / totalTickets) * 100) : 0;

  const kpis: StatCardProps[] = [
    {
      title: "Total de Tickets",
      value: totalTickets.toString(),
      icon: TrendingUp,
      trend: { value: 0, isPositive: true },
      variant: "glass-blue" as const,
    },
    {
      title: "Concluídos",
      value: concluidos.toString(),
      icon: Users,
      trend: { value: 0, isPositive: true },
      variant: "glass-purple" as const,
    },
    {
      title: "1º Atendimento (média)",
      value:
        metrics?.averageTimeToFirstAttendanceMinutes != null
          ? `${Math.round(metrics.averageTimeToFirstAttendanceMinutes)}min`
          : "N/A",
      icon: Clock,
      trend: { value: 0, isPositive: true },
      variant: "glass-cyan" as const,
    },
    {
      title: "Taxa de Cancelamento",
      value: `${taxaCancelamento}%`,
      icon: TrendingUp,
      trend: { value: 0, isPositive: false },
      variant: "glass-orange" as const,
    },
  ];

  const lineData =
    metrics?.volumeByDate.map((d) => ({
      name: new Date(d.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
      tickets: d.total,
    })) ?? [];

  const statusDistribution =
    metrics != null
      ? [
          { name: "Solicitado", value: metrics.statusCounts.SOLICITADO, color: "#f59e0b" },
          { name: "Pendente", value: metrics.statusCounts.PENDENTE_ATENDIMENTO, color: "#3b82f6" },
          { name: "Em Atendimento", value: metrics.statusCounts.EM_ATENDIMENTO, color: "#8b5cf6" },
          { name: "Concluído", value: metrics.statusCounts.CONCLUIDO, color: "#22c55e" },
          { name: "Cancelado", value: metrics.statusCounts.CANCELADO, color: "#ef4444" },
        ]
      : [];

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
    console.log('metrics:', metrics);

    setIsExporting(true);
    setIsExportMenuOpen(false);

    try {
      if (format === 'pdf') {
        exportTicketMetricsToPDF(metrics, "Relatórios");
      } else {
        exportTicketMetricsToCSV(metrics, "Relatórios");
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
          <div className="mb-8 flex items-center justify-between animate-slide-up">
            <div>
              <h1 className="text-3xl font-bold text-white">Relatórios</h1>
              <p className="mt-2 text-slate-400">Análises e métricas do sistema</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Último mês
              </Button>
              <div className="relative" ref={exportMenuRef}>
                <Button
                  variant="gradient"
                  onClick={() => {
                    console.log('Export button clicked, current state:', isExportMenuOpen);
                    setIsExportMenuOpen(!isExportMenuOpen);
                  }}
                  disabled={isExporting}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isExporting ? 'Exportando...' : 'Exportar'}
                </Button>

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

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8 animate-slide-up">
            {kpis.map((kpi, index) => (
              <div key={kpi.title} style={{ animationDelay: `${index * 100}ms` }}>
                <StatCard title={kpi.title} value={kpi.value} icon={kpi.icon} trend={kpi.trend} variant={kpi.variant} />
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2 mb-6">
            <Card variant="glass">
              <CardHeader>
                <CardTitle>Tendência de Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineData}>
                      <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(15, 23, 42, 0.9)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          borderRadius: "8px",
                          color: "#fff",
                        }}
                      />
                      <Line type="monotone" dataKey="tickets" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card variant="glass">
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
                        <YAxis dataKey="name" type="category" stroke="#94a3b8" width={120} />
                        <Tooltip
                          cursor={{ fill: "rgba(255,255,255,0.05)" }}
                          contentStyle={{
                            backgroundColor: "rgba(15, 23, 42, 0.9)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            borderRadius: "8px",
                            color: "#fff",
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

          <div className="grid gap-6 lg:grid-cols-2 animate-slide-up">
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="text-sm">Falhas por minuto</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-white">{metrics?.technical.failuresPerMinute ?? 0}</p>
                <p className="text-sm text-slate-400">Métrica técnica</p>
              </CardContent>
            </Card>

            <Card variant="glass">
              <CardHeader>
                <CardTitle className="text-sm">Tempo médio de resposta (ms)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-white">
                  {metrics?.technical.averageResponseTimeMs != null ? Math.round(metrics.technical.averageResponseTimeMs) : "N/A"}
                </p>
                <p className="text-sm text-slate-400">Métrica técnica</p>
              </CardContent>
            </Card>
          </div>

          {isLoading && (
            <p className="mt-6 text-sm text-slate-400">Carregando métricas...</p>
          )}
        </div>
      </main>
    </div>
  );
}
