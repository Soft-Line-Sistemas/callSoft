"use client";
import { Sidebar } from "../../../src/components/layout/Sidebar";
import { Header } from "../../../src/components/layout/Header";
import { Card, CardHeader, CardTitle, CardContent } from "../../../src/components/ui/Card";
import { Badge } from "../../../src/components/ui/Badge";
import { Button } from "../../../src/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { api, Fornecedor, FornecedorStats } from "../../../src/lib/api";
import { ArrowLeft, MapPin, Phone, Mail, Building2, Clock, CheckCircle, XCircle, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { StatCard, StatCardProps } from "../../../src/components/ui/StatCard";

export default function SupplierDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { id } = params;

    // Fetch basic details
    const { data: supplier, isLoading } = useQuery<Fornecedor>({
        queryKey: ["supplier", id],
        queryFn: async () => {
            const res = await api.get(`/api/v1/suppliers/${id}`);
            return res.data;
        }
    });

    // Fetch stats (assuming endpoint exists based on schema provided)
    const { data: statsData } = useQuery<FornecedorStats>({
        queryKey: ["supplier-stats", id],
        queryFn: async () => {
            const res = await api.get(`/api/v1/suppliers/${id}/stats`);
            return res.data;
        },
        enabled: !!supplier // Only fetch stats if supplier exists
    });

    const stats = statsData?.stats;

    if (isLoading) {
        return (
            <div className="min-h-screen">
                <Sidebar />
                <Header />
                <main className="ml-64 pt-16 p-8">
                    <div className="text-slate-400">Carregando...</div>
                </main>
            </div>
        );
    }

    if (!supplier) {
        return (
            <div className="min-h-screen">
                <Sidebar />
                <Header />
                <main className="ml-64 pt-16 p-8">
                    <div className="text-red-400">Fornecedor não encontrado.</div>
                </main>
            </div>
        );
    }

    const kpis: StatCardProps[] = [
        {
            title: "Total Cotações",
            value: stats?.totalCotacoes.toString() || "0",
            icon: FileText,
            trend: { value: 0, isPositive: true },
            variant: "glass-blue" as const,
        },
        {
            title: "Aprovadas",
            value: stats?.cotacoesAprovadas.toString() || "0",
            icon: CheckCircle,
            trend: { value: stats?.taxaAprovacao || 0, isPositive: true },
            variant: "glass-purple" as const,
        },
        {
            title: "Taxa Aprovação",
            value: stats?.taxaAprovacao ? `${stats.taxaAprovacao}%` : "0%",
            icon: CheckCircle,
            trend: { value: 0, isPositive: true },
            variant: "glass-cyan" as const,
        },
        {
            title: "Tempo Médio",
            value: stats?.tempoMedioResposta ? `${stats.tempoMedioResposta}h` : "-",
            icon: Clock,
            trend: { value: 0, isPositive: false },
            variant: "glass-orange" as const,
        },
    ];

    return (
        <div className="min-h-screen">
            <Sidebar />
            <Header />
            <main className="ml-64 pt-16 p-8">
                <div className="mb-6 animate-slide-up">
                    <Button variant="ghost" onClick={() => router.back()} className="mb-4 pl-0 hover:pl-2 transition-all">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Voltar
                    </Button>
                    
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">{supplier.nome}</h1>
                            <div className="flex items-center gap-3">
                                <Badge variant={supplier.ativo ? "success" : "secondary"}>
                                    {supplier.ativo ? "Ativo" : "Inativo"}
                                </Badge>
                                <span className="text-slate-400">{supplier.razaoSocial}</span>
                                {supplier.cnpj && (
                                    <span className="text-slate-500 font-mono text-sm">{supplier.cnpj}</span>
                                )}
                            </div>
                        </div>
                        <Button variant="outline" onClick={() => router.push(`/suppliers/${id}/edit`)}>
                            Editar
                        </Button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8 animate-slide-up">
                    {kpis.map((kpi, index) => (
                        <div key={kpi.title} style={{ animationDelay: `${index * 100}ms` }}>
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: "200ms" }}>
                    {/* Main Details */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card variant="glass">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-blue-400" />
                                    Dados da Empresa
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-slate-400">Nome Fantasia</p>
                                        <p className="text-white">{supplier.nome}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-400">Razão Social</p>
                                        <p className="text-white">{supplier.razaoSocial || "-"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-400">CNPJ</p>
                                        <p className="text-white font-mono">{supplier.cnpj || "-"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-400">Especialidades</p>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {supplier.especialidades?.map((spec, i) => (
                                                <span key={i} className="inline-flex items-center rounded-full bg-slate-800 px-2 py-1 text-xs font-medium text-slate-300">
                                                    {spec}
                                                </span>
                                            ))}
                                            {(!supplier.especialidades || supplier.especialidades.length === 0) && (
                                                <span className="text-slate-500">-</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="pt-4 border-t border-white/10">
                                    <p className="text-sm text-slate-400 mb-2">Observações</p>
                                    <p className="text-slate-300 whitespace-pre-wrap">{supplier.observacoes || "Nenhuma observação registrada."}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Contact & Location */}
                    <div className="space-y-6">
                        <Card variant="glass">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Phone className="h-5 w-5 text-green-400" />
                                    Contato
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center">
                                        <Mail className="h-4 w-4 text-slate-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-400">Email</p>
                                        <p className="text-white">{supplier.email}</p>
                                    </div>
                                </div>
                                {supplier.telefone && (
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center">
                                            <Phone className="h-4 w-4 text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-400">Telefone</p>
                                            <p className="text-white">{supplier.telefone}</p>
                                        </div>
                                    </div>
                                )}
                                {supplier.contato && (
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center">
                                            <Building2 className="h-4 w-4 text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-400">Pessoa de Contato</p>
                                            <p className="text-white">{supplier.contato}</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card variant="glass">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-purple-400" />
                                    Endereço
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-white">{supplier.endereco || "-"}</p>
                                    <p className="text-white">
                                        {supplier.cidade ? `${supplier.cidade}` : ""}
                                        {supplier.cidade && supplier.estado ? " - " : ""}
                                        {supplier.estado ? `${supplier.estado}` : ""}
                                    </p>
                                    <p className="text-white">{supplier.pais}</p>
                                    {supplier.cep && <p className="text-slate-400 mt-1">{supplier.cep}</p>}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
